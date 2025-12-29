# Railway 백엔드 배포 - 단계별 상세 가이드

## 4단계: 저장소 선택 후 설정

### 4-1. 저장소 선택 완료 후

GitHub 저장소를 선택하면 Railway가 자동으로 배포를 시작합니다. 잠시 기다리면 서비스가 생성됩니다.

### 4-2. Root Directory 설정

1. **서비스가 생성되면** (배포가 시작되는 화면)
2. 우측 상단 또는 Settings 아이콘 클릭
3. **Settings** 탭 클릭
4. **Root Directory** 섹션 찾기
5. 입력란에 `functions` 입력
6. **Save** 또는 **Update** 버튼 클릭

> **참고**: Root Directory를 설정하면 Railway가 `functions` 폴더를 루트로 인식합니다.

### 4-3. 배포 재시작

Root Directory를 변경했으면 배포를 다시 시작해야 합니다:
- 상단의 **"Redeploy"** 버튼 클릭
- 또는 **"Deploy"** 버튼 클릭

---

## 5단계: 환경 변수 설정

### 5-1. Settings로 이동

1. 서비스 페이지에서 **Settings** 탭 클릭
2. 또는 좌측 메뉴에서 **Variables** 클릭

### 5-2. 환경 변수 추가

**Variables** 섹션에서:

1. **"New Variable"** 또는 **"+"** 버튼 클릭
2. 다음 변수들을 하나씩 추가:

   **변수 1:**
   - Name: `PORT`
   - Value: `5001`
   - **Add** 클릭

   **변수 2:**
   - Name: `GOOGLE_APPLICATION_CREDENTIALS`
   - Value: `/app/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json`
   - **Add** 클릭

> **참고**: `/app/`은 Railway의 기본 앱 디렉토리입니다.

---

## 6단계: Firebase 서비스 계정 키 파일 업로드

### 6-1. 파일 위치 확인

프로젝트 루트에 있는 Firebase 서비스 계정 키 파일을 찾으세요:
- 파일명: `budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json`
- 위치: `/Volumes/Samsung USB/budget_management_anti/`

### 6-2. Railway에 파일 업로드

Railway에서 파일을 업로드하는 방법:

**방법 A: Settings > Files 탭 (권장)**

1. Settings 탭에서 **Files** 섹션 찾기
2. **"Upload File"** 또는 **"+"** 버튼 클릭
3. 파일 선택: `budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json`
4. 업로드 완료

**방법 B: 환경 변수로 직접 입력 (대안)**

만약 Files 탭이 없다면:

1. Settings > Variables로 이동
2. 새 변수 추가:
   - Name: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - Value: JSON 파일의 전체 내용을 복사하여 붙여넣기
3. `main.py`에서 환경 변수를 읽도록 수정 필요 (복잡함)

**방법 C: GitHub에 파일 추가 (가장 간단)**

1. 프로젝트를 GitHub에 푸시
2. `functions` 폴더에 서비스 계정 키 파일 추가
3. Railway가 자동으로 파일을 인식

> **주의**: GitHub에 민감한 파일을 올리면 안 됩니다! `.gitignore`에 추가해야 합니다.

---

## 7단계: 도메인 생성 및 URL 확인

### 7-1. Networking 설정

1. Settings 탭에서 **Networking** 섹션 찾기
2. 또는 좌측 메뉴에서 **Networking** 클릭

### 7-2. 도메인 생성

1. **"Generate Domain"** 버튼 클릭
2. Railway가 자동으로 도메인 생성 (예: `your-app.railway.app`)
3. 생성된 URL 복사

### 7-3. URL 확인

생성된 URL은 다음과 같은 형식입니다:
- `https://your-app-name.railway.app`
- 또는 `https://your-app-name.up.railway.app`

이 URL을 복사해두세요! 프론트엔드 설정에 필요합니다.

---

## 8단계: 배포 확인

### 8-1. 배포 상태 확인

1. 서비스 페이지의 **Deployments** 탭 확인
2. **"Building"** 또는 **"Deploying"** 상태 확인
3. 완료되면 **"Active"** 상태로 변경됨

### 8-2. 로그 확인

1. **Logs** 탭 클릭
2. 다음 메시지가 보이면 성공:
   ```
   ✅ Firebase 초기화 성공
   ✅ Firestore 초기화 성공
   * Running on http://0.0.0.0:5001
   ```

### 8-3. Health Check 테스트

브라우저에서 다음 URL 접속:
```
https://your-app.railway.app/health
```

다음과 같은 응답이 오면 성공:
```json
{"status":"ok"}
```

---

## 문제 해결

### Root Directory를 찾을 수 없어요

- Settings > General 섹션 확인
- 또는 서비스 이름 옆의 **"..."** 메뉴에서 Settings 확인

### Files 탭이 없어요

- Railway의 무료 플랜에서는 Files 탭이 없을 수 있습니다
- 대신 GitHub에 파일을 추가하고 `.gitignore`에서 제외하는 방법 사용
- 또는 환경 변수로 JSON 내용을 직접 입력 (복잡함)

### 배포가 실패해요

1. **Logs 탭 확인**
   - 오류 메시지 확인
   - `requirements.txt` 파일이 있는지 확인
   - Python 버전 확인

2. **환경 변수 확인**
   - 모든 변수가 올바르게 설정되었는지 확인
   - 변수 이름에 오타가 없는지 확인

3. **Root Directory 확인**
   - `functions`로 설정되었는지 확인

### Health Check가 실패해요

1. **서비스가 실행 중인지 확인**
   - Deployments 탭에서 Active 상태 확인

2. **포트 확인**
   - Railway는 자동으로 포트를 할당합니다
   - `PORT` 환경 변수는 보통 설정하지 않아도 됩니다
   - `main.py`에서 `os.environ.get('PORT', 5001)`로 처리됨

---

## 다음 단계

백엔드 배포가 완료되면:

1. 생성된 Railway URL 복사
2. 프론트엔드 `.env.production` 파일에 `REACT_APP_API_URL` 설정
3. 프론트엔드 배포 진행

자세한 내용은 `NEXT_STEPS_DEPLOY.md` 참고하세요.

