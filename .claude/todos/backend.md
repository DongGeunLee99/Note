# TODO — backend

> [tasks/backend.md](../tasks/backend.md)의 Step별 세부. 미완료 위, 완료 아래.

---

## 미완료

### 데이터 레이어 — 나머지 도메인 Firestore 연동 (알람 패턴 복제)
- [ ] 캘린더 (일정) — ⚠️ shared 타입/컬렉션 미정의, 스키마 설계 먼저
- [ ] 나중에 (`later`) / 언젠가 (`someday`)
- [ ] 휴지통 (soft delete 목록 + 복원/영구삭제)

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

### 데이터 레이어 — 타입 통일(B안) + 메모 도메인 연동
- [x] Local* 타입 폐기 → shared 타입 직접 사용(B안). 알람 재전환(매퍼 제거), 폼 입력 DTO
- [x] `shared/types/memo.ts` — `pinnedAt`, `aiSummaryEdited` 추가
- [x] `shared/services/memoService.ts` — subscribe/create(id 반환)/update(부분패치)/softDelete
- [x] 웹 `useMemoStore` — mock 제거 → 구독 + `MemoView`(transient: aiLoading/alarmSuggestion/history). AI 시뮬 결과 Firestore 기록
- [x] `AppLayout` 메모 구독 추가, `MemoPage/List/Card` shared 타입
- [x] 검증: 메모 추가/AI정리/수정/직접수정/고정/삭제(soft) 에뮬레이터 실동작 확인
- 참고: 한국어 알람 감지는 미동작(chrono-node에 ko 로케일 없음) → Phase 2 Llama로 해결 예정

### 데이터 레이어 — 알람 도메인 Firestore 연동 (mock 제거)
- [x] `shared/services/firestoreHelpers.ts` — `userCol`, `activeQuery`(isDeleted==false)
- [x] `shared/services/alarmGroupService.ts` — subscribe/create/update/softDelete
- [x] `shared/services/alarmService.ts` — subscribe/create/update/softDelete (기본값 채움)
- [x] `shared/package.json` exports에 `./services/*` 추가
- [x] 웹 `stores/alarmMappers.ts` — shared↔Local 변환(emoji↔icon), 그룹 정렬
- [x] 웹 `useAlarmStore` mock 제거 → 실시간 구독 + mutation service 위임
- [x] `AppLayout`에서 로그인 uid로 구독 시작/해제
- [x] 검증: 알람/그룹 추가·수정·토글·삭제(soft delete) 에뮬레이터 실동작 확인

### Step 0. Firebase 에뮬레이터 셋업 + 카카오 로그인 실동작 검증
- [x] `firebase.json` emulators 블록(auth 9099 / functions 5001 / firestore 8080 / ui 4000)
- [x] `config.ts` — `functions` export + DEV 환경 에뮬레이터 연결(connectAuth/Firestore/FunctionsEmulator)
- [x] `kakaoAuth.ts` — `onCall({ cors: true })`
- [x] 에뮬레이터에서 카카오 로그인 실동작 검증 — Auth `kakao:{id}` + Firestore `users/{uid}` + `alarmGroups`(기타) 생성 확인
- [ ] (배포용 후속) `firebase deploy --only functions` 로 cors 반영한 실제 재배포
