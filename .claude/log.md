# LOG

> 최신 수정 내역이 위에 위치. 형식: 날짜 · 시간 · 내용

---

## 2026-06-12 (4)

### · Path Alias `@/` 도입 + apps/web 상대경로 일괄 변환

> 파일 깊이마다 제각각이던 `../../`, `../` import를 `@/` 별칭으로 통일. 별칭은 번들러(vite)와 타입체커(tsc) 두 곳이 각자 경로를 해석하므로 두 설정을 동기화.

- 설정 2곳
  - `apps/web/vite.config.ts` — `resolve.alias['@'] → ./src` 추가 (번들러 경로 해석)
  - `apps/web/tsconfig.app.json` — `paths: { "@/*": ["./src/*"] }` 추가 (tsc 타입체크 + IDE 점프)
  - TS 6.0이 `baseUrl`을 deprecated 처리 → `baseUrl` 없이 `paths`만 사용(TS 5+ 부터 tsconfig 위치 기준 해석)
- 일괄 변환 — `apps/web/src` 전체 `../` 상대경로 import → `@/` (48개 파일 / 186건)
  - `./` 형제 import(47건)는 변경 이유 없어 유지
  - 임시 codemod 스크립트로 각 파일 위치를 `path.resolve`로 절대 해석 후 치환 → 실행 후 스크립트 삭제
- 별칭은 `@/`로 선택 — 기존 npm 스코프(`@smartnote/shared`, `@tabler/...`)와 충돌 방지
- 검증
  - vite 번들러 빌드 통과 (8,268 모듈 변환, dist 생성) → `@/` 186건 전부 정상 해석 확인
  - 잔여 `../` import 0건
  - baseline 대조: `@/` 모듈 에러는 설정을 뺀 baseline에서만 발생, 설정 있는 빌드에선 0건

### · 확인 필요 (이번 작업과 별개, 사전 존재 타입 에러)
- `tsc -b`는 아래 기존 에러로 미통과 (별칭과 무관, baseline에서도 동일하게 존재 → 손대지 않음)
  - `AuthContext.tsx` `firebase/auth` 모듈 없음 + `ReactNode` type-only import 필요
  - `ToastContext.tsx` `ReactNode` type-only import 필요
  - `main.tsx` / `packages/shared/hooks/useKakaoAuth.ts` `window.Kakao` 타입 미선언
  - `packages/shared/hooks/useAuth.ts` react 타입 선언 못 찾음
  - `DashboardPage.tsx` 미사용 `Legend`, `AlarmGroupModal.tsx` useState 색상 타입 좁힘
- 별도 정리 작업 필요

---

## 2026-06-12 (3)

### · CLAUDE.md 역할 분배 + 정합성 정리

> 비대해진 CLAUDE.md(408줄)를 역할별로 분리하고, 「상세 문서 위치」 섹션의 실제 파일 불일치를 수정.

- `.claude/rules/` 폴더 신설 — 규칙 문서 분리 보관
  - `행동지침.md` 신규 — 행동 지침 1~6 전체 이동. CLAUDE.md에서 `@.claude/rules/행동지침.md`로 자동 로드
  - `네이밍컨벤션.md` 신규 — 파일·코드·함수 네이밍 + 플랫폼별 규칙 전체 이동. CLAUDE.md에서 링크로 참조(필요시 로드)
- `CLAUDE.md` 수정
  - 행동지침 블록 → `@import` 한 줄로 대체
  - 네이밍 블록 → 링크로 대체
  - 분량 408줄 → 222줄 (내용은 잘라낸 것이 아니라 이동 — 손실 없음)
  - 「상세 문서 위치」 정합성 수정:
    - `smartnote_wireframe_v2.html` → `SmartNote_와이어프레임.html` (실제 파일명으로 정정)
    - `SmartNote_흐름도_통합.md` 제거 (실존하지 않던 참조)
    - `SmartNote_시스템흐름도_v0.1.md` 추가 (실존하나 목록 누락분)
  - 「작업 운영 파일」 섹션 신설 — `task.md`/`todo.md`/`log.md`/`log_code.md` 역할 + `rules/` 폴더 정의
