# RPA 도구 설정 가이드

이 가이드는 예산 관리 시스템과 RPA (Robotic Process Automation) 도구를 연동하는 방법을 설명합니다.

## 개요

RPA는 브라우저 자동화를 통해 반복적인 작업을 자동화합니다. 완전 무료로 사용 가능한 도구들:

- **Puppeteer**: Node.js 기반 브라우저 자동화 (무료)
- **Selenium**: 크로스 플랫폼 브라우저 자동화 (무료)
- **Playwright**: Microsoft의 브라우저 자동화 도구 (무료)

## 서버 사이드 구현 필요

클라이언트 사이드에서는 브라우저 자동화가 제한적이므로, 서버 사이드에서 RPA를 구현해야 합니다.

## Puppeteer 예제 (Node.js 서버)

### 1. 설치

```bash
npm install puppeteer
```

### 2. 기본 구조

```javascript
const puppeteer = require('puppeteer');

async function autoParseExcel(filePath) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Excel 파일 파싱 로직
  // ...
  
  await browser.close();
}

async function autoGenerateReport(year, version, format) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // 리포트 생성 로직
  // ...
  
  await browser.close();
}
```

## Selenium 예제 (Python 서버)

### 1. 설치

```bash
pip install selenium
```

### 2. 기본 구조

```python
from selenium import webdriver
from selenium.webdriver.common.by import By

def auto_parse_excel(file_path):
    driver = webdriver.Chrome()
    # Excel 파일 파싱 로직
    # ...
    driver.quit()

def auto_generate_report(year, version, format):
    driver = webdriver.Chrome()
    # 리포트 생성 로직
    # ...
    driver.quit()
```

## API 엔드포인트 예제

서버 사이드에서 RPA 작업을 실행하는 API 엔드포인트:

```javascript
// Express.js 예제
app.post('/api/rpa/execute', async (req, res) => {
  const { type, params } = req.body;
  
  try {
    let result;
    switch (type) {
      case 'parse_excel':
        result = await autoParseExcel(params.filePath);
        break;
      case 'export_report':
        result = await autoGenerateReport(params.year, params.version, params.format);
        break;
      default:
        throw new Error('알 수 없는 작업 타입');
    }
    
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## 주의사항

- RPA는 서버 사이드에서 실행해야 합니다
- 브라우저 드라이버 설치 필요 (Chrome, Firefox 등)
- 리소스 사용량이 높을 수 있음
- 보안 고려사항: RPA 작업은 신뢰할 수 있는 환경에서만 실행

## 무료 대안

- **Puppeteer**: 완전 무료
- **Selenium**: 완전 무료
- **Playwright**: 완전 무료
- **Browserless.io**: 무료 티어 제공 (클라우드)


