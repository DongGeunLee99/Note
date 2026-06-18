# TODO — backend

> [tasks/backend.md](../tasks/backend.md)의 Step별 세부. 미완료 위, 완료 아래.

---

## 미완료

### 결정됨 — 휴지통에 알람 포함 여부: **제외 유지(A안, 2026-06-18)**
- [x] **A안 확정**: 알람은 휴지통 제외 유지(CLAUDE.md 설계대로). 웹 `TrashPage`에서 알람 탭/통계 제거 완료(→ web.md)
- [ ] 후속: 알람/그룹 삭제 시 `isDeleted:true`로 남는 방치 문서 → `trashCleaner`(Phase 2)가 영구 삭제 청소

### 데이터 레이어 — 나머지 도메인 Firestore 연동 (알람 패턴 복제)
- [ ] 나중에 (`later`) / 언젠가 (`someday`) → 완료 시 휴지통에도 합류 — **MVP 이후로 보류(2026-06-18 결정)**
- [ ] 캘린더 후속: 일정 수정(edit), 삭제 일정의 휴지통 합류 여부(알람과 동일 TBD)

### Phase 2 — AI + Cloud Tasks + 라우팅
- [ ] ~~Llama 호스팅 방식 확정~~ → **결정: Gemini Flash 무료(2026-06-18)**. `llamaService` 구현 + `memoAI` Cloud Function (Cloud Functions에서 호출, 키 서버보관, 사용자별 제한, 규칙 선거름)
  - [ ] **데이터 처리 가이드/고지 문서** 작성 (위치·내용 협의 필요) — 무료등급 학습 사용 고지용
- [ ] 홈 자연어 입력 AI 분류 백엔드
- [ ] `onAlarmWrite` + `triggerAlarm` (Cloud Tasks)
- [ ] `onLaterWrite` + `triggerLater` (Cloud Tasks)
- [ ] 기기 활성 상태 감지 + FCM 기기 라우팅
- [ ] `trashCleaner` — 30일 초과 휴지통 영구 삭제

---

## 완료

### 데이터 레이어 — 캘린더(일정) 기본 Firestore 연동
- [x] `shared/types/calendarEvent.ts` `CalendarEvent`(start/end Timestamp) 신규 + `users/{uid}/events` 컬렉션
- [x] `eventService` — subscribeEvents / createEvent(Date→Timestamp) / softDeleteEvent
- [x] `useCalendarStore` — 가짜 일정(PRESET) 제거, 저장/삭제 Firestore 연결, `useAllEvents` Timestamp→Date 변환
- [x] `AppLayout` 일정 구독 추가
- [x] 검증: 일정 생성/삭제(soft)/다중일/새로고침 유지 확인
- 범위: 반복 일정 없음(기본 한 번짜리). 수정·휴지통 합류는 후속(미완료)

### 데이터 레이어 — 휴지통(메모) Firestore 연동
- [x] `firestoreHelpers.deletedQuery`(isDeleted==true)
- [x] `memoService` — subscribeDeletedMemos / restoreMemo / hardDeleteMemo(실제 deleteDoc)
- [x] 웹 `useTrashStore` — 삭제된 메모 구독 + TrashItem 변환, restore/permanentDelete/emptyAll service 위임
- [x] `AppLayout` 휴지통 구독 추가, `TrashPage` 첫 로딩 스피너
- [x] 검증: 삭제→휴지통 표시 / 복원 / 영구삭제 / 비우기 / D-day 에뮬레이터 실동작 확인
- 범위: 메모만. later/someday는 migrate 시 합류, 알람은 위 TBD

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
