# Firestore 복합 인덱스 생성 가이드

## 문제
변경 이력 조회 시 "The query requires an index" 오류가 발생합니다.
이는 `budget_history` 컬렉션에서 `budgetId`로 필터링하고 `changedAt`으로 정렬하는 복합 쿼리를 사용하기 때문입니다.

## 해결 방법: Firebase 콘솔에서 인덱스 생성

### 방법 1: 오류 메시지의 링크 사용 (가장 빠름)
1. 브라우저에서 오류 메시지에 표시된 링크를 클릭하세요
2. Firebase 콘솔이 자동으로 열리고 인덱스 생성 페이지로 이동합니다
3. **인덱스 만들기** 버튼을 클릭하세요
4. 인덱스 생성이 완료될 때까지 기다리세요 (보통 1-2분 소요)

### 방법 2: 수동으로 인덱스 생성
1. [Firebase 콘솔](https://console.firebase.google.com/) 접속
2. 프로젝트 `budget-management-system-72094` 선택
3. 왼쪽 메뉴에서 **Firestore Database** 클릭
4. 상단 탭에서 **인덱스** 탭 클릭
5. **인덱스 만들기** 버튼 클릭
6. 다음 정보 입력:
   - **컬렉션 ID**: `budget_history`
   - **필드 추가**:
     - 필드 1: `budgetId` - 오름차순 (Ascending)
     - 필드 2: `changedAt` - 내림차순 (Descending)
   - **쿼리 범위**: 컬렉션
7. **만들기** 버튼 클릭
8. 인덱스 생성 완료 대기 (상태가 "Building" → "Enabled"로 변경됨)

## 인덱스 생성 확인
- 인덱스 목록에서 `budget_history` 컬렉션의 인덱스가 "Enabled" 상태인지 확인
- 브라우저에서 변경 이력 기능을 다시 테스트

## 참고
- 인덱스 생성은 보통 1-2분 정도 소요됩니다
- 인덱스가 생성되는 동안에는 해당 쿼리를 사용할 수 없습니다
- 인덱스는 한 번 생성하면 계속 유지되며, 추가 작업이 필요 없습니다


