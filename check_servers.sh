#!/bin/bash

# 예산 관리 시스템 - 서버 상태 확인 스크립트

PROJECT_ROOT="/Volumes/Samsung USB/budget_management_anti"
LOG_DIR="$PROJECT_ROOT/logs"

echo "=========================================="
echo "서버 상태 확인"
echo "=========================================="

# 백엔드 서버 확인
if lsof -i :5001 > /dev/null 2>&1; then
    echo "✅ 백엔드 서버: 실행 중 (포트 5001)"
    if [ -f "$LOG_DIR/backend.pid" ]; then
        BACKEND_PID=$(cat "$LOG_DIR/backend.pid")
        echo "   PID: $BACKEND_PID"
    fi
else
    echo "❌ 백엔드 서버: 실행되지 않음"
fi

# 프론트엔드 서버 확인
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ 프론트엔드 서버: 실행 중 (포트 3000)"
    if [ -f "$LOG_DIR/frontend.pid" ]; then
        FRONTEND_PID=$(cat "$LOG_DIR/frontend.pid")
        echo "   PID: $FRONTEND_PID"
    fi
else
    echo "❌ 프론트엔드 서버: 실행되지 않음"
fi

echo ""
echo "최근 로그 확인:"
echo "----------------------------------------"
if [ -f "$LOG_DIR/backend.log" ]; then
    echo "백엔드 로그 (마지막 5줄):"
    tail -n 5 "$LOG_DIR/backend.log"
    echo ""
fi

if [ -f "$LOG_DIR/frontend.log" ]; then
    echo "프론트엔드 로그 (마지막 5줄):"
    tail -n 5 "$LOG_DIR/frontend.log"
fi

echo "=========================================="

