# 개발 서버 시작 가이드

## 문제
`localhost:3000`에 연결할 수 없다는 오류가 발생합니다.

## 해결 방법

### 1. 개발 서버 시작

터미널에서 다음 명령어를 실행하세요:

```bash
cd "/Volumes/Samsung USB/budget_management_anti/frontend"
npm start
```

또는

```bash
cd "/Volumes/Samsung USB/budget_management_anti/frontend"
npm run dev
```

### 2. 서버가 시작되면

- 브라우저가 자동으로 열립니다
- 또는 수동으로 `http://localhost:3000` 접속
- 서버가 실행 중이면 터미널에 "Compiled successfully!" 메시지가 표시됩니다

### 3. 서버 중지

터미널에서 `Ctrl + C`를 누르면 서버가 중지됩니다.

### 4. 포트 충돌 문제

만약 포트 3000이 이미 사용 중이라면:

```bash
# 포트 3000 사용 중인 프로세스 확인
lsof -ti:3000

# 프로세스 종료 (필요시)
kill -9 $(lsof -ti:3000)

# 또는 다른 포트 사용
PORT=3001 npm start
```

### 5. E2E 테스트 실행 시

E2E 테스트는 자동으로 개발 서버를 시작합니다:

```bash
cd "/Volumes/Samsung USB/budget_management_anti/frontend"
npm run test:e2e
```

하지만 수동으로 서버를 먼저 시작하는 것을 권장합니다.

