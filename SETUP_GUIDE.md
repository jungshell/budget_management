# 초보자를 위한 설치 가이드

이 가이드는 초보자도 따라할 수 있도록 단계별로 상세히 작성되었습니다.

## 📋 사전 준비사항

다음 항목들이 이미 설치되어 있어야 합니다:
- ✅ Node.js (v22.14.0) - 이미 설치됨
- ✅ Python (v3.13.4) - 이미 설치됨
- ✅ npm (v10.9.2) - 이미 설치됨

## 🔥 1단계: Firebase 프로젝트 생성 (필수)

이 단계는 **반드시 직접 해야 합니다**. Google 계정이 필요합니다.

### 1-1. Firebase Console 접속

1. 웹 브라우저(Chrome 권장)를 엽니다
2. 다음 주소로 이동: https://console.firebase.google.com/
3. Google 계정으로 로그인합니다

### 1-2. 새 프로젝트 만들기

1. "프로젝트 추가" 또는 "Add project" 버튼 클릭
2. 프로젝트 이름 입력: `budget-management-system` (또는 원하는 이름)
3. "계속" 클릭
4. Google Analytics 설정은 선택사항 (건너뛰어도 됨)
5. "프로젝트 만들기" 클릭
6. 프로젝트 생성 완료까지 1-2분 대기

### 1-3. 웹 앱 등록

1. 프로젝트가 생성되면 대시보드로 이동
2. 왼쪽 메뉴에서 "프로젝트 설정" (톱니바퀴 아이콘) 클릭
3. "일반" 탭에서 아래로 스크롤
4. "내 앱" 섹션에서 "</>" (웹 아이콘) 클릭
5. 앱 닉네임 입력: `Budget Management Web`
6. "Firebase Hosting도 설정" 체크박스는 **체크하지 않음** (나중에 설정)
7. "앱 등록" 클릭

### 1-4. Firebase 설정 정보 복사

앱 등록 후 나타나는 코드에서 다음 정보를 복사합니다:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",           // ← 이것 복사
  authDomain: "...",           // ← 이것 복사
  projectId: "...",            // ← 이것 복사
  storageBucket: "...",        // ← 이것 복사
  messagingSenderId: "...",    // ← 이것 복사
  appId: "1:..."               // ← 이것 복사
};
```

**중요**: 이 정보는 나중에 `.env` 파일에 입력합니다.

### 1-5. Firestore 데이터베이스 생성

1. 왼쪽 메뉴에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. "프로덕션 모드에서 시작" 선택
4. 위치 선택: `asia-northeast3` (서울) 또는 `us-central1`
5. "사용 설정" 클릭
6. 데이터베이스 생성 완료까지 1-2분 대기

### 1-6. Storage 설정

1. 왼쪽 메뉴에서 "Storage" 클릭
2. "시작하기" 클릭
3. "프로덕션 모드에서 시작" 선택
4. "다음" 클릭
5. 위치는 Firestore와 동일하게 선택
6. "완료" 클릭

### 1-7. Authentication 설정

1. 왼쪽 메뉴에서 "Authentication" 클릭
2. "시작하기" 클릭
3. "Sign-in method" 탭 클릭
4. "이메일/비밀번호" 클릭
5. "사용 설정" 토글을 켜기
6. "저장" 클릭

## 🤖 2단계: Gemini API 키 발급 (필수)

### 2-1. Google AI Studio 접속

1. 브라우저에서 다음 주소로 이동: https://aistudio.google.com/
2. Google 계정으로 로그인

### 2-2. API 키 생성

1. 왼쪽 메뉴에서 "Get API key" 클릭
2. "Create API key" 클릭
3. 프로젝트 선택 (Firebase 프로젝트와 같은 것을 선택하거나 새로 만들기)
4. API 키가 생성되면 복사합니다

**중요**: 이 키는 나중에 `.env` 파일에 입력합니다.

## 📝 3단계: 환경 변수 파일 생성

### 3-1. .env 파일 생성

프로젝트 루트 디렉토리(`/Volumes/Samsung USB/budget_management_anti/`)에 `.env` 파일을 생성합니다.

### 3-2. .env 파일 내용 입력

텍스트 에디터(메모장, VS Code 등)로 `.env` 파일을 열고 다음 내용을 입력합니다:

```env
# Firebase Configuration (1-4단계에서 복사한 정보)
REACT_APP_FIREBASE_API_KEY=여기에_apiKey_붙여넣기
REACT_APP_FIREBASE_AUTH_DOMAIN=여기에_authDomain_붙여넣기
REACT_APP_FIREBASE_PROJECT_ID=여기에_projectId_붙여넣기
REACT_APP_FIREBASE_STORAGE_BUCKET=여기에_storageBucket_붙여넣기
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=여기에_messagingSenderId_붙여넣기
REACT_APP_FIREBASE_APP_ID=여기에_appId_붙여넣기

