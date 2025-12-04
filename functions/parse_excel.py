"""
Excel 파일 파싱 모듈
"""
import pandas as pd
import openpyxl
from typing import Dict, List, Any, Optional
import re


def detect_column_mapping(df: pd.DataFrame) -> Dict[str, str]:
    """
    엑셀 파일의 컬럼을 자동으로 매핑
    """
    column_mapping = {}
    df_columns = [str(col).strip() for col in df.columns]
    
    # 가능한 컬럼명 패턴 (더 많은 변형 추가)
    patterns = {
        'projectName': ['사업명', '사업', '프로젝트', 'project', '사업명칭', '사업명칭', '사업제목', '프로젝트명'],
        'department': ['소관부서', '부서', '담당부서', '소관', 'department', '관리부서', '담당', '소관기관'],
        'totalAmount': ['합계', '총액', '예산액', 'total', '합계금액', '총예산', '예산', '금액', '합계(원)', '총액(원)', '예산(원)'],
        'contribution': ['출연금', '출연', 'contribution', '출연금액', '출연(원)'],
        'grant': ['보조금', '보조', 'grant', '보조금액', '보조(원)'],
        'ownFunds': ['자체', '자체예산', '자체자금', 'own', '자체금액', '자체(원)', '자체재원'],
        'national': ['국비', '국고', 'national', '국가', '국비(원)', '국고(원)'],
        'provincial': ['도비', '도', 'provincial', '도예산', '도비(원)', '도예산(원)'],
        'cityCounty': ['시군비', '시군', 'city', 'county', '시군예산', '시군비(원)', '시군(원)'],
    }
    
    for key, possible_names in patterns.items():
        for col in df_columns:
            col_lower = col.lower()  # 대소문자 무시
            for name in possible_names:
                # 정확히 일치하거나 포함되는 경우
                if name in col or name.lower() in col_lower:
                    column_mapping[key] = col
                    break
            if key in column_mapping:
                break
    
    return column_mapping


def parse_amount(value: Any) -> int:
    """
    금액 문자열을 숫자로 변환
    예: "50억원" -> 5000000000, "1,000,000" -> 1000000
    """
    if pd.isna(value) or value == '':
        return 0
    
    # 숫자만 추출
    if isinstance(value, (int, float)):
        return int(value)
    
    value_str = str(value).strip()
    
    # 억원, 만원 단위 처리
    if '억' in value_str:
        number = re.sub(r'[^\d.]', '', value_str.split('억')[0])
        try:
            return int(float(number) * 100000000)
        except:
            return 0
    
    if '만' in value_str:
        number = re.sub(r'[^\d.]', '', value_str.split('만')[0])
        try:
            return int(float(number) * 10000)
        except:
            return 0
    
    # 일반 숫자 (콤마 제거)
    number = re.sub(r'[^\d.]', '', value_str)
    try:
        return int(float(number))
    except:
        return 0


