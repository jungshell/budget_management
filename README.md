# 예산 관리 시스템

예산 데이터를 관리하고 분석하는 웹 애플리케이션입니다.

## 주요 기능

- 📊 **대시보드**: 예산 요약 및 차트 (연도별 비교, 재원별 구성)
- 💰 **예산 관리**: 예산 항목 CRUD 작업 (시군비 세부 관리, 자체재원 관리)
- 📤 **파일 업로드**: Excel/CSV 파일 업로드 및 데이터 파싱
- 🤖 **AI 분석**: 자연어 질의를 통한 예산 분석
- ⚙️ **설정**: 사용자 설정 및 권한 관리
- 🔐 **인증 및 권한**: Firebase Authentication 기반 사용자 인증 및 역할 기반 접근 제어

## 기술 스택

- **Frontend**: React 19, TypeScript, Material-UI (MUI)
- **Backend**: Firebase (Firestore, Authentication)
- **차트**: Recharts
- **테스팅**: Jest, React Testing Library, Playwright (E2E)
- **빌드**: Create React App
- **성능 최적화**: Code Splitting, React.memo, useMemo, useCallback, IndexedDB 캐싱

## 시작하기

### 필수 요구사항

- Node.js 16 이상
- npm 또는 yarn
- Firebase 프로젝트

### 설치

1. 저장소 클론:
```bash
git clone <repository-url>
cd budget_management_anti
```

2. 의존성 설치:
```bash
cd frontend
npm install
```

3. 환경 변수 설정:
`.env` 파일을 생성하고 Firebase 설정을 추가하세요. (`.env.example` 참고)

4. 개발 서버 실행:
```bash
npm start
```

애플리케이션이 `http://localhost:3000`에서 실행됩니다.

## 프로젝트 구조

```
frontend/
├── src/
│   ├── components/     # 재사용 가능한 컴포넌트
│   ├── contexts/       # React Context
│   ├── hooks/          # Custom Hooks
│   ├── pages/          # 페이지 컴포넌트
│   ├── utils/          # 유틸리티 함수
│   └── firebase/       # Firebase 설정
├── public/             # 정적 파일
└── build/              # 프로덕션 빌드
```

## 주요 기능 설명

### 예산 관리
- 예산 항목 추가/수정/삭제
- 검색 및 필터링 (사업명, 소관부서)
- 일괄 선택 및 삭제
- Excel/CSV 내보내기
- **시군비 세부 관리**: 충청남도 15개 시군별 예산 입력 및 관리
- **자체재원 관리**: 자체재원 항목 별도 관리
- **천 단위 구분 쉼표**: 모든 금액 필드에 자동 적용

### 대시보드
- 예산 요약 카드 (총예산, 국비, 도비, 시군비, 자체재원)
- 출연금 상위 10개 사업 차트
- 재원별 구성 파이 차트
- 연도별 비교 차트
- 최근 활동 내역

### AI 분석
- 자연어 질의를 통한 예산 분석
- 질문 히스토리 저장 (최대 10개)
- 예시 질문 제공

### 사용자 인증 및 권한
- Firebase Authentication (이메일/비밀번호, Google 로그인)
- 역할 기반 접근 제어 (관리자, 사용자, 조회자)
- 웹 인터페이스를 통한 사용자 권한 관리

### 성능 최적화
- **코드 스플리팅**: 페이지별 lazy loading
- **React.memo**: 불필요한 리렌더링 방지
- **useMemo/useCallback**: 계산 및 함수 메모이제이션
- **캐싱 전략**: LocalStorage + IndexedDB 이중 캐싱
- **스켈레톤 UI**: 로딩 상태 개선

### 접근성
- 키보드 단축키 지원 (Ctrl+N: 추가, Ctrl+S: 저장, Esc: 닫기)
- ARIA 라벨 적용
- 스크린 리더 지원
- 반응형 디자인 (데스크톱, 태블릿, 모바일)

## 테스트

### 단위 테스트
```bash
cd frontend
npm test
```

### E2E 테스트
```bash
cd frontend
npm run test:e2e
```

### 테스트 커버리지
```bash
cd frontend
npm run test:browser
```

## 성능

- **번들 크기**: ~295 KB (gzip)
- **초기 로딩**: < 3초
- **페이지 전환**: < 1초
- **검색/필터 반응**: < 0.5초

## 최근 개선 사항

### v0.1.0 (최신)
- ✅ 성능 최적화 (React.memo, useMemo, useCallback 적용)
- ✅ 사용자 경험 개선 (스켈레톤 UI, 에러 메시지 개선)
- ✅ 시군비 세부 관리 기능 (충청남도 15개 시군)
- ✅ 자체재원 별도 관리
- ✅ 천 단위 구분 쉼표 자동 적용
- ✅ 테스트 커버리지 향상
- ✅ E2E 테스트 구현 (Playwright)
- ✅ 사용자 권한 관리 웹 인터페이스

## 배포

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

## 문서

- [설정 가이드](./SETUP_GUIDE.md)
- [Firebase 설정](./FIREBASE_SETUP.md)
- [배포 가이드](./DEPLOYMENT.md)
- [사용자 테스트 가이드](./USER_TESTING_GUIDE.md)
- [E2E 테스트 리뷰](./E2E_TEST_REVIEW.md)

## 라이선스

MIT
