# GitHub에서 파일을 functions 폴더로 이동하기

## 현재 상황
- 파일들이 루트 디렉토리에 있습니다
- Railway는 `functions` 폴더를 찾고 있습니다

## 해결 방법: GitHub 웹에서 파일 이동

### 1단계: functions 폴더 만들기

1. GitHub 저장소에서 **"Add file"** > **"Create new file"** 클릭
2. 파일 경로에 `functions/README.md` 입력
3. 내용에 `# Functions` 입력
4. **"Commit changes"** 클릭

### 2단계: 각 파일을 functions 폴더로 이동

**각 파일마다 다음 작업을 반복하세요:**

#### 예시: main.py 이동하기

1. **`main.py` 파일 클릭**
2. 우측 상단의 **연필 아이콘** (✏️ Edit) 클릭
3. **전체 내용 복사** (Ctrl+A, Ctrl+C)
4. **파일 경로를 `functions/main.py`로 변경**
   - 파일명 입력란에서 `main.py` 앞에 `functions/` 추가
5. **"Commit changes"** 클릭
6. **원본 파일 삭제:**
   - 저장소 루트로 돌아가기
   - `main.py` 파일 클릭
   - **"Delete file"** 클릭
   - **"Commit changes"** 클릭

#### 이동해야 할 파일들:

1. `main.py` → `functions/main.py`
2. `parse_excel.py` → `functions/parse_excel.py`
3. `requirements.txt` → `functions/requirements.txt`
4. `Procfile` → `functions/Procfile`
5. `railway.json` → `functions/railway.json`
6. `budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json` → `functions/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json`

### 더 빠른 방법: 한 번에 여러 파일 이동

GitHub 웹에서는 한 번에 여러 파일을 이동할 수 없으므로, 각 파일을 하나씩 이동해야 합니다.

**팁:** 파일 내용이 길면 복사하는 것이 번거로울 수 있습니다. 이 경우 로컬 Git을 사용하는 것이 더 빠릅니다.

---

## 대안: 로컬 Git 사용 (더 빠름)

로컬에서 Git을 사용하면 더 빠르게 처리할 수 있습니다:

```bash
cd "/Volumes/Samsung USB/budget_management_anti"

# GitHub remote 추가
git remote add origin https://github.com/jungshell/budget_management.git

# 원격 저장소에서 최신 코드 가져오기
git fetch origin
git checkout main
git pull origin main

# 파일들을 functions 폴더로 이동
git mv main.py functions/ 2>/dev/null || echo "main.py가 이미 functions에 있거나 없음"
git mv parse_excel.py functions/ 2>/dev/null || echo "parse_excel.py가 이미 functions에 있거나 없음"
git mv requirements.txt functions/ 2>/dev/null || echo "requirements.txt가 이미 functions에 있거나 없음"
git mv Procfile functions/ 2>/dev/null || echo "Procfile가 이미 functions에 있거나 없음"
git mv railway.json functions/ 2>/dev/null || echo "railway.json이 이미 functions에 있거나 없음"
git mv budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json functions/ 2>/dev/null || echo "JSON 파일이 이미 functions에 있거나 없음"

# 커밋 및 푸시
git add .
git commit -m "Move files to functions folder for Railway deployment"
git push origin main
```

---

## 완료 후 확인

1. GitHub 저장소에서 `functions` 폴더 확인
2. 모든 파일이 `functions` 폴더 안에 있는지 확인
3. Railway로 돌아가서 배포 상태 확인
4. Railway가 자동으로 재배포를 시작합니다

