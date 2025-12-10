# CORS 오류 최종 해결 방법

## 🔴 문제 상황
Google Apps Script Web App 호출 시 CORS preflight 오류가 계속 발생합니다.

## ✅ 최종 해결 방법

### 방법 1: Google Apps Script 배포 완전 재설정 (권장)

#### 1단계: 기존 배포 완전 삭제

1. Google Apps Script 편집기 열기
2. **"배포"** > **"배포 관리"** 클릭
3. 기존 배포 옆의 **"삭제"** 버튼 클릭
4. **완전히 삭제** 확인

#### 2단계: 코드 재확인

`GOOGLE_APPS_SCRIPT_FULL_CODE.js` 파일의 전체 코드를 Google Apps Script에 복사:

- ✅ `doGet(e)` 함수 있음
- ✅ `doPost(e)` 함수 있음
- ✅ `doOptions(e)` 함수 있음
- ✅ 모든 헬퍼 함수들 있음

#### 3단계: 새로 배포

1. **"배포"** > **"새 배포"** 클릭
2. **"유형 선택"** 클릭 > **"웹 앱"** 선택
3. 설정 입력:
   ```
   설명: 예산 관리 시스템 연동
   다음 사용자로 실행: 나 (Me)
   액세스 권한: 모든 사용자 (Anyone) ⭐⭐⭐ 가장 중요!
   ```
4. **"배포"** 버튼 클릭
5. **새 Web App URL 복사**

#### 4단계: 권한 승인

1. 새 Web App URL을 브라우저에서 직접 열기
2. 권한 승인 요청이 나타나면 **"허용"** 클릭
3. JSON 응답이 표시되면 성공

#### 5단계: 설정 페이지에 새 URL 입력

1. 예산 관리 시스템 설정 페이지로 이동
2. Google Apps Script Web App URL을 새 URL로 업데이트
3. 저장

---

### 방법 2: 프론트엔드 코드 수정 (이미 적용됨)

프론트엔드 코드에서 `Content-Type` 헤더를 제거하여 preflight 요청을 방지했습니다.

**변경 사항:**
- `headers: { 'Content-Type': 'application/json' }` 제거
- Google Apps Script는 자동으로 JSON을 파싱할 수 있습니다

---

### 방법 3: Google Apps Script 코드 수정

`doOptions` 함수를 더 명확하게 작성:

```javascript
function doOptions(e) {
  return ContentService.createTextOutput('OK')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

이미 `GOOGLE_APPS_SCRIPT_FULL_CODE.js`에 반영되어 있습니다.

---

## 🔍 추가 확인 사항

### 1. Web App URL 형식 확인

- ✅ 올바른 형식: `https://script.google.com/macros/s/.../exec`
- ❌ 잘못된 형식: `https://script.google.com/macros/s/.../dev`

### 2. 배포 버전 확인

- 배포 후 **"새 버전으로 배포"**를 선택했는지 확인
- 배포하지 않으면 코드 변경이 반영되지 않습니다

### 3. 브라우저 캐시 클리어

1. Chrome 개발자 도구 열기 (F12)
2. Network 탭에서 **"Disable cache"** 체크
3. 또는 시크릿 모드에서 테스트

### 4. Google Apps Script 실행 로그 확인

1. Apps Script 편집기에서 **"실행"** 탭 클릭
2. 최근 실행 로그 확인
3. 오류 메시지 확인

---

## 🚨 여전히 안 되면

### 대안 1: Google Sheets API 직접 사용

Google Apps Script 대신 Google Sheets API를 직접 사용:

- 장점: CORS 문제 없음
- 단점: OAuth 인증 필요, API 키 필요

### 대안 2: 백엔드 프록시 사용

Python Flask 백엔드를 통해 Google Apps Script 호출:

- 장점: 완전한 제어 가능
- 단점: 백엔드 코드 수정 필요

### 대안 3: Google Apps Script 배포 URL 확인

배포 관리에서:
1. 배포 ID 확인
2. 배포 URL이 정확한지 확인
3. 배포 상태가 "활성"인지 확인

---

## 📝 체크리스트

다음을 모두 확인했는지 체크:

- [ ] Google Apps Script에 `doGet(e)` 함수가 있음
- [ ] Google Apps Script에 `doPost(e)` 함수가 있음
- [ ] Google Apps Script에 `doOptions(e)` 함수가 있음
- [ ] Web App 배포 설정에서 **"액세스 권한: 모든 사용자"** 선택
- [ ] Web App URL이 `/exec`로 끝남
- [ ] 새 버전으로 배포했음
- [ ] Web App URL을 브라우저에서 직접 열어서 권한 승인 완료
- [ ] 설정 페이지에 올바른 URL 입력
- [ ] 브라우저 캐시 클리어
- [ ] 프론트엔드 코드가 최신 버전 (Content-Type 헤더 제거됨)

---

## 💡 참고

Google Apps Script Web App의 CORS는:
- **"액세스 권한: 모든 사용자"**로 설정하면 자동으로 처리됩니다
- 별도의 헤더 설정이 필요하지 않습니다
- `doOptions` 함수가 있어야 preflight 요청을 처리할 수 있습니다

문제가 계속되면 Google Apps Script의 공식 문서나 커뮤니티를 참고하세요.

