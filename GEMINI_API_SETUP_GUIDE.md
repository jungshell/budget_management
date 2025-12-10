# Gemini API 설정 완전 가이드

## ✅ 문제 해결

### 1. "Generative Language API"가 라이브러리에 없는 경우

**해결**: "Gemini API"를 활성화하세요. Google Cloud Console에서는 "Generative Language API" 대신 "Gemini API"로 표시됩니다.

### 2. API 키 활성화 확인 방법

Google AI Studio에서 확인하세요. Google Cloud Console의 "사용자 인증 정보" 페이지에는 Google AI Studio에서 발급받은 키가 표시되지 않을 수 있습니다.

---

## 📋 단계별 설정 가이드

### 1단계: Gemini API 활성화 (Google Cloud Console)

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/apis/library?project=budget-management-478706
   - 또는 현재 페이지에서 왼쪽 메뉴의 "라이브러리" 클릭

2. **"Gemini API" 검색**
   - 검색창에 "Gemini API" 입력
   - 또는 "Gemini" 검색

3. **Gemini API 활성화**
   - "Gemini API" 클릭
   - "사용 설정" 버튼 클릭
   - 활성화 완료까지 몇 초 대기
   - ✅ "사용 중지" 버튼이 보이면 활성화 완료

### 2단계: API 키 확인 (Google AI Studio)

Google AI Studio에서 발급받은 API 키를 사용합니다.

1. **Google AI Studio 접속**
   - https://aistudio.google.com/app/apikey
   - 또는 https://aistudio.google.com 접속 후 "API 키" 메뉴 클릭

2. **프로젝트 선택**
   - "프로젝트" 메뉴 클릭
   - "budget-management-system" 프로젝트 클릭
   - 또는 "API 키" 메뉴에서 직접 확인

3. **API 키 확인**
   - 프로젝트에 "키 2개"가 표시됨
   - 키를 클릭하여 상세 정보 확인
   - 키가 "활성" 상태인지 확인
   - 키 복사 (AIzaSy... 형식)

4. **API 키 활성화 확인**
   - 키 옆에 토글 스위치가 있으면 "켜기" 상태인지 확인
   - 비활성화되어 있다면 토글 스위치 켜기

### 3단계: 환경 변수 및 웹 설정 업데이트

1. **.env 파일 업데이트**
   ```env
   GEMINI_API_KEY=AIzaSy...여기에_복사한_키_붙여넣기
   ```
   - 따옴표 없이 입력
   - 공백 없이 입력

2. **웹 설정 업데이트**
   - 예산 관리 시스템 > 설정 페이지 접속
   - "AI 설정 (Gemini API)" 섹션 찾기
   - "Gemini API 키" 입력 필드에 키 입력
   - "저장" 버튼 클릭

3. **브라우저 localStorage 확인**
   - 브라우저 개발자 도구 (F12) 열기
   - Console 탭에서 다음 명령 실행:
   ```javascript
   localStorage.getItem('gemini_api_key')
   ```
   - API 키가 표시되면 정상

### 4단계: 테스트

1. **테스트 페이지 접속**
   - http://localhost:3000/test-integration.html
   - 또는 설정 페이지에서 "Gemini API 테스트" 버튼 클릭

2. **테스트 실행**
   - "Gemini API 테스트 실행" 버튼 클릭
   - 결과 확인

3. **성공 메시지 확인**
   - ✅ "테스트 성공!" 메시지가 보이면 완료
   - 사용된 모델 이름 확인

---

## 🔍 문제 해결

### 문제 1: "Generative Language API"를 찾을 수 없음

**원인**: Google Cloud Console에서는 "Gemini API"로 표시됩니다.

**해결**:
1. 검색창에 "Gemini API" 입력
2. "Gemini API" 클릭
3. "사용 설정" 버튼 클릭

### 문제 2: API 키 목록이 비어있음 (Google Cloud Console)

**원인**: Google AI Studio에서 발급받은 API 키는 Google Cloud Console의 "사용자 인증 정보" 페이지에 표시되지 않을 수 있습니다.

**해결**:
1. Google AI Studio에서 API 키 확인: https://aistudio.google.com/app/apikey
2. Google AI Studio에서 키가 "활성" 상태인지 확인
3. Google Cloud Console에서 "Gemini API" 활성화 확인

### 문제 3: API 키가 작동하지 않음

**확인 사항**:

1. **Gemini API 활성화 확인** (가장 중요!)
   - Google Cloud Console > API 및 서비스 > 라이브러리
   - "Gemini API" 검색
   - "사용 중지" 버튼이 보이면 활성화됨

2. **API 키 형식 확인**
   - API 키는 `AIzaSy...` 형식이어야 함
   - 공백이나 특수문자 없이 정확히 복사되었는지 확인

3. **할당량 확인**
   - Google AI Studio > Usage and Billing
   - 일일/분당 할당량 초과 여부 확인
   - 무료 티어: 분당 15회, 일일 1,500회

4. **브라우저 콘솔에서 직접 테스트**
   ```javascript
   const apiKey = localStorage.getItem('gemini_api_key');
   fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       contents: [{ parts: [{ text: '안녕하세요' }] }]
     })
   })
   .then(r => r.json())
   .then(data => {
     if (data.candidates) {
       console.log('✅ 성공:', data.candidates[0].content.parts[0].text);
     } else {
       console.error('❌ 오류:', data.error);
     }
   });
   ```

### 문제 4: JavaScript Chunk 로딩 오류

**오류 메시지**:
```
Loading chunk vendors-node_modules_firebase_firestore_dist_index_cjs_js-node_modules_mui_icons-material_esm-0db6f4 failed.
```

**해결 방법**:

1. **개발 서버 재시작**
   ```bash
   # 터미널에서 Ctrl+C로 서버 중지
   # 그 다음 다시 시작
   cd "/Volumes/Samsung USB/budget_management_anti/frontend"
   npm start
   ```

2. **브라우저 캐시 클리어**
   - Chrome: 개발자 도구 (F12) > Network 탭 > "Disable cache" 체크
   - 또는: Ctrl+Shift+Delete > 캐시된 이미지 및 파일 삭제

3. **빌드 캐시 삭제 후 재시작**
   ```bash
   cd "/Volumes/Samsung USB/budget_management_anti/frontend"
   rm -rf node_modules/.cache
   npm start
   ```

4. **완전 재설치 (필요시)**
   ```bash
   cd "/Volumes/Samsung USB/budget_management_anti/frontend"
   rm -rf node_modules
   npm install
   npm start
   ```

---

## ✅ 체크리스트

설정이 완료되었는지 확인하세요:

- [ ] Google Cloud Console에서 "Gemini API" 활성화됨
- [ ] Google AI Studio에서 API 키 확인됨
- [ ] API 키가 "활성" 상태임
- [ ] .env 파일에 API 키 입력됨
- [ ] 웹 설정에서 API 키 입력됨
- [ ] 브라우저 localStorage에 API 키 저장됨
- [ ] 테스트 페이지에서 테스트 성공
- [ ] JavaScript chunk 오류 해결됨

---

## 📞 추가 도움

문제가 계속되면:

1. **브라우저 콘솔 확인**
   - F12 > Console 탭
   - 오류 메시지 확인

2. **네트워크 탭 확인**
   - F12 > Network 탭
   - API 요청이 실패하는지 확인
   - 응답 코드 확인 (200, 401, 403, 429 등)

3. **테스트 페이지에서 상세 오류 확인**
   - http://localhost:3000/test-integration.html
   - "Gemini API 테스트 실행" 클릭
   - 상세 오류 메시지 확인
