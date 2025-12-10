# Google Apps Script 최종 배포 가이드

## 🔴 현재 문제
코드를 수정하고 배포했는데도 여전히 이전 형식으로 나옵니다.

## ✅ 완전히 새로 시작하는 방법

### 1단계: Google Apps Script 프로젝트 완전 삭제 및 재생성

#### A. 기존 프로젝트 삭제

1. **Google Apps Script 편집기 열기**
   - https://script.google.com 접속
   - 프로젝트 목록에서 "budget management" 또는 관련 프로젝트 찾기

2. **프로젝트 삭제**
   - 프로젝트 선택
   - 좌측 상단의 **"프로젝트 설정"** (톱니바퀴 아이콘) 클릭
   - 하단의 **"프로젝트 삭제"** 클릭
   - 확인

#### B. 새 프로젝트 생성

1. **"새 프로젝트"** 클릭
2. 프로젝트 이름: **"예산관리시스템 연동"**
3. **전체 코드 복사**
   - `GOOGLE_APPS_SCRIPT_COMPLETE_CODE.txt` 파일 열기
   - **전체 내용 복사** (Ctrl+A, Ctrl+C)
4. **Google Apps Script 편집기에 붙여넣기**
   - 편집기에서 기존 코드 모두 삭제
   - 붙여넣기 (Ctrl+V)
5. **저장** (Ctrl+S 또는 저장 버튼)

### 2단계: 새로 배포

1. **"배포"** > **"새 배포"** 클릭
2. **"유형 선택"** 클릭 > **"웹 앱"** 선택
3. **설정 입력**:
   ```
   설명: 예산 관리 시스템 연동 v2
   다음 사용자로 실행: 나 (Me)
   액세스 권한: 모든 사용자 (Anyone) ⭐⭐⭐ 가장 중요!
   ```
4. **"배포"** 버튼 클릭
5. **권한 승인**:
   - "권한 검토" 클릭
   - Google 계정 선택
   - "고급" > "안전하지 않은 페이지로 이동" (필요시)
   - "허용" 클릭
6. **Web App URL 복사**
   - URL이 `/exec`로 끝나는지 확인
   - 전체 URL 복사

### 3단계: 설정 업데이트

1. **예산 관리 시스템 설정 페이지**로 이동
2. **Google Apps Script Web App URL** 입력
   - 새로 복사한 URL 붙여넣기
   - 저장
3. **Google Sheets ID 삭제**
   - "Google Sheets ID" 필드를 **완전히 비우기**
   - 저장

### 4단계: Google Drive 정리

1. **Google Drive 열기**
2. **"예산 데이터"**로 검색
3. **모든 관련 스프레드시트 찾기**
4. **모두 삭제**
   - 선택 > 우클릭 > 삭제
   - 휴지통에서도 완전 삭제

### 5단계: 테스트

1. **브라우저 캐시 클리어**
   - Ctrl+Shift+Delete (Windows) 또는 Cmd+Shift+Delete (Mac)
   - 캐시된 이미지 및 파일 삭제

2. **예산 관리 페이지 새로고침**
   - Ctrl+Shift+R (강력 새로고침)

3. **"Google Sheets로 내보내기"** 클릭

4. **결과 확인**:
   - ✅ 제목: `2024_본예산_241208` 형식
   - ✅ 컬럼: 산식검증, 산식오류 컬럼 있음
   - ✅ 숫자: 천 단위 구분 쉼표 있음 (예: 1,000,000)
   - ✅ 산식 오류: 빨간 배경색으로 표시됨

---

## 🔍 실행 로그 확인 방법

### Google Apps Script 실행 로그 확인

1. **Apps Script 편집기**에서 **"실행"** 탭 클릭
2. **"Google Sheets로 내보내기"** 실행
3. **실행 로그 확인**:
   - `doPost called with action: sync`
   - `syncToSheets called`
   - `year: 2024 version: 본예산`
   - `Spreadsheet title: 2024_본예산_241208`
   - `Headers written: 11 columns`
   - `Writing 23 rows of data`
   - `Number format applied to 8 columns`
   - `Formulas applied: 23`
   - `syncToSheets completed successfully`

4. **오류 확인**:
   - 빨간색 오류 메시지가 있으면 복사하여 알려주세요

---

## 💡 문제 해결 체크리스트

다음을 모두 확인했는지 체크:

- [ ] Google Apps Script 프로젝트를 완전히 삭제하고 새로 생성했음
- [ ] `GOOGLE_APPS_SCRIPT_COMPLETE_CODE.txt` 파일의 전체 코드를 복사했음
- [ ] 코드를 저장했음
- [ ] **"새 배포"**로 배포했음 (기존 배포 수정이 아님)
- [ ] "액세스 권한: 모든 사용자"로 설정했음
- [ ] 새 Web App URL을 설정 페이지에 입력했음
- [ ] Google Sheets ID를 삭제했음
- [ ] Google Drive에서 기존 스프레드시트를 모두 삭제했음
- [ ] 브라우저 캐시를 클리어했음
- [ ] 실행 로그를 확인했음

---

## 🚨 여전히 안 되면

다음 정보를 제공해주세요:

1. **Google Apps Script 실행 로그** (전체)
2. **브라우저 콘솔 오류 메시지** (F12 > Console)
3. **Network 탭의 요청 본문** (F12 > Network > 요청 클릭 > Payload)
4. **배포 관리 화면 스크린샷** (배포 날짜 확인)

---

## 📝 참고

- **중요**: "새 배포"를 해야 합니다. 기존 배포를 수정하면 변경사항이 반영되지 않을 수 있습니다.
- **중요**: "액세스 권한: 모든 사용자"로 설정하지 않으면 CORS 오류가 발생합니다.
- **중요**: 기존 스프레드시트를 사용하면 이전 형식이 유지됩니다. 반드시 삭제하고 새로 생성해야 합니다.

