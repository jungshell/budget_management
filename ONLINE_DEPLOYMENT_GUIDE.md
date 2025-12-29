# 온라인 서버 배포 가이드

컴퓨터를 끄지 않아도 항상 접속 가능한 온라인 서버로 배포하는 방법입니다.

## 🎯 추천 방법: Firebase Hosting + Railway (가장 간단)

### 방법 1: Firebase Hosting (프론트엔드) + Railway (백엔드)

#### 1단계: 프론트엔드 배포 (Firebase Hosting)

##### 1-1. Firebase CLI 설치 및 로그인

```bash
# Firebase CLI 설치 (이미 설치되어 있으면 생략)
npm install -g firebase-tools

# Firebase 로그인
firebase login
```

##### 1-2. 프로젝트 설정 확인

```bash
# 현재 프로젝트 확인
firebase projects:list

# 프로젝트 선택 (이미 설정되어 있으면 생략)
firebase use budget-management-system-72094
```

##### 1-3. 환경 변수 설정

프론트엔드 루트에 `.env.production` 파일 생성:

```bash
cd frontend
```

`.env.production` 파일 생성:

```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=budget-management-system-72094.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=budget-management-system-72094
REACT_APP_FIREBASE_STORAGE_BUCKET=budget-management-system-72094.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_API_URL=https://your-backend-url.railway.app
```

> **참고**: Firebase 설정 값은 Firebase 콘솔 > 프로젝트 설정 > 일반에서 확인할 수 있습니다.

##### 1-4. 빌드 및 배포

```bash
# 프로젝트 루트로 이동
cd "/Volumes/Samsung USB/budget_management_anti"

# 프론트엔드 빌드
cd frontend
npm run build

# Firebase Hosting에 배포
cd ..
firebase deploy --only hosting
```

배포 후 URL이 표시됩니다 (예: `https://budget-management-system-72094.web.app`)

---

#### 2단계: 백엔드 배포 (Railway)

##### 2-1. Railway 계정 생성 및 프로젝트 생성

1. https://railway.app 접속
2. GitHub로 로그인 (또는 이메일)
3. "New Project" 클릭
4. "Deploy from GitHub repo" 선택 (또는 "Empty Project")

##### 2-2. Railway에 프로젝트 연결

**옵션 A: GitHub 저장소 사용 (권장)**

1. 프로젝트를 GitHub에 푸시
2. Railway에서 GitHub 저장소 선택
3. 루트 디렉토리를 `functions`로 설정

**옵션 B: 직접 배포**

1. Railway에서 "Empty Project" 선택
2. "Deploy from GitHub repo" 대신 "Deploy from local directory" 선택
3. `functions` 폴더 업로드

##### 2-3. Railway 설정

Railway 대시보드에서:

1. **Settings > Environment Variables**에 다음 추가:

```
PORT=5001
GOOGLE_APPLICATION_CREDENTIALS=/app/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json
```

2. **Settings > Build Command**:
```
pip install -r requirements.txt
```

3. **Settings > Start Command**:
```
python3 main.py
```

4. **Firebase 서비스 계정 키 업로드**:
   - Settings > Files 탭
   - `budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json` 파일 업로드

##### 2-4. 도메인 설정

1. Railway 대시보드 > Settings > Networking
2. "Generate Domain" 클릭
3. 생성된 URL 복사 (예: `https://your-app.railway.app`)
4. 이 URL을 프론트엔드의 `.env.production`의 `REACT_APP_API_URL`에 입력

##### 2-5. 재배포

프론트엔드의 API URL을 업데이트한 후 다시 빌드 및 배포:

```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

---

## 방법 2: Render 사용 (Railway 대안)

### 백엔드 배포 (Render)

1. https://render.com 접속 및 로그인
2. "New +" > "Web Service" 선택
3. GitHub 저장소 연결 또는 직접 업로드
4. 설정:
   - **Name**: budget-management-backend
   - **Root Directory**: functions
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python3 main.py`
   - **Environment Variables**:
     ```
     PORT=5001
     GOOGLE_APPLICATION_CREDENTIALS=/opt/render/project/src/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json
     ```

5. Firebase 서비스 계정 키 파일을 환경 변수로 추가하거나 파일로 업로드

---

## 방법 3: Firebase Hosting + Firebase Cloud Functions

백엔드를 Firebase Cloud Functions로 변환하는 방법입니다. (더 복잡하지만 완전히 Firebase 생태계 내에서 관리)

### 3-1. Cloud Functions 설정

`functions/main.py`를 Cloud Functions 형식으로 변환해야 합니다.

새 파일 생성: `functions/cloud_function.py`

```python
from flask import Flask
from flask_cors import CORS
import firebase_functions

app = Flask(__name__)
CORS(app)

# 기존 main.py의 모든 라우트를 여기로 이동
# ...

# Cloud Functions로 배포
@firebase_functions.https_fn()
def api(req: firebase_functions.https.Request) -> firebase_functions.https.Response:
    with app.request_context(req.environ):
        return app.full_dispatch_request()
```

### 3-2. 배포

```bash
firebase deploy --only functions
```

---

## 🚀 빠른 배포 스크립트

프로젝트 루트에 `deploy.sh` 파일을 생성했습니다:

```bash
./deploy.sh
```

이 스크립트는 프론트엔드를 자동으로 빌드하고 Firebase에 배포합니다.

---

## ✅ 배포 후 확인사항

1. **프론트엔드 접속**: Firebase Hosting URL 확인
2. **백엔드 확인**: Railway/Render URL로 API 테스트
3. **CORS 설정**: 백엔드에서 프론트엔드 도메인 허용 확인
4. **환경 변수**: 모든 환경 변수가 올바르게 설정되었는지 확인

---

## 🔧 문제 해결

### CORS 오류

백엔드의 `main.py`에서 CORS 설정 확인:

```python
CORS(app, origins=[
    "https://budget-management-system-72094.web.app",
    "https://budget-management-system-72094.firebaseapp.com",
    "http://localhost:3000"  # 개발 환경용
])
```

### 환경 변수 오류

- Firebase Hosting: 빌드 시점에 환경 변수가 포함되어야 함
- Railway/Render: 대시보드에서 환경 변수 설정 확인

### Firebase 인증 오류

Firebase 콘솔에서:
1. Authentication > Sign-in method 활성화
2. Firestore Rules 배포 확인
3. Storage Rules 배포 확인

---

## 📝 비용 안내

- **Firebase Hosting**: 무료 플랜 (10GB 저장, 360MB/일 전송)
- **Railway**: 무료 플랜 (월 $5 크레딧, 500시간)
- **Render**: 무료 플랜 (15분 후 슬리프 모드)

프로덕션 사용 시 유료 플랜 고려가 필요할 수 있습니다.

---

## 🎉 완료!

배포가 완료되면:
- ✅ 컴퓨터를 꺼도 서버가 계속 실행됩니다
- ✅ 어디서나 인터넷으로 접속 가능합니다
- ✅ 자동으로 HTTPS가 적용됩니다

