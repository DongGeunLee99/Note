# LOG_CODE

> 수정 작업 시 변경된 실제 코드 기록. 최신 내역이 위에 위치.
> 형식: 날짜 · 파일 경로 · 변경 내용 (before → after 또는 추가 코드)

---

## 2026-08-14 (5)

### · 캘린더 토글 버튼 색 침범 수정

---

#### `apps/web/src/styles/calendar.css`

```css
/* before */
.rbc-toolbar button.rbc-active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
  box-shadow: none;
}

/* after — 활성 버튼을 이웃 버튼의 겹친 테두리 위로 그려지게 */
.rbc-toolbar button.rbc-active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
  box-shadow: none;
  position: relative;
  z-index: 1;
}
```

---

## 2026-08-14 (4)

### · 메모 상세 모달 재설계

---

#### `apps/web/src/stores/useMemoStore.ts`

```ts
// before — history 하나만, 스냅샷 범위도 title/body/aiSummary뿐
history: { title: string; body: string; aiSummary: string | null } | null

undoMemo: (memoId) => {
  const h = m.history
  updateMemo(uid, memoId, { title: h.title, body: h.body, aiSummary: h.aiSummary, aiSummaryEdited: false })
  patchMemo(memoId, { history: null })
},

// after — location/aiProcessed/aiSummaryBody까지 포함한 스냅샷 + future(redo) 추가
interface MemoSnapshot {
  title: string
  body: string
  location: MemoLocation
  aiSummary: string | null
  aiProcessed: boolean
  aiSummaryBody: string | null
}
history: MemoSnapshot | null
future: MemoSnapshot | null   // 되돌리기 직전 상태 (다시하기용)

undoMemo: (memoId) => {
  const h = m.history
  updateMemo(uid, memoId, {
    title: h.title, body: h.body, location: h.location,
    aiSummary: h.aiSummary, aiProcessed: h.aiProcessed, aiSummaryBody: h.aiSummaryBody,
    aiSummaryEdited: false,
  })
  patchMemo(memoId, { history: null, future: snapshotOf(m) })
},

redoMemo: (memoId) => {
  const f = m.future
  updateMemo(uid, memoId, {
    title: f.title, body: f.body, location: f.location,
    aiSummary: f.aiSummary, aiProcessed: f.aiProcessed, aiSummaryBody: f.aiSummaryBody,
    aiSummaryEdited: false,
  })
  patchMemo(memoId, { future: null, history: snapshotOf(m) })
},
```

`runAi`도 실행 직전에 동일한 `snapshotOf` + `future: null`을 남기도록 변경 — AI 분석/재분석도 되돌리기 대상에 포함.

---

#### `apps/web/src/components/common/AiToggleButton.tsx`

```tsx
// before — 단순 원문/AI 뷰 토글
<button onClick={() => onModeChange('ai')}>
  {loading ? <Spinner size="sm" /> : null}
  {t('memo.aiSummary')}
</button>

// after — 탭 전환 + 분석 트리거 통합
function handleAiClick() {
  if (mode !== 'ai') {
    onModeChange('ai')
    if (!aiProcessed) onTrigger()
  } else if (aiProcessed) {
    onTrigger()
  }
}
...
<button onClick={handleAiClick} disabled={loading}>
  {loading ? <Spinner size="sm" /> : null}
  {aiProcessed ? t('memo.aiReanalyze') : t('memo.aiSummary')}
</button>
```

---

#### `apps/web/src/components/common/Modal.tsx`

```tsx
// after — 헤더에 커스텀 요소를 꽂을 수 있는 두 자리 추가 (기존 사용처엔 영향 없음)
interface ModalProps {
  ...
  headerExtra?: React.ReactNode   // X 왼쪽 (되돌리기/다시하기 버튼)
  titleContent?: React.ReactNode  // title 텍스트 대신 넣을 커스텀 엘리먼트 (제목 입력창)
}

{titleContent ?? <span className="...">{title}</span>}
<div className="flex items-center gap-1">
  {headerExtra}
  <button onClick={onClose}>...</button>
</div>
```

---

## 2026-08-14 (3)

### · PageHeader 테두리 제거 + title prop 미사용

---

#### `apps/web/src/components/common/PageHeader.tsx`

```tsx
// before
export default function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
      <span className="text-[calc(13px*var(--fs))] font-medium flex-1">{title}</span>
      {children}
    </div>
  )
}

// after
export default function PageHeader({ children }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0">
      <div className="flex-1" />
      {children}
    </div>
  )
}
```

`title` prop은 인터페이스에 남겨뒀지만(호출부 전체 수정 방지) 더 이상 렌더링하지 않음 — 우측 패널 없는 페이지(메모/알람/대시보드)는 아예 `PageHeader` 사용을 그만두고 버튼을 콘텐츠 컨테이너 안으로 옮김.

