# 예산 관리 시스템

충청남도 산하기관을 위한 예산 관리 시스템입니다.

## 기술 스택

- **Frontend**: React + TypeScript + Material-UI
- **Backend**: Firebase Functions (Python)
- **Database**: Firestore
- **Storage**: Cloud Storage
- **Hosting**: Firebase Hosting
- **AI**: Google Gemini API

## 프로젝트 구조

```
budget_management_anti/
├── frontend/          # React 앱
├── functions/         # Firebase Functions (Python)
├── upload/            # 업로드 파일 저장소
├── firebase.json      # Firebase 설정
└── README.md
```

## 설치 및 실행

### 1. 의존성 설치

```bash
# 전체 의존성 설치
npm run install:all

# 또는 개별 설치
npm run install:frontend
npm run install:functions
```

### 2. 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 필요한 API 키를 입력하세요.

### 3. 개발 서버 실행

```bash
# Frontend 개발 서버
npm run dev:frontend

# Functions 로컬 서버 (별도 터미널)
npm run serve:functions
```

## 배포

```bash
# Functions 배포
npm run deploy:functions

# Hosting 배포
npm run deploy:hosting
```

## 주요 기능

- 예산 데이터 관리
- 자연어 질의 (Gemini AI)
- 대시보드 시각화
- 파일 업로드 및 파싱
- 보고서 생성 및 익스포트

