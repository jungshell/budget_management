# Firestore 규칙 배포 가이드

현재 Firestore 권한 오류가 발생하고 있습니다. Firestore 규칙을 Firebase 콘솔에 배포해야 합니다.

## 방법 1: Firebase 콘솔에서 직접 배포 (가장 빠름)

### 단계 1: Firebase 콘솔 접속
1. [Firebase 콘솔](https://console.firebase.google.com/) 접속
2. 프로젝트 `budget-management-system-72094` 선택

### 단계 2: Firestore 규칙 페이지로 이동
1. 왼쪽 메뉴에서 **Firestore Database** 클릭
2. 상단 탭에서 **규칙** 탭 클릭

### 단계 3: 규칙 복사 및 붙여넣기
아래 규칙을 복사해서 Firebase 콘솔의 규칙 편집기에 붙여넣고 **게시** 버튼을 클릭하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 예산 데이터 - 개발 단계에서는 모든 읽기/쓰기 허용
    match /budgets/{budgetId} {
      allow read, write: if true;
    }
    
    // 사업 데이터
    match /projects/{projectId} {
      allow read, write: if true;
    }
    
    // 사용자 설정
    match /users/{userId} {
      allow read, write: if true;
    }
    
    // 지침 데이터
    match /guidelines/{guidelineId} {
      allow read, write: if true;
    }
  }
}
```

### 단계 4: 확인
- **게시** 버튼 클릭
- 배포 완료 메시지 확인
- 브라우저에서 페이지 새로고침

## 방법 2: Firebase CLI 사용 (선택사항)

### 단계 1: Firebase CLI 설치
```bash
npm install -g firebase-tools
```

### 단계 2: Firebase 로그인
```bash
firebase login
```

### 단계 3: 프로젝트 설정
```bash
cd "/Volumes/Samsung USB/budget_management_anti"
firebase use --add
# 프로젝트 선택: budget-management-system-72094
```

### 단계 4: 규칙 배포
```bash
firebase deploy --only firestore:rules
```

## 중요 사항

⚠️ **보안 주의**: 현재 규칙은 `allow read, write: if true;`로 설정되어 있어 **모든 사용자가 모든 데이터에 접근**할 수 있습니다. 

이는 개발 단계에서만 사용하고, 프로덕션 환경에서는 반드시 인증 기반 규칙으로 변경해야 합니다.

## 규칙 배포 후 확인

1. 브라우저에서 대시보드 페이지 새로고침
2. 오류 메시지가 사라지고 데이터가 표시되는지 확인
3. 브라우저 개발자 도구 콘솔에서 오류가 없는지 확인