- 검증: `.claude/docs/` 실제 파일(10개 + mmd 2개)이 CLAUDE.md 목록과 1:1 대응(불일치 0), rules 2개 파일 실제 존재

### · 확인 필요 (미검증)
- `@import`가 **한글 경로(`행동지침.md`)에서 동작하는지** 미확인 — 다음 세션 CLAUDE.md 로드 시점에서만 확정 가능한 런타임 동작
- 새 세션에서 행동지침 자동 적용 여부 확인 → 한글 경로를 못 읽으면 파일명을 영문(`work-guidelines.md` 등)으로 교체 필요

---

## 2026-06-12 (2)

### · i18n을 i18next + JSON 구조로 전환 (이전 단일 TS 파일 방식 대체)

> 같은 날 적용한 `translations.ts`(단일 TS 객체) 방식을 라이브러리 기반으로 마이그레이션. 사전을 한/영 JSON으로 분리하고 표준 `useTranslation()` 패턴 채택.

- `pnpm --filter @smartnote/web add i18next react-i18next`
- `apps/web/src/i18n/locales/ko.json`, `en.json` 신규 — 문구 사전을 한/영 JSON으로 분리
  - 함수형 문구는 `{{n}}`·`{{cat}}`·`{{label}}`·`{{title}}` 보간으로 변환
  - 배열(`time.dayNames`, `dashboard.timeSlots`, `notification.tips`)·Record(`category`, `someday.categoryNames`, `calendar.alarmBefore`)는 JSON 객체로 유지
- `apps/web/src/i18n/index.ts` 신규 — i18next 초기화 + `Language` 타입 + `useLang()` 훅
  - `interpolation.escapeValue: false` (React가 XSS 방어), `fallbackLng: 'ko'`
- `apps/web/src/main.tsx` — `import './i18n'` 추가
- `apps/web/tsconfig.app.json` — `resolveJsonModule: true` 추가 (JSON import 허용)
- `stores/useSettingsStore.ts` — `setLanguage`·`onRehydrateStorage`에서 `i18n.changeLanguage` 동기화 (language는 여전히 persist의 source of truth)
- 전 페이지·컴포넌트 33개 호출부 전환:
  - `const t = useT()` → `const { t } = useTranslation()`
  - `t.x.y` → `t('x.y')`, `t.x.y(n)` → `t('x.y', { n })`
  - 배열 → `t('x.y', { returnObjects: true }) as T[]`, 동적 키 → `` t(`category.${k}`) ``
- 비훅 유틸 `utils/formatDate.ts`·`components/calendar/calendarUtils.ts` — `translations[lang]` → `i18n.getFixedT(lang)`
- `apps/web/src/i18n/translations.ts` 삭제
- 검증: `tsc -b` 기준 i18n 관련 타입 에러 0. 잔존 에러(firebase 미설치, react 타입 선언, window.Kakao, GROUP_COLORS as const, 미사용 import)는 전부 기존 빌드 이슈
- 미적용 잔여(DashboardPage·LoginPage·ConfirmModal·HomeRightPanel 목업)는 그대로 — 사전 키는 준비됨

---

## 2026-06-12

### · 앱 전체 한/영 다국어(i18n) 적용

- `apps/web/src/i18n/translations.ts` 신규 — ko/en 두 객체를 단일 TS 파일로 관리
  - `satisfies typeof ko`로 en이 ko와 구조 동일함을 타입 레벨에서 강제
  - 섹션: common / sidebar / category / home / alarm / memo / calendar / later / someday / trash / settings / login / dashboard / time / notification
  - 저장 값(카테고리 '일정', '여행' 등)은 한글 유지 → 표시 시 매핑
  - `useT()` 훅 — 현재 언어 사전 반환 / `useLang()` 훅 — 언어 코드 반환
- `stores/useSettingsStore.ts` — `language: AppLanguage` 필드 + `setLanguage` 액션 추가 (persist로 localStorage 유지)
- `pages/SettingsPage.tsx` — 언어 선택 UI 추가 (한국어 / English)
- 전 페이지·컴포넌트 33개에 `useT()` 적용 — 하드코딩 문구 제거
- `utils/formatDate.ts` — `lang` 파라미터 추가, 영어 시 `toLocaleString('en-US')` 분기
- `components/calendar/calendarUtils.ts` — `formatSectionDate` / `formatToolbarTitle` `lang` 파라미터 추가

