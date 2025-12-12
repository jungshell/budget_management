# Google Apps Script URL 오류 해결

## 현재 문제
- Google Apps Script URL이 404 오류를 반환
- "응답을 파싱할 수 없습니다. 상태 코드: 200" (실제로는 404 HTML 페이지 반환)

## 해결 방법

### 1단계: Google Apps Script URL 확인

1. **설정 페이지로 이동**
   - 왼쪽 사이드바에서 "설정" 클릭

2. **Google Apps Script Web App URL 확인**
   - "Google Apps Script Web App URL" 필드 확인
   - URL이 올바른 형식인지 확인:
     - ✅ 올바른 형식: `https://script.google.com/macros/s/.../exec`
     - ❌ 잘못된 형식: `https://script.google.com/macros/s/.../dev` (개발용)
     - ❌ 잘못된 형식: `https://script.google.com/home/projects/...` (편집기 URL)

### 2단계: Google Apps Script 배포 확인

1. **Google Apps Script 편집기 열기**
   - https://script.google.com 접속
   - 프로젝트 선택

2. **배포 상태 확인**
   - `배포` → `배포 관리` 클릭
   - 배포가 있는지 확인
   - 배포가 없으면 새로 배포 필요

3. **새로 배포하기 (필요한 경우)**
   - `배포` → `새 배포` 클릭
   - `유형 선택` → `웹 앱` 선택
   - 설정:
     - 설명: "예산관리시스템"
     - **다음 사용자로 실행: `나`**
     - **액세스 권한: `모든 사용자`** ⚠️ **반드시!**
   - `배포` 클릭
   - **새 Web App URL 복사** (URL이 `/exec`로 끝나는지 확인)

4. **권한 승인**
   - 복사한 URL을 브라우저에서 직접 열기
   - 권한 승인 팝업에서 `허용` 클릭
   - JSON 응답이 보이면 성공:
     ```json
     {"success":true,"message":"Google Apps Script Web App이 정상적으로 작동 중입니다.",...}
     ```

### 3단계: 설정 페이지에 URL 업데이트

1. **설정 페이지로 이동**
2. **"Google Apps Script Web App URL" 필드에 새 URL 입력**
3. **자동 저장됨** (입력하면 자동으로 localStorage에 저장)

### 4단계: 테스트

1. **파일 업로드 페이지로 이동**
2. **"표준 형식으로 Google Sheets 생성" 버튼 클릭**
3. **정상 작동 확인**

---

## URL 형식 확인

### 올바른 URL 예시:
```
https://script.google.com/macros/s/AKfycbz.../exec
```

### 잘못된 URL 예시:
```
https://script.google.com/home/projects/1MxFJfVLtS620D7YXWOLVgKtH6vH4QiVtFoFXf6mBGhGxgH5_HqRkrCPS/executions
```
이것은 편집기 URL이지 Web App URL이 아닙니다.

---

## 빠른 확인 방법

브라우저에서 Google Apps Script URL을 직접 열어보세요:
- ✅ JSON 응답이 나오면: 정상
- ❌ HTML 오류 페이지가 나오면: URL이 잘못되었거나 배포되지 않음

---

## 문제 해결 체크리스트

- [ ] Google Apps Script 편집기에서 배포 확인
- [ ] Web App URL이 `/exec`로 끝나는지 확인
- [ ] "액세스 권한: 모든 사용자"로 설정되어 있는지 확인
- [ ] URL을 브라우저에서 직접 열어서 JSON 응답 확인
- [ ] 설정 페이지에 올바른 URL 입력
- [ ] 파일 업로드 페이지에서 테스트

