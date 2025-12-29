#!/bin/bash

# Firebase 로그인 스크립트
# PATH를 설정하고 Firebase에 로그인합니다.

export PATH=~/.npm-global/bin:$PATH

echo "Firebase CLI 경로 확인 중..."
which firebase

echo ""
echo "Firebase 로그인 시작..."
firebase login

echo ""
echo "로그인 완료 후 프로젝트를 선택하세요:"
echo "  firebase use budget-management-system-72094"

