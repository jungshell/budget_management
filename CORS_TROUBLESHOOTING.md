# CORS 오류 해결 가이드 (상세)

## 현재 상황
- Google Apps Script 배포 설정은 올바름 ("모든 사용자"로 설정됨)
- 브라우저에서 직접 URL 접속 시 정상 응답
- 하지만 프론트엔드에서 여전히 CORS 오류 발생

## 해결 단계

### 1. Google Apps Script 코드 업데이트 및 재배포

1. **코드 저장**
   - Google Apps Script 편집기에서 `GOOGLE_APPS_SCRIPT_FULL_CODE.js`의 최신 코드를 복사
   - 편집기에 붙여넣기 후 저장 (Ctrl+S)

2. **새 버전으로 재배포** (중요!)
   - `배포` → `배포 관리` 클릭
   - 기존 배포 옆의 **연필 아이콘(편집)** 클릭
   - **"버전"** 드롭다운에서 **"새 버전"** 선택
   - **"배포"** 클릭
   - ⚠️ **기존 URL이 변경되지 않으므로 프론트엔드 설정을 변경할 필요 없음**

### 2. URL 확인

1. **URL 형식 확인**
   - 올바른 형식: `https://script.google.com/macros/s/.../exec`
   - 잘못된 형식: `https://script.google.com/macros/s/.../dev` (개발용)
   - URL 끝이 반드시 `/exec`로 끝나야 함

2. **설정 페이지에서 URL 확인**
   - 설정 페이지로 이동
   - "Google Apps Script Web App URL" 필드 확인
   - URL이 올바른지 확인하고, 필요시 다시 복사하여 입력

### 3. 브라우저 개발자 도구 확인

1. **Network 탭 확인**
   - F12 또는 우클릭 → "검사" 클릭
   - "Network" 탭 열기
   - "표준 형식으로 Google Sheets 생성" 버튼 클릭
   - 실패한 요청 클릭하여 확인:
     - **Request URL**: 올바른 URL인지 확인
     - **Request Method**: POST인지 확인
     - **Status Code**: 무엇인지 확인
     - **Response Headers**: `Access-Control-Allow-Origin` 헤더가 있는지 확인

2. **Console 탭 확인**
   - 정확한 오류 메시지 확인
   - CORS 관련 오류인지, 다른 오류인지 확인

### 4. 캐시 클리어

1. **브라우저 캐시 삭제**
   - Chrome: Ctrl+Shift+Delete (Mac: Cmd+Shift+Delete)
   - "캐시된 이미지 및 파일" 선택
   - "데이터 삭제" 클릭

2. **시크릿 모드에서 테스트**
   - Ctrl+Shift+N (Mac: Cmd+Shift+N)
   - 시크릿 창에서 테스트

### 5. 대안: URL 쿼리 파라미터 방식 (데이터가 작은 경우)

만약 위 방법이 작동하지 않으면, GET 요청으로 전환할 수 있습니다 (하지만 데이터 크기 제한이 있음).

## 디버깅 체크리스트

- [ ] Google Apps Script 코드가 최신 버전으로 저장되었는가?
- [ ] 새 버전으로 재배포했는가?
- [ ] URL이 `/exec`로 끝나는가?
- [ ] "액세스 권한: 모든 사용자"로 설정되어 있는가?
- [ ] 브라우저 개발자 도구에서 실제 요청을 확인했는가?
- [ ] 캐시를 클리어했는가?
- [ ] 시크릿 모드에서 테스트했는가?

## 추가 확인 사항

### Google Apps Script 실행 로그 확인

1. Google Apps Script 편집기에서
2. `실행` → `실행 기록` 클릭
3. 최근 실행 기록 확인
4. 오류가 있는지 확인

### 권한 재승인

1. Google Apps Script 편집기에서
2. `실행` → `doPost` 선택
3. 권한 승인 팝업이 나타나면 승인

## 여전히 문제가 있으면

다음 정보를 확인해주세요:
1. 브라우저 개발자 도구의 Network 탭 스크린샷
2. Console 탭의 오류 메시지 전체
3. Google Apps Script 실행 로그의 오류 메시지
