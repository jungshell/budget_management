# 개발 및 배포 워크플로우

## 📋 워크플로우 개요

1. **로컬에서 개발 및 확인** → 로컬 서버 실행
2. **테스트 완료 후** → 사용자가 배포 요청
3. **자동 배포** → 최신 코드를 웹에 배포

---

## 🚀 1단계: 로컬 개발 서버 실행

### 프론트엔드만 실행
```bash
cd "/Volumes/Samsung USB/budget_management_anti/frontend"
npm start
```
→ http://localhost:3000 에서 확인

### 프론트엔드 + 백엔드 함께 실행
```bash
cd "/Volumes/Samsung USB/budget_management_anti"
./start_all_servers.sh
```
→ 프론트엔드: http://localhost:3000
→ 백엔드: http://localhost:5001

---

## ✅ 2단계: 로컬에서 테스트

로컬 서버에서 다음을 확인:
- [ ] 새로 추가한 기능이 정상 작동하는가?
- [ ] UI 변경사항이 올바르게 표시되는가?
- [ ] 오류가 없는가? (브라우저 콘솔 확인)
- [ ] 모든 기능이 정상 작동하는가?

---

## 🌐 3단계: 웹에 배포 (사용자 요청 시)

로컬에서 모든 테스트가 완료되면, 다음 명령어로 배포:

```bash
cd "/Volumes/Samsung USB/budget_management_anti"
export PATH=~/.npm-global/bin:$PATH
./deploy.sh
```

또는 간단하게:
```
"웹에 배포해줘"
```

라고 요청하면 자동으로 배포됩니다!

---

## 📝 배포 전 체크리스트

배포 전에 확인:
- [ ] 로컬에서 모든 기능이 정상 작동하는가?
- [ ] 브라우저 콘솔에 오류가 없는가?
- [ ] `.env.production` 파일이 올바르게 설정되어 있는가?
- [ ] Firebase 설정 값이 입력되어 있는가?

---

## 🔄 배포 프로세스

배포 스크립트가 자동으로 수행하는 작업:
1. 프론트엔드 빌드 (`npm run build`)
2. 빌드 오류 확인
3. Firebase Hosting에 배포 (`firebase deploy --only hosting`)
4. 배포 완료 확인

---

## 🐛 문제 해결

### 빌드 오류 발생 시
- TypeScript 오류 수정
- 의존성 확인: `npm install`
- 빌드 로그 확인

### 배포 후 변경사항이 보이지 않을 때
- 브라우저 캐시 클리어 (Ctrl+Shift+R)
- 시크릿 모드로 접속
- Firebase Hosting CDN 캐시 대기 (몇 분 소요)

---

## 💡 팁

- **로컬 개발**: 빠른 피드백을 위해 로컬 서버 사용
- **배포 전 테스트**: 반드시 로컬에서 모든 기능 테스트
- **점진적 배포**: 큰 변경사항은 작은 단위로 나눠서 배포

---

## 📞 배포 요청 방법

배포가 필요할 때:
1. "웹에 배포해줘" 또는 "배포해줘"라고 요청
2. 자동으로 빌드 및 배포 진행
3. 배포 완료 후 URL 확인