### · 미적용 잔여 (추후 작업)
- `DashboardPage.tsx` — 하드코딩 다수 (사전 준비 완료)
- `LoginPage.tsx` — 3곳 하드코딩
- `ConfirmModal.tsx` — "취소" 1곳
- `HomeRightPanel.tsx` — 목업 "오전 7:30 / 기상 · 직장" 문구

---

## 2026-06-10 (6)

### · QC 시나리오 문서 신설
- `.claude/docs/SmartNote_QC시나리오_v0.1.md` 생성 — Phase 1 웹 MVP 수동 검수용
  - 공통/설정/홈/대시보드/알람/메모/캘린더/나중에/언젠가/휴지통 10개 영역 + 리팩터링 회귀 체크 4건 (총 50여 케이스)
  - AI 분류·알람 감지는 목업 정규식 기준 입력 예시 명시 (예: 알람 분류 테스트 시 `\d+시` 표현 회피)
  - 알려진 이슈(vite build, 새로고침 초기화)는 QC 실패 대상에서 제외 명시
- `CLAUDE.md` 상세 문서 위치 목록에 추가

## 2026-06-10 (5)

### · 페이지 전역 상태 Zustand 마이그레이션 + 공통 컴포넌트 추출 (기록 누락분 보충)
> 토큰 한도로 세션이 중단되어 기록되지 못한 작업. 코드는 모두 적용 완료 (tsc 통과, dev 서버 정상 확인).

- `stores/` 6개 신규 — `useAlarmStore`, `useMemoStore`, `useLaterStore`, `useSomedayStore`, `useTrashStore`, `useHomeStore`
  - 각 페이지가 들고 있던 로컬 useState/목업 데이터를 페이지별 스토어로 이동
- `mocks/mockData.ts` 신규 — Phase 1 목업 데이터 중앙화 (스토어 초기값). Phase 2에서 Firestore 연동 시 이 파일 참조만 제거
- `services/llamaService.ts` 신규 — AI 분류·시간 감지 목업 (chrono-node). Phase 2에서 실제 Llama 호출로 교체하는 지점
- `services/notificationService.ts` 신규 — OS 알림 권한 요청/발송 래퍼
- `utils/formatDate.ts` · `utils/id.ts` 신규 — 페이지마다 중복 구현하던 날짜 표시/로컬 ID 생성 유틸 통합
- `theme/tones.ts` 신규 — 배지·아이콘·칩 공용 톤 팔레트 (컴포넌트 내 hex 직접 사용 제거)
- 공통 컴포넌트 7개 신규 — `PageHeader`, `EmptyState`, `PillButton`, `StatCards`, `SectionLabel`, `Divider`, `ConfirmModal` → 전 페이지 적용
- `HomePage` 분리 → `components/home/` (`QuickInput`, `HomeRightPanel`, `RecentEntryList`, `categoryConfig`)
- `hooks/useWeekDragSelect.ts` 신규 — WeekView 드래그 선택 로직을 훅으로 분리
- `types/localItems.ts` 신규 — Later/Someday/Trash/RecentEntry 로컬 타입
- 페이지 슬림화: Alarm/Memo/Later/Someday/Trash/Home 전체 약 −1,240줄 / +740줄

### · 알려진 이슈 (미해결)
- `vite build` 실패 — `packages/shared/hooks/useAuth.ts`의 `react` import를 resolve 못 함
  - 원인: `packages/shared/package.json`에 react 의존성(peerDependency) 미선언. **이번 작업과 무관한 기존 문제** (dev 서버는 정상)

## 2026-06-10 (4)

### · 캘린더 Week 뷰 — 1시간 격자선 복구 + 30분 구분선 올바르게 제거
- `calendar.css` — `.rbc-timeslot-group:nth-child(odd) { border-bottom: none }` 제거
  - 원인: rbc 기본 레이아웃은 그룹 1개 = 1시간. `nth-child(odd)`가 홀수 시간(1:00, 3:00...) 선을 제거해 2시간 간격으로 보였음
