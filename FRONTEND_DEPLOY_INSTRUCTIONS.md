# 프론트엔드 배포 전 필수 작업

## ⚠️ 중요: Firebase 설정 값 입력 필요

`.env.production` 파일이 생성되었지만, Firebase 설정 값들을 입력해야 합니다.

## Firebase 설정 값 확인 방법

1. **Firebase 콘솔 접속:**
   - https://console.firebase.google.com/project/budget-management-system-72094/settings/general

2. **웹 앱 설정 확인:**
   - 좌측 메뉴에서 ⚙️ **프로젝트 설정** 클릭
   - **일반** 탭에서 **내 앱** 섹션 찾기
   - 웹 앱이 없으면 **"웹 앱 추가"** 클릭하여 생성

3. **설정 값 복사:**
   - `apiKey` → `REACT_APP_FIREBASE_API_KEY`
   - `authDomain` → `REACT_APP_FIREBASE_AUTH_DOMAIN` (이미 입력됨)
   - `projectId` → `REACT_APP_FIREBASE_PROJECT_ID` (이미 입력됨)
   - `storageBucket` → `REACT_APP_FIREBASE_STORAGE_BUCKET` (이미 입력됨)
   - `messagingSenderId` → `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `REACT_APP_FIREBASE_APP_ID`

4. **`.env.production` 파일 수정:**
   - `/Volumes/Samsung USB/budget_management_anti/frontend/.env.production` 파일 열기
   - `여기에_Firebase_API_키_입력` 부분을 실제 값으로 교체
   - `여기에_발신자_ID_입력` 부분을 실제 값으로 교체
   - `여기에_앱_ID_입력` 부분을 실제 값으로 교체

## 설정 값 입력 후 배포

설정 값을 입력한 후 다음 명령어로 배포:

```bash
cd "/Volumes/Samsung USB/budget_management_anti"
export PATH=~/.npm-global/bin:$PATH
./deploy.sh
```

또는 수동으로:

```bash
cd frontend
npm run build
cd ..
export PATH=~/.npm-global/bin:$PATH
firebase deploy --only hosting
```

