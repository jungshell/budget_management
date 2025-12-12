# 예산 금액 파싱 문제 개선 가이드

## 문제점

예산 금액이 잘못 파싱되는 주요 원인:

1. **컬럼 매핑 오류**: 엑셀 파일의 컬럼명이 표준 형식과 다를 때
2. **합계/소계 행 처리**: 합계, 소계 행이 실제 데이터로 파싱됨
3. **시군비 세부 항목 누락**: 출연금-천안시비 같은 세부 항목이 누락됨
4. **데이터 타입 변환 오류**: 숫자 형식이 아닌 값이 그대로 저장됨

## 개선 방법

### 1. 엑셀 파일 표준 형식 준수

업로드할 엑셀 파일은 다음 형식을 따라야 합니다:

```
| 사업명 | 부서명 | 합계 | 출연금-도비 | 출연금-천안시비 | 출연금-아산시비 | ... | 보조금-국비 | 보조금-도비 | ... | 자체 |
```

**중요 컬럼:**
- `I`: 사업명
- `J`: 부서명
- `K`: 합계-전체합계
- `L`: 합계-국비
- `M`: 합계-도비
- `N`: 합계-시군비 소계
- `O`: 합계-천안시비
- `P`: 합계-아산시비
- `Q`: 합계-당진시비
- `R`: 합계-자체
- `U`: 출연금-도비
- `W`: 출연금-천안시비
- `AB`: 보조금-도비
- `AD`: 보조금-천안시비
- `AG`: 자체

### 2. 파싱 로직 개선 포인트

#### 2.1 컬럼 감지 개선

`functions/parse_excel.py`의 `detect_column_mapping` 함수를 개선:

```python
# 출연금-천안시비 컬럼 감지 개선
contrib_city_cols = {}
CHUNGNAM_CITIES = ['천안시', '아산시', '공주시', ...]
CHUNGNAM_CITY_NAMES = ['천안', '아산', '공주', ...]

for col in df_columns:
    col_normalized = col.replace(' ', '').replace('-', '').replace('_', '').replace('시비', '시').replace('군비', '군')
    for city_idx, city in enumerate(CHUNGNAM_CITIES):
        city_name = CHUNGNAM_CITY_NAMES[city_idx]
        if ((city in col or city_name in col_normalized) and 
            '합계' not in col and '소계' not in col):
            contrib_city_cols[city] = col
```

#### 2.2 합계/소계 행 필터링

```python
# 합계/소계 행 제외
if is_subtotal_row(project_name):
    continue

# 구분별 합계 행 제외 (5행, 7행, 37행, 38행)
if row_index in [5, 7, 37, 38]:
    continue
```

#### 2.3 데이터 검증

파싱 후 각 행의 데이터를 검증:

```python
# 총액과 세부 항목 합계 일치 확인
calculated_total = contrib_do + contrib_city_total + grant_national + grant_do + grant_city_total + own_funds
if abs(total_amount - calculated_total) > 1000:
    logger.warning(f"행 {row_index}: 총액 불일치 - {total_amount} vs {calculated_total}")
```

### 3. 검증 리포트 활용

업로드 후 반드시 검증 리포트를 확인:

1. **예산 관리** 페이지 → **검증 리포트** 버튼 클릭
2. 오류 및 경고 항목 확인
3. 특히 "출연금 시군비" 관련 경고 확인

### 4. 디버깅 방법

#### 4.1 파싱 로그 확인

`functions/parse_excel.py`에 디버그 로그 추가:

```python
print(f"  행 {idx + 1}: 출연금 {city} 파싱 - {amount:,}원 (컬럼: {col_name})")
```

#### 4.2 미리보기 확인

업로드 전 미리보기에서 데이터 확인:
- 출연금-천안시비 값이 올바른지 확인
- 총액과 세부 항목 합계가 일치하는지 확인

#### 4.3 Firestore 데이터 확인

Firebase Console에서 실제 저장된 데이터 확인:
- `budgets` 컬렉션
- `contribution.시군비.천안시` 필드 확인

### 5. 문제 해결 체크리스트

- [ ] 엑셀 파일이 표준 형식을 따르는가?
- [ ] 합계/소계 행이 제외되었는가?
- [ ] 컬럼명이 정확히 매칭되는가? (공백, 하이픈, 언더스코어 처리)
- [ ] 시군비 세부 항목이 모두 파싱되었는가?
- [ ] 검증 리포트에서 오류가 없는가?
- [ ] 미리보기와 실제 업로드 결과가 일치하는가?

### 6. 자주 발생하는 문제

#### 문제 1: 출연금-천안시비가 0으로 나옴

**원인**: 컬럼명 매칭 실패
- "출연금-천안시비" vs "출연금-천안"
- "출연금 천안시비" (공백)

**해결**: `col_normalized`로 정규화하여 매칭

#### 문제 2: 출연금-도비가 합계로 나옴

**원인**: 합계 컬럼(S열)을 도비 컬럼(U열)로 잘못 인식

**해결**: '합계', '소계', 'total', 'sum' 포함 컬럼 제외

#### 문제 3: 행 순서가 뒤죽박죽

**원인**: `rowIndex` 미저장 또는 정렬 누락

**해결**: 파싱 시 `rowIndex` 저장, 표시 시 정렬

## 개선 작업 순서

1. **엑셀 파일 표준화**: 업로드할 파일을 표준 형식으로 정리
2. **파싱 로직 개선**: `functions/parse_excel.py` 수정
3. **검증 리포트 확인**: 업로드 후 반드시 확인
4. **문제 발견 시**: 
   - 데이터 삭제 (Settings → 데이터 삭제)
   - 엑셀 파일 재확인
   - 다시 업로드

