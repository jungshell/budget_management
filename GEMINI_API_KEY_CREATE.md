# Google Cloud Console에서 API 키 생성하기

Google Cloud Console에 API 키가 표시되지 않는 경우, 다음 방법으로 생성할 수 있습니다.

## 방법 1: Google Cloud Console에서 직접 생성 (권장)

### 1단계: API 키 생성

1. **현재 페이지에서**
   - "+ 사용자 인증 정보 만들기" 버튼 클릭
   - 드롭다운에서 "API 키" 선택

2. **API 키 생성 완료**
   - API 키가 생성되면 팝업에 표시됨
   - **중요**: 이 키는 한 번만 표시되므로 복사해서 안전하게 보관
   - "닫기" 클릭

3. **API 키 제한 설정 (선택사항)**
   - 생성된 API 키를 클릭하여 상세 정보 열기
   - "API 키 제한사항" 섹션에서:
     - **애플리케이션 제한사항**: "없음" 또는 "HTTP 리퍼러" 선택
     - **API 제한사항**: "API 제한" 선택
     - "Generative Language API" 검색 후 추가
   - "저장" 클릭

### 2단계: Generative Language API 활성화

1. **왼쪽 메뉴에서 "라이브러리" 클릭**
   - 또는 직접: https://console.cloud.google.com/apis/library?project=budget-management-478706

2. **"Generative Language API" 검색**
   - 검색창에 "Generative Language API" 입력
   - 또는 "Generative AI" 검색

3. **API 활성화**
   - "Generative Language API" 클릭
   - "사용 설정" 버튼 클릭
   - 활성화 완료까지 몇 초 대기

### 3단계: 환경 변수 및 웹 설정 업데이트

1. **.env 파일 업데이트**
   ```env
   GEMINI_API_KEY=생성한_API_키_여기에_붙여넣기
   ```

2. **웹 설정 업데이트**
   - 예산 관리 시스템 > 설정 페이지
   - "AI 설정 (Gemini API)" 섹션
   - 새 API 키 입력
   - 저장

3. **서버 재시작**
   - 개발 서버 중지 (Ctrl+C)
   - 다시 시작: `npm start`

## 방법 2: Google AI Studio에서 확인 (이미 발급받은 경우)

Google AI Studio에서 발급받은 API 키는 Google Cloud Console에 표시되지 않을 수 있습니다.

### 확인 방법

1. **Google AI Studio 접속**
   - https://aistudio.google.com 접속
   - 또는 https://aistudio.google.com/app/apikey 직접 접속

2. **API 키 확인**
   - 발급받은 API 키 목록 확인
   - 키 복사

3. **API 키 활성화 확인**
   - 키 옆에 "활성" 또는 "Active" 표시 확인
   - 비활성화되어 있다면 토글 스위치 켜기

4. **Generative Language API 활성화**
   - Google Cloud Console에서 "Generative Language API" 활성화 확인
   - 활성화되지 않았다면 위의 "방법 1" 참고

## 방법 3: 기존 API 키 사용 (Google AI Studio에서 발급받은 경우)

이미 Google AI Studio에서 API 키를 발급받았고 .env에 입력했다면:

### 확인 사항

1. **Generative Language API 활성화 확인**
   - Google Cloud Console > API 및 서비스 > 라이브러리
   - "Generative Language API" 검색
   - "사용 설정" 되어 있는지 확인
   - **이것이 가장 중요합니다!**

2. **API 키 형식 확인**
   - API 키는 `AIzaSy...` 형식이어야 함
   - 공백이나 특수문자 없이 정확히 복사되었는지 확인

3. **할당량 확인**
   - Google Cloud Console > API 및 서비스 > 할당량
   - "Generative Language API" 필터링
   - 할당량이 0이 아닌지 확인

## 문제 해결

### "표시할 API 키가 없습니다" 메시지가 나오는 경우

**원인**: Google AI Studio에서 발급받은 API 키는 Google Cloud Console의 "사용자 인증 정보" 페이지에 표시되지 않을 수 있습니다.

**해결 방법**:
1. Google AI Studio에서 API 키 확인: https://aistudio.google.com/app/apikey
2. Google Cloud Console에서 새 API 키 생성 (위의 "방법 1" 참고)
3. 또는 기존 API 키 사용 (Generative Language API만 활성화 확인)

### API 키가 작동하지 않는 경우

1. **Generative Language API 활성화 확인** (가장 중요!)
   - Google Cloud Console > API 및 서비스 > 라이브러리
   - "Generative Language API" 검색 후 "사용 설정"

2. **API 키 제한사항 확인**
   - Google Cloud Console > 사용자 인증 정보 > API 키
   - 키 클릭 > "API 키 제한사항"
   - "Generative Language API"가 허용 목록에 있는지 확인

3. **할당량 확인**
   - 일일/분당 할당량 초과 여부 확인
   - 무료 티어: 분당 15회, 일일 1,500회

## 빠른 체크리스트

- [ ] Google Cloud Console에서 "Generative Language API" 활성화됨
- [ ] API 키가 올바른 형식 (`AIzaSy...`)
- [ ] .env 파일에 API 키 입력됨
- [ ] 웹 설정에서 API 키 입력됨
- [ ] 서버 재시작함
- [ ] 브라우저 캐시 클리어함

## 다음 단계

1. **Generative Language API 활성화** (가장 중요!)
   - Google Cloud Console > API 및 서비스 > 라이브러리
   - "Generative Language API" 검색 후 "사용 설정"

2. **테스트**
   - 브라우저 콘솔에서 테스트 코드 실행
   - 또는 테스트 페이지에서 테스트

3. **문제가 계속되면**
   - Google AI Studio에서 새 API 키 발급
   - 또는 Google Cloud Console에서 새 API 키 생성


