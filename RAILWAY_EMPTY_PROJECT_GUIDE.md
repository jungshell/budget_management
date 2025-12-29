# Railway Empty Project에서 GitHub 저장소 배포하기

Empty Project를 선택한 경우의 단계별 가이드입니다.

---

## 현재 상황

Empty Project를 선택하면 "What do you need?" 모달이 나타납니다.

## 다음 단계: GitHub Repo 선택

### 1단계: GitHub Repo 선택

"What do you need?" 모달에서:

1. **"GitHub Repo"** 옵션 클릭
   - GitHub Octocat 아이콘이 있는 옵션입니다
   - 이것이 "Deploy from GitHub repo"와 같은 기능입니다

2. 클릭하면 GitHub 저장소 선택 화면으로 이동합니다

---

## 2단계: GitHub 저장소 선택

### 2-1. 저장소 선택 화면

GitHub Repo를 선택하면 저장소 선택 화면이 나타납니다.

### 2-2. 저장소 선택

1. **"GitHub Repository"** 입력란 클릭
2. 드롭다운 목록에서 원하는 저장소 선택
   - 예: `jungshell/budget_management_anti` (프로젝트 이름에 맞게)
   - 또는 검색하여 찾기

### 2-3. 저장소 연결 확인

저장소를 선택하면 Railway가 자동으로:
- 저장소를 분석합니다
- 배포를 시작합니다
- 서비스를 생성합니다

---

## 3단계: Root Directory 설정 (중요!)

### 3-1. 서비스 페이지로 이동

저장소를 선택하면 서비스가 생성되고 배포가 시작됩니다.

### 3-2. Settings 탭 열기

1. 서비스 페이지에서 **"Settings"** 탭 클릭
   - 상단 메뉴에 있습니다

### 3-3. Root Directory 설정

1. Settings 페이지에서 아래로 스크롤
2. **"Root Directory"** 섹션 찾기
3. 입력란에 `functions` 입력
4. **"Save"** 버튼 클릭

### 3-4. 배포 재시작

1. 상단의 **"Redeploy"** 버튼 클릭
2. 배포가 다시 시작됩니다

---

## 4단계: 환경 변수 설정

Settings 페이지에서:

1. **"Variables"** 섹션 찾기
2. **"New Variable"** 클릭
3. 다음 변수 추가:

   **변수 1:**
   - Name: `PORT`
   - Value: `5001`

   **변수 2:**
   - Name: `GOOGLE_APPLICATION_CREDENTIALS`
   - Value: `/app/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json`

---

## 5단계: Firebase 서비스 계정 키 파일 업로드

Settings 페이지에서:

1. **"Files"** 섹션 찾기
2. **"Upload File"** 클릭
3. 파일 선택:
   - `/Volumes/Samsung USB/budget_management_anti/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json`
4. 업로드 완료

---

## 6단계: 도메인 생성

Settings 페이지에서:

1. **"Networking"** 섹션 찾기
2. **"Generate Domain"** 클릭
3. 생성된 URL 복사

---

## 다음 단계

이제 `RAILWAY_COMPLETE_GUIDE.md`의 4단계부터 계속 진행하세요!

