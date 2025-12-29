# GitHub에 코드 업로드하기 - 두 가지 방법

GitHub 저장소가 비어있어서 `functions` 폴더가 없습니다. 다음 중 하나의 방법으로 코드를 업로드하세요.

---

## 방법 1: GitHub 웹에서 직접 업로드 (가장 간단)

### 1단계: 저장소 루트에서 파일 업로드

1. **GitHub 저장소 페이지에서:**
   - https://github.com/jungshell/budget_management 접속

2. **"Add file" 버튼 클릭:**
   - 저장소가 비어있으면 "uploading an existing file" 링크 클릭
   - 또는 상단의 "Add file" > "Upload files" 클릭

3. **functions 폴더의 파일들 업로드:**
   - `/Volumes/Samsung USB/budget_management_anti/functions/` 폴더의 파일들을 드래그 앤 드롭
   - 또는 "choose your files" 클릭하여 선택
   - 필요한 파일들:
     - `main.py`
     - `parse_excel.py`
     - `requirements.txt`
     - `Procfile`
     - `railway.json`
     - `budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json` (Firebase 서비스 계정 키)

4. **"Commit changes" 클릭:**
   - 커밋 메시지: "Initial commit: Add backend functions"
   - "Commit changes" 버튼 클릭

### 2단계: functions 폴더 구조 만들기

**방법 A: 폴더 이름으로 업로드**

1. 파일 업로드 시 파일명 앞에 `functions/` 추가:
   - 예: `functions/main.py`, `functions/requirements.txt` 등

**방법 B: GitHub에서 폴더 생성 후 업로드**

1. 저장소에서 "Add file" > "Create new file" 클릭
2. 파일명에 `functions/README.md` 입력 (폴더 자동 생성)
3. 내용에 `# Functions` 입력
4. "Commit changes" 클릭
5. 이제 `functions` 폴더가 생성되었으므로 그 안에 파일 업로드

---

## 방법 2: 로컬에서 Git으로 푸시 (권장)

### 1단계: Git remote 확인 및 설정

```bash
cd "/Volumes/Samsung USB/budget_management_anti"

# remote 확인
git remote -v

# remote가 없으면 추가
git remote add origin https://github.com/jungshell/budget_management.git
```

### 2단계: 파일 추가 및 커밋

```bash
# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: Add budget management system"

# main 브랜치로 푸시
git push -u origin main
```

### 3단계: Firebase 서비스 계정 키 파일 추가

```bash
# functions 폴더로 이동
cd functions

# Firebase 서비스 계정 키 파일 복사
cp "../budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json" .

# Git에 추가
git add budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json
git commit -m "Add Firebase service account key"
git push
```

---

## 빠른 방법: GitHub 웹에서 폴더 구조 만들기

### 단계별:

1. **저장소에서 "Add file" > "Create new file" 클릭**

2. **파일 경로에 `functions/README.md` 입력:**
   - 이렇게 하면 `functions` 폴더가 자동으로 생성됩니다

3. **내용에 간단히 입력:**
   ```
   # Functions
   Backend functions for budget management system
   ```

4. **"Commit changes" 클릭**

5. **이제 `functions` 폴더가 생성되었습니다!**

6. **`functions` 폴더로 이동:**
   - 저장소에서 `functions` 폴더 클릭
   - 또는 URL: `https://github.com/jungshell/budget_management/tree/main/functions`

7. **파일 업로드:**
   - "Add file" > "Upload files" 클릭
   - 필요한 파일들 드래그 앤 드롭:
     - `main.py`
     - `parse_excel.py`
     - `requirements.txt`
     - `Procfile`
     - `railway.json`
     - `budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json`

8. **"Commit changes" 클릭**

---

## 추천 순서

**가장 빠른 방법:**
1. GitHub 웹에서 `functions/README.md` 파일 생성 (폴더 자동 생성)
2. `functions` 폴더로 이동
3. 필요한 파일들 업로드
4. Firebase 서비스 계정 키 파일도 함께 업로드

이렇게 하면 Railway가 자동으로 코드를 감지하여 배포를 시작합니다!

---

## 참고

- Firebase 서비스 계정 키 파일은 민감한 정보이지만, Railway 배포를 위해서는 필요합니다
- 나중에 `.gitignore`에 추가하여 더 이상 추적하지 않도록 할 수 있습니다
- 하지만 이미 푸시된 파일은 GitHub에 남아있습니다

