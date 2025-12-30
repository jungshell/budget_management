# 🔧 Git 히스토리에서 키 파일 제거 가이드

## 현재 상황

✅ **키 파일 이동 완료**: 프로젝트에서 제거되고 안전한 위치로 이동됨  
⚠️ **Git 히스토리**: 아직 Git 히스토리에 키 파일이 남아있음

## 해결 방법

### 방법 1: 자동 스크립트 사용 (권장)

```bash
cd "/Volumes/Samsung USB/budget_management_anti"
./scripts/remove_key_from_git.sh
```

스크립트가 다음을 수행합니다:
1. 현재 Git 상태 확인
2. 변경사항 처리 옵션 제공
3. Git 히스토리에서 키 파일 제거
4. Git 정리

### 방법 2: 수동으로 진행

#### 1단계: 변경사항 처리

**옵션 A: 변경사항 커밋 (권장)**
```bash
cd "/Volumes/Samsung USB/budget_management_anti"
git add -A
git commit -m "chore: Firebase 키 파일 제거 및 보안 조치"
```

**옵션 B: 변경사항 임시 저장**
```bash
git stash push -m "임시 저장"
```

#### 2단계: Git 히스토리에서 키 파일 제거

```bash
# 경고 메시지 억제
export FILTER_BRANCH_SQUELCH_WARNING=1

# 히스토리에서 키 파일 제거
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json" \
  --prune-empty --tag-name-filter cat -- --all
```

#### 3단계: Git 정리

```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

#### 4단계: 원격 저장소에 반영 (⚠️ 주의)

```bash
# 모든 브랜치 강제 푸시
git push origin --force --all

# 태그도 강제 푸시
git push origin --force --tags
```

**⚠️ 중요**: 강제 푸시는 팀원과 협의 후 진행하세요!

### 방법 3: BFG Repo-Cleaner 사용 (더 빠름)

```bash
# BFG 다운로드
# https://rtyley.github.io/bfg-repo-cleaner/

# 실행
java -jar bfg.jar --delete-files budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json

# 정리
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## 확인

히스토리에서 제거되었는지 확인:

```bash
# 키 파일이 히스토리에 있는지 확인
git log --all --full-history -- budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json

# 결과가 없으면 성공!
```

## 주의사항

1. **백업**: 작업 전에 저장소를 백업하세요
2. **팀 협의**: 강제 푸시 전에 팀원에게 알리세요
3. **로컬 복사본**: 팀원들은 로컬 저장소를 다시 클론해야 할 수 있습니다

## 완료 후

1. ✅ Firebase 콘솔에서 키 삭제 확인
2. ✅ 로컬 키 파일 안전한 위치 확인
3. ✅ Git 히스토리에서 키 파일 제거 확인
4. ✅ 원격 저장소에 반영 완료

