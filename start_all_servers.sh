#!/bin/bash

# 예산 관리 시스템 - 모든 서버 시작 스크립트
# 이 스크립트는 프론트엔드와 백엔드 서버를 모두 시작합니다.

PROJECT_ROOT="/Volumes/Samsung USB/budget_management_anti"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/functions"
LOG_DIR="$PROJECT_ROOT/logs"

# 로그 디렉토리 생성
mkdir -p "$LOG_DIR"

# 기존 프로세스 종료
echo "기존 서버 프로세스 확인 중..."
pkill -f "react-scripts start" 2>/dev/null
pkill -f "python.*main.py" 2>/dev/null
sleep 2

# 백엔드 서버 시작
echo "백엔드 서버 시작 중..."
cd "$BACKEND_DIR"
source venv/bin/activate
nohup python3 main.py > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo "백엔드 서버 시작됨 (PID: $BACKEND_PID)"
echo "백엔드 로그: $LOG_DIR/backend.log"

# 잠시 대기 (백엔드가 완전히 시작될 때까지)
sleep 3

# 프론트엔드 서버 시작
echo "프론트엔드 서버 시작 중..."
cd "$FRONTEND_DIR"
nohup npm start > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "프론트엔드 서버 시작됨 (PID: $FRONTEND_PID)"
echo "프론트엔드 로그: $LOG_DIR/frontend.log"

# PID 파일 저장 (나중에 종료할 때 사용)
echo "$BACKEND_PID" > "$LOG_DIR/backend.pid"
echo "$FRONTEND_PID" > "$LOG_DIR/frontend.pid"

echo ""
echo "=========================================="
echo "✅ 모든 서버가 시작되었습니다!"
echo "=========================================="
echo "백엔드: http://localhost:5001"
echo "프론트엔드: http://localhost:3000"
echo ""
echo "서버 상태 확인:"
echo "  tail -f $LOG_DIR/backend.log"
echo "  tail -f $LOG_DIR/frontend.log"
echo ""
echo "서버 종료:"
echo "  ./stop_all_servers.sh"
echo "=========================================="

