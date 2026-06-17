# TODO — web

> [tasks/web.md](../tasks/web.md)의 Step별 세부. 미완료 위, 완료 아래.

---

## 미완료

### 휴지통 탭 정리 — 알람/나중에 필터 (휴지통 알람 포함 결정 대기)
- [ ] `TrashPage`의 filter 탭·우측 통계에 `alarm`/`later`가 있으나 현재 항상 0 (목업 잔재). `alarm`은 [backend.md](backend.md) TBD(휴지통 알람 포함 여부) 결정 후 정리, `later`는 Firestore migrate 시 자동으로 채워짐

### 메모 탭 개선 (큐 — "작업하자" 신호 시 일괄 실행)

> 2026-06-16 적재. 모델 변경(`pinnedAt`, `aiSummaryEdited`, 되돌리기용 직전 본문) + 다중 컴포넌트 → **착수 시 행동지침 6번 계획서 먼저**.

**A. 상세 패널 인라인 편집 (지시 1 + 4)**
- [x] 우측 상세 패널: 읽기 → 인라인 편집 전환, 편집용 `MemoEditor` 모달 제거(파일 삭제)
- [x] 신규 메모도 패널에서 작성 (write 버튼 → 빈 메모 패널 열기, 모달 미사용)
- [x] 원문/AI 토글(`AiToggleButton`)을 카드 → 상세 패널로 이동
- [x] AI 정리 텍스트 편집 가능 + 저장 (`updateAiSummary` 액션)
- [x] AI 정리 사용자 수정 시 `aiSummaryEdited` 플래그 → 재분석이 덮어쓰지 않게
- [x] 편집 모드 진입 시 패널 최소 폭 보장(편집 시 minWidth 240)

**B. 카드 우클릭 컨텍스트 메뉴 (지시 3 + 5)**
- [x] 카드 우클릭 → 메뉴(삭제 / 고정·해제), 카드의 휴지통 아이콘 제거
- [x] 메모 고정: `pinnedAt` 추가, 목록 정렬 "고정(핀 시각순) → 일반(작성순)"
- [x] 고정 최대 3개, 4번째 시도 시 차단 + 토스트
- [x] 고정 메모 핀 아이콘 표시

**C. 1-스텝 되돌리기 (지시 2 단계적 대안)**
- [x] 저장 직전 본문 1개 보관 → "되돌리기"로 직전 상태 복원

### 알람 모달 — 요일 프리셋 (큐)

> 2026-06-16 적재. `AlarmModal.tsx` 단일 컴포넌트 + i18n 키. UI: **A안**(프리셋 줄 + 개별 7일 줄).

- [x] 개별 7일 토글 위에 프리셋 줄 추가: `[평일] [주말] [매일]`
- [x] 프리셋 = 세터 (평일=[1~5], 주말=[0,6], 매일=[0~6])
- [x] 현재 `repeatDays`가 프리셋과 정확히 일치하면 해당 프리셋 하이라이트
- [x] i18n 키 추가(ko/en): `alarm.repeatWeekday`·`repeatWeekend`·`repeatEveryday`

### 캘린더 — 일정 내용(설명) 필드 + 우측 패널 표시 (큐)

> 2026-06-16 적재. 모델 변경(`CalendarEventData.description` + `RbcEvent.description`) + 다중 파일 → 착수 시 계획서.

- [x] `CalendarEventData`에 `description` 추가 + `RbcEvent`에도 추가, `useAllEvents`에서 전달
- [x] `NewEventModal`에 내용 textarea 추가 (onSave에 description 포함)
- [x] 우측 패널에 "선택 일정 상세" 영역 신설 — 일정 클릭(그리드+아젠다) 시 `selectedEventId` → 제목·시간·내용 표시
- [x] i18n 키: `fieldDescription`·`descPlaceholder`·`noDescription`

### 캘린더 — 주간 다중일 드래그 → 요일별 개별 일정 (큐)

> 2026-06-16 적재. 사용자 결정: **B안**(여러 날 사각형 드래그 시 각 날짜에 같은 시간대 일정 N개 생성). 드래그→스토어→모달→저장 semantics 변경이라 착수 시 계획서.

- [x] 드래그 선택의 "날짜 목록"(startDay~endDay)을 보존해 스토어로 전달 (`selectedDays`)
- [x] `NewEventModal`: 다중일 선택 시 "N일에 각각 생성" 표시, 시간대는 공통 적용
- [x] 저장 시 선택 일자마다 동일 시간대 일정 1개씩 생성 (`handleSaveEvent` 반복)
- [x] 단일일 드래그는 기존대로 1개 (현재 동작 유지)

