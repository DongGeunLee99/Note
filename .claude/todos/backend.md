# TODO — backend

> [tasks/backend.md](../tasks/backend.md)의 Step별 세부. 미완료 위, 완료 아래.

---

## 미완료

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

### Step 0. Firebase 에뮬레이터 셋업 + 카카오 로그인 실동작 검증
- [x] `firebase.json` emulators 블록(auth 9099 / functions 5001 / firestore 8080 / ui 4000)
- [x] `config.ts` — `functions` export + DEV 환경 에뮬레이터 연결(connectAuth/Firestore/FunctionsEmulator)
- [x] `kakaoAuth.ts` — `onCall({ cors: true })`
- [x] 에뮬레이터에서 카카오 로그인 실동작 검증 — Auth `kakao:{id}` + Firestore `users/{uid}` + `alarmGroups`(기타) 생성 확인
- [ ] (배포용 후속) `firebase deploy --only functions` 로 cors 반영한 실제 재배포
