# SmartNote 컴포넌트 명세 v0.2

> React + TypeScript 기반 / PascalCase 컴포넌트명 / camelCase Props

---

## 1. 알람 컴포넌트

### `<AlarmGroupList />`
알람 그룹 목록 화면 — 그룹 카드 + 소속 알람 렌더링

| Props | Type | 설명 |
|---|---|---|
| `groups` | `AlarmGroup[]` | 알람 그룹 배열 (Firestore 실시간) |
| `onToggleGroup` | `(id: string) => void` | 그룹 토글 핸들러 |
| `onAddGroup` | `() => void` | 그룹 추가 버튼 핸들러 |
| `onEditGroup` | `(id: string) => void` | 그룹 편집 핸들러 |

| State/Variant | 설명 |
|---|---|
| `default` | 그룹 카드 + 소속 알람 리스트 렌더링 |
| `empty` | 그룹 없음 — 추가 안내 표시 |
| `loading` | Skeleton UI 표시 |

> 그룹이 OFF 상태이면 알람 카드에 `opacity: 0.35` 적용. 기타 그룹은 목록 최하단 고정.

---

### `<AlarmGroupCard />`
개별 그룹 카드 — 이름, 알람 수, 토글 버튼

| Props | Type | 설명 |
|---|---|---|
| `group` | `AlarmGroup` | 그룹 데이터 |
| `onToggle` | `() => void` | 토글 ON/OFF (stopPropagation 처리됨) |
| `onEdit` | `() => void` | 카드 클릭 시 편집 모달 열기 |

| State | 설명 |
|---|---|
| `enabled` | 토글 ON — 정상 색상 |
| `disabled` | 토글 OFF — dimmed (opacity 0.35) |
| `default-group` | isDefault=true — 편집 모달 내 삭제 버튼 숨김 |

> 카드 전체 클릭 → 편집 모달. 삭제는 편집 모달 푸터 내 버튼으로 처리 (기본 그룹 제외).

---

### `<AlarmCard />`
개별 알람 카드 — 시간, 라벨, 반복, ON/OFF

| Props | Type | 설명 |
|---|---|---|
| `alarm` | `Alarm` | 알람 데이터 |
| `groupEnabled` | `boolean` | 부모 그룹 ON/OFF 상태 |
| `onToggle` | `() => void` | 개별 알람 ON/OFF (stopPropagation 처리됨) |
| `onEdit` | `() => void` | 행 클릭 시 편집 모달 열기 |

| State | 설명 |
|---|---|
| `active` | 알람 ON + 그룹 ON |
| `individual-off` | 알람 자체 OFF |
| `group-off` | 그룹 OFF — dimmed, 클릭 불가 |
| `memo-linked` | sourceMemoId 있음 — 메모 연동 아이콘 |

---

### `<QuickAlarmInput />`
빠른 알람 자연어 입력창

| Props | Type | 설명 |
|---|---|---|
| `onSubmit` | `(parsed: ParsedAlarm) => void` | 파싱 완료 후 저장 핸들러 |
| `placeholder` | `string` | 입력창 placeholder |

| State | 설명 |
|---|---|
| `idle` | 입력 대기 |
| `parsing` | 파싱 중 |
| `preview` | 파싱 결과 미리보기 + 그룹 선택 |
| `error` | 파싱 실패 안내 |

---

## 2. 메모 컴포넌트

### `<MemoList />`
메모 목록 화면

| Props | Type | 설명 |
|---|---|---|
| `memos` | `Memo[]` | 메모 배열 (Firestore 실시간) |
| `onAdd` | `() => void` | 새 메모 작성 |
| `onSelect` | `(id: string) => void` | 메모 상세/편집 이동 |

---

### `<MemoCard />`
메모 목록 카드 — 제목, 미리보기, 위치, 알람 제안 배지

| Props | Type | 설명 |
|---|---|---|
| `memo` | `Memo` | 메모 데이터 |
| `onAlarmConfirm` | `(alarmData) => void` | 알람 제안 추가 핸들러 |
| `onAlarmDismiss` | `(memoId: string) => void` | 알람 제안 취소 핸들러 |
| `onDelete` | `() => void` | 메모 삭제 (휴지통으로) |

| State | 설명 |
|---|---|
| `default` | 원문 미리보기 |
| `ai-ready` | AI 정리 완료 — 토글 버튼 표시 |
| `ai-loading` | AI 처리 중 — 스피너 |
| `alarm-suggested` | 알람 제안 배지 표시 |

---

### `<AiToggleButton />`
원문 / AI 정리 전환 토글 버튼

| Props | Type | 설명 |
|---|---|---|
| `mode` | `'original' \| 'ai'` | 현재 보기 모드 |
| `aiReady` | `boolean` | AI 처리 완료 여부 |
| `onModeChange` | `(mode) => void` | 모드 전환 핸들러 |

| State | 설명 |
|---|---|
| `original-active` | 원문 탭 활성 |
| `ai-active` | AI 정리 탭 활성 |
| `ai-loading` | AI 처리 중 스피너 |
| `ai-disabled` | aiReady=false — AI 탭 비활성 |

---

### `<AlarmSuggestBadge />`
메모에서 감지된 알람 제안 배지

| Props | Type | 설명 |
|---|---|---|
| `detectedAlarm` | `DetectedAlarm` | 감지된 알람 정보 |
| `onConfirm` | `(groupId: string) => void` | 추가 확인 |
| `onDismiss` | `() => void` | 취소 |

