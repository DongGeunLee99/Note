# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 행동 지침

> 흔한 LLM 코딩 실수를 줄이기 위한 기본 원칙. 코딩·파일·설정 변경 전 항상 적용한다.
> 전체 내용은 아래 파일로 분리했고, `@import`로 매 세션 자동 로드된다.

@.claude/rules/행동지침.md

---

## 프로젝트 개요

**SmartNote** — 알람·메모·캘린더를 하나로 통합한 개인용 앱 (타겟: 1인 사용자)

핵심 차별점:
- 메모 저장 시 AI가 자동으로 날짜/시간을 감지해 알람을 제안
- 알람을 그룹으로 묶어 ON/OFF 한 번에 관리
- 홈 화면 자연어 입력 → AI가 일정/알람/메모/나중에/언젠가로 자동 분류

---

## 기술 스택

| 영역 | 기술 |
|---|---|
| 웹 프론트 | React + TypeScript + Vite + Tailwind CSS (PWA) |
| 모바일 | React Native + Expo + NativeWind v4 |
| 데스크탑 | Electron (웹 빌드 래핑) |
| 백엔드/DB | Firebase Firestore + Cloud Functions |
| 인증 | 카카오 로그인 → Firebase 커스텀 토큰 |
| AI | Google Gemini (Cloud Functions: `aiSummarize` 메모요약 / `parseDateTime` 날짜파싱) |
| 알람 (웹) | Web Audio API + Service Worker |
| 알람 (Electron) | node-schedule + OS Notification API |
| 알람 (모바일) | FCM (Firebase Cloud Messaging) |
| 모노레포 | pnpm workspace + Turborepo |
| 자연어 시간 파싱 | chrono-node |
| 캘린더 UI | react-big-calendar + date-fns |
| 차트 | Recharts |
| 다국어(i18n) | i18next + react-i18next (한/영/일) |
| 테마 | `data-theme` 5종 (system/light/dark/purple/blue) |

---

## 모노레포 구조

```
smartnote/
├── packages/shared/          ← 3개 플랫폼 공통 (타입, 훅, 서비스, 스토어)
│   ├── types/                ← Alarm, AlarmGroup, Memo, Device, Later, Someday, CalendarEvent
│   ├── hooks/                ← useAuth, useKakaoAuth
│   ├── services/             ← alarmService, alarmGroupService, memoService, eventService,
│   │                            laterService, somedayService, firestoreHelpers, llamaService(Gemini 호출)
│   ├── stores/               ← useAlarmStore, useMemoStore, useLaterStore, useSomedayStore (Zustand, 데이터 공통)
│   └── firebase/config.ts    ← Firebase 초기화 (initFirebase 주입식 — 웹=VITE_*, 모바일=EXPO_PUBLIC_*)
├── apps/web/                 ← React + Vite PWA (웹 전용 스토어: calendar/home/settings/trash는 여기)
├── apps/mobile/              ← React Native + Expo (Phase 4, 진행 중)
├── apps/electron/            ← (Phase 3 예정, 아직 미생성) 웹 빌드 래핑
└── functions/                ← Firebase Cloud Functions
    ├── kakaoAuth.ts          ← 카카오 code→토큰 교환 + Firebase 커스텀 토큰 (kakaoLogin)
    ├── aiSummarize.ts        ← 메모 본문 요약 (Gemini)
    ├── parseDateTime.ts      ← 자연어 → ISO 날짜시간 파싱 (Gemini)
    ├── gemini.ts             ← Gemini 호출 공통 헬퍼
    ├── prompts.ts            ← 시스템 프롬프트
    └── (Phase 2 예정)        onAlarmWrite/triggerAlarm, onLaterWrite/triggerLater, trashCleaner
```

### 의존성 방향 (단방향)

```
packages/shared → apps/web, apps/mobile, functions/
apps/electron   → apps/web 빌드 결과를 loadFile/loadURL로 로드 (import 아님)
```

> `packages/shared`는 `apps/`를 절대 import하지 않는다. 순환 의존성 방지.

---

## Firestore 데이터 구조

모든 데이터는 `users/{uid}` 하위에 위치. `uid` = `kakao:{kakaoId}`

```
users/{uid}
  ├── alarmGroups/{groupId}   isEnabled(토글), isDefault(기타 그룹 삭제 불가)
  ├── alarms/{alarmId}        groupId 참조, sourceType: manual|quickAlarm|memoDetected
  ├── memos/{memoId}          aiSummary, aiProcessed, detectedAlarms[], location
  ├── later/{laterId}         notifyAt, isCompleted, snoozedCount
  ├── someday/{somedayId}     category(여행|배움|구매|기타), aiCategory, isFavorite
  └── devices/{deviceId}      platform(web|electron|mobile), isActive, fcmToken
```

### 공통 규칙
- 모든 컬렉션에 `isDeleted`, `deletedAt` 필드. 조회 시 반드시 `where('isDeleted', '==', false)` 필터 적용
- 삭제 후 30일이 지나면 `trashCleaner` Cloud Function이 자동 영구 삭제 *(Phase 2 예정, 미구현)*
- 타임스탬프는 클라이언트 로컬 시간 기준

---

## 알람 라우팅 우선순위

> ⚠️ **Phase 2 예정 — 아직 미구현.** 현재 웹 알람은 클라이언트 `AlarmScheduler`(포그라운드 티커)로만 동작한다.

