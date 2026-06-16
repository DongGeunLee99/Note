# TASK — backend (functions/ + Firestore, 3플랫폼 공통)

> 모든 플랫폼이 공유하는 서버/데이터 레이어. `functions/`, Firestore, FCM/기기 라우팅, `packages/shared` 데이터 레이어(타입·CRUD 훅·서비스).
> 상태: `[ ]` 미시작 · `[~]` 진행 중 · `[x]` 완료. 세부는 [todos/backend.md](../todos/backend.md).

---

## Phase 1 — 인프라 / 데이터

- [x] 모노레포 구조 세팅 — pnpm workspace + Turborepo
- [x] Firebase 프로젝트 생성 — Firestore, Auth, Hosting, Functions, FCM 활성화 (수동)
- [x] 카카오 개발자 앱 생성 — 카카오 로그인용 앱 키 발급 (수동)
- [x] Firebase SDK 연동 — `packages/shared/firebase/config.ts` 초기화, `.env`
- [x] 공통 타입 정의 — `packages/shared/types/` (Alarm, AlarmGroup, Memo, Device, Later, Someday)
- [x] Firestore 보안 규칙 — `request.auth.uid` 기반 읽기/쓰기
- [x] Cloud Function — 카카오 커스텀 토큰 발급 (`functions/src/kakaoAuth.ts`)
- [x] 신규 사용자 초기화 — `users/{uid}` 문서 생성 + 기타 그룹 자동 생성
- [ ] 카카오 로그인 CORS 수정 — `onCall`에 `cors: true` + 로컬 에뮬레이터 연결 (localhost 로그인 불가 이슈)

## Phase 2 — AI + Cloud Tasks + 기기 라우팅

- [ ] Llama AI 연동 — `memoAI` Cloud Function + `llamaService` 구현 (호스팅 방식 확정 필요)
- [ ] 홈 자연어 입력 AI 분류 — classify 백엔드 처리
- [ ] 알람 Cloud Tasks — `onAlarmWrite` + `triggerAlarm` (생성/수정/취소 + 발송)
- [ ] 나중에 Cloud Tasks — `onLaterWrite` + `triggerLater`
- [ ] 기기 활성 상태 감지 + 알람 기기 라우팅 — FCM (웹 → Electron → 모바일 우선순위)
- [ ] 휴지통 자동 삭제 스케줄러 — `trashCleaner` (30일 초과 영구 삭제)
