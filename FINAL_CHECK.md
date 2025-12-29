# 최종 점검 체크리스트

## ✅ 확인해야 할 항목들

### 1. GitHub 저장소 확인

**확인 방법:**
1. https://github.com/jungshell/budget_management 접속
2. `functions` 폴더가 있는지 확인
3. `functions` 폴더 안에 다음 파일들이 있는지 확인:

필수 파일들:
- [ ] `main.py`
- [ ] `parse_excel.py`
- [ ] `requirements.txt`
- [ ] `Procfile`
- [ ] `railway.json`
- [ ] `budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json` (Firebase 서비스 계정 키)

**문제:** 만약 파일들이 루트에 있다면 `functions` 폴더로 이동해야 합니다.

---

### 2. Railway 설정 확인

**확인 방법:**
1. Railway 대시보드 접속
2. `budget_management` 서비스 선택
3. Settings 탭 확인

필수 설정:
- [ ] **Root Directory**: `functions`로 설정되어 있는가?
- [ ] **Variables** 탭에서 환경 변수 확인:
  - [ ] `PORT=5001`
  - [ ] `GOOGLE_APPLICATION_CREDENTIALS=/app/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json`
- [ ] **Networking** 탭에서 도메인 생성되었는가?

---

### 3. Railway 배포 상태 확인

**확인 방법:**
1. Railway Deployments 탭 확인
2. 배포 상태 확인:
   - ✅ "Active" = 배포 완료
   - ⏳ "Building" 또는 "Deploying" = 배포 중
   - ❌ "Failed" = 배포 실패 (Logs 확인 필요)

3. **Logs 탭**에서 다음 메시지 확인:
   ```
   ✅ Firebase 초기화 성공
   ✅ Firestore 초기화 성공
   * Running on http://0.0.0.0:5001
   ```

---

### 4. Health Check 테스트

**확인 방법:**
1. Railway Networking에서 도메인 URL 복사
   - 예: `https://your-app.railway.app`

2. 브라우저에서 접속:
   ```
   https://your-app.railway.app/health
   ```

3. 응답 확인:
   - ✅ `{"status":"ok"}` = 성공
   - ❌ 404 또는 500 오류 = 문제 있음

---

## 문제 해결

### GitHub에 functions 폴더가 없어요

**해결:**
- 파일들을 `functions` 폴더로 이동
- `MOVE_FILES_TO_FUNCTIONS.md` 참고

### Railway 배포가 실패해요

**확인 사항:**
1. Logs 탭에서 오류 메시지 확인
2. Root Directory가 `functions`로 설정되었는지 확인
3. 환경 변수가 올바른지 확인
4. `requirements.txt` 파일이 있는지 확인

### Health Check가 실패해요

**확인 사항:**
1. 서비스가 "Active" 상태인지 확인
2. 로그에서 오류 확인
3. 포트 설정 확인

---

## 다음 단계 (백엔드 완료 후)

백엔드 배포가 완료되면:

1. ✅ Railway URL 복사
2. ⏭️ 프론트엔드 `.env.production` 파일 생성
3. ⏭️ `REACT_APP_API_URL`에 Railway URL 입력
4. ⏭️ 프론트엔드 빌드 및 배포 (`./deploy.sh`)

---

## 빠른 확인 명령어

터미널에서 Railway URL 테스트:
```bash
# Railway URL을 YOUR_URL로 변경
curl https://YOUR_URL.railway.app/health
```

성공하면:
```json
{"status":"ok"}
```

