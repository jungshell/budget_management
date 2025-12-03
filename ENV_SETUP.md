# 환경 변수 설정 가이드

이 파일은 `.env` 파일을 생성하는 방법을 안내합니다.

## .env 파일 생성 방법

1. 프로젝트 루트 디렉토리(`/Volumes/Samsung USB/budget_management_anti/`)로 이동
2. 텍스트 에디터로 `.env` 파일 생성 (파일명이 `.env`여야 함)
3. 아래 내용을 복사하여 붙여넣기
4. 각 항목에 실제 값을 입력

## .env 파일 내용

```env
# Firebase Configuration
# Firebase Console > 프로젝트 설정 > 일반 > 내 앱 > 웹 앱에서 복사
REACT_APP_FIREBASE_API_KEY=여기에_입력
REACT_APP_FIREBASE_AUTH_DOMAIN=여기에_입력
REACT_APP_FIREBASE_PROJECT_ID=여기에_입력
REACT_APP_FIREBASE_STORAGE_BUCKET=여기에_입력
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=여기에_입력
REACT_APP_FIREBASE_APP_ID=여기에_입력

# Gemini API
# https://aistudio.google.com/ 에서 API 키 발급
GEMINI_API_KEY=여기에_입력
```

## 주의사항

- 따옴표(`"`) 없이 입력
- 공백 없이 입력
- `=` 앞뒤 공백 없이 입력
- 실제 값으로 교체해야 함

## 예시

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyABC123def456ghi789jkl012mno345pqr678
REACT_APP_FIREBASE_AUTH_DOMAIN=budget-management.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=budget-management-12345
REACT_APP_FIREBASE_STORAGE_BUCKET=budget-management-12345.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

GEMINI_API_KEY=AIzaSyXYZ789abc012def345ghi678jkl901mno234
```

