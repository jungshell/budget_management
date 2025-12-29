"""
Firebase Cloud Functions for Budget Management System
"""
import os
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, storage
from parse_excel import parse_excel_file, parse_csv_file

# Firebase 초기화 (로컬 개발 환경)
if not firebase_admin._apps:
    try:
        project_id = 'budget-management-system-72094'
        
        # 서비스 계정 키 파일 경로 확인 (프로젝트 루트 또는 functions 폴더)
        project_root = os.path.dirname(os.path.dirname(__file__))
        functions_dir = os.path.dirname(__file__)
        
        # 가능한 파일명 패턴들
        possible_filenames = [
            'firebase-service-account.json',
            'budget-management-system-72094-firebase-adminsdk-*.json',  # 와일드카드 패턴
        ]
        
        service_account_paths = [
            # 환경 변수
            os.environ.get('GOOGLE_APPLICATION_CREDENTIALS', ''),
            # 프로젝트 루트의 firebase-service-account.json
            os.path.join(project_root, 'firebase-service-account.json'),
            # functions 폴더의 firebase-service-account.json
            os.path.join(functions_dir, 'firebase-service-account.json'),
        ]
        
        # 프로젝트 루트에서 firebase-adminsdk로 시작하는 모든 JSON 파일 찾기
        import glob
        for pattern in ['budget-management-system-72094-firebase-adminsdk-*.json', '*firebase-adminsdk*.json']:
            for path in [project_root, functions_dir]:
                matches = glob.glob(os.path.join(path, pattern))
                service_account_paths.extend(matches)
        
        service_account_path = None
        for path in service_account_paths:
            if path and os.path.exists(path):
                service_account_path = path
                print(f"서비스 계정 키 파일 발견: {path}")
                break
        
        # 서비스 계정 키 파일이 있으면 사용
        if service_account_path:
            try:
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred, {
                    'projectId': project_id
                })
                print(f"✅ Firebase 초기화 성공 (서비스 계정 키 사용): {project_id}")
            except Exception as e:
                print(f"❌ 서비스 계정 키 파일 로드 실패: {e}")
                # 실패 시 프로젝트 ID만 사용
                firebase_admin.initialize_app(options={
                    'projectId': project_id
                })
                print(f"⚠️ Firebase 초기화 (프로젝트 ID만 사용, Firestore 저장 불가): {project_id}")
        else:
            # 서비스 계정 키가 없으면 프로젝트 ID만 사용
            firebase_admin.initialize_app(options={
                'projectId': project_id
            })
            print(f"⚠️ Firebase 초기화 (프로젝트 ID만 사용, Firestore 저장 불가): {project_id}")
            print("💡 서비스 계정 키를 설정하면 Firestore 저장이 가능합니다.")
            print("   파일 경로: 프로젝트 루트 또는 functions 폴더의 firebase-service-account.json")
            print("   또는 환경 변수: GOOGLE_APPLICATION_CREDENTIALS")
            print("   자세한 내용: FIREBASE_SETUP.md 참조")
    except Exception as e:
        print(f"Firebase 초기화 오류: {e}")
        # 초기화 실패해도 계속 진행 (로컬 개발용)

try:
    db = firestore.client()
    print("✅ Firestore 초기화 성공")
except Exception as e:
    print(f"❌ Firestore 초기화 오류: {e}")
    db = None

try:
    bucket = storage.bucket()
    print("✅ Storage 초기화 성공")
except Exception as e:
    print(f"⚠️ Storage 초기화 오류 (선택사항): {e}")
    bucket = None
app = Flask(__name__)

# CORS 설정: 프로덕션 도메인과 개발 환경 모두 허용
allowed_origins = [
    "https://budget-management-system-72094.web.app",
    "https://budget-management-system-72094.firebaseapp.com",
    "http://localhost:3000",  # 개발 환경
]

# 환경 변수에서 추가 도메인 허용
if os.environ.get('ALLOWED_ORIGINS'):
    allowed_origins.extend(os.environ.get('ALLOWED_ORIGINS').split(','))

CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200

