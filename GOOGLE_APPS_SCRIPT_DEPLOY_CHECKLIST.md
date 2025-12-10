# Google Apps Script 배포 체크리스트

## 🔴 문제: 코드가 적용되지 않음

코드를 수정했지만 Google Sheets에 반영되지 않는 경우, 다음을 확인하세요.

## ✅ 필수 확인 사항

### 1. Google Apps Script 코드 확인

Google Apps Script 편집기에서 다음을 확인:

#### doPost 함수 확인
```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    // ...
  }
}
```

#### syncToSheets 함수 확인
다음 코드가 있는지 확인:

1. **제목 생성 코드**:
```javascript
const year = data.year || new Date().getFullYear();
const version = data.version || '본예산';
const now = new Date();
const yearStr = String(now.getFullYear()).substring(2);
const monthStr = String(now.getMonth() + 1).padStart(2, '0');
const dateStr = String(now.getDate()).padStart(2, '0');
const spreadsheetTitle = year + '_' + version + '_' + yearStr + monthStr + dateStr;
```

2. **헤더에 산식검증, 산식오류 컬럼**:
```javascript
const headers = ['사업명', '소관부서', '총예산', '출연금-도비', '출연금-시군비', '보조금-국비', '보조금-도비', '보조금-시군비', '자체재원', '산식검증', '산식오류'];
```

3. **숫자 형식 적용**:
```javascript
range.setNumberFormat('#,##0');
```

4. **기존 시트 데이터 삭제**:
```javascript
if (!sheet) {
  sheet = spreadsheet.insertSheet(sheetName);
} else {
  sheet.clear(); // 이 부분이 있어야 함
}
```

### 2. 배포 확인

1. **"배포"** > **"배포 관리"** 클릭
2. 배포 목록에서 최신 배포 확인
3. 배포 날짜/시간 확인
4. 최신 배포가 아니라면:
   - **"수정"** 클릭
   - **"새 버전으로 배포"** 선택
   - **"배포"** 클릭

### 3. Web App URL 확인

1. 배포 관리에서 Web App URL 복사
2. 설정 페이지의 URL과 비교
3. 다르면 설정 페이지에 새 URL 입력

### 4. 테스트 방법

1. **설정에서 스프레드시트 ID 삭제**
   - 예산 관리 시스템 설정 페이지
   - "Google Sheets ID" 필드 비우기
   - 저장

2. **다시 내보내기**
   - 예산 관리 페이지
   - "Google Sheets로 내보내기" 클릭

3. **결과 확인**
   - 제목: `2024_본예산_241208` 형식인지
   - 컬럼: 산식검증, 산식오류 컬럼이 있는지
   - 숫자: 천 단위 구분 쉼표가 있는지

## 🔍 디버깅 방법

### Google Apps Script 실행 로그 확인

1. Apps Script 편집기에서 **"실행"** 탭 클릭
2. 최근 실행 로그 확인
3. 오류 메시지 확인

### 수동 테스트

1. Apps Script 편집기에서 **"실행"** > **"doPost"** 선택
2. 테스트 데이터 입력:
```json
{
  "action": "sync",
  "year": 2024,
  "version": "본예산",
  "sheetName": "테스트",
  "data": [
    {
      "projectName": "테스트 사업",
      "department": "테스트 부서",
      "totalAmount": 1000000,
      "contribution": { "도비": 500000, "시군비": 0 },
      "grant": { "국비": 300000, "도비": 0, "시군비": 0, "자체": 0 },
      "ownFunds": 200000
    }
  ]
}
```

## 💡 빠른 해결 방법

### 완전히 새로 시작

1. **Google Apps Script 프로젝트 삭제**
   - Apps Script 편집기에서 프로젝트 삭제

2. **새 프로젝트 생성**
   - "새 프로젝트" 클릭
   - `GOOGLE_APPS_SCRIPT_FULL_CODE.js` 파일의 전체 코드 복사
   - 붙여넣기
   - 저장

3. **새로 배포**
   - "배포" > "새 배포"
   - "웹 앱" 선택
   - 설정:
     - 다음 사용자로 실행: 나
     - 액세스 권한: 모든 사용자
   - 배포
   - 새 URL 복사

4. **설정 업데이트**
   - 예산 관리 시스템 설정 페이지
   - 새 Web App URL 입력
   - Google Sheets ID 비우기
   - 저장

5. **테스트**
   - 예산 관리 페이지에서 "Google Sheets로 내보내기" 클릭

## ⚠️ 주의사항

- 코드를 수정한 후 **반드시 저장**해야 합니다
- 저장 후 **반드시 새 버전으로 배포**해야 합니다
- 배포하지 않으면 변경사항이 반영되지 않습니다
- 기존 스프레드시트를 사용하면 이전 형식이 유지됩니다

