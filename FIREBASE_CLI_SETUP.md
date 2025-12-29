# Firebase CLI 설치 완료

## ✅ 설치 완료

Firebase CLI가 성공적으로 설치되었습니다!

## 다음 단계: Firebase 로그인

온라인 배포를 위해 Firebase에 로그인해야 합니다:

```bash
firebase login
```

이 명령어를 실행하면:
1. 브라우저가 자동으로 열립니다
2. Google 계정으로 로그인하세요
3. 권한을 승인하세요
4. 터미널에 "Success! Logged in as ..." 메시지가 표시됩니다

## 프로젝트 선택

로그인 후 프로젝트를 선택하세요:

```bash
firebase use budget-management-system-72094
```

또는 프로젝트 목록 확인:

```bash
firebase projects:list
```

## 문제 해결

### PATH 설정이 적용되지 않음

터미널을 다시 시작하거나:

```bash
export PATH=~/.npm-global/bin:$PATH
source ~/.zshrc
```

### 여전히 권한 오류가 발생하는 경우

대안으로 `sudo`를 사용할 수 있지만 권장하지 않습니다:

```bash
sudo npm install -g firebase-tools
```

---

## 참고

- Firebase CLI는 이제 `~/.npm-global/bin`에 설치되어 권한 문제 없이 사용할 수 있습니다.
- 새로운 터미널 창을 열면 자동으로 PATH가 설정됩니다.