| State | 설명 |
|---|---|
| `default` | 알람 추가할까요? + 추가/취소 버튼 |
| `group-select` | 그룹 선택 드롭다운 열림 |
| `confirmed` | 생성 완료 — 2초 후 사라짐 |

---

## 3. 캘린더 컴포넌트

> ⚠️ **실제 구현은 `react-big-calendar` 기반으로 아래와 같이 분리됨.** 상태는 `useCalendarStore`(Zustand)에서 직접 구독하므로 대부분 props가 없습니다(`CalendarPage`는 뷰 분기 + 모달만 담당). 초기 단일 `<CalendarView />` 명세는 폐기됨.

| 컴포넌트 | 역할 |
|---|---|
| `CalendarToolbar` | 월/주/일 전환 + 이전/오늘/다음 |
| `MonthView` | 월 뷰 (드래그 선택) |
| `WeekView` | 주 뷰 (드래그 선택, 시간 격자) |
| `DayView` | 일 뷰 (AM/PM 분할) |
| `MiniCalendar` | 우측 패널 미니 달력 |
| `AgendaItem` | 어젠다 이벤트 행 (알람 아이콘 포함) |
| `NewEventModal` | 이벤트 추가 (Title/Color/Start/End/Alarm) |
| `DateTimePicker` | 날짜+시간 선택 드롭다운 |
| `CalendarRightPanel` | 우측 패널 (미니달력 + 어젠다) |

> 출근일(WorkDayToggle) 기능은 **폐기됨** — 캘린더는 일정/알람만 다룸.

---

## 4. 휴지통 컴포넌트

### `<TrashList />`
휴지통 목록 화면

| Props | Type | 설명 |
|---|---|---|
| `items` | `TrashItem[]` | 삭제된 항목 배열 |
| `onRestore` | `(id: string, type: string) => void` | 복원 핸들러 |
| `onPermanentDelete` | `(id: string, type: string) => void` | 영구 삭제 핸들러 |

| State | 설명 |
|---|---|
| `default` | 삭제된 항목 목록 + 남은 보관 기간 |
| `empty` | 휴지통이 비어있음 |

---

## 5. 공통 컴포넌트

### `<ToggleSwitch />`
ON/OFF 토글 스위치 (공용)

| Props | Type | Default | 설명 |
|---|---|---|---|
| `enabled` | `boolean` | required | 현재 ON/OFF 상태 |
| `onToggle` | `() => void` | required | 토글 핸들러 |
| `disabled` | `boolean` | `false` | 비활성 상태 |
| `size` | `'sm' \| 'md'` | `'md'` | 크기 |

> 낙관적 업데이트 — 클릭 즉시 UI 변경, 실패 시 롤백.

---

### `<Toast />`
토스트 알림 메시지

| Props | Type | 설명 |
|---|---|---|
| `message` | `string` | 표시할 메시지 |
| `type` | `'success' \| 'error' \| 'info'` | 토스트 유형 |
| `duration` | `number` | 표시 시간 (ms, 기본 3000) |

---

### `<Modal />`
공용 모달

| Props | Type | 설명 |
|---|---|---|
| `isOpen` | `boolean` | 모달 표시 여부 |
| `onClose` | `() => void` | 닫기 핸들러 |
| `title` | `string` | 모달 제목 |
| `children` | `ReactNode` | 모달 내용 |

---

## 6. 대시보드 컴포넌트

### `<DashboardPage />`
통계 대시보드 — 요약 스탯 + Recharts 기반 차트 4종

**내부 컴포넌트 (파일 내 정의)**

| 컴포넌트 | 설명 |
|---|---|
| `StatCard` | 단일 수치 강조 카드 (값 + 라벨 + 색상) |
| `ChartCard` | 차트 래퍼 카드 (제목 + 부제목 + children) |
| `ChartTooltip` | Recharts 커스텀 툴팁 (앱 테마 스타일) |

**차트 구성**

| 차트 | 라이브러리 | 데이터 |
|---|---|---|
| 주간 입력 활동량 | `LineChart` | 최근 7일 일별 기록 수 |
| 카테고리 분포 | `PieChart` (donut) | 카테고리별 기록 수 + 중앙 총합 텍스트 |
| 알람 시간대 분포 | `BarChart` | 새벽/오전/오후/저녁 4구간 알람 수 |

> Phase 1은 목업 데이터 사용. Phase 2에서 Firestore 실시간 데이터로 교체 예정.
> 출근일 차트는 출근일 기능 폐기로 제거됨 (현재 스탯 3 + 차트 3).

---

## 7. 실제 구현 컴포넌트 (명세 외 — ✅ 빌드됨)

> 위 1~6은 초기 설계 명세. 아래는 실제 코드에 존재하나 명세에 없던 컴포넌트(2026-06-16 대조).

- **공통(`components/common/`)**: `PageHeader`, `EmptyState`, `PillButton`, `StatCards`, `SectionLabel`, `Divider`, `ConfirmModal`, `ResizableRightPanel`, `ContextMenu`, `Badge`, `Spinner`
- **홈(`components/home/`)**: `QuickInput`, `HomeRightPanel`, `RecentEntryList`, `TodayTimeline`, `UpcomingDeadlines`, `categoryConfig`
- **알람**: `AlarmGroupModal`, `AlarmModal`
- **레이아웃**: `AppLayout`, `Sidebar`(`components/layout/`)
- **캘린더**: 위 3절 표 참조

> 명세에 있었으나 **미구현**: `<AlarmSuggestBadge />`(메모 알람 제안은 `MemoCard` 내부에 인라인).