# Gemini API (2단계에서 복사한 키)
GEMINI_API_KEY=여기에_gemini_api_key_붙여넣기
```

**예시**:
```env
REACT_APP_FIREBASE_API_KEY=AIzaSyABC123...
REACT_APP_FIREBASE_AUTH_DOMAIN=budget-management.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=budget-management
REACT_APP_FIREBASE_STORAGE_BUCKET=budget-management.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123

GEMINI_API_KEY=AIzaSyXYZ789...
```

**주의사항**:
- 따옴표(`"`) 없이 입력
- 공백 없이 입력
- `=` 앞뒤 공백 없이 입력

## 🚀 4단계: 의존성 설치

터미널을 열고 다음 명령어를 실행합니다:

```bash
cd "/Volumes/Samsung USB/budget_management_anti"
npm run install:all
```

이 명령어는 다음을 수행합니다:
- Frontend 의존성 설치 (React, MUI 등)
- Functions 의존성 설치

**소요 시간**: 약 5-10분

## 🧪 5단계: 개발 서버 실행

### 5-1. Frontend 개발 서버 실행

터미널에서:

```bash
cd "/Volumes/Samsung USB/budget_management_anti"
npm run dev:frontend
```

성공하면 다음과 같은 메시지가 나타납니다:
```
Compiled successfully!

You can now view budget-management-system in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

### 5-2. 브라우저에서 확인

1. 브라우저를 엽니다
2. 주소창에 `http://localhost:3000` 입력
3. 대시보드 화면이 나타나면 성공!

## ✅ 완료 체크리스트

다음 항목들을 모두 완료했는지 확인하세요:

- [ ] Firebase 프로젝트 생성 완료
- [ ] Firestore 데이터베이스 생성 완료
- [ ] Storage 설정 완료
- [ ] Authentication 설정 완료
- [ ] Gemini API 키 발급 완료
- [ ] .env 파일 생성 및 정보 입력 완료
- [ ] 의존성 설치 완료
- [ ] 개발 서버 실행 성공
- [ ] 브라우저에서 화면 확인 완료

## 🆘 문제 해결

### 문제 1: "Module not found" 오류
**해결**: `npm run install:all` 다시 실행

### 문제 2: Firebase 연결 오류
**해결**: `.env` 파일의 Firebase 설정 정보가 정확한지 확인

### 문제 3: 포트 3000이 이미 사용 중
**해결**: 다른 포트 사용하거나 3000 포트를 사용하는 프로그램 종료

### 문제 4: Gemini API 오류
**해결**: `.env` 파일의 `GEMINI_API_KEY`가 정확한지 확인

## 📞 다음 단계

설치가 완료되면 다음 단계로 진행할 수 있습니다:
- 데이터 입력 기능 개발
- 자연어 질의 기능 개발
- 차트 시각화 기능 개발

---

**참고**: 이 가이드는 초보자를 위해 작성되었습니다. 문제가 발생하면 각 단계를 다시 확인해보세요.