(설계) Cloud Function `alarmScheduler`가 매분 실행하며 기기 라우팅:
1. 웹 탭 활성 (`isActive=true`) → Firestore 실시간 트리거로 웹 알람 발생
2. 웹 비활성 + Electron 활성 → Electron FCM
3. 모두 비활성 → 모바일 FCM

---

## 화면 구성

웹: `HomePage`, `DashboardPage`, `AlarmPage`, `MemoPage`, `LaterPage`, `SomedayPage`, `CalendarPage`, `TrashPage`
모바일: 동일 구조, `Screen` suffix

---

## 개발 Phase

| Phase | 목표 |
|---|---|
| Phase 1 | 웹 MVP (알람 그룹/CRUD, 메모, 캘린더, 홈 기본, 휴지통) |
| Phase 2 | Gemini AI 연동, FCM, 기기 라우팅, 나중에/언젠가 |
| Phase 3 | Electron (OS 알람, 트레이, 패키징) |
| Phase 4 | React Native + Expo 모바일 앱, 앱스토어 배포 |
| MVP 이후 | 컨텍스트 인식 알람 (PC 작업 감지, 모바일 동작 감지) |

---

## 네이밍 컨벤션

파일·폴더, 코드, 함수 네이밍 패턴, 플랫폼별 규칙 전체는 별도 파일로 분리:
→ [`.claude/rules/네이밍컨벤션.md`](.claude/rules/네이밍컨벤션.md)

코드 작성·리뷰 시 위 파일을 참조한다.

---

## Git 관리 전략

### 커밋 단위

작업 배치(기능 단위)별로 하나의 커밋. 매 파일마다 커밋하지 않는다.

```
35603d4  초기 커밋 — 프로젝트 세팅
766cf0e  카카오 로그인 구현
921592a  알람 그룹 CRUD 완료
17be5e5  메모 기능 + AI 토글 UI
```

### .gitignore 필수 항목

```
.env
node_modules/
dist/
*.log
```

### 롤백

```bash
git diff                     # 변경 확인
git checkout -- <file>       # 파일 복원
git stash                    # 임시 저장
git reset --soft HEAD~1      # 마지막 커밋 취소 (변경 유지)
```

### 커밋 진행 방식

기능 구현 완료 후 아래 순서로 진행:

1. 변경 내역 요약 및 커밋 메시지 제안
2. 사용자 승인 후 `git add` + `git commit` 실행
3. 커밋 요청에는 `git push`까지 함께 실행 (커밋과 push는 한 묶음)

---

## 미결 사항 (TBD)

- **AI 호스팅:** 현재 **Google Gemini**(Cloud Functions `aiSummarize`/`parseDateTime`)로 구현됨. `packages/shared/services/llamaService.ts`도 Gemini 호출로 구현됨(이름은 과거 Llama 계획의 잔재). 단 `classifyText`(홈 분류)·`detectAlarmSuggestion`(메모 알람 감지)은 아직 정규식/chrono-node 로컬 규칙
- **휴지통 적용 범위:** Phase 1은 메모만. Phase 2에서 나중에/언젠가 포함 여부 결정 (알람은 제외)
- **앱 이름:** SmartNote 임시
- **캘린더 상세 기능 범위:** 반복 일정, 색상 구분 등

---

## 상세 문서 위치 (⛔ 사용 안함 — 보관용)

`.claude/docs/` 의 설계 문서 전체는 현재 코드와 어긋나 **더 이상 사용하지 않는다.** 파일명에 `(사용 안함)` 접두사를 붙여 보관만 한다 (PRD, 아키텍처가이드, DB스키마, API명세서, 작업태스크, 컴포넌트명세, 사용자스토리, QC시나리오, 시스템흐름도, AI데이터처리, 와이어프레임.html + `mmd/` 흐름도 2종).

> **현재 상태의 단일 출처는 이 CLAUDE.md + `.claude/tasks` · `.claude/todos` 운영 문서다.** 설계 문서는 참고 시 코드와 반드시 재대조할 것.

---

## 작업 운영 파일

`.claude/` 루트의 진행 상황·로그 파일 (위 설계 문서와 구분):
- `task.md` — 큰 기능 단위 목록 **인덱스**. 실제 항목은 아키텍처 seam별로 `tasks/` 하위에 분리. 상태 `[ ]` 미시작 · `[~]` 진행 중 · `[x]` 완료
- `todo.md` — Step별 세부 태스크 **인덱스**. 실제 체크리스트는 `todos/` 하위에 분리
- `log.md` — 작업 내역 (무엇을 했는지 서술, 최신순 위)
- `log_code.md` — 실제 코드 변경 기록 (before → after, 최신순 위)

`.claude/tasks/` · `.claude/todos/` 폴더 (영역별 분리, 공통 백엔드 + 플랫폼별 프론트):
- `backend.md` — functions/ + Firestore + FCM/기기 라우팅 (3플랫폼 공통)
- `web.md` — apps/web 프론트엔드
- `electron.md` — Phase 3 데스크탑 (착수 전)
- `mobile.md` — Phase 4 모바일 (진행 중 — Step 0/1/2a 완료, 상세는 `todos/mobile.md` 상단)

`.claude/rules/` 폴더에 분리된 규칙 문서 보관:
- `행동지침.md` — 작업 기본 원칙 1~6 (CLAUDE.md 「행동 지침」에서 `@import`)
- `네이밍컨벤션.md` — 파일·코드·함수 네이밍 + 플랫폼별 규칙
