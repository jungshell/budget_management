# 백엔드 재시작 가이드

## 현재 상태
- ✅ `requests` 모듈 설치됨
- ✅ 백엔드 서버 실행 중 (프로세스 2개)

## 백엔드 재시작 방법

### 방법 1: 터미널에서 직접 재시작 (권장)

1. **현재 실행 중인 백엔드 서버 찾기**
   ```bash
   ps aux | grep "python.*main.py" | grep -v grep
   ```

2. **백엔드 서버 중지**
   - 실행 중인 터미널에서 `Ctrl+C` 누르기
   - 또는 프로세스 ID를 찾아서 종료:
     ```bash
     kill [프로세스ID]
     ```

3. **백엔드 서버 재시작**
   ```bash
   cd /Volumes/Samsung\ USB/budget_management_anti/functions
   python3 main.py
   ```

### 방법 2: 자동 재시작 스크립트 사용

```bash
cd /Volumes/Samsung\ USB/budget_management_anti/functions

# 기존 프로세스 종료
pkill -f "python.*main.py"

# 잠시 대기
sleep 2

# 새로 시작
python3 main.py
```

---

## 재시작 후 확인

백엔드가 정상적으로 시작되면 다음과 같은 메시지가 표시됩니다:

```
✅ Firebase 초기화 성공
✅ Firestore 초기화 성공
 * Running on http://0.0.0.0:5001
```

---

## 프론트엔드 테스트

백엔드 재시작 후:

1. 파일 업로드 페이지로 이동
2. "표준 형식으로 Google Sheets 생성" 버튼 클릭
3. **CORS 오류 없이 작동해야 합니다!**

---

## 문제 해결

### 포트 5001이 이미 사용 중
```bash
lsof -i :5001
# 프로세스 ID 확인 후
kill [프로세스ID]
```

### 백엔드가 시작되지 않음
- `functions/main.py` 파일에 문법 오류가 있는지 확인
- Python 버전 확인: `python3 --version`
- 의존성 확인: `pip3 list | grep requests`

