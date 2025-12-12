# Google Apps Script HTML 응답 문제 디버깅

## 현재 상황
- 백엔드 테스트는 성공 (`{"success": true}`)
- 프론트엔드에서는 여전히 HTML 응답 수신
- "예상치 못한 응답 형식입니다. Content-Type: text/html"

## 해결 방법

### 1단계: 백엔드 재시작 (필수)

백엔드 코드를 수정했으므로 반드시 재시작해야 합니다:

```bash
cd /Volumes/Samsung\ USB/budget_management_anti/functions
source venv/bin/activate
python3 main.py
```

### 2단계: 백엔드 로그 확인

백엔드가 실행되면 다음과 같은 디버깅 로그가 출력됩니다:

```
Google Apps Script 응답 상태: 200
Content-Type: application/json
응답 길이: ...
응답 시작 부분: ...
```

이 로그를 통해 실제 응답을 확인할 수 있습니다.

### 3단계: 프론트엔드에서 테스트

1. 파일 업로드 페이지로 이동
2. "표준 형식으로 Google Sheets 생성" 버튼 클릭
3. 백엔드 터미널에서 로그 확인

---

## 가능한 원인

### 원인 1: 백엔드가 재시작되지 않음
- **해결**: 백엔드를 재시작하세요

### 원인 2: Google Apps Script가 실제로 HTML을 반환
- **확인**: 백엔드 로그에서 실제 응답 확인
- **해결**: Google Apps Script 배포 설정 확인

### 원인 3: 리다이렉트 후 GET 요청으로 변경됨
- **확인**: 백엔드 로그에서 상태 코드 확인
- **해결**: 세션을 사용하여 POST 요청 유지

---

## 백엔드 로그 해석

### 정상 응답:
```
Google Apps Script 응답 상태: 200
Content-Type: application/json
응답 시작 부분: {"success":true,...
```

### HTML 응답:
```
Google Apps Script 응답 상태: 200
Content-Type: text/html; charset=utf-8
응답 시작 부분: <!DOCTYPE html>...
```

HTML 응답이 나오면 Google Apps Script 배포 설정을 확인해야 합니다.

---

## 다음 단계

1. **백엔드 재시작**
2. **프론트엔드에서 테스트**
3. **백엔드 로그 확인**
4. **로그 내용을 알려주시면 추가 해결 방법 제시**



