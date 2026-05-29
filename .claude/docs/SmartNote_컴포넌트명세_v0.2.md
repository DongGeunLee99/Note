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
| `onToggle` | `() => void` | 토글 ON/OFF |
| `onEdit` | `() => void` | 편집 시트 열기 |
| `onDelete` | `() => void` | 그룹 삭제 (기타 그룹 비활성) |

| State | 설명 |
|---|---|
| `enabled` | 토글 ON — 정상 색상 |
| `disabled` | 토글 OFF — dimmed (opacity 0.35) |
| `default-group` | isDefault=true — 삭제 버튼 숨김 |

> 낙관적 업데이트 적용 — 즉시 UI 변경 후 Firestore 반영.

---

### `<AlarmCard />`
개별 알람 카드 — 시간, 라벨, 반복, ON/OFF

| Props | Type | 설명 |
|---|---|---|
| `alarm` | `Alarm` | 알람 데이터 |
| `groupEnabled` | `boolean` | 부모 그룹 ON/OFF 상태 |
| `onToggle` | `() => void` | 개별 알람 ON/OFF |
| `onEdit` | `() => void` | 알람 편집 |
| `onDelete` | `() => void` | 알람 삭제 (휴지통으로) |

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

### `<CalendarView />`
월간 캘린더 전체 뷰

| Props | Type | 설명 |
|---|---|---|
| `year` | `number` | 현재 연도 |
| `month` | `number` | 현재 월 (0~11) |
| `workDays` | `WorkDay[]` | 출근일 배열 |
| `events` | `CalendarEvent[]` | 알람+메모 연동 일정 |
| `onDaySelect` | `(date: Date) => void` | 날짜 탭 핸들러 |
| `onMonthChange` | `(dir: 'prev' \| 'next') => void` | 월 이동 |

---

### `<WorkDayToggle />`
날짜 상세에서 출근/비출근 설정

| Props | Type | 설명 |
|---|---|---|
| `date` | `Date` | 대상 날짜 |
| `isWorkDay` | `boolean` | 현재 출근 여부 |
| `onToggle` | `(date: Date, isWork: boolean) => void` | 토글 핸들러 |

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