---

## 2026-06-12 (3)

### · Path Alias `@/` 도입 + 상대경로 일괄 변환

---

#### `apps/web/vite.config.ts`

```ts
// before
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})

// after
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

---

#### `apps/web/tsconfig.app.json`

```jsonc
// after — moduleResolution 아래에 paths 추가 (baseUrl 미사용: TS 6.0 deprecated)
"moduleResolution": "bundler",
"paths": { "@/*": ["./src/*"] },
"allowImportingTsExtensions": true,
```

---

#### `apps/web/src/**` (48개 파일 / 186건)

`../` 상대경로 import만 `@/`로 변환. `./` 형제 import는 유지.

```ts
// before (깊이마다 다름)
import { useLang } from '../../i18n'          // pages/, components/*/
import { tones } from '../theme/tones'

// after (어느 깊이에서든 동일)
import { useLang } from '@/i18n'
import { tones } from '@/theme/tones'
```

---

## 2026-06-12 (2)

### · i18n을 i18next + JSON 구조로 전환

---

#### `apps/web/src/i18n/locales/ko.json` · `en.json` (신규)

함수형 문구는 보간으로, 배열·Record는 객체로:

```jsonc
// ko.json (발췌)
{
  "common": { "count": "{{n}}개" },
  "home": { "recent": "최근 기록 ({{n}})", "aiClassified": "AI가 '{{cat}}'으로 분류했습니다" },
  "trash": { "deleteBody": "\"{{title}}\"을 영구 삭제합니다." },
  "calendar": { "alarmBefore": { "0": "정시", "5": "5분 전", "30": "30분 전" } },
  "time": { "dayNames": ["일","월","화","수","목","금","토"] },
  "notification": { "tips": [{ "step": "1", "label": "...", "desc": "..." }] }
}
```

---

#### `apps/web/src/i18n/index.ts` (신규)

```ts
import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import ko from './locales/ko.json'
import en from './locales/en.json'

export type Language = 'ko' | 'en'

i18n.use(initReactI18next).init({
  resources: { ko: { translation: ko }, en: { translation: en } },
  lng: 'ko',
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
  returnNull: false,
})

export default i18n

export function useLang(): Language {
  return useTranslation().i18n.language as Language
}
```

---

#### `apps/web/src/main.tsx`

```tsx
// import './index.css' 다음 줄에 추가
import './i18n'
```

---

#### `apps/web/tsconfig.app.json`

```jsonc
// compilerOptions에 추가 — JSON import 허용
"resolveJsonModule": true,
```

---

#### `apps/web/src/stores/useSettingsStore.ts`

```ts
// before
setLanguage: (language) => set({ language }),
// ...
{ name: 'smartnote_settings' }

// after
import i18n from '../i18n'
// ...
setLanguage: (language) => {
  i18n.changeLanguage(language)
  set({ language })
},
// ...
{
  name: 'smartnote_settings',
  onRehydrateStorage: () => (state) => {
    if (state?.language) i18n.changeLanguage(state.language)
  },
}
```

---

#### 호출부 전환 패턴 (33개 파일 공통)

```tsx
// before
import { useT, useLang } from '../../i18n/translations'
const t = useT()
<span>{t.alarm.pageTitle}</span>
<span>{t.home.recent(entries.length)}</span>
{t.time.dayNames.map(...)}
<span>{t.category[cat]}</span>

// after
import { useTranslation } from 'react-i18next'
import { useLang } from '../../i18n'        // useLang 쓰는 파일만
const { t } = useTranslation()
<span>{t('alarm.pageTitle')}</span>
<span>{t('home.recent', { n: entries.length })}</span>
{(t('time.dayNames', { returnObjects: true }) as string[]).map(...)}
<span>{t(`category.${cat}`)}</span>
```

---

#### 비훅 유틸 — `utils/formatDate.ts` · `components/calendar/calendarUtils.ts`

```ts
// before
import { translations, type Language } from '../i18n/translations'
const t = translations[lang].time
return t.minutesAgo(diffMin)

// after
import i18n, { type Language } from '../i18n'
const t = i18n.getFixedT(lang)
return t('time.minutesAgo', { n: diffMin })
```

calendarUtils의 rbc `showMore`는 함수 시그니처 유지:
```ts
showMore: (total: number) => t('calendar.showMore', { n: total }),
```

---

#### 삭제

- `apps/web/src/i18n/translations.ts` — 단일 TS 사전 파일 (JSON + i18next로 대체)

---

## 2026-06-12

### · 앱 전체 한/영 다국어(i18n) 적용

---

#### `apps/web/src/i18n/translations.ts` (신규)

```ts
// ko 사전이 기준 스키마. en은 satisfies typeof ko로 구조 강제.
export type Language = 'ko' | 'en'

