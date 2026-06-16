# TASK — web (apps/web 프론트엔드)

> React + TypeScript + Vite + Tailwind PWA. UI/페이지/컴포넌트/클라이언트 로직.
> 상태: `[ ]` 미시작 · `[~]` 진행 중 · `[x]` 완료. 세부는 [todos/web.md](../todos/web.md).

---

## Phase 1 — 웹 MVP

- [x] React + TypeScript 초기화 — Vite + React + TS + Tailwind 세팅
- [x] 카카오 로그인 (프론트) — SDK 버튼/액세스 토큰 수신, `signInWithCustomToken`, Auth 상태 관리 + 라우트 보호
- [x] 공통 UI / 레이아웃 — 사이드바 + React Router, 2단 패널, 공통 컴포넌트
- [x] 알람 그룹 관리 — CRUD, 토글 ON/OFF, 기타 그룹 고정
- [x] 알람 생성 및 관리 — CRUD, 그룹 배정 (`AlarmCard`, `AlarmModal`)
- [x] 빠른 알람 (자연어) — chrono-node 시간 인식 + 알람 생성
- [x] 메모 작성 및 관리 — CRUD, 위치 자동 태깅, 원문/AI 정리 토글 UI
- [x] 홈 화면 — 레이아웃(최근 기록/오늘 요약/다음 알람) + 기록 입력창(수동 분류)
- [x] 캘린더 — 월간/주간 뷰, 알람 연동 일정 표시
- [x] 휴지통 — UI, 삭제/복원/영구삭제, 보관 기간 표시
- [ ] 웹 알람 발생 — Firestore 리스너 + Web Audio API + 모달 (백엔드 연동 단계)
- [ ] Service Worker 등록 — PWA 백그라운드 알람 수신 (백엔드 연동 단계)

## 메모 탭 개선 (완료, 세부는 [todos/web.md](../todos/web.md))

- [x] 상세 패널 인라인 편집 + 원문/AI 토글 이동 + AI 수정 저장 (신규도 패널)
- [x] 카드 우클릭 메뉴 — 삭제 + 고정(최대 3)
- [x] 1-스텝 되돌리기 (풀 버전 히스토리는 Phase 2)

## Phase 2 — AI / 기능 백엔드 연동 (프론트 와이어링)

- [ ] 홈 자연어 입력 → AI 분류 결과 연결
- [ ] 메모 AI 정리 / 알람 제안 실제 연결
- [ ] 나중에 알려줘 — 페이지 백엔드 연동
- [ ] 언젠가 리스트 — 페이지 백엔드 연동
- [ ] 기기 활성 상태(isActive) 보고