- `calendar.css` — `.rbc-day-slot .rbc-time-slot { border-top: none }` 추가
  - 올바른 타겟: 그룹 내 두 번째 sub-slot의 `border-top`이 실제 30분 흐린 구분선
  - `.rbc-day-slot` 범위로 제한해 gutter 레이블에 영향 없음

## 2026-06-10 (3)

### · 캘린더 Week 뷰 — 드래그 선택 gutter 제외 + 하단 테두리 수정
- `WeekView.tsx` — `slotPropGetter` 리팩터
  - inline `style` 제거 → `className`만 반환 (`rbc-week-sel`, `-top`, `-btm`, `-left`, `-right`)
  - `isBottom` 로직: `slotMin + 15 >= endMin` → `slotBlock === endMin - 30` (`rbc-week-sel-btm` 클래스)
- `calendar.css` — Week 뷰 선택 CSS 추가
  - CSS 커스텀 프로퍼티(`--ws-t/b/l/r`)로 side별 shadow 조합
  - `.rbc-week-sel-btm:last-child` — `:last-child`로 sub-slot 개수 무관하게 마지막 슬롯에만 하단 shadow 적용
  - `.rbc-time-gutter .rbc-week-sel { background: transparent; box-shadow: none }` — gutter 영역 하이라이트 제외

## 2026-06-10 (2)

### · 캘린더 Week 뷰 — 드래그 선택 UI 개선 (외곽선만 표시)
- `WeekView.tsx` — `slotPropGetter` 수정
  - 기존: 각 셀에 `rbc-selected-cell` 클래스 → 격자 모양
  - 변경: `box-shadow: inset`으로 선택 범위의 외곽선만 그림 (상/하/좌/우 경계 감지)
  - 내부 배경색 유지, 내부 격자선 없음

## 2026-06-10

### · Zustand 도입 + 캘린더 뷰 모듈화
- `pnpm add zustand` — zustand v5 설치
- `stores/useSettingsStore.ts` 신규 — SettingsContext 대체 (persist 미들웨어로 localStorage 연동)
- `stores/useCalendarStore.ts` 신규 — CalendarPage 상태 전체 이동, `useAllEvents` 파생 훅 포함
- `components/calendar/MonthView.tsx` 신규 — 월 뷰 로직 분리
- `components/calendar/WeekView.tsx` 신규 — 주 뷰 + 드래그 로직 분리
- `components/calendar/calendarUtils.ts` — import 경로 교체, rbcLocalizer/RBC_MESSAGES/getEventProps 추가
- `components/calendar/AgendaItem.tsx` — timeFormat prop 제거, useSettingsStore 직접 사용
- `components/calendar/DayView.tsx` — 모든 props 제거, 스토어 직접 사용
- `components/calendar/CalendarRightPanel.tsx` — 모든 props 제거, 스토어 직접 사용
- `components/alarm/AlarmCard.tsx` / `QuickAlarmInput.tsx` — useSettings → useSettingsStore
- `pages/SettingsPage.tsx` — useSettings → useSettingsStore
- `pages/CalendarPage.tsx` — 344줄 → 62줄로 축소 (뷰 분기 + 모달/컨텍스트메뉴만 담당)
- `App.tsx` — SettingsProvider 제거
- `contexts/SettingsContext.tsx` — 삭제

## 2026-06-09

### · 캘린더 Week 뷰 — 30분 구분선 제거
- `calendar.css` — `.rbc-timeslot-group:nth-child(odd) { border-bottom: none }` 추가
  - 각 시간의 앞 30분 블록(홀수 그룹) 경계선 제거 → 정시 구분선만 유지, 높이 변화 없음

### · 캘린더 Week 뷰 — 30분 구분선 제거 (롤백)
- `calendar.css` — `.rbc-timeslot-group:nth-child(odd) { border-bottom: none }` 추가 후 롤백
  - 사용자 승인 없이 수정한 것으로 원래 상태로 되돌림

