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
CORS(app, resources={r"/api/*": {"origins": "*"}})

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

            # 미리보기용 응답 (상위 10개 항목만 전송)
            preview_rows = budget_rows[:10]

            response = jsonify({
                'success': True,
                'count': len(budget_rows),
                'message': f'{len(budget_rows)}개의 예산 항목이 파싱되었습니다. (미리보기용)',
                'preview': preview_rows,
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


if __name__ == '__main__':
    # 포트 5000이 사용 중일 수 있으므로 5001로 변경
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, port=port, host='0.0.0.0')

