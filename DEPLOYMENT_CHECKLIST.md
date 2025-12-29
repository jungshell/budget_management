# 배포 완료 체크리스트

## ✅ 확인해야 할 항목들

### 1. GitHub 저장소 확인

- [ ] GitHub 저장소에 `functions` 폴더가 있는가?
- [ ] `functions` 폴더 안에 다음 파일들이 있는가?
  - [ ] `main.py`
  - [ ] `parse_excel.py`
  - [ ] `requirements.txt`
  - [ ] `Procfile`
  - [ ] `railway.json`
  - [ ] `budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json`

**확인 방법:**
- https://github.com/jungshell/budget_management 접속
- `functions` 폴더 클릭
- 파일 목록 확인

---

### 2. Railway 설정 확인

- [ ] Root Directory가 `functions`로 설정되어 있는가?
- [ ] 환경 변수가 설정되어 있는가?
  - [ ] `PORT=5001`
  - [ ] `GOOGLE_APPLICATION_CREDENTIALS=/app/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json`
- [ ] 도메인이 생성되었는가?

**확인 방법:**
- Railway 대시보드 접속
- 서비스 Settings 탭 확인
- Variables 탭 확인
- Networking 탭 확인

---

### 3. Railway 배포 상태 확인

- [ ] 배포가 시작되었는가?
- [ ] 배포 상태가 "Active"인가?
- [ ] 로그에 오류가 없는가?

**확인 방법:**
- Railway Deployments 탭 확인
- Logs 탭에서 다음 메시지 확인:
  ```
  ✅ Firebase 초기화 성공
  ✅ Firestore 초기화 성공
  * Running on http://0.0.0.0:5001
  ```

---

### 4. Health Check 테스트

- [ ] Railway 도메인 URL 확인
- [ ] `/health` 엔드포인트 테스트
- [ ] 응답이 `{"status":"ok"}`인가?

**확인 방법:**
- Railway Networking에서 도메인 URL 복사
- 브라우저에서 `https://your-app.railway.app/health` 접속
- 또는 터미널에서:
  ```bash
  curl https://your-app.railway.app/health
  ```

---

### 5. 프론트엔드 설정 (다음 단계)

- [ ] `.env.production` 파일 생성
- [ ] Firebase 설정 값 입력
- [ ] `REACT_APP_API_URL`에 Railway URL 입력
- [ ] 프론트엔드 빌드 및 배포

---

## 문제 해결

### GitHub에 functions 폴더가 없어요

→ 파일들을 `functions` 폴더로 이동해야 합니다.
→ `MOVE_FILES_TO_FUNCTIONS.md` 참고

### Railway 배포가 실패해요

→ Logs 탭에서 오류 메시지 확인
→ 환경 변수가 올바른지 확인
→ Root Directory가 `functions`로 설정되었는지 확인

### Health Check가 실패해요

→ 서비스가 실행 중인지 확인
→ 로그에서 오류 확인
→ 포트 설정 확인

---

## 다음 단계

모든 체크리스트가 완료되면:

1. ✅ Railway 백엔드 배포 완료
2. ⏭️ 프론트엔드 배포 진행
   - `.env.production` 파일 생성
   - Firebase 설정 값 입력
   - Railway URL 입력
   - `./deploy.sh` 실행

