# 🚨 긴급 보안 조치 - 5분 안에 완료하기

## ⚠️ Firebase 서비스 계정 키가 GitHub에 노출되었습니다!

**즉시 다음 단계를 따라주세요:**

## 1️⃣ Firebase 콘솔에서 키 삭제 (2분)

1. https://console.cloud.google.com/iam-admin/serviceaccounts?project=budget-management-system-72094 접속
2. `firebase-adminsdk-fbsvc@budget-management-system-72094.iam.gserviceaccount.com` 클릭
3. "키" 탭 → 키 ID `4c5d4a936c...` 찾기 → **삭제** 클릭
4. 필요하면 "키 추가" → 새 키 생성 (JSON 다운로드)

## 2️⃣ 로컬 파일 이동 (1분)

터미널에서 실행:

```bash
cd "/Volumes/Samsung USB/budget_management_anti"
./scripts/move_firebase_key.sh
```

또는 수동으로:

```bash
# 안전한 위치로 이동
mkdir -p ~/.secure/firebase-keys
mv budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json ~/.secure/firebase-keys/
chmod 600 ~/.secure/firebase-keys/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json

# 환경 변수 설정 (터미널에 추가)
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.secure/firebase-keys/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json"
```

## 3️⃣ GitHub에서 제거 (2분)

**중요**: Git 히스토리에서도 완전히 제거해야 합니다!

```bash
cd "/Volumes/Samsung USB/budget_management_anti"

# Git 히스토리에서 완전히 제거
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json" \
  --prune-empty --tag-name-filter cat -- --all

# 강제 푸시 (주의: 팀원과 협의 후)
git push origin --force --all
```

## ✅ 완료 체크

- [ ] Firebase 콘솔에서 키 삭제 완료
- [ ] 로컬 파일 안전한 위치로 이동 완료
- [ ] GitHub에서 키 파일 제거 완료
- [ ] 새 키 생성 (필요한 경우)

## 📖 자세한 가이드

`SECURITY_FIX_GUIDE.md` 파일을 참고하세요.

