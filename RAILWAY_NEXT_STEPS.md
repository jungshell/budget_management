# Railway 다음 단계 - Root Directory 설정 완료!

## ✅ 현재 상태 확인

스크린샷을 보니:
- ✅ Root Directory가 `functions`로 설정되어 있습니다!
- ⚠️ "Connected branch does not exist" 오류가 있습니다 (이건 나중에 해결)

**Root Directory는 이미 완료되었으므로 링크가 필요 없습니다!**

---

## 다음 단계: 환경 변수 설정

### 1단계: Variables 탭으로 이동

1. 상단의 **"Variables"** 탭 클릭
   - "Deployments", "Variables", "Metrics", "Settings" 중 하나

### 2단계: 환경 변수 추가

Variables 탭에서:

1. **"New Variable"** 또는 **"+"** 버튼 클릭

2. **변수 1 추가:**
   - Name: `PORT`
   - Value: `5001`
   - **Add** 또는 **Save** 클릭

3. **변수 2 추가:**
   - 다시 **"New Variable"** 클릭
   - Name: `GOOGLE_APPLICATION_CREDENTIALS`
   - Value: `/app/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json`
   - **Add** 또는 **Save** 클릭

---

## 3단계: Firebase 서비스 계정 키 파일 처리

Railway에는 Files 탭이 없으므로 GitHub에 파일을 추가해야 합니다.

### GitHub에 파일 추가하기:

1. **GitHub 저장소 열기:**
   - https://github.com/jungshell/budget_management 접속

2. **functions 폴더로 이동:**
   - 저장소에서 `functions` 폴더 클릭
   - 또는 URL: `https://github.com/jungshell/budget_management/tree/main/functions`

3. **파일 업로드:**
   - **"Add file"** > **"Upload files"** 클릭
   - 파일 드래그 앤 드롭:
     - 파일 위치: `/Volumes/Samsung USB/budget_management_anti/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json`
   - 하단에 **"Commit changes"** 클릭

4. **Railway가 자동으로 재배포:**
   - GitHub에 푸시하면 Railway가 자동으로 감지하여 재배포합니다
   - Deployments 탭에서 배포 상태 확인

---

## 4단계: 브랜치 오류 해결 (선택사항)

"Connected branch does not exist" 오류는:
- GitHub 저장소에 `main` 브랜치가 없을 때 발생합니다
- 또는 브랜치 이름이 다를 때 발생합니다

### 해결 방법:

1. **GitHub에서 브랜치 확인:**
   - https://github.com/jungshell/budget_management/branches 접속
   - 어떤 브랜치가 있는지 확인 (예: `master`, `main`, `develop` 등)

2. **Railway에서 브랜치 변경:**
   - Settings > Source 섹션
   - "Branch connected to production" 드롭다운에서 올바른 브랜치 선택
   - 또는 "Disconnect" 후 다시 연결

**참고:** 이 오류는 배포를 막지 않을 수 있습니다. 일단 배포를 시도해보세요.

---

## 5단계: 도메인 생성

### Networking 탭으로 이동:

1. 오른쪽 메뉴에서 **"Networking"** 클릭
   - 또는 Settings 페이지에서 아래로 스크롤하여 "Networking" 섹션 찾기

2. **"Generate Domain"** 버튼 클릭

3. 생성된 URL 복사 (예: `https://your-app.railway.app`)

---

## 6단계: 배포 시작

### Deployments 탭으로 이동:

1. 상단의 **"Deployments"** 탭 클릭

2. **"Deploy"** 버튼 클릭
   - 또는 상단의 "Deploy" 버튼 (⇧+Enter 단축키)

3. 배포 상태 확인:
   - "Building" → "Deploying" → "Active"
   - Logs 탭에서 진행 상황 확인

---

## 체크리스트

완료된 것:
- [x] Root Directory 설정 (`functions`)
- [x] GitHub 저장소 연결

다음 단계:
- [ ] Variables 탭에서 환경 변수 2개 추가
- [ ] GitHub에 Firebase 서비스 계정 키 파일 업로드
- [ ] Networking에서 도메인 생성
- [ ] Deployments에서 배포 시작
- [ ] 배포 완료 확인

---

## 빠른 요약

1. **Variables 탭** → 환경 변수 2개 추가
2. **GitHub** → Firebase 서비스 계정 키 파일 업로드
3. **Networking** → 도메인 생성
4. **Deployments** → 배포 시작

Root Directory는 이미 완료되었으니 다음 단계로 진행하세요!

