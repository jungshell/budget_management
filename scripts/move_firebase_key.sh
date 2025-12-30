#!/bin/bash

# Firebase 서비스 계정 키를 안전한 위치로 이동하는 스크립트

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
KEY_FILE="$PROJECT_ROOT/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json"
SECURE_DIR="$HOME/.secure/firebase-keys"

# 안전한 디렉토리 생성
mkdir -p "$SECURE_DIR"
chmod 700 "$SECURE_DIR"

# 키 파일이 존재하는 경우 이동
if [ -f "$KEY_FILE" ]; then
    echo "🔒 Firebase 키 파일을 안전한 위치로 이동합니다..."
    mv "$KEY_FILE" "$SECURE_DIR/"
    chmod 600 "$SECURE_DIR/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json"
    echo "✅ 키 파일이 $SECURE_DIR 로 이동되었습니다."
    echo ""
    echo "환경 변수 설정:"
    echo "export GOOGLE_APPLICATION_CREDENTIALS=\"$SECURE_DIR/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json\""
else
    echo "⚠️ 키 파일을 찾을 수 없습니다: $KEY_FILE"
fi

# 숨김 파일도 삭제
if [ -f "$PROJECT_ROOT/._budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json" ]; then
    rm -f "$PROJECT_ROOT/._budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json"
    echo "✅ 숨김 파일도 삭제되었습니다."
fi

