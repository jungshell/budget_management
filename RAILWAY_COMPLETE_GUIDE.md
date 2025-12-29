# Railway 백엔드 배포 - 완전 상세 가이드

Railway에서 처음부터 끝까지 백엔드를 배포하는 완전한 가이드입니다.

---

## 🚀 1단계: Railway 계정 생성 및 로그인

### 1-1. Railway 웹사이트 접속

1. 브라우저에서 https://railway.app 접속
2. 우측 상단의 **"Login"** 또는 **"Start a New Project"** 버튼 클릭

### 1-2. GitHub로 로그인

1. **"Login with GitHub"** 버튼 클릭
2. GitHub 계정으로 로그인
3. Railway가 GitHub 권한을 요청하면 **"Authorize Railway"** 클릭

### 1-3. 대시보드 확인

로그인 후 Railway 대시보드가 나타납니다.

---

## 📦 2단계: 새 프로젝트 생성

### 2-1. 프로젝트 생성 시작

1. 대시보드에서 **"New Project"** 버튼 클릭
   - 또는 우측 상단의 **"+"** 버튼 클릭
   - 또는 **"New"** 메뉴 클릭

### 2-2. 배포 방법 선택

다음 중 하나를 선택:

**옵션 A: GitHub 저장소에서 배포 (권장)**
- **"Deploy from GitHub repo"** 선택
- 다음 단계로 진행

**옵션 B: 빈 프로젝트로 시작**
- **"Empty Project"** 선택
- 나중에 서비스를 추가할 수 있습니다

---

## 🔗 3단계: GitHub 저장소 연결

### 3-1. 저장소 선택 화면

"Deploy from GitHub repo"를 선택하면 저장소 선택 화면이 나타납니다.

### 3-2. 저장소 선택

1. **"GitHub Repository"** 입력란 클릭
2. 드롭다운 목록에서 원하는 저장소 선택
   - 예: `jungshell/budget_management_anti` (프로젝트 이름에 맞게)
   - 또는 검색하여 찾기

### 3-3. 저장소 연결 확인

저장소를 선택하면 Railway가 자동으로:
- 저장소를 분석합니다
- 배포를 시작합니다
- 서비스를 생성합니다

---

## ⚙️ 4단계: Root Directory 설정 (중요!)

### 4-1. 서비스 페이지로 이동

저장소를 선택하면 서비스가 생성되고 배포가 시작됩니다.
- 서비스 이름이 표시됩니다 (보통 저장소 이름과 동일)
- 배포 상태가 표시됩니다 (Building, Deploying 등)

### 4-2. Settings 탭 열기

1. 서비스 페이지에서 **"Settings"** 탭 클릭
   - 상단 메뉴에 있습니다
   - 또는 좌측 사이드바에 있습니다

### 4-3. Root Directory 설정

1. Settings 페이지에서 아래로 스크롤
2. **"Root Directory"** 섹션 찾기
3. 입력란에 `functions` 입력
   - 이렇게 하면 Railway가 `functions` 폴더를 루트로 인식합니다
4. **"Save"** 또는 **"Update"** 버튼 클릭

### 4-4. 배포 재시작

Root Directory를 변경했으면 배포를 다시 시작해야 합니다:

1. 상단의 **"Redeploy"** 버튼 클릭
   - 또는 **"Deployments"** 탭에서 **"Redeploy"** 클릭
2. 배포가 다시 시작됩니다

---

## 🔐 5단계: 환경 변수 설정

### 5-1. Variables 섹션 찾기

Settings 페이지에서:

1. **"Variables"** 섹션 찾기
   - Settings 페이지 내에 있습니다
   - 또는 좌측 메뉴에서 **"Variables"** 클릭

### 5-2. 환경 변수 추가

**변수 1: PORT**

1. **"New Variable"** 또는 **"+"** 버튼 클릭
2. 다음 입력:
   - **Name**: `PORT`
   - **Value**: `5001`
3. **"Add"** 또는 **"Save"** 클릭

**변수 2: GOOGLE_APPLICATION_CREDENTIALS**

1. 다시 **"New Variable"** 또는 **"+"** 버튼 클릭
2. 다음 입력:
   - **Name**: `GOOGLE_APPLICATION_CREDENTIALS`
   - **Value**: `/app/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json`
3. **"Add"** 또는 **"Save"** 클릭

> **참고**: `/app/`은 Railway의 기본 앱 디렉토리입니다.

---

## 📁 6단계: Firebase 서비스 계정 키 파일 업로드

### 6-1. 파일 위치 확인

먼저 로컬 컴퓨터에서 파일을 찾으세요:

**파일 경로:**
```
/Volumes/Samsung USB/budget_management_anti/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json
```

### 6-2. Railway에 파일 업로드

**방법 A: Settings > Files 탭 (가장 간단)**

1. Settings 페이지에서 **"Files"** 섹션 찾기
2. **"Upload File"** 또는 **"+"** 버튼 클릭
3. 파일 선택 대화상자에서:
   - `/Volumes/Samsung USB/budget_management_anti/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json` 선택
4. 업로드 완료

**방법 B: GitHub에 파일 추가 (Files 탭이 없는 경우)**

