# TODO

> 미완료 항목은 위, 완료 항목은 아래. 최신 항목이 각 섹션 상단에 위치.

---

## 미완료

### Step 1. 프로젝트 세팅

- [x] 모노레포 구조 세팅 — pnpm workspace + Turborepo, `apps/web` · `apps/electron` · `apps/mobile` · `packages/shared` 폴더 구성
- [x] Firebase 프로젝트 생성 — Firestore, Auth, Hosting, Functions, FCM 활성화 (수동 작업)
- [x] 카카오 개발자 앱 생성 — 카카오 로그인용 앱 키 발급 (수동 작업)
- [x] React + TypeScript 초기화 — `apps/web`에 Vite + React + TypeScript + Tailwind CSS 세팅
- [x] Firebase SDK 연동 — `packages/shared/firebase/config.ts` 초기화, 환경변수(`.env`) 설정
- [x] 공통 타입 정의 — `packages/shared/types/` (Alarm, AlarmGroup, Memo, Device, Later, Someday)
- [x] Firestore 보안 규칙 — `request.auth.uid` 기반 읽기/쓰기 규칙 작성

### Step 2. 카카오 로그인

- [x] 카카오 SDK 연동 — 카카오 로그인 버튼, 액세스 토큰 수신
- [x] Cloud Function — 카카오 커스텀 토큰 발급 — 카카오 API 사용자 확인 → Firebase Admin 커스텀 토큰 발급 (`functions/src/kakaoAuth.ts`)
- [x] `signInWithCustomToken` 처리 — 커스텀 토큰으로 Firebase Auth 로그인
- [x] Auth 상태 관리 — `onAuthStateChanged` 훅, 로그인 필요 라우트 보호 (`packages/shared/hooks/useKakaoAuth.ts`)
- [x] 신규 사용자 초기화 — `users/{uid}` 문서 생성, 기타 그룹 자동 생성

### Step 3. 공통 UI / 레이아웃

- [ ] 사이드바 + React Router 라우팅 — 탭별 라우트 구성 (`HomePage`, `AlarmPage`, `MemoPage`, `LaterPage`, `SomedayPage`, `CalendarPage`, `TrashPage`)
- [ ] 2단 패널 레이아웃 — 사이드바 + 메인 + 우측 요약 패널, 반응형 대응
- [ ] 공통 컴포넌트 — `ToggleSwitch`, `Badge`, `Modal`, `Toast`, `Spinner`, `AiToggleButton` (`apps/web/src/components/common/`)

### Step 4. 알람 기능

- [ ] 알람 그룹 CRUD — 그룹 생성/수정/삭제, 기타 그룹 고정 (`AlarmGroupList`, `AlarmGroupCard`)
- [ ] 알람 그룹 토글 ON/OFF — Firestore `isEnabled` 즉시 업데이트, dimmed UI
- [ ] 알람 CRUD — 알람 생성/수정/삭제, 그룹 배정, 마지막 소리/진동 저장 (`AlarmCard`)
- [ ] 빠른 알람 입력 — chrono-node 자연어 파싱, 시간 인식 + 알람 생성 (`QuickAlarmInput`)
- [ ] 웹 알람 발생 — Firestore 리스너로 알람 시간 감지, Web Audio API + 모달 (`apps/web/src/alarm/webAlarm.ts`)
- [ ] Service Worker 등록 — PWA 백그라운드 알람 수신 준비 (`service-worker.ts`)

### Step 5. 메모 기능

- [ ] 메모 CRUD — 메모 작성/수정/삭제, 최신순 목록 (`MemoList`, `MemoCard`, `MemoEditor`)
- [ ] 위치 자동 태깅 — Geolocation API 수집, 역주소 변환 후 Firestore 저장
- [ ] 원문/AI 정리 토글 UI — 토글 버튼, AI 처리 중 스피너, 실패 시 재시도 버튼 (`AiToggleButton`) — AI 실제 연결은 Phase 2

### Step 6. 캘린더

- [ ] 월간 캘린더 뷰 — 월간 그리드, 오늘 강조, 이전/다음 월 이동
- [ ] 출근일 설정 — 날짜 탭 → 출근/비출근 토글, `workDays` Firestore 저장
- [ ] 알람 연동 일정 표시 — 알람 있는 날짜 dot 표시, 날짜 탭 시 일정 목록

### Step 7. 홈 화면

- [ ] 홈 레이아웃 — 최근 기록, 오늘 요약, 다음 알람 패널
- [ ] 기록 입력창 (기본) — 텍스트 입력 + 카테고리 수동 선택 저장 (AI 분류는 Phase 2)

### Step 8. 휴지통

- [ ] 휴지통 UI — 목록, 남은 보관 기간 표시
- [ ] 삭제/복원/영구삭제 — `isDeleted` / `deletedAt` 처리, 복원, 즉시 영구 삭제

---

## 미결 사항

- [ ] Llama 호스팅 방식 결정 — Groq / Together AI / Ollama 자체 서버 중 선택
- [ ] 휴지통 적용 범위 확정 — 메모만 / 알람 포함 전체 / 알람 제외 전체
- [ ] 앱 이름 확정 — SmartNote 임시

---

## 완료

<!-- 완료된 항목은 여기 아래에 최신순으로 추가 -->
