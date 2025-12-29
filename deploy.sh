#!/bin/bash

# 온라인 배포 스크립트
# 프론트엔드를 빌드하고 Firebase Hosting에 배포합니다.

PROJECT_ROOT="/Volumes/Samsung USB/budget_management_anti"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "=========================================="
echo "🌐 웹 배포 시작"
echo "=========================================="

# PATH 설정
export PATH=~/.npm-global/bin:$PATH

# 1. 프론트엔드 빌드
echo ""
echo "📦 1단계: 프론트엔드 빌드 중..."
cd "$FRONTEND_DIR"

# 빌드 캐시 정리 (선택사항)
# rm -rf build node_modules/.cache

npm run build

if [ $? -ne 0 ]; then
    echo "❌ 빌드 실패!"
    echo "   오류를 확인하고 수정한 후 다시 시도하세요."
    exit 1
fi

echo "✅ 빌드 완료"

# 2. Firebase 배포
echo ""
echo "🚀 2단계: Firebase Hosting에 배포 중..."
cd "$PROJECT_ROOT"

firebase deploy --only hosting

if [ $? -ne 0 ]; then
    echo "❌ 배포 실패!"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ 배포 완료!"
echo "=========================================="
echo ""
echo "🌐 배포된 URL:"
echo "   https://budget-management-system-72094.web.app"
echo ""
echo "💡 팁:"
echo "   - 브라우저 캐시를 클리어하면 (Ctrl+Shift+R) 최신 버전을 확인할 수 있습니다"
echo "   - 변경사항이 반영되는 데 몇 분 걸릴 수 있습니다"
echo ""

