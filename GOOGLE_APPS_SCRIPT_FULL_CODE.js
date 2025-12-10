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
    
    // 헤더 작성 (산식 검증 컬럼 추가)
    // 출연금-시군비(E열) 오른쪽에 15개 시군 출연금 컬럼, 보조금-시군비(H열) 오른쪽에 15개 시군 보조금 컬럼 추가
    const headers = ['사업명', '소관부서', '총예산', '출연금-도비', '출연금-시군비'];
    // 15개 시군 출연금 컬럼 추가
    CHUNGNAM_CITIES.forEach(city => {
      headers.push(`출연금-${city}`);
    });
    // 보조금 컬럼 추가
    headers.push('보조금-국비', '보조금-도비', '보조금-시군비');
    // 15개 시군 보조금 컬럼 추가
    CHUNGNAM_CITIES.forEach(city => {
      headers.push(`보조금-${city}`);
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
      
      const rowNum = index + 2; // 헤더 다음 행부터
      
      // 행 데이터 구성: 사업명, 소관부서, 총예산, 출연금-도비, 출연금-시군비(합계), 15개 시군 출연금, 보조금-국비, 보조금-도비, 보조금-시군비(합계), 15개 시군 보조금, 자체재원, 산식검증, 산식오류
      const row = [
        item.projectName || '',
        item.department || '',
        totalAmount,
        contribDo,
        contribCity, // 출연금-시군비 합계
      ];
      
      // 15개 시군 출연금 데이터 추가
      CHUNGNAM_CITIES.forEach(city => {
        row.push(contribCityDetails[city] || 0);
      });
      
      // 보조금 데이터 추가
      row.push(grantNational, grantDo, grantCity); // 보조금-시군비 합계
      
      // 15개 시군 보조금 데이터 추가
      CHUNGNAM_CITIES.forEach(city => {
        row.push(grantCityDetails[city] || 0);
      });
      
      // 나머지 컬럼 추가
      row.push(ownFunds, '', ''); // 자체재원, 산식검증(수식), 산식오류(수식)
      
      rows.push(row);
      
      // 산식 검증 컬럼 위치 계산
      // 컬럼 순서: A(1)=사업명, B(2)=소관부서, C(3)=총예산, D(4)=출연금-도비, E(5)=출연금-시군비(합계)
      // F(6)~T(20)=15개 시군 출연금, U(21)=보조금-국비, V(22)=보조금-도비, W(23)=보조금-시군비(합계)
      // X(24)~AL(38)=15개 시군 보조금, AM(39)=자체재원, AN(40)=산식검증, AO(41)=산식오류
      const formulaRow = rowNum;
      const contribCityStartCol = 6; // F열 (15개 시군 출연금 시작)
      const contribCityEndCol = 5 + CHUNGNAM_CITIES.length; // T열 (15개 시군 출연금 끝)
      const grantStartCol = 21; // U열 (보조금-국비)
      const grantCityStartCol = 24; // X열 (15개 시군 보조금 시작)
      const grantCityEndCol = 23 + CHUNGNAM_CITIES.length; // AL열 (15개 시군 보조금 끝)
      const ownFundsCol = 23 + CHUNGNAM_CITIES.length + 1; // AM열 (자체재원)
      const formulaCol = ownFundsCol + 1; // AN열 (산식검증)
      const errorCol = formulaCol + 1; // AO열 (산식오류)
      
      // 산식 검증 수식: 출연금-도비(D) + 출연금-시군비(E) + 보조금-국비(U) + 보조금-도비(V) + 보조금-시군비(W) + 자체재원(AM)
      const formula = `=SUM(D${formulaRow},E${formulaRow},U${formulaRow},V${formulaRow},W${formulaRow},AM${formulaRow})`;
      formulaRows.push({ row: formulaRow, col: formulaCol, formula: formula });
      
      // 산식 오류 수식: 총예산과 산식검증 비교
      const errorFormula = `=IF(ABS(C${formulaRow}-AN${formulaRow})>1000,"오류","정상")`;
      errorRows.push({ row: formulaRow, col: errorCol, formula: errorFormula });
    });

    // 숫자 형식 컬럼 정의 (블록 밖으로 이동)
    const numberColumns = [3]; // 총예산(C)
    numberColumns.push(4); // 출연금-도비(D)
    numberColumns.push(5); // 출연금-시군비(E)
    // 15개 시군 출연금 (F~T, 6~20)
    for (let i = 6; i <= 5 + CHUNGNAM_CITIES.length; i++) {
      numberColumns.push(i);
    }
    numberColumns.push(21); // 보조금-국비(U)
    numberColumns.push(22); // 보조금-도비(V)
    numberColumns.push(23); // 보조금-시군비(W)
    // 15개 시군 보조금 (X~AL, 24~38)
    for (let i = 24; i <= 23 + CHUNGNAM_CITIES.length; i++) {
      numberColumns.push(i);
    }
    numberColumns.push(23 + CHUNGNAM_CITIES.length + 1); // 자체재원(AM)
    numberColumns.push(23 + CHUNGNAM_CITIES.length + 2); // 산식검증(AN)

    if (rows.length > 0) {
      const dataRange = sheet.getRange(2, 1, rows.length, headers.length);
      dataRange.setValues(rows);
      
      // 숫자 형식 적용
      numberColumns.forEach(col => {
        const range = sheet.getRange(2, col, rows.length, 1);
        range.setNumberFormat('#,##0'); // 천 단위 구분 쉼표 형식
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
      
      // 산식 오류가 있는 행에 배경색 적용 (수식이 적용된 후)
      // 조건부 서식으로 처리하거나, 수식 결과를 기다린 후 적용
      // 수식이 계산되기 전이므로 조건부 서식 사용
      const errorCol = 23 + CHUNGNAM_CITIES.length + 3; // AO열 (산식오류)
      const errorRange = sheet.getRange(2, errorCol, rows.length, 1); // 산식오류 컬럼
      const errorCondition = SpreadsheetApp.newConditionalFormatRule()
        .setRanges([errorRange])
        .whenTextEqualTo('오류')
        .setBackground('#ffcccc')
        .build();
      sheet.setConditionalFormatRules([errorCondition]);
      
      // 총예산 컬럼에도 조건부 서식 적용 (산식오류가 "오류"인 경우)
      const totalAmountRange = sheet.getRange(2, 3, rows.length, 1); // 총예산 컬럼(C열)
      const errorColLetter = String.fromCharCode(64 + errorCol); // AO
      const totalAmountCondition = SpreadsheetApp.newConditionalFormatRule()
        .setRanges([totalAmountRange])
        .whenFormulaSatisfied(`=$${errorColLetter}2="오류"`) // 산식오류 컬럼이 "오류"인 경우
        .setBackground('#ffcccc')
        .build();
      
      // 산식검증 컬럼에도 조건부 서식 적용
      const formulaCol = 23 + CHUNGNAM_CITIES.length + 2; // AN열 (산식검증)
      const formulaRange = sheet.getRange(2, formulaCol, rows.length, 1); // 산식검증 컬럼
      const formulaCondition = SpreadsheetApp.newConditionalFormatRule()
        .setRanges([formulaRange])
        .whenFormulaSatisfied(`=$${errorColLetter}2="오류"`)
        .setBackground('#ffcccc')
        .build();
      
      sheet.setConditionalFormatRules([errorCondition, totalAmountCondition, formulaCondition]);
      
      // 0인 열 자동 숨기기 (출연금-시군비 합계, 보조금-시군비 합계는 제외)
      const columnsToCheck = [3]; // 총예산(C)
      columnsToCheck.push(4); // 출연금-도비(D)
      // 15개 시군 출연금 (F~T, 6~20)
      for (let i = 6; i <= 5 + CHUNGNAM_CITIES.length; i++) {
        columnsToCheck.push(i);
      }
      columnsToCheck.push(21); // 보조금-국비(U)
      columnsToCheck.push(22); // 보조금-도비(V)
      // 15개 시군 보조금 (X~AL, 24~38)
      for (let i = 24; i <= 23 + CHUNGNAM_CITIES.length; i++) {
        columnsToCheck.push(i);
      }
      columnsToCheck.push(23 + CHUNGNAM_CITIES.length + 1); // 자체재원(AM)
      
      columnsToCheck.forEach(col => {
        const colRange = sheet.getRange(2, col, rows.length, 1);
        const values = colRange.getValues();
        const allZero = values.every(row => {
          const val = row[0];
          return val === 0 || val === '' || val === null || (typeof val === 'string' && val.trim() === '');
        });
        if (allZero) {
          sheet.hideColumns(col);
        }
      });
      
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
    
    // 본예산 시트 합계 행 추가 (2행)
    if (rows.length > 0) {
      // 합계 행 데이터 생성
      const totalRow = ['합계', ''];
      // 총예산 합계
      totalRow.push('');
      // 출연금-도비 합계
      totalRow.push('');
      // 출연금-시군비 합계
      totalRow.push('');
      // 15개 시군 출연금 합계
      for (let i = 0; i < CHUNGNAM_CITIES.length; i++) {
        totalRow.push('');
      }
      // 보조금-국비 합계
      totalRow.push('');
      // 보조금-도비 합계
      totalRow.push('');
      // 보조금-시군비 합계
      totalRow.push('');
      // 15개 시군 보조금 합계
      for (let i = 0; i < CHUNGNAM_CITIES.length; i++) {
        totalRow.push('');
      }
      // 자체재원 합계
      totalRow.push('');
      // 산식검증 합계
      totalRow.push('');
      // 산식오류 (합계 없음)
      totalRow.push('');
      
      // 합계 행 삽입 (2행에)
      sheet.insertRowBefore(2);
      sheet.getRange(2, 1, 1, headers.length).setValues([totalRow]);
      
      // 합계 수식 적용
      const dataStartRow = 3; // 데이터 시작 행 (합계 행 추가로 +1)
      const dataEndRow = rows.length + 2; // 데이터 끝 행
      
      // 총예산 합계 (C열)
      sheet.getRange(2, 3).setFormula(`=SUM(C${dataStartRow}:C${dataEndRow})`);
      // 출연금-도비 합계 (D열)
      sheet.getRange(2, 4).setFormula(`=SUM(D${dataStartRow}:D${dataEndRow})`);
      // 출연금-시군비 합계 (E열)
      sheet.getRange(2, 5).setFormula(`=SUM(E${dataStartRow}:E${dataEndRow})`);
      // 15개 시군 출연금 합계 (F~T열)
      for (let i = 0; i < CHUNGNAM_CITIES.length; i++) {
        const col = 6 + i; // F열부터 시작
        const colLetter = String.fromCharCode(64 + col);
        sheet.getRange(2, col).setFormula(`=SUM(${colLetter}${dataStartRow}:${colLetter}${dataEndRow})`);
      }
      // 보조금-국비 합계 (U열)
      sheet.getRange(2, 21).setFormula(`=SUM(U${dataStartRow}:U${dataEndRow})`);
      // 보조금-도비 합계 (V열)
      sheet.getRange(2, 22).setFormula(`=SUM(V${dataStartRow}:V${dataEndRow})`);
      // 보조금-시군비 합계 (W열)
      sheet.getRange(2, 23).setFormula(`=SUM(W${dataStartRow}:W${dataEndRow})`);
      // 15개 시군 보조금 합계 (X~AL열)
      for (let i = 0; i < CHUNGNAM_CITIES.length; i++) {
        const col = 24 + i; // X열부터 시작
        const colLetter = String.fromCharCode(64 + col);
        sheet.getRange(2, col).setFormula(`=SUM(${colLetter}${dataStartRow}:${colLetter}${dataEndRow})`);
      }
      // 자체재원 합계 (AM열)
      const ownFundsCol = 23 + CHUNGNAM_CITIES.length + 1;
      const ownFundsColLetter = String.fromCharCode(64 + ownFundsCol);
      sheet.getRange(2, ownFundsCol).setFormula(`=SUM(${ownFundsColLetter}${dataStartRow}:${ownFundsColLetter}${dataEndRow})`);
      // 산식검증 합계 (AN열)
      const formulaCol = ownFundsCol + 1;
      const formulaColLetter = String.fromCharCode(64 + formulaCol);
      sheet.getRange(2, formulaCol).setFormula(`=SUM(${formulaColLetter}${dataStartRow}:${formulaColLetter}${dataEndRow})`);
      
      // 합계 행 스타일 적용
      const totalRange = sheet.getRange(2, 1, 1, headers.length);
      totalRange.setFontWeight('bold');
      totalRange.setBackground('#e0e0e0');
      
      // 합계 행 숫자 형식 적용
      numberColumns.forEach(col => {
        sheet.getRange(2, col).setNumberFormat('#,##0');
      });
      
      // 산식 검증 수식 위치 조정 (합계 행 추가로 행 번호 변경)
      formulaRows.forEach(({ row, col, formula }) => {
        // 행 번호를 +1 조정 (합계 행 추가로)
        const adjustedRow = row + 1;
        const adjustedFormula = formula.replace(/\d+/, (match) => {
          const num = parseInt(match);
          if (num >= 2 && num <= rows.length + 1) {
            return String(num + 1);
          }
          return match;
        });
        sheet.getRange(adjustedRow, col).setFormula(adjustedFormula);
        sheet.getRange(adjustedRow, col).setNumberFormat('#,##0');
      });
      
      // 산식 오류 수식 위치 조정
      errorRows.forEach(({ row, col, formula }) => {
        const adjustedRow = row + 1;
        const adjustedFormula = formula.replace(/\d+/, (match) => {
          const num = parseInt(match);
          if (num >= 2 && num <= rows.length + 1) {
            return String(num + 1);
          }
          return match;
        });
        sheet.getRange(adjustedRow, col).setFormula(adjustedFormula);
      });
      
      // 데이터 범위 재설정 (합계 행 제외)
      const adjustedDataRange = sheet.getRange(3, 1, rows.length, headers.length);
      adjustedDataRange.setValues(rows);
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

    // 데이터 읽기 (헤더 제외)
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, data: [] })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const range = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
    const values = range.getValues();

    // 데이터 변환
    const budgetData = values.map(row => {
      // 헤더 순서: ['사업명', '소관부서', '총예산', '출연금-도비', '출연금-시군비', '보조금-국비', '보조금-도비', '보조금-시군비', '자체재원']
      return {
        projectName: row[0] || '',
        department: row[1] || '',
        totalAmount: parseFloat(row[2]) || 0,
        contribution: {
          도비: parseFloat(row[3]) || 0,
          시군비: parseFloat(row[4]) || 0, // 시군비는 합계로 저장 (세부 분리는 추후 개선)
        },
        grant: {
          국비: parseFloat(row[5]) || 0,
          도비: parseFloat(row[6]) || 0,
          시군비: parseFloat(row[7]) || 0, // 시군비는 합계로 저장
          자체: 0,
        },
        ownFunds: parseFloat(row[8]) || 0,
      };
    }).filter(item => item.projectName && item.projectName.trim() !== ''); // 빈 행 제거

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

