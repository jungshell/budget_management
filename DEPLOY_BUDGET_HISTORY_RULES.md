# 예산 변경 이력 Firestore 규칙 배포 가이드

## 문제
변경 이력 기능을 사용할 때 "Missing or insufficient permissions" 오류가 발생합니다.
이는 `budget_history` 컬렉션에 대한 Firestore 보안 규칙이 없기 때문입니다.

## 해결 방법: Firebase 콘솔에서 규칙 배포

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
      // 모든 사용자는 자신의 프로필 읽기 가능
      allow read: if request.auth != null;
      // 자신의 프로필은 수정 가능 (단, role은 제외)
      allow update: if request.auth != null && request.auth.uid == userId && 
        !('role' in request.resource.data.diff(resource.data).keys());
      // 관리자만 다른 사용자의 role 변경 가능
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' &&
        'role' in request.resource.data.diff(resource.data).keys();
      // 새 사용자 생성은 인증된 사용자 모두 가능
      allow create: if request.auth != null;
    }
    
    // 지침 데이터
    match /guidelines/{guidelineId} {
      allow read, write: if true;
    }
    
    // 활동 로그
    match /activities/{activityId} {
      allow read, write: if true;
    }
    
    // 예산 변경 이력
    match /budget_history/{historyId} {
      allow read, write: if true;
    }
  }
}
```

### 단계 4: 확인
- **게시** 버튼 클릭
- 배포 완료 메시지 확인
- 브라우저에서 페이지 새로고침 후 변경 이력 기능 테스트

## 중요 사항

⚠️ **보안 주의**: 현재 규칙은 `allow read, write: if true;`로 설정되어 있어 **모든 사용자가 모든 데이터에 접근**할 수 있습니다. 
프로덕션 환경에서는 인증된 사용자만 접근할 수 있도록 규칙을 수정해야 합니다.

### 프로덕션 권장 규칙 (향후 적용)
```javascript
// 예산 변경 이력 - 인증된 사용자만 읽기/쓰기 가능
match /budget_history/{historyId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'user'];
}
```