const ko = { common: { add: '추가', ... }, sidebar: { ... }, ... }
const en = { common: { add: 'Add', ... }, sidebar: { ... }, ... } satisfies typeof ko

export const translations: Record<Language, typeof ko> = { ko, en }

export function useT() {
  const language = useSettingsStore(s => s.language)
  return translations[language]
}

export function useLang(): Language {
  return useSettingsStore(s => s.language)
}
```

---

#### `apps/web/src/stores/useSettingsStore.ts`

```ts
// before
interface SettingsState {
  timeFormat: TimeFormat
  setTimeFormat: (fmt: TimeFormat) => void
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
}

// after
export type AppLanguage = 'ko' | 'en'

interface SettingsState {
  timeFormat: TimeFormat
  setTimeFormat: (fmt: TimeFormat) => void
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  language: AppLanguage          // 추가
  setLanguage: (language: AppLanguage) => void  // 추가
}

// 초기값
language: 'ko',
setLanguage: (language) => set({ language }),
```

---

#### `apps/web/src/utils/formatDate.ts`

```ts
// before: 한국어 하드코딩
export function formatFullDate(date: Date): string { ... }

// after: lang 파라미터 추가, 영어 분기
export function formatFullDate(date: Date, lang: Language = 'ko'): string {
  if (lang === 'en') {
    return date.toLocaleString('en-US', { year: 'numeric', month: 'short', ... })
  }
  // 기존 한국어 포맷
}
```

---

#### `apps/web/src/components/calendar/calendarUtils.ts`

```ts
// before
export function formatSectionDate(date: Date): string { ... }
export function formatToolbarTitle(date: Date, view: CalView): string { ... }

// after: lang 파라미터 추가
export function formatSectionDate(date: Date, lang: Language = 'en'): string {
  if (lang === 'ko') return `${...}월 ${...}일 (${DAY_SHORT_KO[...]})`
  return `${DAY_SHORT[...]}, ${MONTH_SHORT[...]} ${...}`
}
export function formatToolbarTitle(date: Date, view: CalView, lang: Language = 'en'): string { ... }
```

---

#### 컴포넌트 적용 패턴 (33개 파일 공통)

```tsx
// before
<span>알람</span>
<button>취소</button>

// after
import { useT } from '../../i18n/translations'
const t = useT()
<span>{t.sidebar.alarm}</span>
<button>{t.common.cancel}</button>
```

---

## 2026-06-09

### · 캘린더 Week 뷰 — 30분 구분선 제거

---

#### `apps/web/src/styles/calendar.css`

```css
/* 추가 */
/* 홀수 번째 그룹(각 시간대의 앞 30분)의 경계선 제거 → 1시간이 하나의 칸으로 보임 */
.rbc-timeslot-group:nth-child(odd) {
  border-bottom: none;
}
```

---

### · 캘린더 Week 뷰 — 30분 구분선 제거

---

#### `apps/web/src/styles/calendar.css`

```css
/* 추가 */
.rbc-timeslot-group:nth-child(odd) {
  border-bottom: none;
}
```

---

### · 캘린더 Week 뷰 — 드래그 선택 UX 보완

---

#### `apps/web/src/styles/calendar.css`

```css
/* 추가 — 시간 레이블 영역(gutter)은 선택 하이라이트 제외 */
.rbc-time-gutter .rbc-selected-cell {
  background: transparent !important;
  outline: none !important;
}
```

---

### · 캘린더 Week 뷰 — month 뷰 동일 스타일 드래그 선택 구현

---

#### `apps/web/src/styles/calendar.css`

```css
/* 추가 */
.rbc-time-view .rbc-slot-selection {
  display: none;   /* rbc 기본 회색 오버레이 숨김 — slotPropGetter 방식으로 대체 */
}
```

---

#### `apps/web/src/pages/CalendarPage.tsx`

**① import 변경**
```ts
// before
import { useState, useMemo, useCallback } from 'react'
import { format, parse, startOfWeek, getDay, isSameDay } from 'date-fns'

// after
import { useState, useMemo, useCallback, useRef } from 'react'
import { format, parse, startOfWeek, getDay, isSameDay, addDays } from 'date-fns'
```

**② WeekSel 인터페이스 + state/refs 추가**
```ts
interface WeekSel {
  startDay: Date    // midnight
  endDay:   Date    // midnight
  startMin: number  // minutes from midnight, inclusive
  endMin:   number  // minutes from midnight, exclusive
}

const weekContainerRef = useRef<HTMLDivElement>(null)
const isMultiDayRef    = useRef(false)
const dragStartRef     = useRef<{ colIdx: number; minutes: number } | null>(null)
const weekSelRef       = useRef<WeekSel | null>(null)
const [weekSel, setWeekSelState] = useState<WeekSel | null>(null)

