# TODO — backend

> [tasks/backend.md](../tasks/backend.md)의 Step별 세부. 미완료 위, 완료 아래.

---

## 미완료

### 카카오 로그인 CORS 수정
- [ ] `functions/src/kakaoAuth.ts` `onCall` 옵션에 `cors: true` 추가 → `firebase deploy --only functions` 재배포
- [ ] (권장) 로컬 개발용 Firebase 에뮬레이터 + `connectFunctionsEmulator` (DEV 환경 한정)

### Phase 2 — AI + Cloud Tasks + 라우팅
- [ ] Llama 호스팅 방식 확정 후 `llamaService` 구현 + `memoAI` Cloud Function
- [ ] 홈 자연어 입력 AI 분류 백엔드
- [ ] `onAlarmWrite` + `triggerAlarm` (Cloud Tasks)
- [ ] `onLaterWrite` + `triggerLater` (Cloud Tasks)
- [ ] 기기 활성 상태 감지 + FCM 기기 라우팅
- [ ] `trashCleaner` — 30일 초과 휴지통 영구 삭제

---

## 완료

### Step 1. 인프라 / 데이터 세팅
- [x] 모노레포 구조 세팅 — pnpm workspace + Turborepo
- [x] Firebase 프로젝트 생성 — Firestore, Auth, Hosting, Functions, FCM (수동)
- [x] 카카오 개발자 앱 생성 — 앱 키 발급 (수동)
- [x] Firebase SDK 연동 — `packages/shared/firebase/config.ts`, `.env`
- [x] 공통 타입 정의 — `packages/shared/types/`
- [x] Firestore 보안 규칙 — `request.auth.uid` 기반

### Step 2. 카카오 인증 (백엔드)
- [x] Cloud Function — 카카오 커스텀 토큰 발급 (`functions/src/kakaoAuth.ts`)
- [x] 신규 사용자 초기화 — `users/{uid}` 문서 + 기타 그룹 자동 생성
