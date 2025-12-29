# 로컬 최신 코드를 웹에 배포하기

## 현재 상황
- 로컬에서 최신 코드를 개발 중
- 웹에는 오래된 버전이 배포되어 있음
- 로컬 최신 코드를 웹에 배포하고 싶음

## 해결 방법

### 1단계: 로컬 코드 확인
로컬에서 개발한 최신 코드가 있는지 확인:
```bash
cd "/Volumes/Samsung USB/budget_management_anti/frontend"
git status  # 변경사항 확인
```

### 2단계: 최신 코드 빌드
```bash
cd "/Volumes/Samsung USB/budget_management_anti/frontend"
npm run build
```

### 3단계: Firebase에 배포
```bash
cd "/Volumes/Samsung USB/budget_management_anti"
export PATH=~/.npm-global/bin:$PATH
firebase deploy --only hosting
```

## 자동 배포 스크립트

한 번에 실행:
```bash
cd "/Volumes/Samsung USB/budget_management_anti"
export PATH=~/.npm-global/bin:$PATH
./deploy.sh
```

## 주의사항

### .env.production 파일 확인
배포 전에 `.env.production` 파일이 올바르게 설정되어 있는지 확인:
- Firebase 설정 값이 실제 값으로 입력되어 있는지
- `REACT_APP_API_URL`이 Railway 백엔드 URL을 가리키는지

### 빌드 오류 확인
빌드 중 오류가 발생하면:
- TypeScript 오류 수정
- 의존성 설치 확인: `npm install`
- 빌드 로그 확인

## 배포 후 확인

1. **웹사이트 접속:**
   - https://budget-management-system-72094.web.app

2. **변경사항 확인:**
   - 브라우저 캐시 클리어 (Ctrl+Shift+R 또는 Cmd+Shift+R)
   - 개발자 도구(F12)에서 네트워크 탭 확인

3. **기능 테스트:**
   - 로그인/회원가입
   - 파일 업로드
   - 데이터 조회

## 자동 배포 설정 (선택사항)

GitHub Actions를 사용하여 자동 배포 설정:
- GitHub에 푸시하면 자동으로 빌드 및 배포
- `/.github/workflows/deploy.yml` 파일 생성 필요

