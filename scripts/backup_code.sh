#!/bin/bash

# 코드 백업 스크립트
# Git을 사용하여 현재 코드 상태를 백업합니다.

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 백업 이름 (기본값: 현재 날짜/시간)
BACKUP_NAME="${1:-백업 - $(date '+%Y-%m-%d %H:%M:%S')}"
BACKUP_DESCRIPTION="${2:-자동 코드 백업}"

echo -e "${GREEN}코드 백업 시작...${NC}"
echo -e "백업 이름: ${YELLOW}${BACKUP_NAME}${NC}"
echo -e "설명: ${YELLOW}${BACKUP_DESCRIPTION}${NC}"
echo ""

# Git 저장소 확인
if [ ! -d ".git" ]; then
    echo -e "${RED}오류: Git 저장소가 아닙니다.${NC}"
    echo -e "${YELLOW}Git 저장소를 초기화하시겠습니까? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        git init
        echo -e "${GREEN}Git 저장소 초기화 완료${NC}"
    else
        exit 1
    fi
fi

# 변경사항 확인
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}변경사항이 없습니다.${NC}"
    exit 0
fi

# 변경사항 스테이징
echo -e "${GREEN}변경사항 스테이징 중...${NC}"
git add -A

# 커밋
echo -e "${GREEN}커밋 생성 중...${NC}"
COMMIT_HASH=$(git commit -m "${BACKUP_NAME}

${BACKUP_DESCRIPTION}
백업 시간: $(date '+%Y-%m-%d %H:%M:%S')" | grep -oP '(?<=^\[.*\s)[a-f0-9]{7}(?=\])' || git rev-parse --short HEAD)

echo ""
echo -e "${GREEN}백업 완료!${NC}"
echo -e "커밋 해시: ${YELLOW}${COMMIT_HASH}${NC}"
echo ""
echo -e "백업 목록 보기: ${YELLOW}git log --oneline${NC}"
echo -e "백업 복원: ${YELLOW}git checkout ${COMMIT_HASH}${NC}"

