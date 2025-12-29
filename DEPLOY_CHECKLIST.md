# 온라인 배포 체크리스트

## 📋 배포 전 확인사항

### 1. 환경 변수 설정

#### 프론트엔드 (.env.production)
- [ ] `REACT_APP_FIREBASE_API_KEY` 설정
- [ ] `REACT_APP_FIREBASE_AUTH_DOMAIN` 설정
- [ ] `REACT_APP_FIREBASE_PROJECT_ID` 설정
- [ ] `REACT_APP_FIREBASE_STORAGE_BUCKET` 설정
- [ ] `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` 설정
- [ ] `REACT_APP_FIREBASE_APP_ID` 설정
- [ ] `REACT_APP_API_URL` 설정 (백엔드 URL)

#### 백엔드 (Railway/Render 환경 변수)
- [ ] `PORT` 설정 (보통 자동 할당)
- [ ] `GOOGLE_APPLICATION_CREDENTIALS` 설정
- [ ] `FIREBASE_PROJECT_ID` 설정

### 2. Firebase 설정

- [ ] Firebase 프로젝트가 활성화되어 있음
- [ ] Authentication 활성화됨
- [ ] Firestore 데이터베이스 생성됨
- [ ] Storage 버킷 생성됨
- [ ] Firestore Rules 배포됨
- [ ] Storage Rules 배포됨

### 3. 백엔드 배포 (Railway/Render)

- [ ] Railway/Render 계정 생성
- [ ] 프로젝트 생성 및 저장소 연결
- [ ] Firebase 서비스 계정 키 파일 업로드
- [ ] 환경 변수 설정
- [ ] 배포 완료 및 URL 확인
- [ ] Health check 엔드포인트 테스트 (`/health`)

### 4. 프론트엔드 배포 (Firebase Hosting)

- [ ] Firebase CLI 설치 및 로그인
- [ ] `.env.production` 파일 생성 및 설정
- [ ] `npm run build` 성공
- [ ] `firebase deploy --only hosting` 성공
- [ ] 배포 URL 확인

### 5. CORS 설정 확인

백엔드의 `main.py`에서 프론트엔드 도메인이 허용되어 있는지 확인:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://budget-management-system-72094.web.app",
            "https://budget-management-system-72094.firebaseapp.com",
            "http://localhost:3000"  # 개발 환경용
        ]
    }
})
```

### 6. 테스트

- [ ] 프론트엔드 접속 가능
- [ ] 로그인/회원가입 작동
- [ ] 파일 업로드 작동
- [ ] 데이터 조회 작동
- [ ] Google Sheets 연동 작동

---

## 🚀 빠른 배포 명령어

### 프론트엔드 배포
```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

또는 스크립트 사용:
```bash
./deploy.sh
```

### 백엔드 배포 (Railway)
1. Railway 대시보드에서 "Deploy" 클릭
2. 또는 GitHub에 푸시하면 자동 배포

---

## 🔍 문제 해결

### 배포 후 화면이 안 보임
1. Firebase Hosting URL 확인
2. 브라우저 콘솔 오류 확인 (F12)
3. 네트워크 탭에서 API 요청 확인

### API 연결 오류
1. 백엔드 URL 확인
2. CORS 설정 확인
3. 백엔드 로그 확인 (Railway/Render 대시보드)

### Firebase 인증 오류
1. Firebase 콘솔에서 Authentication 활성화 확인
2. Firestore Rules 확인
3. 환경 변수 확인

---

## 📞 지원

문제가 발생하면 다음 정보를 확인하세요:
- 브라우저 콘솔 오류
- 백엔드 로그
- Firebase 콘솔 오류
- Network 탭의 요청/응답

