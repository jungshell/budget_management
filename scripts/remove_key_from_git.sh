#!/bin/bash

# Git 히스토리에서 Firebase 키 파일을 제거하는 스크립트

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🔍 현재 Git 상태 확인 중..."
git status --short | head -20

echo ""
echo "⚠️  Git 히스토리에서 키 파일을 제거하려면 먼저 변경사항을 처리해야 합니다."
echo ""
echo "다음 중 하나를 선택하세요:"
echo ""
echo "1. 변경사항을 커밋한 후 히스토리 정리 (권장)"
echo "2. 변경사항을 stash한 후 히스토리 정리"
echo "3. 변경사항을 무시하고 히스토리만 정리 (위험)"
echo ""
read -p "선택 (1/2/3): " choice

case $choice in
  1)
    echo "📝 변경사항을 커밋합니다..."
    git add -A
    git commit -m "chore: Firebase 키 파일 제거 및 보안 조치"
    echo "✅ 커밋 완료"
    ;;
  2)
    echo "💾 변경사항을 stash합니다..."
    git stash push -m "임시 저장: Firebase 키 제거 전"
    echo "✅ Stash 완료"
    ;;
  3)
    echo "⚠️  변경사항을 무시하고 진행합니다..."
    ;;
  *)
    echo "❌ 잘못된 선택입니다."
    exit 1
    ;;
esac

echo ""
echo "🗑️  Git 히스토리에서 키 파일 제거 중..."
echo "⚠️  이 작업은 시간이 걸릴 수 있습니다..."

# FILTER_BRANCH_SQUELCH_WARNING 환경 변수 설정
export FILTER_BRANCH_SQUELCH_WARNING=1

git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json" \
  --prune-empty --tag-name-filter cat -- --all

echo ""
echo "🧹 Git 정리 중..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "✅ Git 히스토리에서 키 파일이 제거되었습니다!"
echo ""
echo "⚠️  다음 단계:"
echo "1. 원격 저장소에 강제 푸시: git push origin --force --all"
echo "2. 태그도 강제 푸시: git push origin --force --tags"
echo ""
echo "⚠️  주의: 강제 푸시는 팀원과 협의 후 진행하세요!"

