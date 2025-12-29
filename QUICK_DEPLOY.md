# 🚀 빠른 온라인 배포 가이드

컴퓨터를 꺼도 항상 접속 가능한 온라인 서버로 배포하는 가장 간단한 방법입니다.

## ⚡ 5분 안에 배포하기

### 1단계: 백엔드 배포 (Railway) - 3분

1. **Railway 계정 생성**
   - https://railway.app 접속
   - GitHub로 로그인

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - "Deploy from GitHub repo" 선택
   - 저장소 선택 (또는 "Empty Project" 선택)

3. **서비스 추가**
   - "New" > "GitHub Repo" 선택
   - 저장소 선택
   - **Root Directory**: `functions` 설정

4. **환경 변수 설정**
   - Settings > Variables 탭
   - 다음 추가:
     ```
     PORT=5001
     GOOGLE_APPLICATION_CREDENTIALS=/app/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json
     ```

5. **Firebase 서비스 계정 키 업로드**
   - Settings > Files 탭
   - `budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json` 파일 업로드
   - 파일명 정확히 일치해야 함

6. **도메인 생성**
   - Settings > Networking 탭
   - "Generate Domain" 클릭
   - 생성된 URL 복사 (예: `https://your-app.railway.app`)

---

### 2단계: 프론트엔드 환경 변수 설정 - 1분

프론트엔드 폴더에 `.env.production` 파일 생성:

```bash
cd frontend
```

`.env.production` 파일 생성:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSy... (Firebase 콘솔에서 확인)
REACT_APP_FIREBASE_AUTH_DOMAIN=budget-management-system-72094.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=budget-management-system-72094
REACT_APP_FIREBASE_STORAGE_BUCKET=budget-management-system-72094.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789 (Firebase 콘솔에서 확인)
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123 (Firebase 콘솔에서 확인)
REACT_APP_API_URL=https://your-app.railway.app
```

> **Firebase 설정 값 확인 방법**: Firebase 콘솔 > 프로젝트 설정 > 일반 > 앱 섹션

---

### 3단계: 프론트엔드 배포 - 1분

```bash
# 프로젝트 루트로 이동
cd "/Volumes/Samsung USB/budget_management_anti"

# 배포 스크립트 실행
./deploy.sh
```

또는 수동으로:

```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

---

## ✅ 완료!

배포가 완료되면:
- Firebase Hosting URL이 표시됩니다 (예: `https://budget-management-system-72094.web.app`)
- 이 URL로 어디서나 접속 가능합니다
- 컴퓨터를 꺼도 서버가 계속 실행됩니다

---

## 🔍 확인사항

1. **프론트엔드 접속**: Firebase Hosting URL 확인
2. **백엔드 확인**: Railway URL + `/health` 접속 (예: `https://your-app.railway.app/health`)
3. **테스트**: 로그인, 파일 업로드 등 기능 테스트

---

## ❓ 문제 해결

### 배포 후 화면이 안 보임
- Firebase Hosting URL 확인
- 브라우저 콘솔 오류 확인 (F12)

### API 연결 오류
- 백엔드 URL이 올바른지 확인
- Railway에서 서버가 실행 중인지 확인
- CORS 설정 확인

### Firebase 인증 오류
- Firebase 콘솔 > Authentication 활성화 확인
- Firestore Rules 배포 확인

---

## 📚 더 자세한 내용

- 전체 가이드: `ONLINE_DEPLOYMENT_GUIDE.md`
- 체크리스트: `DEPLOY_CHECKLIST.md`

