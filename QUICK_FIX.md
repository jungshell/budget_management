# 빠른 해결 가이드

## 🚨 현재 문제 3가지 해결

### 1️⃣ Gemini API 활성화 (가장 중요!)

**현재 상황**: Google Cloud Console 라이브러리에서 "Generative Language API"를 찾을 수 없음

**해결 방법**:
1. Google Cloud Console 접속: https://console.cloud.google.com/apis/library?project=budget-management-478706
2. 검색창에 **"Gemini API"** 입력 (Generative Language API가 아님!)
3. "Gemini API" 클릭
4. **"사용 설정"** 버튼 클릭
5. 활성화 완료까지 몇 초 대기

✅ "사용 중지" 버튼이 보이면 활성화 완료!

---

### 2️⃣ API 키 활성화 확인

**현재 상황**: Google Cloud Console의 "사용자 인증 정보" 페이지에 API 키가 표시되지 않음

**해결 방법**:
1. **Google AI Studio 접속**: https://aistudio.google.com/app/apikey
2. **프로젝트 선택**: "프로젝트" 메뉴 클릭 → "budget-management-system" 클릭
3. **API 키 확인**: 
   - 프로젝트에 "키 2개" 표시됨
   - 키를 클릭하여 상세 정보 확인
   - 키가 **"활성"** 상태인지 확인
   - 비활성화되어 있다면 토글 스위치 켜기
4. **키 복사**: AIzaSy... 형식의 키 복사

**참고**: Google AI Studio에서 발급받은 API 키는 Google Cloud Console의 "사용자 인증 정보" 페이지에 표시되지 않을 수 있습니다. 이는 정상입니다!

---

### 3️⃣ JavaScript Chunk 로딩 오류 해결

**오류 메시지**:
```
Loading chunk vendors-node_modules_firebase_firestore_dist_index_cjs_js-node_modules_mui_icons-material_esm-0db6f4 failed.
```

**해결 방법**:

#### 방법 1: 개발 서버 재시작 (가장 간단)

1. **터미널에서 서버 중지**
   - 터미널 창에서 `Ctrl + C` 누르기

2. **서버 다시 시작**
   ```bash
   cd "/Volumes/Samsung USB/budget_management_anti/frontend"
   npm start
   ```

3. **브라우저 새로고침**
   - `Ctrl + Shift + R` (하드 리프레시)
   - 또는 `Ctrl + F5`

#### 방법 2: 브라우저 캐시 클리어

1. **Chrome 개발자 도구 열기**
   - `F12` 또는 `Ctrl + Shift + I`

2. **Network 탭 열기**
   - "Disable cache" 체크박스 체크

3. **페이지 새로고침**
   - `Ctrl + Shift + R`

#### 방법 3: 완전 캐시 삭제 (방법 1이 안 될 때)

1. **브라우저 캐시 삭제**
   - Chrome: `Ctrl + Shift + Delete`
   - "캐시된 이미지 및 파일" 선택
   - "데이터 삭제" 클릭

2. **개발 서버 재시작**
   ```bash
   cd "/Volumes/Samsung USB/budget_management_anti/frontend"
   npm start
   ```

#### 방법 4: 완전 재설치 (방법 1-3이 안 될 때)

```bash
cd "/Volumes/Samsung USB/budget_management_anti/frontend"
rm -rf node_modules/.cache
npm start
```

---

## ✅ 체크리스트

다음 항목들을 확인하세요:

- [ ] Google Cloud Console에서 **"Gemini API"** 활성화됨
- [ ] Google AI Studio에서 API 키가 **"활성"** 상태임
- [ ] 웹 설정에서 API 키 입력됨
- [ ] 개발 서버 재시작함
- [ ] 브라우저 캐시 클리어함
- [ ] 페이지 새로고침함

---

## 🧪 테스트 방법

### 방법 1: 설정 페이지에서 테스트

1. **설정 페이지 접속**: http://localhost:3000/settings
2. **"AI 설정 (Gemini API)"** 섹션 찾기
3. **"API 테스트"** 버튼 클릭
4. 결과 확인

### 방법 2: 테스트 페이지에서 테스트

1. **테스트 페이지 접속**: http://localhost:3000/test-integration.html
2. **"Gemini API 테스트 실행"** 버튼 클릭
3. 결과 확인

### 방법 3: 브라우저 콘솔에서 직접 테스트

1. **개발자 도구 열기**: `F12`
2. **Console 탭** 클릭
3. 다음 코드 붙여넣기:

```javascript
const apiKey = localStorage.getItem('gemini_api_key');
if (!apiKey) {
  console.error('❌ API 키가 설정되지 않았습니다.');
} else {
  console.log('🔑 API 키:', apiKey.substring(0, 10) + '...');
  
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
      console.log('✅ 성공!', data.candidates[0].content.parts[0].text);
    } else {
      console.error('❌ 오류:', data.error);
    }
  })
  .catch(err => console.error('❌ 네트워크 오류:', err));
}
```

4. **Enter** 키 누르기
5. 결과 확인

---

## 📞 문제가 계속되면

1. **브라우저 콘솔 확인** (F12 > Console)
2. **네트워크 탭 확인** (F12 > Network)
3. **테스트 페이지에서 상세 오류 확인**
4. **GEMINI_API_SETUP_GUIDE.md 파일 참고**


