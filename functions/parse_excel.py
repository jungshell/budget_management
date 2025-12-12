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
        'changeType': ['구분', '변경구분', '유형', 'type', '변경', '추경구분', '구분(추경)'],
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
        
        # 헤더 행 찾기 (사업명이 포함된 행 - 1행 또는 3행 중 하나)
        header_row = None
        for idx in range(min(10, len(df_raw))):
            row_values = [str(val).strip() for val in df_raw.iloc[idx].values if pd.notna(val)]
            # 사업명이 포함된 행을 헤더로 간주
            has_project = any('사업' in str(val) for val in row_values)
            if has_project:
                header_row = idx
                break
        
        # 헤더 행을 찾지 못한 경우 기본값 사용
        if header_row is None:
            header_row = 0
        
        # 멀티레벨 헤더 처리 (3행 헤더 구조)
        # header_row가 0이면 0, 1, 2행을 헤더로 사용
        # header_row가 2면 2, 3, 4행을 헤더로 사용
        try:
            # 먼저 3행 헤더로 읽기 시도
            df = pd.read_excel(file_path, sheet_name=0, engine='openpyxl', header=[header_row, header_row+1, header_row+2])
            # 멀티레벨 컬럼명을 문자열로 변환
            # 튜플인 경우: ("출연금", "출연금-시군비", "출연금-천안") -> "출연금/출연금-시군비/출연금-천안"
            # 단일 값인 경우: 그대로 사용
            new_columns = []
            for col in df.columns:
                if isinstance(col, tuple):
                    # 튜플의 각 요소를 결합 (nan 제외)
                    col_parts = [str(c) for c in col if pd.notna(c) and str(c).strip() and str(c).strip() != 'nan']
                    if col_parts:
                        new_columns.append('/'.join(col_parts))
                    else:
                        new_columns.append(str(col))
                else:
                    new_columns.append(str(col))
            df.columns = new_columns
            print(f"멀티레벨 헤더로 읽기 성공 (헤더 행: {header_row}, {header_row+1}, {header_row+2})")
        except Exception as e:
            # 멀티레벨 헤더 읽기 실패 시 단일 헤더로 읽기
            print(f"멀티레벨 헤더 읽기 실패, 단일 헤더로 읽기 시도: {e}")
            df = pd.read_excel(file_path, sheet_name=0, engine='openpyxl', header=header_row)
        
        # 빈 행 제거
        df = df.dropna(how='all')
        
        # 디버깅: 실제 컬럼명 출력
        print(f"헤더 행: {header_row}")
        print(f"실제 엑셀 파일 컬럼명: {list(df.columns)}")
        print(f"컬럼 개수: {len(df.columns)}")
        # 각 컬럼의 인덱스와 이름 출력
        for i, col in enumerate(df.columns):
            col_letter = chr(65 + i) if i < 26 else chr(64 + (i // 26)) + chr(65 + (i % 26))
            print(f"  컬럼 {i+1} ({col_letter}열): '{col}'")
        
        # 컬럼 매핑 자동 감지
        column_mapping = detect_column_mapping(df)
        print(f"매핑된 컬럼: {column_mapping}")
        
        # 필수 컬럼 확인 (자체재원은 선택사항)
        required_columns = ['projectName', 'department', 'totalAmount']
        missing_columns = [col for col in required_columns if col not in column_mapping]
        
        if missing_columns:
            # 더 자세한 오류 메시지 제공
            available_columns = list(df.columns)
            error_msg = f"필수 컬럼을 찾을 수 없습니다: {missing_columns}\n"
            error_msg += f"실제 파일의 컬럼명: {available_columns}\n"
            error_msg += f"매핑된 컬럼: {column_mapping}"
            raise ValueError(error_msg)
        
        # 자체재원 컬럼 매핑 확인 및 로깅
        if 'ownFunds' in column_mapping:
            print(f"자체재원 컬럼 발견 (매핑): {column_mapping['ownFunds']}")
        else:
            print("자체재원 컬럼을 자동 매핑에서 찾지 못했습니다. 수동 검색을 시도합니다.")
        
        # 데이터 파싱
        budget_rows = []
        
        for idx, row in df.iterrows():
            try:
                # 기본 정보
                project_name = str(row[column_mapping['projectName']]).strip()
                department = str(row[column_mapping.get('department', '')]).strip()
                
                # 사업명이 비어있거나 nan인 경우 건너뛰기
                if not project_name or project_name == 'nan' or project_name.lower() == 'nan':
                    continue
                
                # 구분 컬럼 확인 (구분별 합계 행 필터링)
                change_type_col = column_mapping.get('changeType')
                change_type_val = ''
                if change_type_col and change_type_col in row:
                    change_type_val = str(row[change_type_col]).strip()
                
                # 소계/합계/총계 등 집계 행은 건너뛰기 (더 강화된 필터링)
                normalized_name = project_name.replace(' ', '').replace('(', '').replace(')', '').replace(':', '').replace('：', '').replace('-', '').replace('_', '')
                normalized_name_lower = normalized_name.lower()
                normalized_change_type = change_type_val.replace(' ', '').replace('(', '').replace(')', '').replace(':', '').replace('：', '').replace('-', '').replace('_', '')
                
                # 다양한 소계/합계 패턴 인식
                aggregate_keywords = [
                    '소계', '합계', '총계', '계', '합', '소', '총',
                    'subtotal', 'total', 'sum', 'aggregate', 'summary',
                    '소계(원)', '합계(원)', '총계(원)',
                    '소계:', '합계:', '총계:',
                    '소계：', '합계：', '총계：',
                ]
                
                # 사업명에 집계 키워드가 포함되어 있는지 확인
                # 단, "합계"가 포함된 사업명도 있을 수 있으므로 더 엄격하게 체크
                # 사업명이 정확히 집계 키워드로만 이루어진 경우만 제외
                is_aggregate_row = False
                # 정확히 일치하는 경우만 (예: "합계", "소계", "총계")
                for keyword in ['소계', '합계', '총계', '계']:
                    if normalized_name == keyword or normalized_name == keyword + ':' or normalized_name == keyword + '：':
                        is_aggregate_row = True
                        break
                # 또는 사업명이 매우 짧고(3글자 이하) 집계 키워드로 시작/끝나는 경우
                if not is_aggregate_row and len(normalized_name) <= 3:
                    for keyword in aggregate_keywords:
                        if normalized_name.startswith(keyword) or normalized_name.endswith(keyword):
                            is_aggregate_row = True
                            break
                
                # 구분 컬럼에 집계 키워드가 있는지 확인 (예: "구분: 총계", "구분: 소계")
                is_aggregate_in_change_type = any(keyword in normalized_change_type or keyword in normalized_change_type.lower() for keyword in aggregate_keywords)
                
                # 총액 계산 (필터링 전에 미리 계산)
                total_amount = parse_amount(row[column_mapping['totalAmount']])
                
                # 사업명이 숫자만으로 이루어진 경우는 건너뛰지 않음 (사업명이 숫자일 수도 있음)
                # is_numeric_only = False  # 숫자만으로 된 사업명도 허용
                
                # 부서명이 비어있고 사업명이 비어있거나 매우 짧은 경우 (1글자)만 건너뛰기
                is_too_short = (not normalized_name or len(normalized_name) <= 1) and not department
                
                # 사업명이 특정 패턴을 가진 경우 (예: "합계:", "소계:", "총계:" 등)만 건너뛰기
                # 정확히 일치하는 경우만 (공백 제거 후)
                is_pattern_match = bool(re.match(r'^(소계|합계|총계|계|합|소|총)[:：]?\s*$', normalized_name, re.IGNORECASE))
                
                # 총액이 매우 크고(100억 이상) 사업명이 비어있거나 매우 짧은 경우(1글자 이하)만 합계 행으로 간주
                # 단, 부서명이 있으면 실제 사업일 수 있으므로 제외하지 않음
                is_large_total_with_short_name = total_amount > 10000000000 and (not normalized_name or len(normalized_name) <= 1) and not department
                
                # 사업명이 "합계"로 시작하거나 끝나는 경우만 건너뛰기 (중간에 포함된 것은 허용)
                # 단, "합계"가 포함된 사업명도 있을 수 있으므로 더 엄격하게 체크
                starts_or_ends_with_aggregate = (normalized_name.startswith(('소계', '합계', '총계', '계')) and len(normalized_name) <= 5) or (normalized_name.endswith(('소계', '합계', '총계', '계')) and len(normalized_name) <= 5)
                
                # 반환금, 예비비는 건너뛰기 (정확히 일치하는 경우만)
                is_reserve_or_refund = normalized_name in ['반환금', '예비비']
                
                # 집계 행 필터링 (더 완화 - 실제 사업을 제외하지 않도록)
                if is_aggregate_row or is_aggregate_in_change_type or is_too_short or is_pattern_match or is_large_total_with_short_name or starts_or_ends_with_aggregate or is_reserve_or_refund:
                    print(f"  집계 행 건너뛰기: '{project_name}' (구분: '{change_type_val}', idx: {idx}, 총액: {total_amount:,})")
                    continue
                
                # 총액 (위에서 이미 파싱했으므로 그대로 사용)
                
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
                
                # 모든 컬럼명을 확인하여 세부 항목 파싱
                df_columns = [str(col).strip() for col in df.columns]
                
                # 출연금 관련 컬럼 찾기
                contrib_do_col = None
                contrib_city_cols = {}
                
                # 먼저 시군별 컬럼을 찾아서 제외 (시군별 컬럼이 우선)
                CHUNGNAM_CITIES = ['천안시', '아산시', '공주시', '보령시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군']
                CHUNGNAM_CITY_NAMES = ['천안', '아산', '공주', '보령', '서산', '논산', '계룡', '당진', '금산', '부여', '서천', '청양', '홍성', '예산', '태안']
                
                contrib_col_count = 0
                for col in df_columns:
                    col_lower = col.lower()
                    # 출연금으로 시작하는 컬럼인지 확인
                    if '출연' in col or 'contribution' in col_lower:
                        contrib_col_count += 1
                        # 합계, 소계가 포함된 컬럼은 완전히 제외 (예: 출연금-합계, 출연금-소계)
                        if '합계' in col or '소계' in col or 'total' in col_lower or 'sum' in col_lower:
                            continue
                        
                        # 시군명이 포함된 컬럼인지 먼저 확인 (우선순위 높음)
                        city_found = None
                        for city_idx, city in enumerate(CHUNGNAM_CITIES):
                            city_name = CHUNGNAM_CITY_NAMES[city_idx]
                            # "출연금-천안시", "출연금-천안", "출연-천안", "출연금-천안시비" 등 다양한 형식 지원
                            # 정확한 매칭을 위해 컬럼명에서 시군명이 독립적으로 나타나는지 확인
                            # "출연금-천안" 형식도 인식하도록 개선
                            col_normalized = col.replace(' ', '').replace('-', '').replace('_', '').replace('시비', '시').replace('군비', '군')
                            # 천안시비, 천안시, 천안 등 다양한 형식 매칭
                            # 컬럼명에 시군명이 포함되어 있는지 확인
                            # "출연금-천안" 형식도 인식 (하이픈 포함)
                            # 멀티레벨 헤더 형식도 인식: "출연금/출연금-시군비/출연금-천안"
                            if (city_name in col_normalized or city in col or 
                                f'출연금-{city_name}' in col or f'출연금-{city}' in col or
                                f'출연-{city_name}' in col or f'출연-{city}' in col or
                                f'/출연금-{city_name}' in col or f'/출연금-{city}' in col or
                                f'출연금-시군비/출연금-{city_name}' in col or f'출연금-시군비/출연금-{city}' in col):
                                contrib_city_cols[city] = col
                                city_found = city
                                print(f"  출연금 시군 컬럼 발견: '{col}' -> {city} (정규화: {col_normalized})")
                                break
                        
                        # 시군 컬럼이 아니고, 도비 컬럼인 경우
                        if not city_found:
                            # 정확히 '도비'를 포함하는 컬럼만 선택 (도비가 명시적으로 포함되어야 함)
                            if '도비' in col:
                                if contrib_do_col is None:
                                    contrib_do_col = col
                                    print(f"  출연금 도비 컬럼 발견: '{col}'")
                            # '도'만 있고 '시군'이 없고, 시군명도 없는 경우 (하지만 합계/소계는 이미 제외됨)
                            elif ('도' in col and '시군' not in col and not any(city_name in col for city_name in CHUNGNAM_CITY_NAMES) and 'provincial' in col_lower):
                                if contrib_do_col is None:
                                    contrib_do_col = col
                                    print(f"  출연금 도비 컬럼 발견 (provincial): '{col}'")
                
                # 보조금 관련 컬럼 찾기
                grant_national_col = None
                grant_do_col = None
                grant_city_cols = {}
                
                grant_col_count = 0
                for col in df_columns:
                    col_lower = col.lower()
                    col_clean = str(col).strip()
                    
                    # 보조금으로 시작하는 컬럼인지 확인
                    if '보조' in col_clean or 'grant' in col_lower:
                        grant_col_count += 1
                        # 합계, 소계가 포함된 컬럼은 완전히 제외 (예: 보조금-합계, 보조금-소계)
                        if '합계' in col_clean or '소계' in col_clean or 'total' in col_lower or 'sum' in col_lower:
                            continue
                        
                        # 시군명이 포함된 컬럼인지 먼저 확인 (우선순위 높음)
                        city_found = None
                        for city_idx, city in enumerate(CHUNGNAM_CITIES):
                            city_name = CHUNGNAM_CITY_NAMES[city_idx]
                            # "보조금-천안시", "보조금-천안", "보조-천안", "보조금-천안시비" 등 다양한 형식 지원
                            # 정확한 매칭을 위해 컬럼명에서 시군명이 독립적으로 나타나는지 확인
                            # "보조금-천안" 형식도 인식하도록 개선
                            col_normalized = col_clean.replace(' ', '').replace('-', '').replace('_', '').replace('시비', '시').replace('군비', '군')
                            # 천안시비, 천안시, 천안 등 다양한 형식 매칭
                            # 컬럼명에 시군명이 포함되어 있는지 확인
                            # "보조금-천안" 형식도 인식 (하이픈 포함)
                            # 멀티레벨 헤더 형식도 인식: "보조금/보조금-시군비/보조금-천안"
                            if (city_name in col_normalized or city in col_clean or 
                                f'보조금-{city_name}' in col_clean or f'보조금-{city}' in col_clean or
                                f'보조-{city_name}' in col_clean or f'보조-{city}' in col_clean or
                                f'/보조금-{city_name}' in col_clean or f'/보조금-{city}' in col_clean or
                                f'보조금-시군비/보조금-{city_name}' in col_clean or f'보조금-시군비/보조금-{city}' in col_clean):
                                grant_city_cols[city] = col_clean
                                city_found = city
                                print(f"  보조금 시군 컬럼 발견: '{col_clean}' -> {city} (정규화: {col_normalized})")
                                break
                        
                        # 시군 컬럼이 아닌 경우
                        if not city_found:
                            # 보조금-국비 컬럼 찾기
                            if ('국비' in col_clean or '국고' in col_clean or 'national' in col_lower):
                                if grant_national_col is None:
                                    grant_national_col = col_clean
                                    print(f"  보조금 국비 컬럼 발견: '{col_clean}'")
                            # 보조금-도비 컬럼 찾기 (도비가 명시적으로 포함되어야 함)
                            # 멀티레벨 헤더 형식도 인식: "보조금/보조금-도비"
                            elif ('도비' in col_clean or 
                                  '/보조금-도비' in col_clean or 
                                  '보조금-도비' in col_clean or
                                  '보조금/보조금-도비' in col_clean):
                                if grant_do_col is None:
                                    grant_do_col = col_clean
                                    print(f"  보조금 도비 컬럼 발견: '{col_clean}'")
                            # '도'만 있고 '시군'이 없고, 시군명도 없는 경우 (하지만 합계/소계는 이미 제외됨)
                            elif ('도' in col_clean and '시군' not in col_clean and not any(city_name in col_clean for city_name in CHUNGNAM_CITY_NAMES) and 'provincial' in col_lower):
                                if grant_do_col is None:
                                    grant_do_col = col_clean
                                    print(f"  보조금 도비 컬럼 발견 (provincial): '{col_clean}'")
                
                # 자체재원 컬럼 찾기 (더 정확한 매칭)
                own_funds_col = None
                
                # 1순위: 컬럼 매핑에서 찾기
                if 'ownFunds' in column_mapping:
                    own_funds_col = column_mapping['ownFunds']
                
                # 2순위: 수동 검색 (매핑에서 찾지 못한 경우)
                if not own_funds_col:
                    for col in df_columns:
                        col_lower = col.lower().strip()
                        # '자체재원', '자체', 'own', 'self' 등 다양한 패턴 인식
                        # '시군', '도비', '출연', '보조'가 포함되지 않은 '자체' 관련 컬럼만 선택
                        if ('자체재원' in col or ('자체' in col and '시군' not in col and '도비' not in col and '출연' not in col and '보조' not in col)):
                            own_funds_col = col
                            break
                        elif ('own' in col_lower or 'self' in col_lower) and ('fund' in col_lower or 'resource' in col_lower or '재원' in col):
                            if 'city' not in col_lower and 'county' not in col_lower and 'provincial' not in col_lower:
                                own_funds_col = col
                                break
                
                # 구분 컬럼 찾기 (증감분 모드용)
                change_type = None
                if 'changeType' in column_mapping:
                    change_type_col = column_mapping['changeType']
                    if change_type_col in row:
                        change_type_val = str(row[change_type_col]).strip().lower()
                        if '신규' in change_type_val or 'new' in change_type_val:
                            change_type = 'new'
                        elif '증가' in change_type_val or '증액' in change_type_val or 'increase' in change_type_val or '+' in change_type_val:
                            change_type = 'increase'
                        elif '감소' in change_type_val or '감액' in change_type_val or 'decrease' in change_type_val or '-' in change_type_val:
                            change_type = 'decrease'
                        elif '삭제' in change_type_val or 'delete' in change_type_val:
                            change_type = 'delete'
                        elif '변경' in change_type_val or 'change' in change_type_val:
                            change_type = 'change'
                
                # 출연금 파싱
                # 출연금-도비 컬럼(U열) 파싱 (합계 컬럼이 아닌 실제 도비 컬럼)
                if contrib_do_col and contrib_do_col in row:
                    contribution['도비'] = parse_amount(row[contrib_do_col])
                
                # 출연금 시군비 파싱 (W열: 출연금-천안, X열: 출연금-아산, Y열: 출연금-당진 등)
                if contrib_city_cols:
                    contribution['시군비'] = {}
                    for city, col_name in contrib_city_cols.items():
                        if col_name in row:
                            amount = parse_amount(row[col_name])
                            # 0이 아닌 모든 값 저장 (0도 저장하여 명시적으로 표시)
                            contribution['시군비'][city] = amount
                            if amount > 0:
                                print(f"  행 {idx + 1}: 출연금 {city} 파싱 - {amount:,}원 (컬럼: {col_name})")
                elif 'contribution' in column_mapping:
                    # 출연금 총액만 있는 경우, 도비로 처리 (기존 로직 유지)
                    contribution_total = parse_amount(row[column_mapping['contribution']])
                    if contribution_total > 0 and contribution['도비'] == 0:
                        contribution['도비'] = contribution_total
                
                # 보조금 파싱
                # 보조금-국비 컬럼 파싱
                if grant_national_col and grant_national_col in row:
                    grant['국비'] = parse_amount(row[grant_national_col])
                
                # 보조금-도비 컬럼 파싱 (합계 컬럼이 아닌 실제 도비 컬럼)
                if grant_do_col and grant_do_col in row:
                    grant['도비'] = parse_amount(row[grant_do_col])
                
                # 보조금 시군비 파싱 (AD열: 보조금-천안, AE열: 보조금-아산, AF열: 보조금-당진 등)
                if grant_city_cols:
                    grant['시군비'] = {}
                    for city, col_name in grant_city_cols.items():
                        if col_name in row:
                            amount = parse_amount(row[col_name])
                            if amount > 0:
                                grant['시군비'][city] = amount
                elif 'grant' in column_mapping:
                    # 보조금 총액만 있는 경우, 국비로 처리 (기존 로직 유지)
                    grant_total = parse_amount(row[column_mapping['grant']])
                    if grant_total > 0 and grant['국비'] == 0:
                        grant['국비'] = grant_total
                
                # 자체재원 파싱 (우선순위: 컬럼 매핑 > 수동 검색)
                own_funds = 0
                if 'ownFunds' in column_mapping and column_mapping['ownFunds'] in row:
                    own_funds = parse_amount(row[column_mapping['ownFunds']])
                    if own_funds > 0 and idx < 3:  # 처음 몇 개 행만 로깅
                        print(f"  행 {idx + 1}: 자체재원 파싱 성공 (매핑) - {own_funds}원 (컬럼: {column_mapping['ownFunds']})")
                elif own_funds_col and own_funds_col in row:
                    own_funds = parse_amount(row[own_funds_col])
                    if own_funds > 0 and idx < 3:  # 처음 몇 개 행만 로깅
                        print(f"  행 {idx + 1}: 자체재원 파싱 성공 (수동) - {own_funds}원 (컬럼: {own_funds_col})")
                
                # 자체재원이 grant.자체에도 저장되도록 설정
                if own_funds > 0:
                    grant['자체'] = own_funds
                
                # 기존 컬럼 매핑 방식도 지원 (하위 호환성)
                # 기존 컬럼 매핑 방식은 제거 (멀티레벨 헤더에서 이미 구분됨)
                # 'provincial' 컬럼 매핑 로직 제거 - 출연금-도비와 보조금-도비가 이미 구분되어 파싱됨
                
                budget_row = {
                    'projectName': project_name,
                    'department': department,
                    'totalAmount': total_amount,
                    'contribution': contribution,
                    'grant': grant,
                    'ownFunds': own_funds,
                    'year': year,
                    'version': version,
                    # 엑셀의 원래 행 순서를 보존하기 위한 인덱스 (헤더 행 제외한 실제 데이터 행 번호)
                    'rowIndex': int(idx),
                }
                
                # rowIndex를 기준으로 정렬하기 위해 저장
                # (나중에 프론트엔드에서 정렬할 때 사용)
                
                # 구분이 있으면 추가
                if change_type:
                    budget_row['changeType'] = change_type
                
                budget_rows.append(budget_row)
                
            except Exception as e:
                print(f"행 {idx + 1} 파싱 오류: {str(e)}")
                continue
        
        # rowIndex 기준으로 정렬하여 원본 파일 순서 유지
        budget_rows.sort(key=lambda x: x.get('rowIndex', 999999))
        
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

