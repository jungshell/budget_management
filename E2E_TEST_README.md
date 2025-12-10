# E2E 테스트 가이드

## 개요
이 프로젝트는 Playwright를 사용하여 E2E(End-to-End) 테스트를 수행합니다.

## 사전 요구사항
- Node.js 설치
- npm 또는 yarn 설치

## 설치

```bash
cd frontend
npm install
npx playwright install --with-deps chromium
```

## 테스트 실행

### 기본 실행
```bash
cd "/Volumes/Samsung USB/budget_management_anti/frontend"
npm run test:e2e
```

### UI 모드로 실행 (권장)
```bash
npm run test:e2e:ui
```

### 디버그 모드로 실행
```bash
npm run test:e2e:debug
```

### 특정 브라우저만 실행
```bash
npx playwright test --project=chromium
```

### 특정 테스트 파일만 실행
```bash
npx playwright test e2e/dashboard.spec.ts
```

## 테스트 구조

### 테스트 파일 위치
- `frontend/e2e/` 디렉토리에 테스트 파일이 있습니다.

### 주요 테스트 파일
- `dashboard.spec.ts`: 대시보드 페이지 테스트
- `budgets.spec.ts`: 예산 관리 페이지 테스트
- `navigation.spec.ts`: 네비게이션 테스트

## 테스트 작성 가이드

### 기본 구조
```typescript
import { test, expect } from '@playwright/test';

test.describe('페이지 이름', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('테스트 설명', async ({ page }) => {
    // 테스트 코드
    await expect(page).toHaveTitle(/예산 관리 시스템/);
  });
});
```

### 유용한 명령어
- `page.goto(url)`: 페이지 이동
- `page.locator(selector)`: 요소 찾기
- `expect(locator).toBeVisible()`: 요소가 보이는지 확인
- `expect(page).toHaveURL(url)`: URL 확인
- `page.click(selector)`: 클릭
- `page.fill(selector, text)`: 텍스트 입력

## 문제 해결

### macOS 리소스 포크 파일 오류
macOS에서 `._`로 시작하는 리소스 포크 파일이 생성될 수 있습니다. 이를 삭제하려면:

```bash
cd frontend/e2e
find . -name "._*" -type f -delete
```

### 개발 서버가 시작되지 않는 경우
테스트 실행 전에 개발 서버가 실행 중인지 확인하세요:

```bash
npm start
```

또는 `playwright.config.ts`에서 `reuseExistingServer: true`로 설정되어 있으면 자동으로 기존 서버를 재사용합니다.

### 테스트 실패 시
1. 스크린샷 확인: `test-results/` 디렉토리에서 스크린샷 확인
2. 비디오 확인: 실패한 테스트의 비디오 확인
3. HTML 리포트 확인: `npm run test:e2e` 실행 후 생성된 HTML 리포트 확인

## CI/CD 통합

CI 환경에서는 다음과 같이 실행합니다:

```bash
npm run test:e2e
```

CI 환경에서는 자동으로:
- 모든 브라우저에서 테스트 실행
- 실패 시 재시도 (2회)
- HTML 리포트 생성

## 추가 리소스

- [Playwright 공식 문서](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

