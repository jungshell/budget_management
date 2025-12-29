# 로컬 개발 서버 실행 가이드

## 로컬 서버 시작

### 방법 1: 자동 시작 (현재 실행 중)

로컬 개발 서버가 자동으로 시작되었습니다!

**접속 URL:**
- http://localhost:3000

브라우저가 자동으로 열리지 않으면 위 URL을 직접 입력하세요.

---

### 방법 2: 수동 시작

터미널에서 다음 명령어 실행:

```bash
cd "/Volumes/Samsung USB/budget_management_anti/frontend"
npm start
```

---

## 로컬 서버 특징

- **핫 리로드**: 코드를 수정하면 자동으로 새로고침됩니다
- **개발 모드**: 개발자 도구와 디버깅 기능 사용 가능
- **빠른 반응**: 프로덕션 빌드보다 빠른 개발 경험

---

## 서버 중지

터미널에서 `Ctrl + C`를 누르면 서버가 중지됩니다.

---

## 백엔드 서버도 함께 실행하기

프론트엔드와 백엔드를 함께 실행하려면:

### 터미널 1: 프론트엔드
```bash
cd "/Volumes/Samsung USB/budget_management_anti/frontend"
npm start
```

### 터미널 2: 백엔드
```bash
cd "/Volumes/Samsung USB/budget_management_anti/functions"
source venv/bin/activate
python3 main.py
```

또는 자동 시작 스크립트 사용:
```bash
cd "/Volumes/Samsung USB/budget_management_anti"
./start_all_servers.sh
```

---

## 환경 변수 설정

로컬 개발을 위해 `.env` 파일이 필요할 수 있습니다:

**프론트엔드 `.env` 파일:**
```env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=budget-management-system-72094.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=budget-management-system-72094
REACT_APP_FIREBASE_STORAGE_BUCKET=budget-management-system-72094.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_API_URL=http://localhost:5001
```

**백엔드 로컬 실행:**
- 백엔드는 `http://localhost:5001`에서 실행됩니다
- 프론트엔드는 `http://localhost:3000`에서 실행됩니다

---

## 문제 해결

### 포트 3000이 이미 사용 중
```bash
# 포트 사용 중인 프로세스 확인
lsof -ti:3000

# 프로세스 종료
kill -9 $(lsof -ti:3000)
```

### 서버가 시작되지 않음
```bash
# 의존성 재설치
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### 변경사항이 반영되지 않음
- 브라우저 캐시 클리어 (Ctrl+Shift+R)
- 서버 재시작
- 브라우저 개발자 도구에서 하드 리로드

---

## 완료!

이제 로컬에서 개발할 수 있습니다:
- 프론트엔드: http://localhost:3000
- 백엔드: http://localhost:5001 (별도 실행 시)

