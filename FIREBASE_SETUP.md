# Firebase 서비스 계정 키 설정 가이드

로컬 개발 환경에서 Firestore에 데이터를 저장하려면 Firebase 서비스 계정 키를 설정해야 합니다.

## 1. Firebase 콘솔에서 서비스 계정 키 생성

### 단계 1: Firebase 콘솔 접속
1. [Firebase 콘솔](https://console.firebase.google.com/)에 접속
2. 프로젝트 선택: `budget-management-system-72094`

### 단계 2: 프로젝트 설정 열기
1. 왼쪽 메뉴에서 ⚙️ **프로젝트 설정** 클릭
2. 상단 탭에서 **서비스 계정** 탭 선택

### 단계 3: 서비스 계정 키 생성
1. **새 비공개 키 만들기** 버튼 클릭
2. 확인 대화상자에서 **키 생성** 클릭
3. JSON 파일이 자동으로 다운로드됩니다 (예: `budget-management-system-72094-xxxxx.json`)

## 2. 서비스 계정 키 파일 배치

### 방법 1: 프로젝트 루트에 배치 (권장)
```bash
# 다운로드한 JSON 파일을 프로젝트 루트로 이동
mv ~/Downloads/budget-management-system-72094-*.json "/Volumes/Samsung USB/budget_management_anti/firebase-service-account.json"
```

### 방법 2: functions 폴더에 배치
```bash
# 다운로드한 JSON 파일을 functions 폴더로 이동
mv ~/Downloads/budget-management-system-72094-*.json "/Volumes/Samsung USB/budget_management_anti/functions/firebase-service-account.json"
```

## 3. 코드 수정

### 방법 1: 환경 변수 사용 (권장)

`functions/main.py` 파일을 수정:

```python
# Firebase 초기화 (로컬 개발 환경)
if not firebase_admin._apps:
    try:
        project_id = 'budget-management-system-72094'
        
        # 서비스 계정 키 파일 경로
        service_account_path = os.path.join(
            os.path.dirname(__file__),
            '..',
            'firebase-service-account.json'
        )
        
        # 서비스 계정 키 파일이 있으면 사용
        if os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred, {
                'projectId': project_id
            })
            print(f"Firebase 초기화 성공 (서비스 계정 키 사용): {project_id}")
        else:
            # 서비스 계정 키가 없으면 프로젝트 ID만 사용
            firebase_admin.initialize_app(options={
                'projectId': project_id
            })
            print(f"Firebase 초기화 성공 (프로젝트 ID만 사용): {project_id}")
    except Exception as e:
        print(f"Firebase 초기화 오류: {e}")
```

### 방법 2: 환경 변수로 경로 지정

`.env` 파일 생성 (프로젝트 루트 또는 functions 폴더):

```bash
# .env 파일
GOOGLE_APPLICATION_CREDENTIALS=/Volumes/Samsung USB/budget_management_anti/firebase-service-account.json
```

그리고 `functions/main.py`에서:

```python
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# Firebase 초기화
if not firebase_admin._apps:
    try:
        project_id = 'budget-management-system-72094'
        
        # 환경 변수에서 서비스 계정 키 경로 가져오기
        service_account_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        
        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred, {
                'projectId': project_id
            })
            print(f"Firebase 초기화 성공 (서비스 계정 키 사용)")
        else:
            firebase_admin.initialize_app(options={
                'projectId': project_id
            })
            print(f"Firebase 초기화 성공 (프로젝트 ID만 사용)")
    except Exception as e:
        print(f"Firebase 초기화 오류: {e}")
```

## 4. .gitignore에 추가

서비스 계정 키 파일은 절대 Git에 커밋하지 마세요!

`.gitignore` 파일에 추가:

```
# Firebase 서비스 계정 키
firebase-service-account.json
**/firebase-service-account.json
*.json
!package.json
!package-lock.json
!tsconfig.json
```

## 5. 서버 재시작

서비스 계정 키를 설정한 후 백엔드 서버를 재시작하세요:

```bash
# 기존 서버 종료
lsof -ti:5001 | xargs kill -9

# 서버 재시작
cd "/Volumes/Samsung USB/budget_management_anti"
source venv/bin/activate
cd functions
python main.py
```

## 6. 확인

서버 로그에서 다음 메시지를 확인하세요:

```
Firebase 초기화 성공 (서비스 계정 키 사용): budget-management-system-72094
Firestore/Storage 초기화 성공
```

이제 파일 업로드 시 Firestore에 데이터가 저장됩니다!

## 보안 주의사항

⚠️ **중요**: 서비스 계정 키는 절대 공개 저장소에 업로드하지 마세요!
- `.gitignore`에 반드시 추가
- 파일 권한 설정: `chmod 600 firebase-service-account.json`
- 필요시 Firebase 콘솔에서 키를 재생성할 수 있습니다

