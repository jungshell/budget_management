/**
 * 예산 관리 시스템과 Google 서비스 연동
 * 전체 코드 - Google Apps Script에 복사하여 사용
 */

// GET 요청 처리 (브라우저에서 직접 접속 시)
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ 
      success: true, 
      message: 'Google Apps Script Web App이 정상적으로 작동 중입니다.',
      timestamp: new Date().toISOString()
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

// POST 요청 처리 (프론트엔드에서 호출 시)
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    // 디버깅: 받은 데이터 로그 출력
    console.log('Received data:', JSON.stringify(data));
    
    // 디버깅: 로그 출력
    console.log('doPost called with action:', action);
    console.log('Data received:', JSON.stringify(data).substring(0, 200));

    let result;
    switch (action) {
      case 'sync':
        result = syncToSheets(data);
        break;
      case 'upload':
        result = uploadToDrive(data);
        break;
      case 'email':
        result = sendEmail(data);
        break;
      case 'calendar':
        result = addCalendarEvent(data);
        break;
      case 'import':
        result = importFromSheets(data);
        break;
      case 'test':
        result = ContentService.createTextOutput(
          JSON.stringify({ success: true, message: '연동 테스트 성공' })
        ).setMimeType(ContentService.MimeType.JSON);
        break;
      default:
        result = ContentService.createTextOutput(
          JSON.stringify({ success: false, error: '알 수 없는 액션' })
        ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // CORS는 Web App 배포 설정에서 자동으로 처리됨 (액세스 권한: "모든 사용자")
    return result;
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// OPTIONS 요청 처리 (CORS preflight) - 중요: 이 함수가 있어야 CORS가 작동함
function doOptions(e) {
  // CORS preflight 요청에 대한 응답
  // Google Apps Script Web App은 "액세스 권한: 모든 사용자"로 설정하면
  // 자동으로 CORS 헤더를 추가하지만, doOptions 함수가 있어야 합니다
  return ContentService.createTextOutput('OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Google Sheets 동기화
function syncToSheets(data) {
  try {
    const spreadsheetId = data.spreadsheetId;
    const sheetName = data.sheetName || '예산데이터';
    const budgetData = data.data;
    const year = data.year || new Date().getFullYear();
    const version = data.version || '본예산';

    /**
     * 컬럼 번호를 알파벳으로 변환하는 함수 (A=1, Z=26, AA=27, ...)
     * @param {number} colNum - 컬럼 번호 (1부터 시작)
     * @return {string} 컬럼 알파벳 (A, B, ..., Z, AA, AB, ...)
     */
    function getColumnLetter(colNum) {
      let result = '';
      while (colNum > 0) {
        colNum--;
        result = String.fromCharCode(65 + (colNum % 26)) + result;
        colNum = Math.floor(colNum / 26);
      }
      return result;
    }

    // 디버깅: 받은 데이터 확인
    console.log('syncToSheets called');
    console.log('year:', year, 'version:', version);
    console.log('budgetData length:', budgetData ? budgetData.length : 0);

    // 액션 구분 (표준 형식 생성 vs 내보내기)
    const actionType = data.actionType || 'export'; // 'standardize' 또는 'export'
    
    // 제목 생성: 연도_회차_타입 (예: 2024_본예산_표준형식 또는 2024_본예산) - 같은 연도/회차/타입은 덮어쓰기
    let spreadsheetTitle = year + '_' + version;
    if (actionType === 'standardize') {
      spreadsheetTitle = year + '_' + version + '_표준형식';
    }
    
    // 디버깅: 제목 생성 확인
    console.log('Spreadsheet title:', spreadsheetTitle);
    console.log('Year:', year, 'Version:', version, 'Action:', actionType);

    let spreadsheet;
    let isNewSpreadsheet = false;
    
    // 같은 연도/회차의 기존 스프레드시트 찾기
    if (spreadsheetId && spreadsheetId.trim() !== '') {
      try {
        // 스프레드시트 ID가 제공된 경우, 해당 스프레드시트 열기
        spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        const currentTitle = spreadsheet.getName();
        // 제목이 같은 연도/회차인지 확인
        if (currentTitle.startsWith(year + '_' + version)) {
          // 같은 연도/회차면 제목 유지 (덮어쓰기)
          console.log('기존 스프레드시트 덮어쓰기:', currentTitle);
        } else {
          // 다른 연도/회차면 제목 업데이트
          spreadsheet.rename(spreadsheetTitle);
        }
      } catch (error) {
        // 스프레드시트 ID가 유효하지 않거나 접근 권한이 없는 경우
        // Drive에서 같은 제목의 스프레드시트 찾기
        const files = DriveApp.getFilesByName(spreadsheetTitle);
        if (files.hasNext()) {
          // 같은 제목의 스프레드시트가 있으면 사용
          const file = files.next();
          spreadsheet = SpreadsheetApp.openById(file.getId());
          console.log('기존 스프레드시트 찾아서 덮어쓰기:', spreadsheetTitle);
        } else {
          // 없으면 새로 생성
          spreadsheet = SpreadsheetApp.create(spreadsheetTitle);
          isNewSpreadsheet = true;
          console.log('새 스프레드시트 생성:', spreadsheetTitle);
        }
      }
    } else {
      // 스프레드시트 ID가 없는 경우, 같은 제목의 스프레드시트 찾기
      const files = DriveApp.getFilesByName(spreadsheetTitle);
      if (files.hasNext()) {
        // 같은 제목의 스프레드시트가 있으면 사용
        const file = files.next();
        spreadsheet = SpreadsheetApp.openById(file.getId());
        console.log('기존 스프레드시트 찾아서 덮어쓰기:', spreadsheetTitle);
      } else {
        // 없으면 새로 생성
        spreadsheet = SpreadsheetApp.create(spreadsheetTitle);
        isNewSpreadsheet = true;
        console.log('새 스프레드시트 생성:', spreadsheetTitle);
      }
    }

    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    } else {
      // 기존 시트가 있으면 모든 데이터 삭제
      sheet.clear();
    }
    
    // 시트 순서 조정: 회차시트(본예산) → 시군비 상세 순서
    // 먼저 시군비 상세 시트가 있으면 삭제하고 나중에 다시 생성
    const existingCitySheet = spreadsheet.getSheetByName('시군비 상세');
    if (existingCitySheet) {
      spreadsheet.deleteSheet(existingCitySheet);
    }

    // 충청남도 15개 시군 목록
    const CHUNGNAM_CITIES = [
      '천안시', '공주시', '보령시', '아산시', '서산시',
      '논산시', '계룡시', '당진시', '금산군', '부여군',
      '서천군', '청양군', '홍성군', '예산군', '태안군'
    ];
    
    // 시군비 데이터 수집 (별도 탭 생성을 위해)
    const cityDataMap = {}; // {cityName: {projectName: {contribution: amount, grant: amount}}}
    
    // 헤더 작성 (컬럼 구조 정확히 반영)
    // A: 사업명, B: 소관부서
    // C~F: 합계-총합계, 합계-국비, 합계-도비, 합계-시군비-소계
    // G~U: 합계-15개 시군 (천안시부터 태안군까지)
    // V: 합계-자체
    // W: 출연금-합계, X: 출연금-도비, Y: 출연금-시군비-소계
    // Z~AN: 출연금-15개 시군 (천안시부터 태안군까지)
    // AO: 보조금-합계, AP: 보조금-국비, AQ: 보조금-도비, AR: 보조금-시군비-소계
    // AS~BG: 보조금-15개 시군 (천안시부터 태안군까지)
    // BH: 자체재원, BI: 산식검증, BJ: 산식오류
    const headers = ['사업명', '소관부서'];
    
    // 합계 섹션 (줄바꿈 처리)
    headers.push('합계\n총합계', '합계\n국비', '합계\n도비', '합계\n시군비\n소계');
    // 15개 시군 합계 (줄바꿈 처리)
    CHUNGNAM_CITIES.forEach(city => {
      headers.push(`합계\n시군비\n${city}`);
    });
    headers.push('합계\n자체');
    
    // 출연금 섹션 (합계 열 추가)
    headers.push('출연금\n합계', '출연금\n도비', '출연금\n시군비\n소계');
    // 15개 시군 출연금 컬럼 추가 (줄바꿈 처리 - 시군비 포함)
    CHUNGNAM_CITIES.forEach(city => {
      headers.push(`출연금\n시군비\n${city}`);
    });
    
    // 보조금 섹션 (합계 열 추가, 줄바꿈 처리)
    headers.push('보조금\n합계', '보조금\n국비', '보조금\n도비', '보조금\n시군비\n소계');
    // 15개 시군 보조금 컬럼 추가 (줄바꿈 처리 - 시군비 포함)
    CHUNGNAM_CITIES.forEach(city => {
      headers.push(`보조금\n시군비\n${city}`);
    });
    
    // 나머지 컬럼 추가
    headers.push('자체재원', '산식검증', '산식오류');
    
    // 데이터를 rowIndex 기준으로 정렬 (있는 경우)
    const sortedData = budgetData.slice().sort((a, b) => {
      const ai = a.rowIndex ?? Number.MAX_SAFE_INTEGER;
      const bi = b.rowIndex ?? Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi;
      // rowIndex가 같으면 사업명으로 정렬
      return (a.projectName || '').localeCompare(b.projectName || '', 'ko');
    });
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // 헤더 스타일 설정
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f0f0f0');
    headerRange.setHorizontalAlignment('center');
    headerRange.setVerticalAlignment('middle');
    // 헤더 텍스트 줄바꿈 활성화
    headerRange.setWrap(true);

    // 데이터 작성 및 산식 검증 (정렬된 데이터 사용)
    const rows = [];
    const formulaRows = [];
    const errorRows = [];
    
    sortedData.forEach((item, index) => {
      const contribDo = item.contribution?.도비 || 0;
      let contribCity = 0;
      let contribCityDetails = {};
      if (typeof item.contribution?.시군비 === 'object' && item.contribution.시군비 !== null) {
        contribCityDetails = item.contribution.시군비;
        contribCity = Object.values(item.contribution.시군비).reduce((sum, v) => sum + (v || 0), 0);
      } else {
        contribCity = item.contribution?.시군비 || 0;
      }
      
      const grantNational = item.grant?.국비 || 0;
      const grantDo = item.grant?.도비 || 0;
      let grantCity = 0;
      let grantCityDetails = {};
      if (typeof item.grant?.시군비 === 'object' && item.grant.시군비 !== null) {
        grantCityDetails = item.grant.시군비;
        grantCity = Object.values(item.grant.시군비).reduce((sum, v) => sum + (v || 0), 0);
      } else {
        grantCity = item.grant?.시군비 || 0;
      }
      const ownFunds = item.grant?.자체 || item.ownFunds || 0;
      
      // 시군비 데이터 수집 (별도 탭 생성을 위해)
      const allCities = new Set();
      Object.keys(contribCityDetails).forEach(city => allCities.add(city));
      Object.keys(grantCityDetails).forEach(city => allCities.add(city));
      
      allCities.forEach(city => {
        if (!cityDataMap[city]) {
          cityDataMap[city] = {};
        }
        cityDataMap[city][item.projectName || ''] = {
          contribution: contribCityDetails[city] || 0,
          grant: grantCityDetails[city] || 0,
        };
      });
      
      const calculatedTotal = contribDo + contribCity + grantNational + grantDo + grantCity + ownFunds;
      const totalAmount = item.totalAmount || 0;
      const difference = Math.abs(totalAmount - calculatedTotal);
      const hasError = difference > 1000; // 1000원 이상 차이면 오류
      
      const rowNum = index + 3; // 헤더(1행) + 합계(2행) 다음 행부터
      
      // 합계 계산
      const totalNational = grantNational; // 합계-국비 (보조금-국비만)
      const totalDo = contribDo + grantDo; // 합계-도비 (출연금-도비 + 보조금-도비)
      const totalCity = contribCity + grantCity; // 합계-시군비-소계 (출연금-시군비 + 보조금-시군비)
      const totalGrandTotal = totalNational + totalDo + totalCity + ownFunds; // 합계-총합계
      
      // 출연금 합계 계산
      const contribTotal = contribDo + contribCity; // 출연금-합계
      // 보조금 합계 계산
      const grantTotal = grantNational + grantDo + grantCity; // 보조금-합계
      
      // 행 데이터 구성: 사업명, 소관부서, 합계 섹션, 출연금 섹션, 보조금 섹션, 자체재원, 산식검증, 산식오류
      const row = [
        item.projectName || '',
        item.department || '',
        // 합계 섹션
        totalGrandTotal, // 합계-총합계 (C열)
        totalNational, // 합계-국비 (D열)
        totalDo, // 합계-도비 (E열)
        totalCity, // 합계-시군비-소계 (F열)
      ];
      
      // 합계-15개 시군 데이터 추가 (G~U열, 7~21)
      CHUNGNAM_CITIES.forEach(city => {
        const cityTotal = (contribCityDetails[city] || 0) + (grantCityDetails[city] || 0);
        row.push(cityTotal);
      });
      
      // 합계-자체 (V열, 22)
      row.push(ownFunds);
      
      // 출연금 섹션 (합계 열 추가, 수식으로 계산)
      row.push('', contribDo, contribCity); // 출연금-합계(W, 23, 수식), 출연금-도비(X, 24), 출연금-시군비-소계(Y, 25)
      // 15개 시군 출연금 데이터 추가 (Z~AN열, 26~40)
      CHUNGNAM_CITIES.forEach(city => {
        row.push(contribCityDetails[city] || 0);
      });
      
      // 보조금 섹션 (합계 열 추가, 수식으로 계산)
      row.push('', grantNational, grantDo, grantCity); // 보조금-합계(AO, 41, 수식), 보조금-국비(AP, 42), 보조금-도비(AQ, 43), 보조금-시군비-소계(AR, 44)
      // 15개 시군 보조금 데이터 추가 (AS~BG열, 45~59)
      CHUNGNAM_CITIES.forEach(city => {
        row.push(grantCityDetails[city] || 0);
      });
      
      // 나머지 컬럼 추가
      row.push(ownFunds, '', ''); // 자체재원(BH, 60), 산식검증(BI, 61), 산식오류(BJ, 62)
      
      rows.push(row);
      
      // 산식 검증 컬럼 위치 계산
      // 컬럼 순서: A(1)=사업명, B(2)=소관부서
      // C(3)=합계-총합계, D(4)=합계-국비, E(5)=합계-도비, F(6)=합계-시군비-소계
      // G(7)~U(21)=합계-15개 시군, V(22)=합계-자체
      // W(23)=출연금-합계, X(24)=출연금-도비, Y(25)=출연금-시군비-소계, Z(26)~AN(40)=출연금-15개 시군
      // AO(41)=보조금-합계, AP(42)=보조금-국비, AQ(43)=보조금-도비, AR(44)=보조금-시군비-소계, AS(45)~BG(59)=보조금-15개 시군
      // BH(60)=자체재원, BI(61)=산식검증, BJ(62)=산식오류
      const formulaRow = rowNum;
      const totalGrandTotalCol = 3; // C열 (합계-총합계)
      const totalNationalCol = 4; // D열 (합계-국비)
      const totalDoCol = 5; // E열 (합계-도비)
      const totalCityCol = 6; // F열 (합계-시군비-소계)
      const totalOwnFundsCol = 22; // V열 (합계-자체)
      const contribTotalCol = 23; // W열 (출연금-합계)
      const contribDoCol = 24; // X열 (출연금-도비)
      const contribCityCol = 25; // Y열 (출연금-시군비-소계)
      const grantTotalCol = 41; // AO열 (보조금-합계)
      const grantNationalCol = 42; // AP열 (보조금-국비)
      const grantDoCol = 43; // AQ열 (보조금-도비)
      const grantCityCol = 44; // AR열 (보조금-시군비-소계)
      const ownFundsCol = 60; // BH열 (자체재원)
      const formulaCol = 61; // BI열 (산식검증)
      const errorCol = 62; // BJ열 (산식오류)
      
      // 산식 검증 수식: 합계-총합계(C) 사용
      const formula = `=C${formulaRow}`; // 합계-총합계 사용
      formulaRows.push({ row: formulaRow, col: formulaCol, formula: formula });
      
      // 산식 오류 수식: 여러 검증 항목 확인
      // 1. 합계-총합계 = 출연금-합계 + 보조금-합계 + 자체재원
      // 2. 출연금-합계 = 출연금-도비 + 출연금-시군비-소계
      // 3. 보조금-합계 = 보조금-국비 + 보조금-도비 + 보조금-시군비-소계
      const contribTotalLetter = getColumnLetter(23); // W열 (출연금-합계)
      const contribDoLetter = getColumnLetter(24); // X열 (출연금-도비)
      const contribCityLetter = getColumnLetter(25); // Y열 (출연금-시군비-소계)
      const grantTotalLetter = getColumnLetter(41); // AO열 (보조금-합계)
      const grantNationalLetter = getColumnLetter(42); // AP열 (보조금-국비)
      const grantDoLetter = getColumnLetter(43); // AQ열 (보조금-도비)
      const grantCityLetter = getColumnLetter(44); // AR열 (보조금-시군비-소계)
      const ownFundsLetter = getColumnLetter(60); // BH열 (자체재원)
      const totalGrandTotalLetter = getColumnLetter(3); // C열 (합계-총합계)
      
      // 종합 검증 수식
      const errorFormula = `=IFERROR(IF(OR(ABS(${totalGrandTotalLetter}${formulaRow}-(${contribTotalLetter}${formulaRow}+${grantTotalLetter}${formulaRow}+${ownFundsLetter}${formulaRow}))>1000,ABS(${contribTotalLetter}${formulaRow}-(${contribDoLetter}${formulaRow}+${contribCityLetter}${formulaRow}))>1000,ABS(${grantTotalLetter}${formulaRow}-(${grantNationalLetter}${formulaRow}+${grantDoLetter}${formulaRow}+${grantCityLetter}${formulaRow}))>1000),"오류","정상"),"오류")`;
      errorRows.push({ row: formulaRow, col: errorCol, formula: errorFormula });
    });

    // 숫자 형식 컬럼 정의 (반드시 rows 생성 후에 선언)
    const numberColumns = [];
    // 합계 섹션
    numberColumns.push(3); // 합계-총합계(C)
    numberColumns.push(4); // 합계-국비(D)
    numberColumns.push(5); // 합계-도비(E)
    numberColumns.push(6); // 합계-시군비-소계(F)
    // 합계-15개 시군 (G~U, 7~21)
    for (let i = 7; i <= 6 + CHUNGNAM_CITIES.length; i++) {
      numberColumns.push(i);
    }
    numberColumns.push(22); // 합계-자체(V)
    // 출연금 섹션
    numberColumns.push(23); // 출연금-합계(W)
    numberColumns.push(24); // 출연금-도비(X)
    numberColumns.push(25); // 출연금-시군비-소계(Y)
    // 출연금-15개 시군 (Z~AN, 26~40)
    for (let i = 26; i <= 25 + CHUNGNAM_CITIES.length; i++) {
      numberColumns.push(i);
    }
    // 보조금 섹션
    numberColumns.push(41); // 보조금-합계(AO)
    numberColumns.push(42); // 보조금-국비(AP)
    numberColumns.push(43); // 보조금-도비(AQ)
    numberColumns.push(44); // 보조금-시군비-소계(AR)
    // 보조금-15개 시군 (AS~BG, 45~59)
    for (let i = 45; i <= 44 + CHUNGNAM_CITIES.length; i++) {
      numberColumns.push(i);
    }
    numberColumns.push(60); // 자체재원(BH)
    numberColumns.push(61); // 산식검증(BI)

    // 합계 행 먼저 삽입 (2행에)
    if (rows.length > 0) {
      // 합계 행 데이터 생성
      const totalRow = ['합계', ''];
      // 합계 섹션 합계
      totalRow.push(''); // 합계-총합계 (C열)
      totalRow.push(''); // 합계-국비 (D열)
      totalRow.push(''); // 합계-도비 (E열)
      totalRow.push(''); // 합계-시군비-소계 (F열)
      // 합계-15개 시군 합계 (G~U열)
      for (let i = 0; i < CHUNGNAM_CITIES.length; i++) {
        totalRow.push('');
      }
      totalRow.push(''); // 합계-자체 (V열)
      // 출연금 섹션 합계
      totalRow.push(''); // 출연금-합계 (W열, 수식)
      totalRow.push(''); // 출연금-도비 (X열)
      totalRow.push(''); // 출연금-시군비-소계 (Y열)
      // 출연금-15개 시군 합계 (Z~AN열)
      for (let i = 0; i < CHUNGNAM_CITIES.length; i++) {
        totalRow.push('');
      }
      // 보조금 섹션 합계
      totalRow.push(''); // 보조금-합계 (AO열, 수식)
      totalRow.push(''); // 보조금-국비 (AP열)
      totalRow.push(''); // 보조금-도비 (AQ열)
      totalRow.push(''); // 보조금-시군비-소계 (AR열)
      // 보조금-15개 시군 합계 (AS~BG열)
      for (let i = 0; i < CHUNGNAM_CITIES.length; i++) {
        totalRow.push('');
      }
      // 자체재원 합계
      totalRow.push(''); // 자체재원 (BH열)
      // 산식검증 합계
      totalRow.push(''); // 산식검증 (BI열)
      // 산식오류 (합계 없음)
      totalRow.push(''); // 산식오류 (BJ열)
      
      // 합계 행 삽입 (2행에)
      sheet.insertRowBefore(2);
      sheet.getRange(2, 1, 1, headers.length).setValues([totalRow]);
      
      // 데이터 작성 (3행부터, 헤더 1행 + 합계 1행 이후)
      const dataStartRow = 3; // 데이터 시작 행 (헤더 1행 + 합계 1행)
      
      // 각 행의 길이를 헤더 길이에 맞춤 (디버깅 및 안정성)
      const expectedLength = headers.length;
      rows.forEach((row, idx) => {
        if (row.length !== expectedLength) {
          console.log(`행 ${idx}의 길이가 일치하지 않습니다: ${row.length} (예상: ${expectedLength})`);
          // 부족한 컬럼은 빈 문자열로 채움
          while (row.length < expectedLength) {
            row.push('');
          }
          // 초과하는 컬럼은 제거
          if (row.length > expectedLength) {
            row.splice(expectedLength);
          }
        }
      });
      
      // 합계 행 길이도 확인
      if (totalRow.length !== expectedLength) {
        console.log(`합계 행의 길이가 일치하지 않습니다: ${totalRow.length} (예상: ${expectedLength})`);
        while (totalRow.length < expectedLength) {
          totalRow.push('');
        }
        if (totalRow.length > expectedLength) {
          totalRow.splice(expectedLength);
        }
      }
      
      const dataRange = sheet.getRange(dataStartRow, 1, rows.length, headers.length);
      dataRange.setValues(rows);
      
      // 숫자 형식 적용 (데이터 행)
      numberColumns.forEach(col => {
        const range = sheet.getRange(dataStartRow, col, rows.length, 1);
        range.setNumberFormat('#,##0'); // 천 단위 구분 쉼표 형식
      });
      
      // 출연금-합계 수식 적용 (W열, 23)
      rows.forEach((rowData, idx) => {
        const rowNum = dataStartRow + idx;
        sheet.getRange(rowNum, 23).setFormula(`=X${rowNum}+Y${rowNum}`); // 출연금-합계 = 출연금-도비 + 출연금-시군비-소계
        sheet.getRange(rowNum, 23).setNumberFormat('#,##0');
      });
      
      // 보조금-합계 수식 적용 (AO열, 41)
      rows.forEach((rowData, idx) => {
        const rowNum = dataStartRow + idx;
        sheet.getRange(rowNum, 41).setFormula(`=AP${rowNum}+AQ${rowNum}+AR${rowNum}`); // 보조금-합계 = 보조금-국비 + 보조금-도비 + 보조금-시군비-소계
        sheet.getRange(rowNum, 41).setNumberFormat('#,##0');
      });
      
      // 산식 검증 컬럼에 수식 적용
      formulaRows.forEach(({ row, col, formula }) => {
        sheet.getRange(row, col).setFormula(formula);
        sheet.getRange(row, col).setNumberFormat('#,##0');
      });
      
      // 산식 오류 컬럼에 수식 적용
      errorRows.forEach(({ row, col, formula }) => {
        sheet.getRange(row, col).setFormula(formula);
      });
      
      // 합계 행 수식 적용
      const dataEndRow = rows.length + 2; // 데이터 끝 행
      
      // 합계 섹션 합계
      sheet.getRange(2, 3).setFormula(`=SUM(C${dataStartRow}:C${dataEndRow})`); // 합계-총합계 (C열)
      sheet.getRange(2, 4).setFormula(`=SUM(D${dataStartRow}:D${dataEndRow})`); // 합계-국비 (D열)
      sheet.getRange(2, 5).setFormula(`=SUM(E${dataStartRow}:E${dataEndRow})`); // 합계-도비 (E열)
      sheet.getRange(2, 6).setFormula(`=SUM(F${dataStartRow}:F${dataEndRow})`); // 합계-시군비-소계 (F열)
      // 합계-15개 시군 합계 (G~U열)
      for (let i = 0; i < CHUNGNAM_CITIES.length; i++) {
        const col = 7 + i; // G열부터 시작
        const colLetter = getColumnLetter(col);
        sheet.getRange(2, col).setFormula(`=SUM(${colLetter}${dataStartRow}:${colLetter}${dataEndRow})`);
      }
      sheet.getRange(2, 22).setFormula(`=SUM(V${dataStartRow}:V${dataEndRow})`); // 합계-자체 (V열)
      // 출연금 섹션 합계
      sheet.getRange(2, 24).setFormula(`=SUM(X${dataStartRow}:X${dataEndRow})`); // 출연금-도비 (X열)
      // 출연금-시군비-소계 (Y열)는 Z~AN 열의 합계여야 함
      const contribCityStartCol = getColumnLetter(26); // Z열
      const contribCityEndCol = getColumnLetter(26 + CHUNGNAM_CITIES.length - 1); // AN열
      sheet.getRange(2, 25).setFormula(`=SUM(${contribCityStartCol}2:${contribCityEndCol}2)`); // 출연금-시군비-소계 = Z~AN 합계 행의 합계
      // 출연금-합계는 수식으로 계산되므로 합계 행에도 수식 적용
      sheet.getRange(2, 23).setFormula(`=X2+Y2`); // 합계 행의 출연금-합계 = 출연금-도비 합계 + 출연금-시군비-소계 합계
      // 출연금-15개 시군 합계 (Z~AN열)
      for (let i = 0; i < CHUNGNAM_CITIES.length; i++) {
        const col = 26 + i; // Z열부터 시작
        const colLetter = getColumnLetter(col);
        sheet.getRange(2, col).setFormula(`=SUM(${colLetter}${dataStartRow}:${colLetter}${dataEndRow})`);
      }
      // 보조금 섹션 합계
      sheet.getRange(2, 42).setFormula(`=SUM(AP${dataStartRow}:AP${dataEndRow})`); // 보조금-국비 (AP열)
      sheet.getRange(2, 43).setFormula(`=SUM(AQ${dataStartRow}:AQ${dataEndRow})`); // 보조금-도비 (AQ열)
      // 보조금-시군비-소계 (AR열)는 AS~BG 열의 합계여야 함
      const grantCityStartCol = getColumnLetter(45); // AS열
      const grantCityEndCol = getColumnLetter(45 + CHUNGNAM_CITIES.length - 1); // BG열
      sheet.getRange(2, 44).setFormula(`=SUM(${grantCityStartCol}2:${grantCityEndCol}2)`); // 보조금-시군비-소계 = AS~BG 합계 행의 합계
      // 보조금-합계는 수식으로 계산되므로 합계 행에도 수식 적용
      sheet.getRange(2, 41).setFormula(`=AP2+AQ2+AR2`); // 합계 행의 보조금-합계 = 보조금-국비 합계 + 보조금-도비 합계 + 보조금-시군비-소계 합계
      // 보조금-15개 시군 합계 (AS~BG열)
      for (let i = 0; i < CHUNGNAM_CITIES.length; i++) {
        const col = 45 + i; // AS열부터 시작
        const colLetter = getColumnLetter(col);
        sheet.getRange(2, col).setFormula(`=SUM(${colLetter}${dataStartRow}:${colLetter}${dataEndRow})`);
      }
      // 자체재원 합계 (BH열)
      sheet.getRange(2, 60).setFormula(`=SUM(BH${dataStartRow}:BH${dataEndRow})`);
      // 산식검증 합계 (BI열)
      sheet.getRange(2, 61).setFormula(`=SUM(BI${dataStartRow}:BI${dataEndRow})`);
      
      // 합계 행 스타일 적용
      const totalRange = sheet.getRange(2, 1, 1, headers.length);
      totalRange.setFontWeight('bold');
      totalRange.setBackground('#e0e0e0');
      
      // 합계 행 숫자 형식 적용
      numberColumns.forEach(col => {
        sheet.getRange(2, col).setNumberFormat('#,##0');
      });
      
      // 산식 오류가 있는 행에 배경색 적용 (수식이 적용된 후)
      // 조건부 서식으로 처리
      const errorCol = 62; // BN열 (산식오류)
      const errorRange = sheet.getRange(dataStartRow, errorCol, rows.length, 1); // 산식오류 컬럼 (데이터 행)
      const errorCondition = SpreadsheetApp.newConditionalFormatRule()
        .setRanges([errorRange])
        .whenTextEqualTo('오류')
        .setBackground('#ffcccc')
        .build();
      
      // 합계-총합계 컬럼에도 조건부 서식 적용 (산식오류가 "오류"인 경우)
      const totalGrandTotalRange = sheet.getRange(dataStartRow, 3, rows.length, 1); // 합계-총합계 컬럼(C열, 데이터 행)
      const errorColLetter = String.fromCharCode(64 + errorCol); // BN
      const totalGrandTotalCondition = SpreadsheetApp.newConditionalFormatRule()
        .setRanges([totalGrandTotalRange])
        .whenFormulaSatisfied(`=$${errorColLetter}${dataStartRow}="오류"`) // 산식오류 컬럼이 "오류"인 경우
        .setBackground('#ffcccc')
        .build();
      
      // 산식검증 컬럼에도 조건부 서식 적용
      const formulaColForConditional = 61; // BM열 (산식검증)
      const formulaRange = sheet.getRange(dataStartRow, formulaColForConditional, rows.length, 1); // 산식검증 컬럼 (데이터 행)
      const formulaCondition = SpreadsheetApp.newConditionalFormatRule()
        .setRanges([formulaRange])
        .whenFormulaSatisfied(`=$${errorColLetter}${dataStartRow}="오류"`)
        .setBackground('#ffcccc')
        .build();
      
      sheet.setConditionalFormatRules([errorCondition, totalGrandTotalCondition, formulaCondition]);
      
      // 섹션별 배경색 적용 (1행 헤더)
      // 합계 섹션: 회색 (C~V열, 3~22)
      const totalSectionRange = sheet.getRange(1, 3, 1, 20);
      totalSectionRange.setBackground('#d3d3d3'); // 회색
      
      // 출연금 섹션: 파란색 (W~AN열, 23~40)
      const contribSectionRange = sheet.getRange(1, 23, 1, 18);
      contribSectionRange.setBackground('#b3d9ff'); // 연한 파란색
      
      // 보조금 섹션: 초록색 (AO~BG열, 41~59)
      const grantSectionRange = sheet.getRange(1, 41, 1, 19);
      grantSectionRange.setBackground('#b3ffb3'); // 연한 초록색
      
      // 자체재원: 노란색 (BH열, 60)
      sheet.getRange(1, 60).setBackground('#ffffb3'); // 연한 노란색
      
      // 산식검증, 산식오류: 기본색 유지
      
      // 3행부터 수정 가능/자동계산 구분 배경색
      // 수정 가능: 흰색 (기본)
      // 자동계산: 연한 회색 (합계 섹션, 출연금-합계, 보조금-합계, 산식검증, 산식오류)
      if (rows.length > 0) {
        // 합계 섹션 (C~V열) - 자동계산
        const autoCalcRange1 = sheet.getRange(dataStartRow, 3, rows.length, 20);
        autoCalcRange1.setBackground('#f5f5f5'); // 연한 회색
        
        // 출연금-합계 (W열) - 자동계산
        const autoCalcRange2 = sheet.getRange(dataStartRow, 23, rows.length, 1);
        autoCalcRange2.setBackground('#f5f5f5');
        
        // 보조금-합계 (AO열) - 자동계산
        const autoCalcRange3 = sheet.getRange(dataStartRow, 41, rows.length, 1);
        autoCalcRange3.setBackground('#f5f5f5');
        
        // 산식검증, 산식오류 (BI~BJ열) - 자동계산
        const autoCalcRange4 = sheet.getRange(dataStartRow, 61, rows.length, 2);
        autoCalcRange4.setBackground('#f5f5f5');
      }
      
      // 시군비 중 예산 없는 시군만 숨기기
      // 합계 섹션 시군비 (I~V열, 9~22) 중 값이 모두 0인 열 숨기기
      // 출연금 시군비 (AA~AN열, 27~40) 중 값이 모두 0인 열 숨기기
      // 보조금 시군비 (AS~BF열, 44~57) 중 값이 모두 0인 열 숨기기
      if (rows.length > 0) {
        // 합계 섹션 시군비 (G~U열, 7~21)
        for (let i = 0; i < CHUNGNAM_CITIES.length; i++) {
          const col = 7 + i; // G열부터 시작
          let hasValue = false;
          // 합계 행(2행)과 데이터 행(3행~) 확인
          const sumValue = sheet.getRange(2, col).getValue();
          if (sumValue && sumValue !== 0) {
            hasValue = true;
          } else {
            for (let row = dataStartRow; row <= dataEndRow; row++) {
              const cellValue = sheet.getRange(row, col).getValue();
              if (cellValue && cellValue !== 0) {
                hasValue = true;
                break;
              }
            }
          }
          if (!hasValue) {
            sheet.hideColumns(col);
          }
        }
        
        // 출연금 시군비 (Z~AN열, 26~40)
        for (let i = 0; i < CHUNGNAM_CITIES.length; i++) {
          const col = 26 + i; // Z열부터 시작
          let hasValue = false;
          const sumValue = sheet.getRange(2, col).getValue();
          if (sumValue && sumValue !== 0) {
            hasValue = true;
          } else {
            for (let row = dataStartRow; row <= dataEndRow; row++) {
              const cellValue = sheet.getRange(row, col).getValue();
              if (cellValue && cellValue !== 0) {
                hasValue = true;
                break;
              }
            }
          }
          if (!hasValue) {
            sheet.hideColumns(col);
          }
        }
        
        // 보조금 시군비 (AS~BG열, 45~59)
        for (let i = 0; i < CHUNGNAM_CITIES.length; i++) {
          const col = 45 + i; // AS열부터 시작
          let hasValue = false;
          const sumValue = sheet.getRange(2, col).getValue();
          if (sumValue && sumValue !== 0) {
            hasValue = true;
          } else {
            for (let row = dataStartRow; row <= dataEndRow; row++) {
              const cellValue = sheet.getRange(row, col).getValue();
              if (cellValue && cellValue !== 0) {
                hasValue = true;
                break;
              }
            }
          }
          if (!hasValue) {
            sheet.hideColumns(col);
          }
        }
      }
      
      // 시군비 별도 탭 생성 (15개 시군 모두 표시)
      // 시군비 탭 생성 (회차시트 다음에 위치)
      let citySheet = spreadsheet.getSheetByName('시군비 상세');
      if (!citySheet) {
        // 회차시트 다음에 시군비 상세 시트 삽입
        const mainSheetIndex = sheet.getIndex();
        citySheet = spreadsheet.insertSheet('시군비 상세', mainSheetIndex + 1);
      } else {
        citySheet.clear();
        // 시트 순서 조정: 회차시트 다음으로 이동
        const mainSheetIndex = sheet.getIndex();
        const citySheetIndex = citySheet.getIndex();
        if (citySheetIndex !== mainSheetIndex + 1) {
          spreadsheet.setActiveSheet(citySheet);
          spreadsheet.moveActiveSheet(mainSheetIndex + 1);
        }
      }
      
      // 시군비 탭 헤더 (15개 시군 모두 표시)
      // 출연금 15개 먼저, 그 다음 보조금 15개
      const cityHeaders = ['사업명', '소관부서'];
      // 15개 시군 출연금 먼저 추가
      CHUNGNAM_CITIES.forEach(city => {
        cityHeaders.push(`출연금-${city}`);
      });
      // 15개 시군 보조금 그 다음 추가
      CHUNGNAM_CITIES.forEach(city => {
        cityHeaders.push(`보조금-${city}`);
      });
      citySheet.getRange(1, 1, 1, cityHeaders.length).setValues([cityHeaders]);
      citySheet.getRange(1, 1, 1, cityHeaders.length).setFontWeight('bold');
      citySheet.getRange(1, 1, 1, cityHeaders.length).setBackground('#f0f0f0');
      
      // 시군비 탭 데이터 작성 (15개 시군 모두 표시)
      // 출연금 15개 먼저, 그 다음 보조금 15개
      const cityRows = [];
      budgetData.forEach((item) => {
        const cityRow = [item.projectName || '', item.department || ''];
        // 15개 시군 출연금 먼저 추가
        CHUNGNAM_CITIES.forEach(city => {
          const cityData = cityDataMap[city] && cityDataMap[city][item.projectName || ''] 
            ? cityDataMap[city][item.projectName || '']
            : { contribution: 0, grant: 0 };
          cityRow.push(cityData.contribution || 0);
        });
        // 15개 시군 보조금 그 다음 추가
        CHUNGNAM_CITIES.forEach(city => {
          const cityData = cityDataMap[city] && cityDataMap[city][item.projectName || ''] 
            ? cityDataMap[city][item.projectName || '']
            : { contribution: 0, grant: 0 };
          cityRow.push(cityData.grant || 0);
        });
        cityRows.push(cityRow);
      });
      
      if (cityRows.length > 0) {
        citySheet.getRange(2, 1, cityRows.length, cityHeaders.length).setValues(cityRows);
        
        // 숫자 형식 적용
        const cityNumberCols = [];
        for (let i = 3; i <= cityHeaders.length; i++) {
          cityNumberCols.push(i);
        }
        cityNumberCols.forEach(col => {
          const range = citySheet.getRange(2, col, cityRows.length, 1);
          range.setNumberFormat('#,##0');
        });
        
        // 시군비 상세 시트 합계 행 추가 (2행)
        const totalRow = ['합계', ''];
        // 15개 시군 출연금 합계
        for (let i = 0; i < CHUNGNAM_CITIES.length; i++) {
          const col = 3 + i; // C열부터 시작
          const sumFormula = `=SUM(C3:C${cityRows.length + 1})`; // 3행부터 마지막 행까지 합계
          totalRow.push('');
          // 합계 수식은 나중에 적용
        }
        // 15개 시군 보조금 합계
        for (let i = 0; i < CHUNGNAM_CITIES.length; i++) {
          const col = 3 + CHUNGNAM_CITIES.length + i; // 출연금 다음부터 시작
          totalRow.push('');
        }
        // 합계 행 삽입 (2행에)
        citySheet.insertRowBefore(2);
        citySheet.getRange(2, 1, 1, cityHeaders.length).setValues([totalRow]);
        // 합계 수식 적용
        for (let i = 0; i < CHUNGNAM_CITIES.length; i++) {
          const col = 3 + i; // 출연금 컬럼
          const startRow = 3; // 데이터 시작 행
          const endRow = cityRows.length + 2; // 데이터 끝 행 (합계 행 추가로 +1)
          const formula = `=SUM(${String.fromCharCode(64 + col)}${startRow}:${String.fromCharCode(64 + col)}${endRow})`;
          citySheet.getRange(2, col).setFormula(formula);
          citySheet.getRange(2, col).setNumberFormat('#,##0');
        }
        for (let i = 0; i < CHUNGNAM_CITIES.length; i++) {
          const col = 3 + CHUNGNAM_CITIES.length + i; // 보조금 컬럼
          const startRow = 3; // 데이터 시작 행
          const endRow = cityRows.length + 2; // 데이터 끝 행
          const formula = `=SUM(${String.fromCharCode(64 + col)}${startRow}:${String.fromCharCode(64 + col)}${endRow})`;
          citySheet.getRange(2, col).setFormula(formula);
          citySheet.getRange(2, col).setNumberFormat('#,##0');
        }
        // 합계 행 스타일 적용
        const totalRange = citySheet.getRange(2, 1, 1, cityHeaders.length);
        totalRange.setFontWeight('bold');
        totalRange.setBackground('#e0e0e0');
      }
    }

    // ------------------------------
    // 시트 탭 순서 및 기본 시트 정리
    // ------------------------------
    try {
      // 1) 기본으로 생성되는 '시트1'은 제거 (다른 시트가 이미 존재할 때만)
      const defaultSheet = spreadsheet.getSheetByName('시트1');
      if (defaultSheet && spreadsheet.getSheets().length > 1) {
        spreadsheet.deleteSheet(defaultSheet);
      }

      // 2) 회차 시트(현재 sheet)를 가장 왼쪽으로 이동
      spreadsheet.setActiveSheet(sheet);
      spreadsheet.moveActiveSheet(1);

      // 3) '시군비 상세' 시트를 두 번째 탭으로 이동
      const mainSheetIndex = sheet.getIndex(); // 보통 1
      const citySheetIndex = citySheet.getIndex();
      if (citySheetIndex !== mainSheetIndex + 1) {
        spreadsheet.setActiveSheet(citySheet);
        spreadsheet.moveActiveSheet(mainSheetIndex + 1);
      }
    } catch (e) {
      console.log('시트 탭 정리 중 오류:', e);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true, 
        spreadsheetId: spreadsheet.getId(),
        spreadsheetUrl: spreadsheet.getUrl()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Google Drive 업로드
function uploadToDrive(data) {
  try {
    const fileName = data.fileName;
    const fileContent = data.fileContent;
    const mimeType = data.mimeType || 'application/json';

    const folder = DriveApp.getRootFolder(); // 또는 특정 폴더 지정
    const file = folder.createFile(fileName, fileContent, mimeType);

    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true, 
        fileId: file.getId(),
        fileUrl: file.getUrl()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Gmail 전송
function sendEmail(data) {
  try {
    const to = data.to;
    const subject = data.subject;
    const body = data.body;
    const attachments = data.attachments || [];

    let options = {
      htmlBody: body.replace(/\n/g, '<br>'),
    };

    if (attachments.length > 0) {
      options.attachments = attachments.map(att => {
        return {
          fileName: att.name,
          content: Utilities.base64Decode(att.content),
          mimeType: att.mimeType,
        };
      });
    }

    MailApp.sendEmail(to, subject, body, options);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Google Calendar 일정 추가
function addCalendarEvent(data) {
  try {
    const calendar = CalendarApp.getDefaultCalendar();
    const event = calendar.createEvent(
      data.title,
      new Date(data.startTime),
      new Date(data.endTime),
      { description: data.description }
    );

    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true, 
        eventId: event.getId()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// A, B열 변경 감지 및 다른 시트에 동기화
function onEdit(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const range = e.range;
    const row = range.getRow();
    const col = range.getColumn();
    
    // A열(사업명) 또는 B열(소관부서)이 변경된 경우만 처리
    if (row <= 1 || (col !== 1 && col !== 2)) {
      return;
    }
    
    // 메인 시트(회차시트)에서만 동기화 수행
    const sheetName = sheet.getName();
    if (sheetName === '시군비 상세' || sheetName === '시트1') {
      return; // 시군비 상세 시트나 기본 시트에서는 동기화하지 않음
    }
    
    // 회차시트인지 확인 (예: "2024년_본예산", "2024년_1차 추경" 등)
    if (!sheetName.includes('년_')) {
      return;
    }
    
    // 변경된 값 가져오기
    const projectName = sheet.getRange(row, 1).getValue();
    const department = sheet.getRange(row, 2).getValue();
    
    // 시군비 상세 시트 찾기
    const spreadsheet = e.source;
    const citySheet = spreadsheet.getSheetByName('시군비 상세');
    
    if (citySheet) {
      // 시군비 상세 시트에서 해당 행 찾기
      const lastRow = citySheet.getLastRow();
      if (lastRow >= row) {
        // A열(사업명) 업데이트
        if (col === 1) {
          citySheet.getRange(row, 1).setValue(projectName);
        }
        // B열(소관부서) 업데이트
        if (col === 2) {
          citySheet.getRange(row, 2).setValue(department);
        }
      }
    }
    
    // 다른 회차시트들도 동기화 (같은 스프레드시트 내의 다른 회차시트)
    const allSheets = spreadsheet.getSheets();
    allSheets.forEach(s => {
      const sName = s.getName();
      // 회차시트이고 현재 시트가 아닌 경우
      if (sName.includes('년_') && sName !== sheetName && s.getLastRow() >= row) {
        if (col === 1) {
          s.getRange(row, 1).setValue(projectName);
        }
        if (col === 2) {
          s.getRange(row, 2).setValue(department);
        }
      }
    });
  } catch (error) {
    console.error('onEdit error:', error);
    // 오류가 발생해도 계속 진행
  }
}

// Google Sheets에서 데이터 가져오기
function importFromSheets(data) {
  try {
    const spreadsheetId = data.spreadsheetId;
    const sheetName = data.sheetName || '예산데이터';

    if (!spreadsheetId || spreadsheetId.trim() === '') {
      throw new Error('스프레드시트 ID가 필요합니다.');
    }

    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    } catch (error) {
      throw new Error('스프레드시트를 열 수 없습니다. ID가 유효한지 확인하거나 접근 권한이 있는지 확인하세요. 오류: ' + error.toString());
    }
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error('시트를 찾을 수 없습니다: ' + sheetName);
    }

    // 데이터 읽기 (헤더 1행, 합계 2행 제외하고 3행부터)
    const lastRow = sheet.getLastRow();
    if (lastRow <= 2) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, data: [] })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // 헤더 행 읽기 (첫 번째 행)
    const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // 데이터는 3행부터 읽기 (1행: 헤더, 2행: 합계)
    // 각 행의 실제 행 번호를 추적하기 위해 행별로 읽기
    const dataRows = [];
    for (let rowNum = 3; rowNum <= lastRow; rowNum++) {
      const rowRange = sheet.getRange(rowNum, 1, 1, sheet.getLastColumn());
      const rowValues = rowRange.getValues()[0];
      dataRows.push({ rowNumber: rowNum, values: rowValues });
    }
    
    // 컬럼 인덱스 찾기 함수 (정확한 매칭 우선, 부분 매칭은 후순위)
    const findColumnIndex = (searchText, exactMatch = false) => {
      // 먼저 정확한 매칭 시도
      for (let i = 0; i < headerRow.length; i++) {
        const header = String(headerRow[i] || '').trim();
        // 줄바꿈 제거하고 비교
        const headerNormalized = header.replace(/\n/g, '').replace(/\s+/g, '');
        const searchNormalized = searchText.replace(/\n/g, '').replace(/\s+/g, '');
        
        if (exactMatch) {
          if (headerNormalized === searchNormalized || header === searchText) {
            return i;
          }
        } else {
          // 정확한 매칭 우선
          if (headerNormalized === searchNormalized || header === searchText) {
            return i;
          }
        }
      }
      
      // 정확한 매칭 실패 시 부분 매칭 시도 (exactMatch가 false인 경우만)
      if (!exactMatch) {
        for (let i = 0; i < headerRow.length; i++) {
          const header = String(headerRow[i] || '').trim();
          if (header.includes(searchText)) {
            return i;
          }
        }
      }
      
      return -1;
    };
    
    // 컬럼 인덱스 찾기 (정확한 매칭 우선)
    const colProjectName = findColumnIndex('사업명') !== -1 ? findColumnIndex('사업명') : 0;
    const colDepartment = findColumnIndex('소관부서') !== -1 ? findColumnIndex('소관부서') : 1;
    const colChangeType = findColumnIndex('구분') !== -1 ? findColumnIndex('구분') : -1;
    
    // 합계 컬럼 찾기 (정확한 매칭 우선)
    let colTotal = findColumnIndex('합계총합계');
    if (colTotal === -1) {
      colTotal = findColumnIndex('합계');
      // 합계가 여러 개 있을 수 있으므로, 출연금-합계나 보조금-합계가 아닌 것을 찾기
      if (colTotal !== -1) {
        const header = String(headerRow[colTotal] || '').trim();
        if (header.includes('출연금') || header.includes('보조금')) {
          colTotal = 2; // 기본값 사용
        }
      }
    }
    if (colTotal === -1) colTotal = 2;
    
    // 출연금-도비 찾기 (정확한 매칭 우선, 출연금으로 시작하고 도비로 끝나는 것)
    // 정확한 패턴: "출연금\n도비" 또는 "출연금도비" 또는 "출연금-도비"
    let colContribDo = -1;
    for (let i = 0; i < headerRow.length; i++) {
      const header = String(headerRow[i] || '').trim();
      const headerNormalized = header.replace(/\n/g, '').replace(/\s+/g, '').replace(/-/g, '');
      // 출연금과 도비가 모두 포함되고, 보조금이 포함되지 않아야 함
      // 합계, 소계, 시군비, 국비가 포함되지 않아야 함 (도비만)
      if (headerNormalized.includes('출연금') && headerNormalized.includes('도비') && 
          !headerNormalized.includes('보조금') && 
          !headerNormalized.includes('합계') && 
          !headerNormalized.includes('소계') &&
          !headerNormalized.includes('시군비') &&
          !headerNormalized.includes('국비') &&
          !headerNormalized.includes('국고')) {
        colContribDo = i;
        console.log(`출연금-도비 컬럼 찾음: 인덱스 ${i}, 헤더: "${headerRow[i]}"`);
        break;
      }
    }
    
    // 보조금-도비 찾기 (정확한 매칭 우선, 보조금으로 시작하고 도비로 끝나는 것)
    // 정확한 패턴: "보조금\n도비" 또는 "보조금도비" 또는 "보조금-도비"
    let colGrantDo = -1;
    for (let i = 0; i < headerRow.length; i++) {
      const header = String(headerRow[i] || '').trim();
      const headerNormalized = header.replace(/\n/g, '').replace(/\s+/g, '').replace(/-/g, '');
      // 보조금과 도비가 모두 포함되고, 출연금이 포함되지 않아야 함
      // 합계, 소계, 시군비, 국비가 포함되지 않아야 함 (도비만)
      if (headerNormalized.includes('보조금') && headerNormalized.includes('도비') && 
          !headerNormalized.includes('출연금') && 
          !headerNormalized.includes('합계') && 
          !headerNormalized.includes('소계') &&
          !headerNormalized.includes('시군비') &&
          !headerNormalized.includes('국비') &&
          !headerNormalized.includes('국고')) {
        colGrantDo = i;
        console.log(`보조금-도비 컬럼 찾음: 인덱스 ${i}, 헤더: "${headerRow[i]}"`);
        break;
      }
    }
    
    // 디버깅: 컬럼 인덱스 확인
    console.log(`컬럼 인덱스 확인 - 출연금-도비: ${colContribDo}, 보조금-도비: ${colGrantDo}`);
    
    // 보조금-국비 찾기 (보조금-도비보다 먼저 찾아야 함)
    let colGrantNational = -1;
    for (let i = 0; i < headerRow.length; i++) {
      const header = String(headerRow[i] || '').trim();
      const headerNormalized = header.replace(/\n/g, '').replace(/\s+/g, '').replace(/-/g, '');
      // 보조금과 국비(또는 국고)가 모두 포함되고, 출연금이 포함되지 않아야 함
      // 합계, 소계, 시군비, 도비가 포함되지 않아야 함 (국비만)
      if (headerNormalized.includes('보조금') && (headerNormalized.includes('국비') || headerNormalized.includes('국고')) && 
          !headerNormalized.includes('출연금') && 
          !headerNormalized.includes('합계') && 
          !headerNormalized.includes('소계') &&
          !headerNormalized.includes('시군비') &&
          !headerNormalized.includes('도비')) {
        colGrantNational = i;
        console.log(`보조금-국비 컬럼 찾음: 인덱스 ${i}, 헤더: "${headerRow[i]}"`);
        break;
      }
    }
    
    // 출연금-시군비 찾기
    let colContribCity = -1;
    for (let i = 0; i < headerRow.length; i++) {
      const header = String(headerRow[i] || '').trim();
      const headerNormalized = header.replace(/\n/g, '').replace(/\s+/g, '').replace(/-/g, '');
      // 출연금과 시군비가 모두 포함되고, 보조금이 포함되지 않아야 함
      // 합계가 포함되지 않고, 소계가 포함되어야 함
      if (headerNormalized.includes('출연금') && (headerNormalized.includes('시군비') || headerNormalized.includes('시군')) && 
          !headerNormalized.includes('보조금') && 
          !headerNormalized.includes('합계') && 
          headerNormalized.includes('소계') &&
          !headerNormalized.includes('도비') &&
          !headerNormalized.includes('국비')) {
        colContribCity = i;
        console.log(`출연금-시군비 소계 컬럼 찾음: 인덱스 ${i}, 헤더: "${headerRow[i]}"`);
        break;
      }
    }
    
    // 보조금-시군비 찾기
    let colGrantCity = -1;
    for (let i = 0; i < headerRow.length; i++) {
      const header = String(headerRow[i] || '').trim();
      const headerNormalized = header.replace(/\n/g, '').replace(/\s+/g, '').replace(/-/g, '');
      // 보조금과 시군비가 모두 포함되고, 출연금이 포함되지 않아야 함
      // 합계가 포함되지 않고, 소계가 포함되어야 함
      if (headerNormalized.includes('보조금') && (headerNormalized.includes('시군비') || headerNormalized.includes('시군')) && 
          !headerNormalized.includes('출연금') && 
          !headerNormalized.includes('합계') && 
          headerNormalized.includes('소계') &&
          !headerNormalized.includes('도비') &&
          !headerNormalized.includes('국비')) {
        colGrantCity = i;
        console.log(`보조금-시군비 소계 컬럼 찾음: 인덱스 ${i}, 헤더: "${headerRow[i]}"`);
        break;
      }
    }
    
    // 충청남도 15개 시군 목록
    const CHUNGNAM_CITIES = [
      '천안시', '공주시', '보령시', '아산시', '서산시',
      '논산시', '계룡시', '당진시', '금산군', '부여군',
      '서천군', '청양군', '홍성군', '예산군', '태안군'
    ];
    
    // 보조금 시군비 개별 시군 찾기 (보조금\n시군비\n천안시 형식)
    const colGrantCityByCity = {}; // {천안시: 인덱스, ...}
    for (let i = 0; i < headerRow.length; i++) {
      const header = String(headerRow[i] || '').trim().replace(/\n/g, '').replace(/\s+/g, '');
      if (header.includes('보조금') && header.includes('시군비') && 
          !header.includes('출연금') && !header.includes('소계') && !header.includes('합계')) {
        // 각 시군명 확인
        for (const city of CHUNGNAM_CITIES) {
          const cityName = city.replace('시', '').replace('군', '');
          if (header.includes(city) || header.includes(cityName)) {
            colGrantCityByCity[city] = i;
            console.log(`보조금-시군비-${city} 컬럼 찾음: 인덱스 ${i}, 헤더: "${headerRow[i]}"`);
            break;
          }
        }
      }
    }
    
    // 출연금 시군비 개별 시군 찾기 (출연금\n시군비\n천안시 형식)
    const colContribCityByCity = {}; // {천안시: 인덱스, ...}
    for (let i = 0; i < headerRow.length; i++) {
      const header = String(headerRow[i] || '').trim().replace(/\n/g, '').replace(/\s+/g, '');
      if (header.includes('출연금') && header.includes('시군비') && 
          !header.includes('보조금') && !header.includes('소계') && !header.includes('합계')) {
        // 각 시군명 확인
        for (const city of CHUNGNAM_CITIES) {
          const cityName = city.replace('시', '').replace('군', '');
          if (header.includes(city) || header.includes(cityName)) {
            colContribCityByCity[city] = i;
            console.log(`출연금-시군비-${city} 컬럼 찾음: 인덱스 ${i}, 헤더: "${headerRow[i]}"`);
            break;
          }
        }
      }
    }
    
    // 하위 호환성을 위해 기존 변수도 유지
    const colGrantCityCheonan = colGrantCityByCity['천안시'] !== undefined ? colGrantCityByCity['천안시'] : -1;
    const colGrantCityDangjin = colGrantCityByCity['당진시'] !== undefined ? colGrantCityByCity['당진시'] : -1;
    
    const colOwnFunds = findColumnIndex('자체재원') !== -1 ? findColumnIndex('자체재원') : findColumnIndex('자체') !== -1 ? findColumnIndex('자체') : -1;
    
    // 데이터 변환 (rowIndex 포함, 3행부터 시작)
    // 실제 엑셀 행 번호를 유지하기 위해 각 행의 실제 행 번호 사용
    const budgetData = dataRows.map((rowData) => {
      const row = rowData.values;
      const actualRowNumber = rowData.rowNumber; // 실제 엑셀 행 번호
      const projectName = row[colProjectName] || '';
      const department = row[colDepartment] || '';
      const changeType = colChangeType !== -1 ? String(row[colChangeType] || '').trim() : '';
      
      // 빈 행 제거 및 합계/소계 행 제거 (더 엄격한 필터링)
      const projectNameTrimmed = String(projectName).trim();
      if (!projectName || projectNameTrimmed === '' || 
          projectNameTrimmed === '합계' || 
          projectNameTrimmed === '소계' ||
          projectNameTrimmed === '총계' ||
          projectNameTrimmed.startsWith('합계') ||
          projectNameTrimmed.startsWith('소계') ||
          projectNameTrimmed.startsWith('총계')) {
        return null;
      }
      
      // 숫자 파싱 헬퍼 함수 (음수와 쉼표 처리)
      const parseNumber = (value) => {
        if (value === null || value === undefined || value === '') {
          return 0;
        }
        // 숫자 타입이면 그대로 반환 (음수 포함)
        if (typeof value === 'number') {
          return value;
        }
        // 문자열인 경우 파싱
        const strValue = String(value).trim();
        if (strValue === '' || strValue === '-') {
          return 0;
        }
        // 쉼표 제거 후 파싱 (음수 기호 보존)
        const cleanedValue = strValue.replace(/,/g, '').trim();
        const parsed = parseFloat(cleanedValue);
        // NaN이 아니면 반환 (음수도 포함)
        return isNaN(parsed) ? 0 : parsed;
      };
      
      // 합계 컬럼 찾기
      const totalAmount = parseNumber(row[colTotal]);
      
      // 출연금 (정확한 컬럼에서 읽기)
      let contribDo = 0;
      if (colContribDo !== -1) {
        contribDo = parseNumber(row[colContribDo]);
        // 디버깅: 첫 번째 행만 로그 출력
        if (actualRowNumber === 3 && contribDo !== 0) {
          console.log(`출연금-도비 컬럼 인덱스: ${colContribDo}, 헤더: "${headerRow[colContribDo]}", 값: ${contribDo}`);
        }
      }
      
      let contribCityTotal = 0;
      if (colContribCity !== -1) {
        contribCityTotal = parseNumber(row[colContribCity]);
      }
      
      // 보조금 (정확한 컬럼에서 읽기)
      let grantNational = 0;
      if (colGrantNational !== -1) {
        const rawValue = row[colGrantNational];
        grantNational = parseNumber(rawValue);
        // 디버깅: 음수 값이나 특정 사업명에 대해 로그 출력
        const projectNameStr = String(projectName || '').trim();
        if (grantNational < 0 || projectNameStr.includes('VR·AR') || projectNameStr.includes('VRAR')) {
          console.log(`[보조금-국비] ${projectNameStr}: 원본값="${rawValue}", 파싱값=${grantNational}, 컬럼인덱스=${colGrantNational}`);
        }
      }
      
      let grantDo = 0;
      if (colGrantDo !== -1) {
        grantDo = parseNumber(row[colGrantDo]);
        // 디버깅: 첫 번째 행만 로그 출력
        if (actualRowNumber === 3 && grantDo !== 0) {
          console.log(`보조금-도비 컬럼 인덱스: ${colGrantDo}, 헤더: "${headerRow[colGrantDo]}", 값: ${grantDo}`);
        }
      }
      
      let grantCityTotal = 0;
      if (colGrantCity !== -1) {
        grantCityTotal = parseNumber(row[colGrantCity]);
      }
      
      // 보조금 시군비 개별 시군 파싱 (모든 시군)
      const grantCityDetails = {};
      for (const city of CHUNGNAM_CITIES) {
        const colIndex = colGrantCityByCity[city];
        if (colIndex !== undefined && colIndex !== -1) {
          const amount = parseNumber(row[colIndex]);
          // 0이 아닌 값만 저장 (음수 포함)
          if (amount !== 0) {
            grantCityDetails[city] = amount;
          }
        }
      }
      
      // 출연금 시군비 개별 시군 파싱 (모든 시군)
      const contribCityDetails = {};
      for (const city of CHUNGNAM_CITIES) {
        const colIndex = colContribCityByCity[city];
        if (colIndex !== undefined && colIndex !== -1) {
          const amount = parseNumber(row[colIndex]);
          // 0이 아닌 값만 저장 (음수 포함)
          if (amount !== 0) {
            contribCityDetails[city] = amount;
          }
        }
      }
      
      // 하위 호환성 (개별 시군 값은 그대로 사용)
      const grantCityCheonan = grantCityDetails['천안시'] || 0;
      const grantCityDangjin = grantCityDetails['당진시'] || 0;
      
      // 자체재원
      const ownFunds = colOwnFunds !== -1 ? parseNumber(row[colOwnFunds]) : 0;
      
      // 예비비, 반환금은 자체 사업비로 처리
      const isReserveOrRefund = projectName === '예비비' || projectName === '반환금';
      
      // 재원 구분: 출연금과 보조금이 모두 있으면 보조금 우선, 예비비/반환금은 자체재원
      // 출연금이 0이면 보조금만 사용
      let finalContribDo = 0;
      let finalContribCity = {};
      let finalGrantNational = 0;
      let finalGrantDo = 0;
      let finalGrantCity = {};
      let finalOwnFunds = ownFunds;
      
      if (isReserveOrRefund) {
        // 예비비, 반환금은 자체재원으로 처리 (totalAmount를 grant.자체에 설정)
        finalOwnFunds = totalAmount;
      } else {
        // 출연금/보조금 시군비 소계 계산
        // - 시군별 값이 하나라도 있으면 "시군별 합계"를 신뢰 (시트상 소계가 잘못되어 있어도 도시별 합을 사용)
        // - 시군별 값이 전혀 없을 때만 소계 컬럼 값을 사용
        const contribCitySum = Object.values(contribCityDetails).reduce((sum, val) => sum + val, 0);
        const hasContribCityDetails = Object.keys(contribCityDetails).length > 0;
        const effectiveContribCity = hasContribCityDetails ? contribCitySum : contribCityTotal;
        
        const grantCitySum = Object.values(grantCityDetails).reduce((sum, val) => sum + val, 0);
        const hasGrantCityDetails = Object.keys(grantCityDetails).length > 0;
        const effectiveGrantCity = hasGrantCityDetails ? grantCitySum : grantCityTotal;
        
        // 이전 로직에서는 grantTotal > 0 일 때만 보조금을 살리고,
        // 그렇지 않으면 출연금으로만 처리해서 음수 보조금(-20,000,000)이 사라졌음.
        // 이제는 "있는 그대로" 저장하도록 변경:
        // - 출연금 컬럼은 항상 contribution.* 로,
        // - 보조금 컬럼은 항상 grant.* 로 보존 (음수 포함).
        
        // 출연금: 도비 + 시군비 합계
        finalContribDo = contribDo;
        if (effectiveContribCity !== 0) {
          finalContribCity['합계'] = effectiveContribCity;
        }
        Object.keys(contribCityDetails).forEach(city => {
          finalContribCity[city] = contribCityDetails[city];
        });
        
        // 보조금: 국비/도비 + 시군비 합계 (음수도 그대로 반영)
        finalGrantNational = grantNational;
        finalGrantDo = grantDo;
        if (effectiveGrantCity !== 0) {
          finalGrantCity['합계'] = effectiveGrantCity;
        }
        Object.keys(grantCityDetails).forEach(city => {
          finalGrantCity[city] = grantCityDetails[city];
        });
        
        // 자체재원은 그대로
        finalOwnFunds = ownFunds;
      }
      
      return {
        projectName: String(projectName).trim(),
        department: String(department).trim(),
        totalAmount: totalAmount,
        contribution: {
          도비: finalContribDo,
          시군비: finalContribCity,
        },
        grant: {
          국비: finalGrantNational,
          도비: finalGrantDo,
          시군비: finalGrantCity,
          자체: finalOwnFunds,
        },
        ownFunds: finalOwnFunds,
        rowIndex: actualRowNumber, // 실제 엑셀 행 번호 (헤더 1행 + 합계 2행 제외하고 3부터 시작)
      };
    }).filter(item => item !== null); // null 제거

    // 디버깅: rowIndex 확인 (처음 5개 항목)
    if (budgetData.length > 0) {
      console.log('=== rowIndex 디버깅 (처음 5개) ===');
      budgetData.slice(0, 5).forEach((item, idx) => {
        console.log(`${idx + 1}. ${item.projectName}: rowIndex=${item.rowIndex}`);
      });
    }

    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true, 
        data: budgetData,
        count: budgetData.length
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