### Phase 1 잔여 (백엔드 연동 단계)
- [ ] 웹 알람 발생 — Firestore 리스너로 알람 시간 감지, Web Audio API + 모달
- [ ] Service Worker 등록 — PWA 백그라운드 알람 수신 준비

### Phase 2 — AI / 기능 백엔드 연동 (프론트 와이어링)
- [ ] 홈 자연어 입력 → AI 분류 결과 연결
- [ ] 메모 AI 정리 / 알람 제안 실제 연결
- [ ] 나중에 / 언젠가 페이지 백엔드 연동
- [ ] 기기 활성 상태(isActive) 보고
- [ ] 메모 풀 버전 히스토리 — Firestore `versions` 서브컬렉션 (1-스텝 되돌리기의 확장)

### i18n 잔여 미적용 (사전 키 준비됨)
- [ ] `DashboardPage` · `LoginPage` · `ConfirmModal` · `HomeRightPanel` 목업 문구 i18n 연결

---

## 완료

### Step 1. 웹 세팅
- [x] React + TypeScript 초기화 — `apps/web`에 Vite + React + TS + Tailwind 세팅

### Step 2. 카카오 로그인 (프론트)
- [x] 카카오 SDK 연동 — 로그인 버튼, 액세스 토큰 수신
- [x] `signInWithCustomToken` 처리 — 커스텀 토큰으로 Firebase Auth 로그인
- [x] Auth 상태 관리 — `onAuthStateChanged` 훅, 로그인 필요 라우트 보호 (`useKakaoAuth.ts`)

### Step 3. 공통 UI / 레이아웃
- [x] 사이드바 + React Router 라우팅 — 탭별 라우트 구성
- [x] 2단 패널 레이아웃 — 사이드바 + 메인 + 우측 요약 패널, 반응형
- [x] 공통 컴포넌트 — `ToggleSwitch`, `Badge`, `Modal`, `Toast`, `Spinner`, `AiToggleButton`

### Step 4. 알람 기능
- [x] 알람 그룹 CRUD — 생성/수정/삭제, 기타 그룹 고정 (`AlarmGroupList`, `AlarmGroupCard`)
- [x] 알람 그룹 토글 ON/OFF — 로컬 상태 즉시 업데이트, dimmed UI
- [x] 알람 CRUD — 생성/수정/삭제, 그룹 배정 (`AlarmCard`, `AlarmModal`)
- [x] 빠른 알람 입력 — chrono-node 자연어 파싱 (`QuickAlarmInput`)

### Step 5. 메모 기능
- [x] 메모 CRUD — 작성/수정/삭제, 최신순 목록 (`MemoList`, `MemoCard`, `MemoEditor`)
- [x] 위치 자동 태깅 — Geolocation API + Nominatim 역주소 변환 UI
- [x] 원문/AI 정리 토글 UI — AI 처리 시뮬레이션, 스피너, chrono-node 알람 제안

### Step 6. 캘린더
- [x] 월간 캘린더 뷰 — 그리드, 오늘 강조, 이전/다음 월 이동
- [x] 알람 연동 일정 표시 — dot 표시, 날짜 탭 시 알람 목록

### Step 7. 홈 화면
- [x] 홈 레이아웃 — 최근 기록, 오늘 요약, 다음 알람 패널
- [x] 기록 입력창 (기본) — 텍스트 입력 + 카테고리 수동 선택 저장

### Step 8. 휴지통
- [x] 휴지통 UI — 목록, 남은 보관 기간 표시, 타입별 필터
- [x] 삭제/복원/영구삭제 — 복원, 즉시 영구 삭제(확인 모달), 전체 비우기, D-day

### Path Alias `@/` 적용 (2026-06-12)
- [x] `vite.config.ts` `resolve.alias` + `tsconfig.app.json` `paths` 설정
- [x] `apps/web/src` `../` 상대경로 → `@/` 일괄 변환 (48개 파일 / 186건)
- [x] 검증: vite 빌드 통과(8,268 모듈), 잔여 `../` 0건

### i18n i18next + JSON 전환 (2026-06-12)
- [x] i18next + react-i18next 도입, `locales/ko.json`·`en.json` 분리, 33개 호출부 전환