### · 캘린더 Week 뷰 — 드래그 선택 UX 보완
- `calendar.css` — `.rbc-time-gutter .rbc-selected-cell` 오버라이드 추가, 시간 레이블 영역 하이라이트 제거

### · 캘린더 Week 뷰 — month 뷰 동일 스타일 드래그 선택 구현
- `WeekSel` 인터페이스 — `{ startDay, endDay, startMin, endMin }` 선택 범위 상태
- `weekSelRef` + `setWeekSel()` — stale closure 방지용 ref/state 동기 래퍼
- `weekDates` (useMemo) — 현재 주 7일 배열, 열 인덱스 → Date 변환
- `getColAndTime()` — 마우스 X → `.rbc-day-slot` 열 인덱스, Y → 30분 단위 시간(분)
- `handleWeekMouseDown/Move/Up` — 드래그 추적, 동일 슬롯 반복 업데이트 방지
- `isMultiDayRef` — 다중 열 감지 시 `onSelecting` 에서 `false` 반환해 rbc 단일 선택 취소
- `slotPropGetter` — 선택 범위 슬롯에 `rbc-selected-cell` 적용 (month 뷰와 동일 파란 배경+테두리)
- `calendar.css` — `.rbc-time-view .rbc-slot-selection { display: none }` 추가 (rbc 기본 회색 오버레이 대체)

### · 캘린더 드래그 버그 수정
- 월 뷰 드래그 시 end exclusive(+1일) 문제 보정
- `onSelecting`으로 드래그 중 실시간 하이라이트 적용, 깜빡임 제거
- `.rbc-slot-selection { display: none }` — rbc 기본 오버레이 숨김
- 주 뷰 드래그 커서 깨짐 수정 — `onSelecting`을 월 뷰에서만 동작하도록 제한
- 월 경계(5월 31~6월 X) 드래그 시 `setCurrentDate` 불필요 호출 제거
- 날짜 클릭 → Day 뷰 자동 이동 제거 (`drilldownView={null}`)

### · 캘린더 Workday 기능 제거
- `workDays` 상태, `isWorkDay`, `toggleWorkDay` 제거
- 우측 패널 Workday/Day off 토글 UI 제거
- This Month 통계에서 Workdays, Days off 항목 제거

### · 캘린더 모듈화 — `components/calendar/` 폴더 신설
- `types.ts` — RbcEvent, CalendarEventData, CalView
- `calendarUtils.ts` — 상수, 헬퍼 함수, 프리셋 데이터
- `MiniCalendar.tsx` — 미니 캘린더 그리드
- `AgendaItem.tsx` — 어젠다 이벤트 행
- `CalendarToolbar.tsx` — 툴바 (월/주/일 + 이전/오늘/다음)
- `DayView.tsx` — HalfDayColumn + CustomDayView (AM/PM 분할)
- `DateTimePicker.tsx` — 날짜+시간 선택 드롭다운
- `NewEventModal.tsx` — 이벤트 추가 모달 (자체 상태 관리)
- `CalendarRightPanel.tsx` — 우측 패널 전체
- `CalendarPage.tsx` 706줄 → 190줄로 축소

### · 캘린더 일정 기능 개편 — 알람 중심 → 일정+알람
- 이벤트 모델: `customAlarms` → `CalendarEventData` (start/end/color/hasAlarm)
- 드래그 → 우클릭 → "New Event" → 모달 플로우
- NewEventModal: Title / Color / Start / End / Alarm 토글 / 알림 시간
- 우클릭 컨텍스트 메뉴 (월/주/일 뷰 + Day 뷰 시간 슬롯)
- 어젠다 이벤트에 알람 아이콘 표시

### · 설정 페이지 신설 — 시간 형식 (12h/24h)
- `SettingsContext.tsx` 생성 — localStorage 기반 설정 관리
- `SettingsPage.tsx` 생성 — 24-hour / 12-hour 선택 UI
- `App.tsx` — SettingsProvider 추가, `/settings` 라우트 추가
- `localAlarm.ts` `formatTime` — `fmt` 파라미터 추가
- 적용 범위: AlarmCard, QuickAlarmInput, CalendarPage (어젠다/Day뷰)
- DB 스키마 `settings.timeFormat` 추가

