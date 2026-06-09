# LOG

> 최신 수정 내역이 위에 위치. 형식: 날짜 · 시간 · 내용

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
