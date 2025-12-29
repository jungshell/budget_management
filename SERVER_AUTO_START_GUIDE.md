# 서버 자동 시작 가이드

컴퓨터를 켤 때마다 자동으로 프론트엔드와 백엔드 서버가 시작되도록 설정하는 방법입니다.

## 방법 1: launchd를 사용한 자동 시작 (권장)

### 1단계: plist 파일 설치

터미널에서 다음 명령어를 실행하세요:

```bash
# plist 파일을 LaunchAgents 디렉토리로 복사
cp "/Volumes/Samsung USB/budget_management_anti/com.budgetmanagement.servers.plist" ~/Library/LaunchAgents/

# launchd에 등록
launchctl load ~/Library/LaunchAgents/com.budgetmanagement.servers.plist
```

### 2단계: 즉시 시작 (선택사항)

등록 후 즉시 서버를 시작하려면:

```bash
launchctl start com.budgetmanagement.servers
```

### 3단계: 확인

서버가 실행 중인지 확인:

```bash
./check_servers.sh
```

또는 브라우저에서 접속:
- 프론트엔드: http://localhost:3000
- 백엔드: http://localhost:5001

---

## 방법 2: 수동으로 서버 시작

자동 시작을 원하지 않으면, 필요할 때마다 수동으로 시작할 수 있습니다:

```bash
# 프로젝트 루트에서
./start_all_servers.sh
```

---

## 서버 관리 명령어

### 서버 시작
```bash
./start_all_servers.sh
```

### 서버 종료
```bash
./stop_all_servers.sh
```

### 서버 상태 확인
```bash
./check_servers.sh
```

### 로그 확인
```bash
# 백엔드 로그
tail -f logs/backend.log

# 프론트엔드 로그
tail -f logs/frontend.log
```

---

## 자동 시작 해제

자동 시작을 해제하려면:

```bash
# launchd에서 제거
launchctl unload ~/Library/LaunchAgents/com.budgetmanagement.servers.plist

# plist 파일 삭제 (선택사항)
rm ~/Library/LaunchAgents/com.budgetmanagement.servers.plist
```

---

## 문제 해결

### 서버가 시작되지 않음

1. **로그 확인**
   ```bash
   cat logs/backend.log
   cat logs/frontend.log
   ```

2. **포트 확인**
   ```bash
   lsof -i :3000
   lsof -i :5001
   ```

3. **수동 시작 테스트**
   ```bash
   ./start_all_servers.sh
   ```

### launchd가 서버를 시작하지 않음

1. **plist 파일 확인**
   ```bash
   launchctl list | grep budgetmanagement
   ```

2. **수동으로 다시 로드**
   ```bash
   launchctl unload ~/Library/LaunchAgents/com.budgetmanagement.servers.plist
   launchctl load ~/Library/LaunchAgents/com.budgetmanagement.servers.plist
   ```

3. **로그 확인**
   ```bash
   cat logs/launchd.log
   cat logs/launchd_error.log
   ```

---

## 참고사항

- 서버는 백그라운드에서 실행되므로 터미널을 닫아도 계속 실행됩니다.
- 컴퓨터를 재시작하면 launchd가 자동으로 서버를 시작합니다.
- 서버를 종료하려면 `./stop_all_servers.sh`를 실행하세요.

