# 🔒 Firebase 서비스 계정 키 노출 보안 조치 가이드

## ⚠️ 현재 상황

Firebase 서비스 계정 키가 GitHub에 공개적으로 노출되었습니다. **즉시 조치가 필요합니다.**

## 🚨 즉시 조치 사항

### 1단계: Firebase 콘솔에서 노출된 키 삭제 (최우선)

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/iam-admin/serviceaccounts?project=budget-management-system-72094
   - 또는 Firebase Console → 프로젝트 설정 → 서비스 계정

2. **서비스 계정 찾기**
   - `firebase-adminsdk-fbsvc@budget-management-system-72094.iam.gserviceaccount.com` 찾기

3. **키 삭제**
   - 서비스 계정 클릭
   - "키" 탭으로 이동
   - 키 ID: `4c5d4a936cf7c87f702d384188b29a27bab68ac7` 찾기
   - **즉시 삭제** 클릭

4. **새 키 생성** (필요한 경우)
   - "키 추가" → "새 키 만들기" → JSON 선택
   - **새 키를 안전한 위치에 저장** (절대 Git에 커밋하지 마세요!)

### 2단계: GitHub에서 키 파일 제거

**중요**: Git 히스토리에서 완전히 제거해야 합니다. 단순히 삭제만 하면 히스토리에 남아있습니다.

#### 방법 1: Git Filter-Branch 사용 (권장)

```bash
cd "/Volumes/Samsung USB/budget_management_anti"

# Git 히스토리에서 파일 완전히 제거
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json" \
  --prune-empty --tag-name-filter cat -- --all

# 강제 푸시 (주의: 팀원과 협의 후 진행)
git push origin --force --all
git push origin --force --tags
```

#### 방법 2: BFG Repo-Cleaner 사용 (더 빠름)

```bash
# BFG 다운로드 (한 번만)
# https://rtyley.github.io/bfg-repo-cleaner/

# 실행
java -jar bfg.jar --delete-files budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

#### 방법 3: 새 저장소로 이전 (가장 안전)

1. 새 저장소 생성
2. `.gitignore` 업데이트 확인
3. 키 파일 제외하고 코드만 복사
4. 새 저장소로 푸시

### 3단계: 로컬 파일 처리

```bash
cd "/Volumes/Samsung USB/budget_management_anti"

# 키 파일 삭제 (백업 후)
# 안전한 위치로 이동 (선택사항)
mkdir -p ~/.secure/firebase-keys
mv budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json ~/.secure/firebase-keys/ 2>/dev/null || true

# 또는 완전히 삭제
rm -f budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json
rm -f ._budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json
```

### 4단계: .gitignore 확인 (이미 완료됨)

`.gitignore`에 다음 패턴이 추가되었습니다:
```
*-firebase-adminsdk-*.json
**/*-firebase-adminsdk-*.json
firebase-adminsdk-*.json
**/firebase-adminsdk-*.json
```

### 5단계: 환경 변수 사용으로 전환 (권장)

로컬 파일 대신 환경 변수 사용:

1. **새 키를 안전한 위치에 저장**
   ```bash
   # 예: ~/.secure/firebase-keys/budget-management-key.json
   ```

2. **환경 변수 설정**
   ```bash
   # .env 파일에 추가 (프로젝트 루트)
   export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.secure/firebase-keys/budget-management-key.json"
   ```

3. **코드에서 환경 변수 사용**
   - `functions/main.py`에서 이미 환경 변수를 확인하도록 되어 있습니다.

## 📋 체크리스트

- [ ] Firebase 콘솔에서 노출된 키 삭제 완료
- [ ] 새 키 생성 (필요한 경우)
- [ ] GitHub에서 키 파일 제거 (Git 히스토리 포함)
- [ ] 로컬 키 파일 삭제 또는 안전한 위치로 이동
- [ ] `.gitignore` 업데이트 확인
- [ ] 새 키를 환경 변수로 설정
- [ ] 코드에서 환경 변수 사용 확인
- [ ] 팀원에게 보안 사고 알림 (필요한 경우)

## 🔐 향후 예방 조치

1. **키 파일은 절대 Git에 커밋하지 않기**
2. **환경 변수 또는 비밀 관리 서비스 사용** (AWS Secrets Manager, Google Secret Manager 등)
3. **정기적으로 키 로테이션** (3-6개월마다)
4. **GitHub에서 자동 스캔 활성화** (GitHub Advanced Security)
5. **Pre-commit 훅 설정** (키 파일 커밋 방지)

## 🆘 추가 도움

- Google Cloud 지원: https://cloud.google.com/support
- Firebase 문서: https://firebase.google.com/docs/admin/setup

## ⚠️ 주의사항

- **키가 노출되면 누구나 프로젝트에 접근할 수 있습니다**
- **즉시 키를 삭제하고 새로 생성하세요**
- **Git 히스토리에서도 완전히 제거해야 합니다**
- **새 키는 절대 Git에 커밋하지 마세요**