@app.route('/api/budgets', methods=['GET'])
def get_budgets():
    """예산 데이터 조회"""
    try:
        budgets_ref = db.collection('budgets')
        budgets = budgets_ref.stream()
        budgets_list = [doc.to_dict() for doc in budgets]
        return jsonify(budgets_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/budgets', methods=['POST'])
def create_budget():
    """예산 데이터 생성"""
    try:
        data = request.json
        budgets_ref = db.collection('budgets')
        doc_ref = budgets_ref.add(data)
        return jsonify({'id': doc_ref[1].id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    """파일 업로드 및 파싱"""
    # CORS preflight 처리
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        if 'file' not in request.files:
            return jsonify({'error': '파일이 없습니다.'}), 400
        
        file = request.files['file']
        year = int(request.form.get('year', 2024))
        version = request.form.get('version', '본예산')
        is_delta = request.form.get('is_delta', 'false').lower() == 'true'  # 증감분 모드
        
        if file.filename == '':
            return jsonify({'error': '파일명이 없습니다.'}), 400
        
        # 임시 파일로 저장
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
            file.save(tmp_file.name)
            tmp_path = tmp_file.name
        
        try:
            # 파일 확장자에 따라 파싱
            file_ext = os.path.splitext(file.filename)[1].lower()
            
            if file_ext in ['.xlsx', '.xls']:
                budget_rows = parse_excel_file(tmp_path, year, version)
            elif file_ext == '.csv':
                budget_rows = parse_csv_file(tmp_path, year, version)
            elif file_ext == '.numbers':
                # Numbers 파일은 Excel로 변환 필요 안내
                return jsonify({
                    'error': 'Numbers 파일은 Excel 형식으로 내보낸 후 업로드해주세요.'
                }), 400
            else:
                return jsonify({'error': '지원하지 않는 파일 형식입니다.'}), 400
            
            if not budget_rows:
                return jsonify({'error': '파싱된 데이터가 없습니다. 파일 형식을 확인해주세요.'}), 400
            
            # 증감분 모드인 경우 본예산과 합산
            if is_delta and version != '본예산' and db is not None:
                # 본예산 데이터 불러오기
                base_budgets_ref = db.collection('budgets')
                base_docs = base_budgets_ref.where('year', '==', year).where('version', '==', '본예산').stream()
                
                # 본예산 데이터를 사업명으로 매핑
                base_budgets_map = {}
                for doc in base_docs:
                    data = doc.to_dict()
                    project_name = (data.get('projectName', '') or '').strip()
                    if project_name:
                        base_budgets_map[project_name] = {
                            'id': doc.id,
                            'data': data
                        }
                
                # 증감분 적용
                final_budgets = []
                processed_projects = set()
                
                for delta_row in budget_rows:
                    project_name = delta_row.get('projectName', '').strip()
                    change_type = delta_row.get('changeType', '').strip().lower()
                    
                    if not project_name:
                        continue
                    
                    processed_projects.add(project_name)
                    
                    if change_type in ['new', '신규']:
                        # 신규 사업: 그대로 추가
                        final_budgets.append(delta_row)
                    elif change_type in ['delete', '삭제']:
                        # 삭제 사업: 추가하지 않음
                        continue
                    elif change_type in ['increase', '증가', '증액'] or change_type in ['decrease', '감소', '감액'] or change_type in ['change', '변경']:
                        # 기존 사업 증감: 본예산과 합산
                        if project_name in base_budgets_map:
                            base_data = base_budgets_map[project_name]['data']
                            
                            # 본예산 데이터 복사
                            final_row = {
                                'projectName': project_name,
                                'department': base_data.get('department', delta_row.get('department', '')),
                                'totalAmount': base_data.get('totalAmount', 0),
                                'contribution': base_data.get('contribution', {'도비': 0, '시군비': {}}).copy(),
                                'grant': base_data.get('grant', {'국비': 0, '도비': 0, '시군비': {}, '자체': 0}).copy(),
                                'ownFunds': base_data.get('ownFunds', 0),
                                'year': year,
                                'version': version,
                            }
                            
                            # 증감분 적용
                            final_row['totalAmount'] += delta_row.get('totalAmount', 0)
                            
                            # 출연금 증감
                            delta_contrib = delta_row.get('contribution', {})
                            final_row['contribution']['도비'] = (final_row['contribution'].get('도비', 0) or 0) + (delta_contrib.get('도비', 0) or 0)
                            delta_contrib_cities = delta_contrib.get('시군비', {})
                            if isinstance(delta_contrib_cities, dict):
                                final_cities = final_row['contribution'].get('시군비', {})
                                if not isinstance(final_cities, dict):
                                    final_cities = {}
                                for city, amount in delta_contrib_cities.items():
                                    final_cities[city] = (final_cities.get(city, 0) or 0) + (amount or 0)
                                final_row['contribution']['시군비'] = final_cities
                            
                            # 보조금 증감
                            delta_grant = delta_row.get('grant', {})
                            final_row['grant']['국비'] = (final_row['grant'].get('국비', 0) or 0) + (delta_grant.get('국비', 0) or 0)
                            final_row['grant']['도비'] = (final_row['grant'].get('도비', 0) or 0) + (delta_grant.get('도비', 0) or 0)
                            delta_grant_cities = delta_grant.get('시군비', {})
                            if isinstance(delta_grant_cities, dict):
                                final_cities = final_row['grant'].get('시군비', {})
                                if not isinstance(final_cities, dict):
                                    final_cities = {}
                                for city, amount in delta_grant_cities.items():
                                    final_cities[city] = (final_cities.get(city, 0) or 0) + (amount or 0)
                                final_row['grant']['시군비'] = final_cities
                            
                            # 자체재원 증감
                            final_row['ownFunds'] = (final_row.get('ownFunds', 0) or 0) + (delta_row.get('ownFunds', 0) or 0)
                            
                            final_budgets.append(final_row)
                        else:
                            # 본예산에 없는 사업은 신규로 처리
                            final_budgets.append(delta_row)
                    else:
                        # 구분이 없거나 명확하지 않으면 전체 교체 모드로 처리
                        final_budgets.append(delta_row)
                
                # 본예산에 있지만 추경에서 처리되지 않은 사업은 그대로 유지
                for project_name, base_info in base_budgets_map.items():
                    if project_name not in processed_projects:
                        base_data = base_info['data']
                        final_budgets.append({
                            'projectName': project_name,
                            'department': base_data.get('department', ''),
                            'totalAmount': base_data.get('totalAmount', 0),
                            'contribution': base_data.get('contribution', {'도비': 0, '시군비': {}}),
                            'grant': base_data.get('grant', {'국비': 0, '도비': 0, '시군비': {}, '자체': 0}),
                            'ownFunds': base_data.get('ownFunds', 0),
                            'year': year,
                            'version': version,
                        })
                
                budget_rows = final_budgets
            
            # Firestore에 저장
            if db is None:
                # Firestore가 초기화되지 않은 경우, 파싱된 데이터만 반환
                response = jsonify({
                    'success': True,
                    'count': len(budget_rows),
                    'message': f'{len(budget_rows)}개의 예산 항목이 성공적으로 파싱되었습니다.',
                    'data': budget_rows[:10],  # 샘플 데이터만 반환
                    'warning': 'Firestore 저장을 활성화하려면 Firebase 서비스 계정 키를 설정해주세요. 현재는 파일 파싱만 완료되었습니다.'
                })
                response.headers.add('Access-Control-Allow-Origin', '*')
                return response, 200
            
            budgets_ref = db.collection('budgets')
            batch = db.batch()
            
            # 기존 데이터 삭제 (같은 연도/버전)
            existing_docs = budgets_ref.where('year', '==', year).where('version', '==', version).stream()
            delete_batch = db.batch()
            delete_count = 0
            for doc in existing_docs:
                delete_batch.delete(doc.reference)
                delete_count += 1
                if delete_count % 500 == 0:
                    delete_batch.commit()
                    delete_batch = db.batch()
            if delete_count % 500 != 0:
                delete_batch.commit()
            
            # 새 데이터 저장
            for idx, budget_row in enumerate(budget_rows):
                doc_ref = budgets_ref.document()
                batch.set(doc_ref, budget_row)
                
                # 배치 크기 제한 (500개)
                if (idx + 1) % 500 == 0:
                    batch.commit()
                    batch = db.batch()
            
            # 남은 데이터 커밋
            if len(budget_rows) % 500 != 0:
                batch.commit()
            
            response = jsonify({
                'success': True,
                'count': len(budget_rows),
                'message': f'{len(budget_rows)}개의 예산 항목이 저장되었습니다.'
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 200
            
        finally:
            # 임시 파일 삭제
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
                
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback.print_exc()
        return jsonify({'error': error_msg}), 500


@app.route('/api/upload/preview', methods=['POST', 'OPTIONS'])
def upload_preview():
    """파일 업로드 미리보기 (파싱만 하고 저장하지 않음)"""
    # CORS preflight 처리
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response

    try:
        if 'file' not in request.files:
            return jsonify({'error': '파일이 없습니다.'}), 400

        file = request.files['file']
        year = int(request.form.get('year', 2024))
        version = request.form.get('version', '본예산')

        if file.filename == '':
            return jsonify({'error': '파일명이 없습니다.'}), 400

        # 임시 파일로 저장
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
            file.save(tmp_file.name)
            tmp_path = tmp_file.name

        try:
            # 파일 확장자에 따라 파싱
            file_ext = os.path.splitext(file.filename)[1].lower()

            if file_ext in ['.xlsx', '.xls']:
                budget_rows = parse_excel_file(tmp_path, year, version)
            elif file_ext == '.csv':
                budget_rows = parse_csv_file(tmp_path, year, version)
            elif file_ext == '.numbers':
                # Numbers 파일은 Excel로 변환 필요 안내
                return jsonify({
                    'error': 'Numbers 파일은 Excel 형식으로 내보낸 후 업로드해주세요.'
                }), 400
            else:
                return jsonify({'error': '지원하지 않는 파일 형식입니다.'}), 400

            if not budget_rows:
                return jsonify({'error': '파싱된 데이터가 없습니다. 파일 형식을 확인해주세요.'}), 400

            # 전체 데이터 반환 (표준 형식 변환을 위해)
            # 미리보기용으로는 상위 10개만 표시하지만, 전체 데이터도 함께 전송
            preview_rows = budget_rows[:10]

            response = jsonify({
                'success': True,
                'count': len(budget_rows),
                'message': f'{len(budget_rows)}개의 예산 항목이 파싱되었습니다. (미리보기용)',
                'preview': preview_rows,
                'allData': budget_rows,  # 전체 데이터 추가 (표준 형식 변환용)
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 200

        finally:
            # 임시 파일 삭제
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback.print_exc()
        return jsonify({'error': error_msg}), 500


@app.route('/api/budgets/<int:year>/<version>', methods=['GET'])
def get_budgets_by_year_version(year: int, version: str):
    """연도와 버전으로 예산 데이터 조회"""
    try:
        budgets_ref = db.collection('budgets')
        query = budgets_ref.where('year', '==', year).where('version', '==', version)
        budgets = query.stream()
        budgets_list = [doc.to_dict() for doc in budgets]
        return jsonify(budgets_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/google-apps-script', methods=['POST', 'OPTIONS'])
def proxy_google_apps_script():
    """
    Google Apps Script 호출을 프록시하는 엔드포인트
    CORS 문제를 해결하기 위해 백엔드를 통해 요청을 전달
    """
    # CORS preflight 처리
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        # 프론트엔드에서 받은 데이터
        data = request.get_json()
        
        # Google Apps Script URL 가져오기
        script_url = data.get('scriptUrl')
        if not script_url:
            return jsonify({'success': False, 'error': 'Google Apps Script URL이 필요합니다.'}), 400
        
        # Google Apps Script에 전달할 페이로드
        payload = {
            'action': data.get('action', 'sync'),
            'spreadsheetId': data.get('spreadsheetId'),
            'sheetName': data.get('sheetName', '예산데이터'),
            'year': data.get('year'),
            'version': data.get('version'),
            'actionType': data.get('actionType', 'export'),
            'data': data.get('data', [])
        }
        
        # Google Apps Script에 요청 전달
        import requests
        
        # Google Apps Script는 POST 요청 시 특별한 처리가 필요함
        # 세션을 사용하여 쿠키와 리다이렉트를 올바르게 처리
        session = requests.Session()
        
        # 첫 번째 요청 (리다이렉트를 따라감)
        response = session.post(
            script_url,
            json=payload,
            timeout=300,  # 5분 타임아웃
            headers={
                'Content-Type': 'application/json'
            },
            allow_redirects=True  # 리다이렉트 따라가기
        )
        
        # 디버깅: 응답 정보 로그
        print(f"Google Apps Script 응답 상태: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type', 'N/A')}")
        print(f"응답 길이: {len(response.text)}")
        print(f"응답 시작 부분: {response.text[:200]}")
        
        # 응답 처리
        content_type = response.headers.get('Content-Type', '').lower()
        response_text = response.text.strip()
        
        # JSON 응답인 경우 (Content-Type 확인 또는 내용 확인)
        is_json = False
        if 'application/json' in content_type:
            is_json = True
        elif response_text.startswith('{') or response_text.startswith('['):
            # Content-Type이 없어도 JSON 형식이면 파싱 시도
            is_json = True
        
        if is_json:
            try:
                result = response.json()
            except Exception as json_error:
                # JSON 파싱 실패
                result = {
                    'success': False,
                    'error': f'JSON 파싱 오류: {str(json_error)}',
                    'status_code': response.status_code,
                    'content_type': content_type,
                    'response_text': response_text[:1000]
                }
        else:
            # HTML 또는 다른 형식의 응답
            # Google Apps Script 오류 페이지인 경우 HTML에서 오류 메시지 추출 시도
            import re
            error_message = '알 수 없는 오류'
            error_details = []
            
            # HTML에서 오류 정보 추출
            if '<title>' in response_text.lower():
                title_match = re.search(r'<title>(.*?)</title>', response_text, re.IGNORECASE | re.DOTALL)
                if title_match:
                    error_message = title_match.group(1).strip()
                    error_details.append(f'제목: {error_message}')
            
            # body 태그 내의 텍스트 추출
            body_match = re.search(r'<body[^>]*>(.*?)</body>', response_text, re.IGNORECASE | re.DOTALL)
            if body_match:
                body_text = re.sub(r'<[^>]+>', ' ', body_match.group(1))
                body_text = ' '.join(body_text.split())
                if body_text and len(body_text) > 10:
                    error_details.append(f'내용: {body_text[:500]}')
            
            # 전체 HTML 저장 (디버깅용)
            print(f"Google Apps Script HTML 오류 응답 전체:")
            print(response_text)
            
            result = {
                'success': False,
                'error': f'예상치 못한 응답 형식입니다. Content-Type: {content_type}',
                'status_code': response.status_code,
                'content_type': content_type,
                'response_text': response_text[:2000],  # 더 많은 정보 제공
                'html_title': error_message,
                'error_details': error_details,
                'message': f'Google Apps Script가 HTML 오류를 반환했습니다. 오류: {error_message}. Google Apps Script 코드와 권한을 확인해주세요.'
            }
        
        # CORS 헤더 추가
        flask_response = jsonify(result)
        flask_response.headers.add('Access-Control-Allow-Origin', '*')
        return flask_response
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        error_response = jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        })
        error_response.headers.add('Access-Control-Allow-Origin', '*')
        return error_response, 500

@app.route('/api/export/hwp', methods=['POST', 'OPTIONS'])
def export_hwp():
    """HWP 파일 내보내기"""
    # CORS preflight 처리
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        year = data.get('year', 2024)
        version = data.get('version', '본예산')
        budgets = data.get('budgets', [])
        
        # HWP 파일 생성 (RTF 형식으로 대체 - 브라우저 호환성)
        # 실제 HWP는 복잡하므로 RTF 형식으로 생성
        rtf_content = f"""{{\\rtf1\\ansi\\deff0
{{\\fonttbl{{\\f0\\fnil\\fcharset129 맑은 고딕;}}}}
\\f0\\fs24
{{\\b {year}년 {version} 예산 목록}}\\par\\par
"""
        
        # 테이블 헤더
        rtf_content += "사업명\\tab 소관부서\\tab 합계\\tab 출연금\\tab 보조금\\tab 자체\\par\\par\n"
        
        # 데이터 행
        for budget in budgets:
            project_name = budget.get('projectName', '')
            department = budget.get('department', '')
            total = budget.get('totalAmount', 0)
            
            contrib = budget.get('contribution', {})
            contrib_do = contrib.get('도비', 0)
            contrib_cities = contrib.get('시군비', {})
            contrib_city_total = sum(contrib_cities.values()) if isinstance(contrib_cities, dict) else 0
            contrib_total = contrib_do + contrib_city_total
            
            grant = budget.get('grant', {})
            grant_national = grant.get('국비', 0)
            grant_do = grant.get('도비', 0)
            grant_cities = grant.get('시군비', {})
            grant_city_total = sum(grant_cities.values()) if isinstance(grant_cities, dict) else 0
            grant_self = grant.get('자체', 0)
            grant_total = grant_national + grant_do + grant_city_total + grant_self
            
            own_funds = budget.get('ownFunds', 0) or grant_self
            
            rtf_content += f"{project_name}\\tab {department}\\tab {total:,}\\tab {contrib_total:,}\\tab {grant_total:,}\\tab {own_funds:,}\\par\n"
        
        rtf_content += "}"
        
        # RTF 파일로 반환 (HWP 호환)
        from flask import Response
        response = Response(
            rtf_content.encode('utf-8'),
            mimetype='application/x-hwp',
            headers={
                'Content-Disposition': f'attachment; filename="{year}년_{version}_예산목록.hwp"',
                'Access-Control-Allow-Origin': '*',
            }
        )
        return response
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # 포트 5000이 사용 중일 수 있으므로 5001로 변경
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, port=port, host='0.0.0.0')