만약 Railway의 무료 플랜에서 Files 탭이 없다면:

1. **로컬에서 파일 확인:**
   ```bash
   ls "/Volumes/Samsung USB/budget_management_anti/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json"
   ```

2. **GitHub 저장소에 파일 추가:**
   - GitHub 웹사이트에서 저장소 열기
   - `functions` 폴더로 이동
   - "Add file" > "Upload files" 클릭
   - JSON 파일 드래그 앤 드롭
   - "Commit changes" 클릭

3. **Railway가 자동으로 재배포:**
   - GitHub에 푸시하면 Railway가 자동으로 감지하여 재배포합니다

> **⚠️ 보안 주의**: GitHub에 민감한 파일을 올릴 때는 `.gitignore`를 확인하세요. 하지만 Railway 배포를 위해서는 파일이 필요합니다.

---

## 🌐 7단계: 도메인 생성 및 URL 확인

### 7-1. Networking 섹션 찾기

1. Settings 페이지에서 **"Networking"** 섹션 찾기
   - 또는 좌측 메뉴에서 **"Networking"** 클릭

### 7-2. 도메인 생성

1. **"Generate Domain"** 버튼 클릭
2. Railway가 자동으로 도메인을 생성합니다
   - 예: `your-app-name.railway.app`
   - 또는 `your-app-name.up.railway.app`

### 7-3. URL 복사

생성된 URL을 복사하세요:
- 예: `https://budget-backend-production.up.railway.app`
- 이 URL을 메모장에 저장해두세요!
- 프론트엔드 설정에 필요합니다

---

## ✅ 8단계: 배포 확인 및 테스트

### 8-1. 배포 상태 확인

1. **"Deployments"** 탭 클릭
2. 배포 상태 확인:
   - **"Building"**: 빌드 중
   - **"Deploying"**: 배포 중
   - **"Active"**: 배포 완료 ✅

### 8-2. 로그 확인

1. **"Logs"** 탭 클릭
2. 다음 메시지가 보이면 성공:
   ```
   ✅ Firebase 초기화 성공
   ✅ Firestore 초기화 성공
   * Running on http://0.0.0.0:5001
   ```

3. 오류가 있다면:
   - 빨간색 오류 메시지 확인
   - 환경 변수가 올바른지 확인
   - 파일이 올바르게 업로드되었는지 확인

### 8-3. Health Check 테스트

브라우저에서 다음 URL 접속:
```
https://your-app.railway.app/health
```

**성공 응답:**
```json
{"status":"ok"}
```

**실패 시:**
- 404 오류: 배포가 아직 완료되지 않았을 수 있음
- 500 오류: 서버 오류, 로그 확인 필요

---

## 🔧 문제 해결

### Root Directory를 찾을 수 없어요

1. Settings 페이지를 다시 확인
2. "General" 섹션 확인
3. 서비스 이름 옆의 **"..."** 메뉴에서 Settings 확인

### Variables 섹션이 없어요

1. Settings 페이지에서 아래로 스크롤
2. "Environment Variables" 또는 "Config" 섹션 확인
3. Railway UI가 업데이트되었을 수 있으므로 다른 이름으로 표시될 수 있습니다

### Files 탭이 없어요

Railway의 무료 플랜에서는 Files 탭이 없을 수 있습니다:

**해결 방법:**
1. GitHub에 파일 추가 (방법 B 사용)
2. 또는 환경 변수로 JSON 내용 직접 입력 (복잡함)

### 배포가 실패해요

1. **Logs 탭 확인:**
   - 오류 메시지 확인
   - 빨간색 오류 메시지 찾기

2. **일반적인 오류:**
   - `ModuleNotFoundError`: `requirements.txt` 확인
   - `FileNotFoundError`: 서비스 계정 키 파일 경로 확인
   - `Port already in use`: PORT 환경 변수 확인

3. **requirements.txt 확인:**
   - `functions/requirements.txt` 파일이 있는지 확인
   - 모든 의존성이 포함되어 있는지 확인

### Health Check가 실패해요

1. **서비스가 실행 중인지 확인:**
   - Deployments 탭에서 "Active" 상태 확인

2. **포트 확인:**
   - Railway는 자동으로 포트를 할당합니다
   - `PORT` 환경 변수는 보통 설정하지 않아도 됩니다
   - `main.py`에서 `os.environ.get('PORT', 5001)`로 처리됨

3. **CORS 오류:**
   - 백엔드의 CORS 설정 확인
   - 프론트엔드 도메인이 허용되어 있는지 확인

---

## 📝 다음 단계

백엔드 배포가 완료되면:

1. ✅ Railway URL 복사 (예: `https://your-app.railway.app`)
2. ✅ 프론트엔드 `.env.production` 파일 생성
3. ✅ `REACT_APP_API_URL`에 Railway URL 입력
4. ✅ 프론트엔드 배포

자세한 내용은 `NEXT_STEPS_DEPLOY.md` 참고하세요.

---

## 🎉 완료!

백엔드가 성공적으로 배포되면:
- ✅ 컴퓨터를 꺼도 서버가 계속 실행됩니다
- ✅ 어디서나 인터넷으로 접속 가능합니다
- ✅ HTTPS가 자동으로 적용됩니다