// ref와 state 동기 래퍼 (stale closure 방지)
function setWeekSel(v: WeekSel | null) {
  weekSelRef.current = v
  setWeekSelState(v)
}

const weekDates = useMemo(() => {
  const s = startOfWeek(currentDate, { weekStartsOn: 0 })
  return Array.from({ length: 7 }, (_, i) => addDays(s, i))
}, [currentDate])
```

**③ getColAndTime — 마우스 위치 → (열 인덱스, 30분 단위 시간)**
```ts
const getColAndTime = useCallback((e: React.MouseEvent): { colIdx: number; minutes: number } | null => {
  const c = weekContainerRef.current
  if (!c) return null
  const slots = Array.from(c.querySelectorAll<HTMLElement>('.rbc-day-slot'))
  for (let i = 0; i < slots.length; i++) {
    const r = slots[i].getBoundingClientRect()
    if (e.clientX >= r.left && e.clientX <= r.right) {
      const relY   = e.clientY - r.top
      const totalH = slots[i].offsetHeight || r.height
      const mins   = Math.min(23 * 60, Math.max(0, Math.round((relY / totalH) * 1440 / 30) * 30))
      return { colIdx: i, minutes: mins }
    }
  }
  return null
}, [])
```

**④ 마우스 핸들러**
```ts
function handleWeekMouseDown(e: React.MouseEvent) {
  if (view !== 'week') return
  const pos = getColAndTime(e)
  if (!pos) return
  isMultiDayRef.current = false
  setWeekSel(null)
  dragStartRef.current = pos
}

function handleWeekMouseMove(e: React.MouseEvent) {
  if (view !== 'week' || !dragStartRef.current || !(e.buttons & 1)) return
  const cur = getColAndTime(e)
  if (!cur) return
  // 같은 슬롯이면 불필요한 재렌더 방지
  if (cur.colIdx === dragStartRef.current.colIdx && cur.minutes === dragStartRef.current.minutes) return

  if (cur.colIdx !== dragStartRef.current.colIdx) isMultiDayRef.current = true

  const sCol = Math.min(dragStartRef.current.colIdx, cur.colIdx)
  const eCol = Math.max(dragStartRef.current.colIdx, cur.colIdx)
  const sMin = Math.min(dragStartRef.current.minutes, cur.minutes)
  const eMin = Math.min(24 * 60, Math.max(dragStartRef.current.minutes, cur.minutes) + 30)
  setWeekSel({
    startDay: new Date(weekDates[sCol].getFullYear(), weekDates[sCol].getMonth(), weekDates[sCol].getDate()),
    endDay:   new Date(weekDates[eCol].getFullYear(), weekDates[eCol].getMonth(), weekDates[eCol].getDate()),
    startMin: sMin,
    endMin:   eMin,
  })
}

function handleWeekMouseUp() {
  if (view !== 'week') return
  dragStartRef.current  = null
  isMultiDayRef.current = false
  // weekSel은 handleWeekMouseMove에서 이미 최신 값 — 그대로 유지
}
```

**⑤ handleSelecting — 다중 날 모드 중 rbc 단일 선택 취소**
```ts
// before
const handleSelecting = useCallback(({ start, end }) => {
  if (view === 'month') setSelectedSlot({ start, end })
  return true
}, [view])

// after
const handleSelecting = useCallback(({ start, end }) => {
  if (view === 'month') setSelectedSlot({ start, end })
  if (isMultiDayRef.current) return false   // ← 추가
  return true
}, [view])
```

**⑥ slotPropGetter 추가 — 선택 범위 슬롯에 rbc-selected-cell 적용**
```ts
// 추가
const slotPropGetter = useCallback((slotDate: Date) => {
  if (view !== 'week' || !weekSel) return {}
  const slotDay   = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate())
  // 15분 슬롯도 처리: 해당 슬롯이 속한 30분 블록 기준으로 비교
  const slotBlock = Math.floor((slotDate.getHours() * 60 + slotDate.getMinutes()) / 30) * 30
  if (
    slotDay >= weekSel.startDay && slotDay <= weekSel.endDay &&
    slotBlock >= weekSel.startMin && slotBlock < weekSel.endMin
  ) {
    return { className: 'rbc-selected-cell' }
  }
  return {}
}, [view, weekSel])
```

**⑦ Calendar 컴포넌트에 slotPropGetter 추가 + 컨테이너에 ref/핸들러 연결**
```tsx
// Calendar props에 추가
slotPropGetter={slotPropGetter}

// 컨테이너 div
<div
  ref={weekContainerRef}
  className="flex-1 p-3 overflow-hidden border-r"
  style={{ borderColor: 'var(--color-border)' }}
  onContextMenu={e => openCtxMenu(e)}
  onMouseDown={handleWeekMouseDown}
  onMouseMove={handleWeekMouseMove}
  onMouseUp={handleWeekMouseUp}
>
```

---
