#!/bin/bash

# 코드 복원 스크립트
# Git 백업에서 코드를 복원합니다.

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 커밋 해시 또는 백업 이름
RESTORE_TARGET="${1}"

if [ -z "$RESTORE_TARGET" ]; then
    echo -e "${RED}오류: 복원할 백업을 지정해주세요.${NC}"
    echo ""
    echo "사용법:"
    echo "  $0 <커밋해시>"
    echo "  $0 <백업이름>"
    echo ""
    echo "백업 목록 보기:"
    echo "  git log --oneline"
    exit 1
fi

# Git 저장소 확인
if [ ! -d ".git" ]; then
    echo -e "${RED}오류: Git 저장소가 아닙니다.${NC}"
    exit 1
fi

# 커밋 해시로 복원 시도
if git rev-parse --verify "$RESTORE_TARGET" >/dev/null 2>&1; then
    echo -e "${GREEN}백업 찾음: ${RESTORE_TARGET}${NC}"
    echo -e "${YELLOW}경고: 현재 변경사항이 모두 사라집니다.${NC}"
    echo -e "계속하시겠습니까? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        git checkout "$RESTORE_TARGET"
        echo -e "${GREEN}복원 완료!${NC}"
    else
        echo -e "${YELLOW}복원 취소됨${NC}"
        exit 0
    fi
else
    # 백업 이름으로 검색
    COMMIT_HASH=$(git log --all --oneline --grep="$RESTORE_TARGET" | head -1 | cut -d' ' -f1)
    if [ -n "$COMMIT_HASH" ]; then
        echo -e "${GREEN}백업 찾음: ${COMMIT_HASH}${NC}"
        echo -e "${YELLOW}경고: 현재 변경사항이 모두 사라집니다.${NC}"
        echo -e "계속하시겠습니까? (y/n)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            git checkout "$COMMIT_HASH"
            echo -e "${GREEN}복원 완료!${NC}"
        else
            echo -e "${YELLOW}복원 취소됨${NC}"
            exit 0
        fi
    else
        echo -e "${RED}오류: 백업을 찾을 수 없습니다: ${RESTORE_TARGET}${NC}"
        echo ""
        echo "백업 목록:"
        git log --oneline | head -10
        exit 1
    fi
fi

