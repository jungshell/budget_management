# CORS 오류 해결 가이드

## 문제
Google Apps Script 호출 시 CORS 오류가 발생합니다:
```
Access to fetch at 'https://script.google.com/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## 해결 방법

### 1. Google Apps Script 웹 앱 배포 확인

1. **Google Apps Script 편집기 열기**
   - https://script.google.com 접속
   - 프로젝트 선택

2. **웹 앱으로 배포**
   - 상단 메뉴: `배포` → `웹 앱으로 배포`
   - 또는 `배포` → `새 배포` → `유형 선택` → `웹 앱` 선택

3. **배포 설정 (중요!)**
   - **설명**: "예산 관리 시스템 연동" (원하는 설명)
   - **실행 대상**: `나`
   - **액세스 권한**: `모든 사용자` ⚠️ **반드시 이렇게 설정해야 합니다!**
   - **버전**: `새 버전` (코드를 수정했다면)

4. **배포 및 URL 복사**
   - `배포` 버튼 클릭
   - `웹 앱 URL` 복사 (예: `https://script.google.com/macros/s/AKfycb.../exec`)
   - 이 URL을 설정 페이지의 "Google Apps Script URL"에 입력

### 2. 권한 승인

- 처음 배포 시 권한 승인 팝업이 나타날 수 있습니다
- `권한 검토` → `[프로젝트 이름]이(가) Google 계정에 액세스하려고 합니다` → `허용` 클릭

### 3. 코드 업데이트 후 재배포

코드를 수정한 경우:
1. Google Apps Script 편집기에서 코드 저장
2. `배포` → `웹 앱으로 배포` → `버전`을 `새 버전`으로 선택
3. `배포` 클릭
4. **중요**: 기존 URL이 변경되지 않으므로 프론트엔드 설정을 변경할 필요 없음

### 4. 테스트

1. 브라우저에서 웹 앱 URL 직접 접속
   - 예: `https://script.google.com/macros/s/.../exec`
   - `{"success":true,"message":"Google Apps Script Web App이 정상적으로 작동 중입니다.",...}` 응답이 나와야 함

2. 프론트엔드에서 테스트
   - 설정 페이지에서 URL이 올바르게 입력되었는지 확인
   - "표준 형식으로 Google Sheets 생성" 버튼 클릭
   - CORS 오류가 사라지고 정상 작동해야 함

## 주의사항

- **액세스 권한을 "나"로 설정하면 CORS 오류가 발생합니다**
- 반드시 **"모든 사용자"**로 설정해야 합니다
- 코드를 수정한 후에는 **새 버전으로 재배포**해야 합니다
- 기존 URL은 변경되지 않으므로 프론트엔드 설정을 변경할 필요 없습니다

## 문제가 계속되면

1. Google Apps Script 실행 로그 확인
   - `실행` → `실행 기록`에서 오류 확인
   
2. 브라우저 개발자 도구 확인
   - Network 탭에서 요청/응답 확인
   - Console 탭에서 오류 메시지 확인

3. Google Apps Script URL 확인
   - URL 끝이 `/exec`로 끝나는지 확인
   - `/dev`가 아닌 `/exec`를 사용해야 합니다

