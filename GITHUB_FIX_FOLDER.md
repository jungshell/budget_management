# GitHub 파일 위치 수정하기

## 현재 상황

파일들이 저장소 루트에 업로드되었지만, Railway는 `functions` 폴더를 찾고 있습니다.

## 해결 방법: functions 폴더 만들고 파일 이동

### 방법 1: GitHub 웹에서 폴더 만들고 파일 이동 (권장)

#### 1단계: functions 폴더 만들기

1. GitHub 저장소에서 **"Add file"** > **"Create new file"** 클릭
2. 파일 경로에 `functions/README.md` 입력
   - 이렇게 하면 `functions` 폴더가 자동으로 생성됩니다
3. 내용에 간단히 입력:
   ```
   # Functions
   Backend functions for budget management system
   ```
4. **"Commit changes"** 클릭

#### 2단계: 파일들을 functions 폴더로 이동

각 파일을 하나씩 이동:

1. **파일 클릭** (예: `main.py`)
2. 우측 상단의 **연필 아이콘** (Edit) 클릭
3. 파일 내용 복사 (Ctrl+A, Ctrl+C)
4. 파일 경로를 `functions/main.py`로 변경
5. **"Commit changes"** 클릭
6. 원본 파일 삭제:
   - 루트로 돌아가서 파일 클릭
   - "Delete file" 클릭
   - "Commit changes" 클릭

**모든 파일에 대해 반복:**
- `main.py` → `functions/main.py`
- `parse_excel.py` → `functions/parse_excel.py`
- `requirements.txt` → `functions/requirements.txt`
- `Procfile` → `functions/Procfile`
- `railway.json` → `functions/railway.json`
- `budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json` → `functions/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json`

### 방법 2: 로컬에서 Git으로 수정 (더 빠름)

로컬에서 파일을 이동하고 푸시:

```bash
cd "/Volumes/Samsung USB/budget_management_anti"

# functions 폴더가 이미 있으므로 파일들을 이동
git mv main.py functions/
git mv parse_excel.py functions/
git mv requirements.txt functions/
git mv Procfile functions/
git mv railway.json functions/
git mv budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json functions/

# 커밋 및 푸시
git commit -m "Move files to functions folder"
git push origin main
```

---

## 방법 3: Railway Root Directory 제거 (간단하지만 권장하지 않음)

만약 파일 이동이 번거롭다면:

1. Railway Settings로 이동
2. Root Directory를 비우기 (빈 값으로)
3. 이렇게 하면 루트 디렉토리를 사용합니다

**하지만 이 방법은 권장하지 않습니다:**
- 프로젝트 구조가 깔끔하지 않습니다
- 나중에 문제가 될 수 있습니다

---

## 추천: 방법 2 (로컬 Git 사용)

가장 빠르고 간단합니다:

1. 터미널에서 위의 명령어 실행
2. GitHub에 자동으로 반영됩니다
3. Railway가 자동으로 재배포합니다

---

## 완료 후 확인

1. GitHub 저장소에서 `functions` 폴더 확인
2. 모든 파일이 `functions` 폴더 안에 있는지 확인
3. Railway로 돌아가서 배포 상태 확인

