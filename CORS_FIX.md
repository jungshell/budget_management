# CORS 오류 해결 가이드

## 🔴 현재 오류
```
Access to fetch at 'https://script.google.com/macros/s/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ 해결 방법

### 1단계: Google Apps Script Web App 배포 설정 확인 (가장 중요!)

1. **Google Apps Script 편집기 열기**
   - https://script.google.com 접속
   - 프로젝트 선택

2. **배포 관리 확인**
   - "배포" > "배포 관리" 클릭
   - 기존 배포가 있으면 "수정" 클릭
   - 없으면 "새 배포" 클릭

3. **반드시 확인할 설정**
   ```
   유형: 웹 앱
   설명: 예산 관리 시스템 연동
   다음 사용자로 실행: 나 (Me)
   액세스 권한: 모든 사용자 (Anyone) ⭐ 가장 중요!
   ```

4. **새 버전으로 배포**
   - 설정 확인 후 "배포" 클릭
   - **중요**: "새 버전으로 배포" 선택 (기존 배포 수정 시)
   - Web App URL 복사 (URL이 `/exec`로 끝나는지 확인)

### 2단계: URL 확인

- ✅ 올바른 형식: `https://script.google.com/macros/s/.../exec`
- ❌ 잘못된 형식: `https://script.google.com/macros/s/.../dev`

`/dev`는 개발용이고 CORS가 제대로 작동하지 않을 수 있습니다.

### 3단계: 권한 재승인

1. **Apps Script에서 권한 확인**
   - Apps Script 편집기에서 "실행" > "doPost" 선택
   - 권한 승인 요청이 나타나면 "허용" 클릭

2. **또는 Web App URL 직접 열기**
   - 복사한 Web App URL을 브라우저에서 직접 열기
   - 권한 승인 요청이 나타나면 "허용" 클릭

### 4단계: 브라우저 캐시 클리어

1. Chrome 개발자 도구 열기 (F12)
2. Network 탭에서 "Disable cache" 체크
3. 또는 시크릿 모드에서 테스트

### 5단계: 코드 확인

`GOOGLE_APPS_SCRIPT_SETUP.md` 파일의 최신 코드를 Google Apps Script에 복사했는지 확인:

- ✅ `doPost()` 함수 있음
- ✅ `doOptions()` 함수 있음
- ✅ `importFromSheets()` 함수 있음
- ❌ `setHeaders()` 사용 안 함 (지원하지 않음)

## 🔍 추가 확인 사항

### Google Apps Script 코드가 올바른지 확인

```javascript
// doPost 함수가 있어야 함
function doPost(e) {
  // ... 코드 ...
}

// doOptions 함수가 있어야 함
function doOptions() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// importFromSheets 함수가 있어야 함
function importFromSheets(data) {
  // ... 코드 ...
}
```

### 프론트엔드 설정 확인

설정 페이지에서:
- Google Apps Script Web App URL이 올바르게 입력되어 있는지
- URL이 `/exec`로 끝나는지

## 🚨 여전히 오류가 발생하는 경우

### 대안 1: JSONP 방식 사용 (제한적)

Google Apps Script는 JSONP를 지원하지 않으므로 이 방법은 사용할 수 없습니다.

### 대안 2: 프록시 서버 사용

자체 서버를 통해 Google Apps Script를 호출하는 방법이지만, 현재는 무료 솔루션을 사용 중이므로 권장하지 않습니다.

### 대안 3: Google Apps Script 배포 재설정

1. 기존 배포 삭제
2. 코드 다시 복사
3. 새로 배포
4. 새 URL로 설정 업데이트

## ✅ 성공 확인 방법

1. 브라우저 콘솔에서 CORS 오류가 사라짐
2. "Google Sheets 동기화 완료" 메시지 표시
3. Google Sheets에 데이터가 정상적으로 저장됨

## 📞 문제가 계속되면

1. Google Apps Script 실행 로그 확인
   - Apps Script 편집기 > "실행" 탭
   - 오류 메시지 확인

2. 브라우저 Network 탭 확인
   - 개발자 도구 > Network 탭
   - 요청/응답 헤더 확인

3. Web App URL 직접 테스트
   - 브라우저에서 Web App URL 직접 열기
   - 정상 작동하는지 확인

