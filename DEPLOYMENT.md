# 배포 가이드

## 환경 변수 설정

### 1. Firebase 설정

프로젝트 루트의 `.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 2. API URL 설정

```env
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_AI_API_URL=https://your-api-domain.com/ai/query.php
```

## 프로덕션 빌드

### 1. 빌드 실행

```bash
cd frontend
npm run build
```

빌드된 파일은 `frontend/build` 디렉토리에 생성됩니다.

### 2. 빌드 최적화

- 코드 스플리팅: React.lazy()를 사용하여 라우트별 코드 분할
- 이미지 최적화: 이미지 파일은 최적화된 형식 사용
- 압축: gzip/brotli 압축 활성화

## 배포 방법

### Firebase Hosting

1. Firebase CLI 설치:
```bash
npm install -g firebase-tools
```

2. Firebase 로그인:
```bash
firebase login
```

3. 프로젝트 초기화:
```bash
firebase init hosting
```

4. 배포:
```bash
firebase deploy --only hosting
```

### 다른 호스팅 서비스

빌드된 `build` 폴더의 내용을 호스팅 서비스에 업로드하세요.

## Firestore 보안 규칙

Firestore 콘솔에서 다음 규칙을 설정하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 인증 필요
    match /budgets/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'user'];
    }
    
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /activities/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 모니터링

### Firebase Analytics

Firebase 콘솔에서 Analytics를 활성화하여 사용자 행동을 추적할 수 있습니다.

### 에러 로깅

프로덕션 환경에서는 에러를 외부 로깅 서비스(예: Sentry)로 전송하는 것을 권장합니다.


