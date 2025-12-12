# CORS 문제 해결 - 백엔드 프록시 방식

## ✅ 해결 방법

CORS 문제를 완전히 해결하기 위해 **백엔드 프록시**를 구현했습니다.

### 변경 사항

1. **백엔드 (`functions/main.py`)**
   - `/api/google-apps-script` 엔드포인트 추가
   - Google Apps Script 호출을 프록시로 처리
   - CORS 헤더 자동 추가

2. **프론트엔드 (`frontend/src/utils/googleAppsScriptUtils.ts`)**
   - Google Apps Script 직접 호출 → 백엔드 프록시를 통해 호출로 변경
   - `syncToGoogleSheets`, `importFromGoogleSheets` 함수 수정

3. **의존성 (`functions/requirements.txt`)**
   - `requests>=2.31.0` 추가

---

## 다음 단계

### 1단계: 의존성 설치 (1분)

```bash
cd functions
pip install requests
```

또는 `requirements.txt`가 있다면:

```bash
cd functions
pip install -r requirements.txt
```

### 2단계: 백엔드 재시작 (30초)

백엔드 서버를 재시작하세요:

```bash
# 백엔드 서버 중지 (Ctrl+C)
# 그리고 다시 시작
cd functions
python main.py
```

또는 이미 실행 중이라면 재시작하세요.

### 3단계: 프론트엔드 테스트 (1분)

1. 프론트엔드가 실행 중이면 자동으로 새 코드가 반영됩니다
2. 파일 업로드 페이지로 이동
3. "표준 형식으로 Google Sheets 생성" 버튼 클릭
4. **CORS 오류 없이 작동해야 합니다!**

---

## 작동 원리

### 이전 방식 (CORS 오류 발생)
```
프론트엔드 → Google Apps Script (CORS 차단)
```

### 새로운 방식 (CORS 문제 해결)
```
프론트엔드 → 백엔드 프록시 → Google Apps Script
```

백엔드 서버는 CORS 정책의 영향을 받지 않으므로, 프론트엔드에서 백엔드로 요청하면 CORS 문제가 발생하지 않습니다.

---

## 장점

1. ✅ **CORS 문제 완전 해결** - 브라우저 CORS 정책을 우회
2. ✅ **더 안정적** - 서버 간 통신은 더 안정적
3. ✅ **오류 처리 용이** - 백엔드에서 오류를 처리하고 상세 정보 제공
4. ✅ **보안 향상** - Google Apps Script URL을 백엔드에서 관리

---

## 문제 해결

### 백엔드가 시작되지 않음
- `pip install requests` 실행했는지 확인
- 포트 5001이 사용 중인지 확인

### 여전히 CORS 오류 발생
- 백엔드가 정상적으로 실행 중인지 확인
- 프론트엔드에서 `REACT_APP_API_URL` 환경 변수가 올바른지 확인
- 브라우저 Console에서 실제 호출되는 URL 확인

### Google Apps Script 오류
- 백엔드 Console에서 상세 오류 메시지 확인
- Google Apps Script URL이 올바른지 확인

---

## 완료!

이제 CORS 문제 없이 Google Sheets 생성이 작동합니다! 🎉

