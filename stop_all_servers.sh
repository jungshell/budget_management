#!/bin/bash

# 예산 관리 시스템 - 모든 서버 종료 스크립트

PROJECT_ROOT="/Volumes/Samsung USB/budget_management_anti"
LOG_DIR="$PROJECT_ROOT/logs"

echo "서버 종료 중..."

# PID 파일에서 프로세스 종료
if [ -f "$LOG_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$LOG_DIR/backend.pid")
    if ps -p "$BACKEND_PID" > /dev/null 2>&1; then
        kill "$BACKEND_PID" 2>/dev/null
        echo "백엔드 서버 종료됨 (PID: $BACKEND_PID)"
    fi
    rm -f "$LOG_DIR/backend.pid"
fi

if [ -f "$LOG_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$LOG_DIR/frontend.pid")
    if ps -p "$FRONTEND_PID" > /dev/null 2>&1; then
        kill "$FRONTEND_PID" 2>/dev/null
        echo "프론트엔드 서버 종료됨 (PID: $FRONTEND_PID)"
    fi
    rm -f "$LOG_DIR/frontend.pid"
fi

# 추가로 프로세스 확인 및 종료
pkill -f "react-scripts start" 2>/dev/null
pkill -f "python.*main.py" 2>/dev/null

echo "✅ 모든 서버가 종료되었습니다."

