# TODO — web

> [tasks/web.md](../tasks/web.md)의 Step별 세부. 미완료 위, 완료 아래.

---

## 미완료

### Phase 1 잔여 (백엔드 연동 단계)
- [ ] 웹 알람 발생 — Firestore 리스너로 알람 시간 감지, Web Audio API + 모달
- [ ] Service Worker 등록 — PWA 백그라운드 알람 수신 준비

### Phase 2 — AI / 기능 백엔드 연동 (프론트 와이어링)
- [ ] 홈 자연어 입력 → AI 분류 결과 연결
- [ ] 메모 AI 정리 / 알람 제안 실제 연결
- [ ] 나중에 / 언젠가 페이지 백엔드 연동
- [ ] 기기 활성 상태(isActive) 보고

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
