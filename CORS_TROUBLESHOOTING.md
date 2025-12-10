# CORS 오류 완전 해결 가이드

## 🔴 문제 상황
Google Apps Script Web App 호출 시 CORS 오류가 계속 발생합니다.

## ✅ 단계별 해결 방법

### ⚠️ 중요: Google Apps Script Web App의 CORS는 특별합니다

Google Apps Script Web App은 일반적인 웹 서버와 다르게 CORS를 처리합니다. **"액세스 권한: 모든 사용자"로 설정하면 자동으로 CORS가 처리되어야 하지만**, 때로는 추가 조치가 필요합니다.

---

## 1단계: Google Apps Script 코드 재확인

### 필수 함수 확인

다음 코드를 Google Apps Script에 **정확히** 복사했는지 확인:

```javascript
// OPTIONS 요청 처리 (CORS preflight) - 반드시 필요!
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// POST 요청 처리
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    let result;
    switch (action) {
      case 'sync':
        result = syncToSheets(data);
        break;
      case 'import':
        result = importFromSheets(data);
        break;
      // ... 기타 케이스
    }
    
    return result;
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

**중요**: `doOptions` 함수의 매개변수 `(e)`를 포함해야 합니다!

---

## 2단계: Web App 배포 설정 재확인

### 정확한 설정 순서

1. **Google Apps Script 편집기 열기**
   - https://script.google.com
   - 프로젝트 선택

2. **기존 배포 삭제 (권장)**
   - "배포" > "배포 관리"
   - 기존 배포가 있으면 "삭제" 클릭
   - **완전히 삭제** 후 새로 배포

3. **새 배포 생성**
   - "배포" > "새 배포" 클릭
   - "유형 선택" 클릭 > "웹 앱" 선택

4. **설정 입력 (정확히!)**
   ```
   설명: 예산 관리 시스템 연동
   다음 사용자로 실행: 나 (Me) ⭐
   액세스 권한: 모든 사용자 (Anyone) ⭐⭐ 가장 중요!
   ```

5. **배포 실행**
   - "배포" 버튼 클릭
   - **Web App URL 복사** (URL이 `/exec`로 끝나는지 확인!)

6. **권한 승인**
   - "권한 검토" 클릭
   - Google 계정 선택
   - "허용" 클릭

---

## 3단계: URL 형식 확인

### 올바른 URL 형식

```
✅ https://script.google.com/macros/s/AKfycby.../exec
❌ https://script.google.com/macros/s/AKfycby.../dev
```

**중요**: 
- `/exec` = 배포 버전 (CORS 지원)
- `/dev` = 개발 버전 (CORS 미지원)

---

## 4단계: 프론트엔드 코드 확인

프론트엔드 코드는 이미 수정되었습니다:
- `mode: 'cors'` 명시
- `credentials: 'omit'` 설정

---

## 5단계: 브라우저에서 직접 테스트

### 테스트 방법

1. **Web App URL 직접 열기**
   ```
   브라우저에서 Web App URL 직접 접속
   예: https://script.google.com/macros/s/.../exec
   ```

2. **권한 승인 확인**
   - 권한 승인 요청이 나타나면 "허용"
   - 이미 승인된 경우 "이 앱은 확인됨" 메시지 표시

3. **Postman 또는 curl로 테스트** (선택사항)
   ```bash
   curl -X POST https://script.google.com/macros/s/.../exec \
     -H "Content-Type: application/json" \
     -d '{"action":"test"}'
   ```

---

## 6단계: Google Apps Script 실행 로그 확인

1. **Apps Script 편집기에서**
   - "실행" 탭 클릭
   - 최근 실행 로그 확인
   - 오류 메시지 확인

2. **실행 테스트**
   - "실행" > "doPost" 선택
   - 테스트 데이터 입력 (선택사항)
   - 실행하여 오류 확인

---

## 7단계: 대안 방법 (위 방법이 모두 실패할 경우)

### 방법 1: Google Apps Script를 doGet으로 변경

`doPost` 대신 `doGet`을 사용하고 URL 파라미터로 데이터 전달:

```javascript
// Google Apps Script
function doGet(e) {
  const action = e.parameter.action;
  // ... 처리 로직
}
```

하지만 이 방법은 데이터 크기 제한이 있습니다.

### 방법 2: Google Sheets API 직접 사용

Google Apps Script 대신 Google Sheets API를 직접 사용:

- 장점: CORS 문제 없음
- 단점: OAuth 인증 필요, API 키 필요

### 방법 3: 백엔드 프록시 사용

자체 백엔드 서버를 통해 Google Apps Script 호출:

- 장점: 완전한 제어 가능
- 단점: 서버 필요 (현재는 무료 솔루션 사용 중)

---

## 🔍 디버깅 체크리스트

다음을 모두 확인했는지 체크:

- [ ] Google Apps Script에 `doOptions(e)` 함수가 있음
- [ ] Google Apps Script에 `doPost(e)` 함수가 있음
- [ ] `importFromSheets` 함수가 있음
- [ ] Web App 배포 설정에서 "액세스 권한: 모든 사용자" 선택
- [ ] Web App URL이 `/exec`로 끝남
- [ ] Web App URL을 브라우저에서 직접 열어서 권한 승인 완료
- [ ] 설정 페이지에 올바른 URL 입력
- [ ] 브라우저 캐시 클리어
- [ ] 시크릿 모드에서 테스트

---

## 🚨 여전히 안 되면

### 최종 확인 사항

1. **Google 계정 확인**
   - 개인 Google 계정인지 확인
   - Google Workspace 계정인 경우 관리자 설정 확인

2. **브라우저 확장 프로그램 비활성화**
   - CORS 관련 확장 프로그램이 있는지 확인
   - 시크릿 모드에서 테스트

3. **다른 브라우저에서 테스트**
   - Chrome, Firefox, Safari 등에서 테스트

4. **네트워크 확인**
   - 방화벽이나 프록시가 요청을 차단하는지 확인

---

## 📞 추가 도움

문제가 계속되면 다음 정보를 제공해주세요:

1. Google Apps Script 실행 로그 (오류 메시지)
2. 브라우저 Network 탭의 요청/응답 헤더
3. Web App 배포 설정 스크린샷
4. Web App URL (일부만 공유 가능)

