# Google Apps Script doGet 오류 해결 (빠른 가이드)

## 🔴 현재 오류
"다음 스크립트 함수(doGet)를 찾을 수 없습니다."

## ✅ 해결 방법

### 1단계: Google Apps Script 편집기 열기

1. https://script.google.com 접속
2. 프로젝트 선택 (예산 관리 시스템 연동)

### 2단계: doGet 함수 추가

코드 편집기의 **맨 위**에 다음 함수를 추가:

```javascript
// GET 요청 처리 (브라우저에서 직접 접속 시)
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ 
      success: true, 
      message: 'Google Apps Script Web App이 정상적으로 작동 중입니다.',
      timestamp: new Date().toISOString()
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

**중요**: 
- 함수 이름은 정확히 `doGet`이어야 합니다 (대소문자 구분)
- 매개변수 `(e)`를 포함해야 합니다
- 코드의 **맨 위**에 추가하는 것을 권장합니다

### 3단계: 저장

1. 편집기 상단의 **"저장"** 버튼 클릭 (💾 아이콘 또는 Ctrl+S)
2. 저장 완료 확인

### 4단계: 새 버전으로 배포 (가장 중요!)

**이 단계를 건너뛰면 변경사항이 반영되지 않습니다!**

1. **"배포"** 메뉴 클릭
2. **"배포 관리"** 선택
3. 기존 배포 옆의 **"수정"** (연필 아이콘) 클릭
4. **"새 버전으로 배포"** 선택 ⭐
5. **"배포"** 버튼 클릭
6. 새 Web App URL이 생성되거나 기존 URL이 업데이트됨

### 5단계: 테스트

1. Web App URL을 브라우저에서 다시 열기
2. 다음 JSON 응답이 표시되어야 함:
   ```json
   {
     "success": true,
     "message": "Google Apps Script Web App이 정상적으로 작동 중입니다.",
     "timestamp": "2024-12-08T..."
   }
   ```

## 🔍 문제가 계속되면 확인 사항

### 체크리스트

- [ ] `doGet` 함수가 코드에 정확히 추가되었는지
- [ ] 함수 이름이 정확히 `doGet`인지 (대소문자 확인)
- [ ] 코드를 저장했는지
- [ ] **새 버전으로 배포했는지** (가장 중요!)
- [ ] Web App URL이 `/exec`로 끝나는지
- [ ] 브라우저 캐시를 클리어했는지 (Ctrl+Shift+Delete)

### 코드 위치 확인

Google Apps Script 편집기에서 코드가 다음과 같이 시작해야 합니다:

```javascript
// GET 요청 처리 (브라우저에서 직접 접속 시)
function doGet(e) {
  // ...
}

// POST 요청 처리 (프론트엔드에서 호출 시)
function doPost(e) {
  // ...
}

// OPTIONS 요청 처리 (CORS preflight)
function doOptions(e) {
  // ...
}
```

## 📝 전체 코드 확인

`GOOGLE_APPS_SCRIPT_FULL_CODE.js` 파일에 전체 코드가 있습니다.
이 파일의 내용을 Google Apps Script에 복사하여 사용하세요.

## ⚠️ 주의사항

1. **코드 수정 후 반드시 새 버전으로 배포해야 합니다**
   - 코드만 저장하는 것으로는 Web App에 반영되지 않음
   - 배포를 해야 변경사항이 적용됨

2. **배포 후 약간의 지연이 있을 수 있습니다**
   - 배포 후 1-2분 정도 기다린 후 테스트

3. **URL이 변경될 수 있습니다**
   - 새 버전으로 배포하면 URL이 변경될 수 있음
   - 새 URL을 설정 페이지에 다시 입력해야 할 수 있음

