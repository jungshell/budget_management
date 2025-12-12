# 백엔드 서버 시작 가이드

## 문제 해결 완료 ✅

가상 환경이 있고 Flask도 설치되어 있습니다. 백엔드 서버를 시작하는 방법:

## 올바른 시작 방법

### 터미널에서 실행:

```bash
cd /Volumes/Samsung\ USB/budget_management_anti/functions
source venv/bin/activate
python3 main.py
```

**중요:** 
- `source venv/bin/activate`를 먼저 실행해야 합니다
- 이렇게 하면 가상 환경이 활성화되어 Flask 등 필요한 패키지를 사용할 수 있습니다

---

## 정상적으로 시작되면

다음과 같은 메시지가 보입니다:

```
✅ Firebase 초기화 성공
✅ Firestore 초기화 성공
 * Running on http://0.0.0.0:5001
```

이 터미널 창은 **열어둔 채로 유지**하세요 (서버가 계속 실행됩니다).

---

## 간편한 시작 스크립트

터미널에서 매번 입력하기 번거로우면, 다음 명령어를 한 번에 실행할 수 있습니다:

```bash
cd /Volumes/Samsung\ USB/budget_management_anti/functions && source venv/bin/activate && python3 main.py
```

---

## 재시작 후 테스트

1. **파일 업로드 페이지로 이동**
2. **"표준 형식으로 Google Sheets 생성" 버튼 클릭**
3. **CORS 오류 없이 작동해야 합니다!**

---

## 문제 해결

### "포트 5001이 이미 사용 중" 오류
```bash
# 포트 사용 중인 프로세스 확인
lsof -i :5001

# 프로세스 종료 (PID는 위 명령어 결과에서 확인)
kill [PID]
```

### 가상 환경 활성화가 안 됨
```bash
cd /Volumes/Samsung\ USB/budget_management_anti/functions
source venv/bin/activate
which python3  # 가상 환경의 python이 사용되는지 확인
```

