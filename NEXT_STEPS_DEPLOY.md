# 🚀 다음 단계: 온라인 배포 진행하기

Firebase 로그인이 완료되었습니다! 이제 온라인 서버로 배포할 수 있습니다.

## 📋 배포 순서

### 1단계: Firebase 설정 값 확인 (필수)

프론트엔드 배포를 위해 Firebase 설정 값이 필요합니다.

**Firebase 콘솔에서 확인:**
1. https://console.firebase.google.com 접속
2. `budget-management-system-72094` 프로젝트 선택
3. 좌측 메뉴에서 ⚙️ **프로젝트 설정** 클릭
4. **일반** 탭에서 **앱** 섹션 찾기
5. 웹 앱이 없으면 "웹 앱 추가" 클릭하여 생성
6. 다음 값들을 복사:
   - API 키
   - 인증 도메인
   - 프로젝트 ID
   - 스토리지 버킷
   - 메시징 발신자 ID
   - 앱 ID

### 2단계: 백엔드 배포 (Railway) - 먼저 해야 함!

백엔드를 먼저 배포해야 프론트엔드의 API URL을 설정할 수 있습니다.

#### Railway에 배포하기:

1. **Railway 계정 생성**
   - https://railway.app 접속
   - GitHub로 로그인

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - "Deploy from GitHub repo" 선택
   - 저장소 선택 (또는 "Empty Project")

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
   - 프로젝트 루트의 `budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json` 파일 업로드

6. **도메인 생성**
   - Settings > Networking 탭
   - "Generate Domain" 클릭
   - 생성된 URL 복사 (예: `https://your-app.railway.app`)

### 3단계: 프론트엔드 환경 변수 설정

백엔드 URL을 받은 후 프론트엔드 설정:

```bash
cd frontend
```

`.env.production` 파일 생성:

```env
REACT_APP_FIREBASE_API_KEY=여기에_Firebase_API_키_입력
REACT_APP_FIREBASE_AUTH_DOMAIN=budget-management-system-72094.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=budget-management-system-72094
REACT_APP_FIREBASE_STORAGE_BUCKET=budget-management-system-72094.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=여기에_발신자_ID_입력
REACT_APP_FIREBASE_APP_ID=여기에_앱_ID_입력
REACT_APP_API_URL=https://your-app.railway.app
```

> **중요**: `REACT_APP_API_URL`은 2단계에서 받은 Railway URL을 입력하세요!

### 4단계: 프론트엔드 빌드 및 배포

```bash
# 프로젝트 루트로 이동
cd "/Volumes/Samsung USB/budget_management_anti"

# 배포 스크립트 실행
export PATH=~/.npm-global/bin:$PATH
./deploy.sh
```

또는 수동으로:

```bash
export PATH=~/.npm-global/bin:$PATH
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

### 5단계: 확인

배포가 완료되면:
- Firebase Hosting URL이 표시됩니다
- 브라우저에서 접속하여 테스트하세요

---

## ⚡ 빠른 명령어 모음

```bash
# PATH 설정 (새 터미널 열 때마다)
export PATH=~/.npm-global/bin:$PATH

# Firebase 프로젝트 확인
firebase projects:list

# Firebase 프로젝트 선택
firebase use budget-management-system-72094

# 프론트엔드 배포
cd "/Volumes/Samsung USB/budget_management_anti"
./deploy.sh
```

---

## 📝 체크리스트

- [ ] Firebase 설정 값 확인 (1단계)
- [ ] Railway에 백엔드 배포 (2단계)
- [ ] 백엔드 URL 복사
- [ ] 프론트엔드 `.env.production` 파일 생성 (3단계)
- [ ] 프론트엔드 빌드 및 배포 (4단계)
- [ ] 배포된 사이트 테스트 (5단계)

---

## ❓ 문제 해결

### Firebase 설정 값을 모르겠어요
→ Firebase 콘솔 > 프로젝트 설정 > 일반 > 앱 섹션에서 확인

### Railway 배포가 어려워요
→ `ONLINE_DEPLOYMENT_GUIDE.md` 파일의 상세 가이드 참고

### 배포 후 오류가 발생해요
→ `DEPLOY_CHECKLIST.md` 파일의 문제 해결 섹션 참고