def parse_excel_file(file_path: str, year: int, version: str = '본예산') -> List[Dict[str, Any]]:
    """
    엑셀 파일을 파싱하여 예산 데이터 리스트로 변환
    
    Args:
        file_path: 엑셀 파일 경로
        year: 연도
        version: 예산 버전 (본예산, 1차 추경, 2차 추경, 3차 추경)
    
    Returns:
        예산 데이터 리스트
    """
    try:
        # 엑셀 파일 읽기 (헤더 없이 먼저 읽어서 구조 파악)
        df_raw = pd.read_excel(file_path, sheet_name=0, engine='openpyxl', header=None)
        
        # 헤더 행 찾기 (사업명, 부서, 합계가 포함된 행)
        header_row = None
        for idx in range(min(10, len(df_raw))):
            row_values = [str(val).strip() for val in df_raw.iloc[idx].values if pd.notna(val)]
            # 사업명, 부서, 합계가 모두 포함된 행을 헤더로 간주
            has_project = any('사업' in str(val) for val in row_values)
            has_dept = any('부서' in str(val) or '소관' in str(val) for val in row_values)
            has_total = any('합계' in str(val) for val in row_values)
            if has_project and (has_dept or has_total):
                header_row = idx
                break
        
        # 헤더 행을 찾지 못한 경우 기본값 사용
        if header_row is None:
            header_row = 0
        
        # 헤더 행을 사용하여 다시 읽기
        df = pd.read_excel(file_path, sheet_name=0, engine='openpyxl', header=header_row)
        
        # 빈 행 제거
        df = df.dropna(how='all')
        
        # 디버깅: 실제 컬럼명 출력
        print(f"헤더 행: {header_row}")
        print(f"실제 엑셀 파일 컬럼명: {list(df.columns)}")
        
        # 컬럼 매핑 자동 감지
        column_mapping = detect_column_mapping(df)
        print(f"매핑된 컬럼: {column_mapping}")
        
        # 필수 컬럼 확인
        required_columns = ['projectName', 'department', 'totalAmount']
        missing_columns = [col for col in required_columns if col not in column_mapping]
        
        if missing_columns:
            # 더 자세한 오류 메시지 제공
            available_columns = list(df.columns)
            error_msg = f"필수 컬럼을 찾을 수 없습니다: {missing_columns}\n"
            error_msg += f"실제 파일의 컬럼명: {available_columns}\n"
            error_msg += f"매핑된 컬럼: {column_mapping}"
            raise ValueError(error_msg)
        
        # 데이터 파싱
        budget_rows = []
        
        for idx, row in df.iterrows():
            try:
                # 기본 정보
                project_name = str(row[column_mapping['projectName']]).strip()
                department = str(row[column_mapping.get('department', '')]).strip()
                
                if not project_name or project_name == 'nan':
                    continue
                
                # 소계/총계 등 집계 행은 건너뛰기
                normalized_name = project_name.replace(' ', '')
                if any(key in normalized_name for key in ['소계', '총계']):
                    continue
                
                # 총액
                total_amount = parse_amount(row[column_mapping['totalAmount']])
                
                # 출연금 구조
                contribution = {
                    '도비': 0,
                    '시군비': {},
                }
                
                # 보조금 구조
                grant = {
                    '국비': 0,
                    '도비': 0,
                    '시군비': {},
                }
                
                # 자체
                own_funds = 0
                
                # 출연금 파싱
                if 'contribution' in column_mapping:
                    contribution_total = parse_amount(row[column_mapping['contribution']])
                    # 도비, 시군비 분리 (추후 개선 필요)
                    contribution['도비'] = contribution_total
                
                # 보조금 파싱
                if 'grant' in column_mapping:
                    grant_total = parse_amount(row[column_mapping['grant']])
                    # 국비, 도비, 시군비 분리 (추후 개선 필요)
                    grant['국비'] = grant_total
                
                # 자체 파싱
                if 'ownFunds' in column_mapping:
                    own_funds = parse_amount(row[column_mapping['ownFunds']])
                
                # 국비, 도비, 시군비 직접 컬럼이 있는 경우
                if 'national' in column_mapping:
                    grant['국비'] = parse_amount(row[column_mapping['national']])
                
                if 'provincial' in column_mapping:
                    contribution['도비'] = parse_amount(row[column_mapping['provincial']])
                    grant['도비'] = parse_amount(row[column_mapping['provincial']])
                
                if 'cityCounty' in column_mapping:
                    city_county_amount = parse_amount(row[column_mapping['cityCounty']])
                    # 시군비는 기본적으로 빈 딕셔너리로 시작
                    contribution['시군비'] = {}
                    grant['시군비'] = {}
                
                budget_row = {
                    'projectName': project_name,
                    'department': department,
                    'totalAmount': total_amount,
                    'contribution': contribution,
                    'grant': grant,
                    'ownFunds': own_funds,
                    'year': year,
                    'version': version,
                    # 엑셀의 원래 행 순서를 보존하기 위한 인덱스
                    'rowIndex': int(idx),
                }
                
                budget_rows.append(budget_row)
                
            except Exception as e:
                print(f"행 {idx + 1} 파싱 오류: {str(e)}")
                continue
        
        return budget_rows
        
    except Exception as e:
        raise Exception(f"엑셀 파일 파싱 오류: {str(e)}")


def parse_csv_file(file_path: str, year: int, version: str = '본예산') -> List[Dict[str, Any]]:
    """
    CSV 파일을 파싱하여 예산 데이터 리스트로 변환
    """
    try:
        # CSV 파일 읽기 (UTF-8 인코딩 시도)
        encodings = ['utf-8', 'utf-8-sig', 'cp949', 'euc-kr']
        df = None
        
        for encoding in encodings:
            try:
                df = pd.read_csv(file_path, encoding=encoding)
                break
            except:
                continue
        
        if df is None:
            raise ValueError("CSV 파일 인코딩을 확인할 수 없습니다.")
        
        # 엑셀 파싱과 동일한 로직 사용
        return parse_excel_file(file_path, year, version)
        
    except Exception as e:
        raise Exception(f"CSV 파일 파싱 오류: {str(e)}")

