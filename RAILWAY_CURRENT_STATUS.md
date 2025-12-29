# Railway 현재 진행 상황 확인 및 다음 단계

## ✅ 현재 상태 확인

스크린샷을 보니 잘 진행하고 계십니다!

### 완료된 것:
- ✅ Railway 프로젝트 생성 완료
- ✅ GitHub 저장소 연결 완료 (`jungshell/budget_management`)
- ✅ Settings 탭 접근 완료

### 다음에 해야 할 것:
1. Root Directory 설정
2. 환경 변수 설정
3. Firebase 서비스 계정 키 파일 처리 (Files 탭이 없으므로 다른 방법 사용)

---

## 1단계: Root Directory 설정

### 현재 화면에서:

1. **"Source"** 섹션 찾기
   - Settings 페이지 상단에 있습니다
   - 또는 오른쪽 메뉴에서 "Source" 클릭

2. **"Add Root Directory"** 링크 클릭
   - "Source Repo" 아래에 있습니다
   - 또는 "Root Directory" 입력란 찾기

3. 입력란에 `functions` 입력

4. **"Save"** 또는 **"Update"** 버튼 클릭

---

## 2단계: 환경 변수 설정

### Variables 탭으로 이동:

1. 상단의 **"Variables"** 탭 클릭
   - "Deployments", "Variables", "Metrics", "Settings" 중 하나

2. **"New Variable"** 또는 **"+"** 버튼 클릭

3. 다음 변수들을 추가:

   **변수 1:**
   - Name: `PORT`
   - Value: `5001`
   - Add 클릭

   **변수 2:**
   - Name: `GOOGLE_APPLICATION_CREDENTIALS`
   - Value: `/app/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json`
   - Add 클릭

---

## 3단계: Firebase 서비스 계정 키 파일 처리 (Files 탭 없을 때)

Railway의 무료 플랜에서는 Files 탭이 없을 수 있습니다. 대신 다음 방법을 사용하세요:

### 방법 A: GitHub에 파일 추가 (권장)

1. **로컬에서 파일 확인:**
   ```bash
   ls "/Volumes/Samsung USB/budget_management_anti/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json"
   ```

2. **GitHub 저장소 열기:**
   - https://github.com/jungshell/budget_management 접속

3. **functions 폴더로 이동:**
   - 저장소에서 `functions` 폴더 클릭
   - 또는 직접 URL: `https://github.com/jungshell/budget_management/tree/main/functions`

4. **파일 업로드:**
   - "Add file" > "Upload files" 클릭
   - 파일 드래그 앤 드롭:
     - `/Volumes/Samsung USB/budget_management_anti/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json`
   - "Commit changes" 클릭

5. **Railway가 자동으로 재배포:**
   - GitHub에 푸시하면 Railway가 자동으로 감지하여 재배포합니다

### 방법 B: 환경 변수로 JSON 내용 직접 입력 (복잡함)

만약 GitHub에 파일을 올리고 싶지 않다면:

1. JSON 파일 내용 복사:
   ```bash
   cat "/Volumes/Samsung USB/budget_management_anti/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json"
   ```

2. Variables 탭에서 새 변수 추가:
   - Name: `FIREBASE_SERVICE_ACCOUNT_JSON`
   - Value: JSON 파일의 전체 내용 붙여넣기 (한 줄로)

3. `main.py` 수정 필요 (복잡함)

**권장: 방법 A 사용**

---

## 4단계: 도메인 생성

### Networking 탭으로 이동:

1. 오른쪽 메뉴에서 **"Networking"** 클릭
   - 또는 Settings 페이지에서 "Networking" 섹션 찾기

2. **"Generate Domain"** 버튼 클릭

3. 생성된 URL 복사 (예: `https://your-app.railway.app`)

---

## 5단계: 배포 시작

### Deployments 탭으로 이동:

1. 상단의 **"Deployments"** 탭 클릭

2. **"Deploy"** 버튼 클릭
   - 또는 상단의 "Deploy" 버튼 (⇧+Enter 단축키)

3. 배포 상태 확인:
   - "Building" → "Deploying" → "Active"

---

## 체크리스트

현재까지:
- [x] Railway 프로젝트 생성
- [x] GitHub 저장소 연결
- [x] Settings 탭 접근

다음 단계:
- [ ] Root Directory를 `functions`로 설정
- [ ] 환경 변수 2개 추가 (PORT, GOOGLE_APPLICATION_CREDENTIALS)
- [ ] Firebase 서비스 계정 키 파일을 GitHub에 업로드
- [ ] 도메인 생성
- [ ] 배포 시작
- [ ] 배포 완료 확인

---

## 문제 해결

### Root Directory를 찾을 수 없어요

- Settings 페이지에서 "Source" 섹션 확인
- "Add Root Directory" 링크 클릭
- 또는 오른쪽 메뉴에서 "Source" 클릭

### Variables 탭이 없어요

- 상단 탭 메뉴 확인 ("Deployments", "Variables", "Metrics", "Settings")
- Variables 탭 클릭

### Files 탭이 정말 없어요

- Railway 무료 플랜에서는 Files 탭이 없을 수 있습니다
- 대신 GitHub에 파일을 추가하는 방법 사용 (방법 A)

