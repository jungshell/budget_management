# Firebase 서비스 계정 키 파일 위치

## ✅ 파일이 있습니다!

파일 위치:
```
/Volumes/Samsung USB/budget_management_anti/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json
```

## 파일 찾는 방법

### Finder에서 찾기:

1. **Finder 열기**
2. **"Samsung USB"** 드라이브로 이동
3. **"budget_management_anti"** 폴더 열기
4. 파일명: `budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json`

### 터미널에서 확인:

```bash
ls -lh "/Volumes/Samsung USB/budget_management_anti/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json"
```

## GitHub에 업로드할 때

이 파일을 GitHub의 `functions` 폴더에 업로드해야 합니다:

1. GitHub 저장소: https://github.com/jungshell/budget_management
2. `functions` 폴더로 이동
3. "Add file" > "Upload files" 클릭
4. 파일 드래그 앤 드롭:
   - `/Volumes/Samsung USB/budget_management_anti/budget-management-system-72094-firebase-adminsdk-fbsvc-4c5d4a936c.json`

## 파일이 정말 없다면

만약 파일을 찾을 수 없다면, Firebase 콘솔에서 새로 다운로드해야 합니다:

1. **Firebase 콘솔 접속:**
   - https://console.firebase.google.com/
   - 프로젝트: `budget-management-system-72094` 선택

2. **프로젝트 설정:**
   - 좌측 메뉴에서 ⚙️ **프로젝트 설정** 클릭
   - **서비스 계정** 탭 선택

3. **새 비공개 키 만들기:**
   - **"새 비공개 키 만들기"** 버튼 클릭
   - **"키 생성"** 클릭
   - JSON 파일이 다운로드됩니다

4. **파일 이름 확인:**
   - 다운로드한 파일명이 다를 수 있습니다
   - 예: `budget-management-system-72094-xxxxx.json`

5. **파일을 프로젝트로 이동:**
   ```bash
   mv ~/Downloads/budget-management-system-72094-*.json "/Volumes/Samsung USB/budget_management_anti/"
   ```

## 참고

- 파일이 숨겨져 있을 수 있습니다 (`.`으로 시작하는 파일)
- 파일 권한 문제일 수 있습니다
- USB 드라이브가 마운트되지 않았을 수 있습니다