### · 캘린더 UX 전면 개편 — 참고 이미지 기반
- 우측 패널: MiniCalendar + TODAY/TOMORROW/THIS WEEK 어젠다 섹션
- 이벤트 색상: 그룹별 구분 (직장 파랑, 건강 주황, 기타 보라)
- Day 뷰: AM/PM 두 컬럼 분할 레이아웃
- 툴바: `‹ 오늘 ›` 순서 수정 + Month/Week/Day 뷰 전환 버튼
- 전체 레이블 영어로 통일
- Today 버튼 클릭 시 selectedDate도 오늘로 초기화

### · ResizableRightPanel 공통 컴포넌트 생성
- 드래그로 우측 패널 너비 조절
- localStorage에 너비 저장 (탭 이동·새로고침 유지)
- 모든 우측 패널 보유 페이지 적용 (홈·메모·알람·나중에·언젠가·캘린더·휴지통)
- DB 스키마 `settings.rightPanelWidth` 추가

### · 홈 — 알림 테스트 기능 추가
- OS 알림 권한 요청 + 테스트 발송
- `?` 버튼 — 알림 안 울릴 때 3단계 체크리스트 팝오버

### · 백엔드 설계 변경 — Cloud Tasks 방식으로 전환
- `alarmScheduler` (매분 폴링) → `onAlarmWrite` + `triggerAlarm` (Cloud Tasks)
- `laterScheduler` (매분 폴링) → `onLaterWrite` + `triggerLater` (Cloud Tasks)
- API명세서 v0.1 → v0.2 업데이트
- 아키텍처가이드, CLAUDE.md, 작업태스크 functions/ 목록 업데이트

### · 문서 — OS 알림 방식 통일
- 웹 알람: 앱 내 모달 방식 → Web Notification API (OS 알림)로 변경
- 아키텍처가이드, API명세서 반영

---

## 2026-05-29

### 17:00 · 문서 정리 — CLAUDE.md 최신화
- 상세 문서 위치 섹션에 `smartnote_wireframe_v2.html` 추가
- `.claude/docs/mmd/` 폴더 및 mmd 파일 목록 추가

### 16:30 · Mermaid 흐름도 — 유저플로우 .mmd 파일 생성
- `.claude/docs/mmd/SmartNote_유저플로우_v0.2.mmd` 생성
- Flow A~I (9개) 전체를 단일 `flowchart TD` + `subgraph` 구조로 통합

### 16:00 · Mermaid 흐름도 — 서비스흐름도 .mmd 파일 생성
- `.claude/docs/mmd/SmartNote_서비스흐름도_v0.2.mmd` 생성
- Flow A~I (9개) 전체를 단일 `flowchart TD` + `subgraph` 구조로 통합
- `.md` 파일의 Markdown + mermaid 코드블록 방식에서 순수 `.mmd` 포맷으로 변환

### 15:30 · Mermaid 흐름도 — 통합 MD 파일 생성
- `.claude/docs/mmd/SmartNote_흐름도_통합.md` 생성
- 유저플로우 + 서비스흐름도를 기능 11개 섹션으로 묶어 정리

### 15:00 · 문서 폴더 구조 정리
- `.claude/docs/mmd/` 폴더 생성
- 기존 `.mermaid` 파일 2개는 `.claude/docs/`에 원본 유지

### 14:00 · CLAUDE.md 초기 작성
- 프로젝트 개요, 기술 스택, 모노레포 구조, Firestore 스키마, 알람 라우팅, 개발 Phase, 미결 사항 정리
- `.claude/docs/` 전체 문서 분석 후 핵심 내용 요약

### 13:30 · 프로젝트 문서 분석
- `.claude/docs/` 내 10개 문서 전체 검토
- PRD, 아키텍처가이드, DB스키마, API명세서, 작업태스크, 컴포넌트명세, 사용자스토리, 흐름도 파악

### 13:00 · 저장소 초기화
- `CLAUDE.md` 생성 (초기 빈 템플릿)
- `.claude/` 폴더 생성
