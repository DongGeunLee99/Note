# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 행동 지침

> 흔한 LLM 코딩 실수를 줄이기 위한 기본 원칙. 프로젝트별 지침과 함께 적용.
>
> **트레이드오프:** 이 지침은 속도보다 신중함을 우선시한다. 사소한 작업에는 판단해서 적용.

### 1. 코딩 전에 생각하기

**가정하지 말 것. 혼란을 숨기지 말 것. 트레이드오프를 드러낼 것.**

구현 전에:
- 가정한 것이 있으면 명시적으로 밝힌다. 불확실하면 질문한다.
- 해석이 여러 가지일 경우 제시한다 — 조용히 하나를 고르지 않는다.
- 더 단순한 접근이 있으면 말한다. 필요하면 반론을 제기한다.
- 뭔가 불명확하면 멈춘다. 무엇이 헷갈리는지 명시하고 질문한다.

### 2. 단순함 우선

**문제를 해결하는 최소한의 코드. 추측성 코드 금지.**

- 요청받지 않은 기능은 추가하지 않는다.
- 단일 사용 코드에 추상화를 만들지 않는다.
- 요청하지 않은 "유연성"이나 "설정 가능성"을 추가하지 않는다.
- 발생 불가능한 시나리오에 대한 에러 처리를 넣지 않는다.
- 200줄로 썼는데 50줄로 가능하다면 다시 쓴다.

스스로 물어볼 것: "시니어 엔지니어가 이 코드를 보고 과도하게 복잡하다고 할까?" 그렇다면 단순화한다.

### 3. 외과적 수정

**반드시 필요한 것만 건드린다. 내가 만든 문제만 정리한다.**

기존 코드를 수정할 때:
- 인접한 코드, 주석, 포매팅을 "개선"하지 않는다.
- 망가지지 않은 것을 리팩터링하지 않는다.
- 내 방식이 달라도 기존 스타일을 맞춘다.
- 관련 없는 죽은 코드를 발견하면 언급은 하되 삭제하지 않는다.

내 변경이 고아(orphan)를 만들 때:
- 내 변경으로 인해 사용되지 않게 된 import/변수/함수는 제거한다.
- 기존에 있던 죽은 코드는 요청받지 않으면 건드리지 않는다.

기준: 변경된 모든 줄이 사용자의 요청으로 직접 이어져야 한다.

### 4. 코드 수정은 명시적 요청 시에만

**질문에 답하는 것과 코드를 수정하는 것은 완전히 별개다.**

- 사용자가 명시적으로 수정을 요청할 때만 코드를 변경한다.
- 질문에 답변하면서 동시에 코드를 수정하면 절대 안 된다.
- 코드 개선이 필요해 보여도, 요청받기 전까지는 언급만 하고 손대지 않는다.
- "이렇게 하면 어떨까요?"라고 제안할 수는 있지만, 직접 적용은 승인 후에만 한다.

### 5. 목표 중심 실행

**성공 기준을 정의한다. 검증될 때까지 반복한다.**

작업을 검증 가능한 목표로 변환:
- "유효성 검사 추가" → "잘못된 입력에 대한 테스트 작성 후 통과시키기"
- "버그 수정" → "버그를 재현하는 테스트 작성 후 통과시키기"
- "X 리팩터링" → "리팩터링 전후 테스트가 모두 통과하는지 확인"

다단계 작업에는 간략한 계획을 먼저 제시:
```
1. [단계] → 검증: [확인 방법]
2. [단계] → 검증: [확인 방법]
3. [단계] → 검증: [확인 방법]
```

명확한 성공 기준이 있어야 독립적으로 반복 실행할 수 있다. 모호한 기준("동작하게 만들기")은 실수 후 계속 확인을 요구하게 된다.

---

---

## 프로젝트 개요

**SmartNote** — 알람·메모·캘린더를 하나로 통합한 개인용 앱 (타겟: 1인 사용자)

핵심 차별점:
- 메모 저장 시 Llama AI가 자동으로 날짜/시간을 감지해 알람을 제안
- 알람을 그룹으로 묶어 ON/OFF 한 번에 관리 (예: 직장 그룹 비출근일 자동 OFF)
- 홈 화면 자연어 입력 → Llama가 일정/알람/메모/나중에/언젠가로 자동 분류

---

## 기술 스택

| 영역 | 기술 |
|---|---|
| 웹 프론트 | React + TypeScript + Vite + Tailwind CSS (PWA) |
| 모바일 | React Native + Expo + NativeWind v4 |
| 데스크탑 | Electron (웹 빌드 래핑) |
| 백엔드/DB | Firebase Firestore + Cloud Functions |
| 인증 | 카카오 로그인 → Firebase 커스텀 토큰 |
| AI | Llama (호스팅 방식 미정: Groq / Together AI / Ollama 자체 서버) |
| 알람 (웹) | Web Audio API + Service Worker |
| 알람 (Electron) | node-schedule + OS Notification API |
| 알람 (모바일) | FCM (Firebase Cloud Messaging) |
| 모노레포 | pnpm workspace + Turborepo |
| 자연어 시간 파싱 | chrono-node |

---

## 모노레포 구조

```
smartnote/
├── packages/shared/          ← 3개 플랫폼 공통 (타입, 훅, 서비스, 유틸)
│   ├── types/                ← Alarm, AlarmGroup, Memo, Device, Later, Someday
│   ├── hooks/                ← Firestore CRUD 훅, useKakaoAuth
│   ├── services/             ← alarmService, memoService, llamaService
│   ├── utils/                ← parseTime (chrono-node), formatDate, constants
│   ├── tokens/design.ts      ← 색상·간격·폰트 디자인 토큰
│   └── firebase/config.ts    ← Firebase 초기화 (공통)
├── apps/web/                 ← React + Vite PWA
├── apps/electron/            ← 웹 빌드를 로드하는 최소 네이티브 코드
├── apps/mobile/              ← React Native + Expo
└── functions/                ← Firebase Cloud Functions
    ├── kakaoAuth.ts          ← 카카오 → Firebase 커스텀 토큰
    ├── alarmScheduler.ts     ← 매분 알람 체크 + 기기 라우팅
    ├── memoAI.ts             ← 메모 저장 트리거 → Llama 처리
    ├── workDayScheduler.ts   ← 자정 출근일 확인 + 그룹 자동 OFF
    ├── laterScheduler.ts     ← 나중에 알려줘 알림 발송
    └── trashCleaner.ts       ← 30일 초과 휴지통 자동 삭제
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
  ├── workDays/{YYYY-MM-DD}   isWorkDay (알람 그룹 자동 OFF 연동)
  └── devices/{deviceId}      platform(web|electron|mobile), isActive, fcmToken
```

### 공통 규칙
- 모든 컬렉션에 `isDeleted`, `deletedAt` 필드. 조회 시 반드시 `where('isDeleted', '==', false)` 필터 적용
- 삭제 후 30일이 지나면 `trashCleaner` Cloud Function이 자동 영구 삭제
- 타임스탬프는 클라이언트 로컬 시간 기준

---

## 알람 라우팅 우선순위

Cloud Function `alarmScheduler`가 매분 실행하며 기기 라우팅:
1. 웹 탭 활성 (`isActive=true`) → Firestore 실시간 트리거로 웹 알람 발생
2. 웹 비활성 + Electron 활성 → Electron FCM
3. 모두 비활성 → 모바일 FCM

---

## 화면 구성

웹: `HomePage`, `AlarmPage`, `MemoPage`, `LaterPage`, `SomedayPage`, `CalendarPage`, `TrashPage`
모바일: 동일 구조, `Screen` suffix

---

## 개발 Phase

| Phase | 목표 |
|---|---|
| Phase 1 | 웹 MVP (알람 그룹/CRUD, 메모, 캘린더, 홈 기본, 휴지통) |
| Phase 2 | Llama AI 연동, FCM, 기기 라우팅, 나중에/언젠가 |
| Phase 3 | Electron (OS 알람, 트레이, 패키징) |
| Phase 4 | React Native + Expo 모바일 앱, 앱스토어 배포 |
| MVP 이후 | 컨텍스트 인식 알람 (PC 작업 감지, 모바일 동작 감지) |

---

## 네이밍 컨벤션

### 파일 & 폴더

| 대상 | 컨벤션 | 예시 |
|---|---|---|
| 컴포넌트 파일 | PascalCase | `AlarmGroupCard.tsx` |
| 훅 / 서비스 / 유틸 파일 | camelCase | `useAlarms.ts`, `alarmService.ts` |
| 웹 페이지 파일 | PascalCase + `Page` suffix | `AlarmPage.tsx` |
| 모바일 스크린 파일 | PascalCase + `Screen` suffix | `AlarmScreen.tsx` |
| 폴더 | kebab-case | `alarm-group/` |

> Electron은 웹 빌드를 그대로 로드하므로 웹과 동일.

### 코드

| 대상 | 컨벤션 | 예시 |
|---|---|---|
| 컴포넌트 | PascalCase | `AlarmGroupCard` |
| Props 인터페이스 | `ComponentNameProps` | `AlarmGroupCardProps` |
| 훅 | camelCase + `use` prefix | `useAlarms`, `useKakaoAuth` |
| 전역 스토어 훅 | `useXxxStore` | `useAlarmStore` |
| 함수 / 변수 | camelCase | `toggleGroup`, `isEnabled` |
| 상수 | UPPER_SNAKE_CASE | `MAX_SNOOZE_COUNT`, `ROUTES.ALARM` |
| TypeScript 타입 / 인터페이스 | PascalCase | `AlarmGroup`, `DetectedAlarm` |
| Firestore 필드 | camelCase | `isDeleted`, `deletedAt` |
| Firestore 컬렉션 참조 변수 | camelCase + `Ref` suffix | `alarmsRef`, `memosRef` |
| 환경변수 | `VITE_` prefix + UPPER_SNAKE_CASE | `VITE_FIREBASE_API_KEY` |
| Tailwind 커스텀 클래스 | kebab-case | `alarm-card`, `ai-toggle` |
| CSS 변수 | kebab-case | `--color-primary`, `--font-size-sm` |

### 함수 네이밍 패턴

| 패턴 | 용도 | 예시 |
|---|---|---|
| `handle` prefix | 이벤트 핸들러 | `handleToggleGroup` |
| `on` prefix | props로 전달되는 콜백 | `onToggle`, `onDelete` |
| `is` / `has` prefix | boolean | `isEnabled`, `hasLocation` |
| `get` prefix | 데이터 조회 | `getActiveDevices` |
| `create` / `update` / `delete` | CRUD | `createAlarm`, `deleteGroup` |

### 플랫폼별 프로젝트 규칙

**공통 (packages/shared)**
- 언어: TypeScript strict mode
- 커밋 메시지: 한국어

**웹 (apps/web)**
- 프레임워크: React + TypeScript + Vite
- 스타일: Tailwind CSS
- 라우팅: React Router v6
- 개발 포트: 5173
- 날짜 입력: DatePicker 컴포넌트 필수 (`input type=date` 금지)
- 컴포넌트 재사용 원칙

**Electron (apps/electron)**
- Main / Renderer 프로세스 분리 원칙
- IPC 채널명: kebab-case (`alarm-trigger`, `tray-update`)
- Node.js API는 Main 프로세스에서만 사용 (Renderer 직접 접근 금지)

**모바일 (apps/mobile)**
- 프레임워크: React Native + Expo
- 스타일: NativeWind v4
- 네비게이션: React Navigation
- 날짜 입력: DateTimePicker 컴포넌트 필수

**Firebase Functions (functions/)**
- 언어: TypeScript
- 함수명: camelCase (`kakaoLogin`, `alarmScheduler`)
- 스케줄 함수: `xxxScheduler` suffix
- 트리거 함수: 이벤트 기준 (`memoAIProcess`, `trashCleaner`)

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
.claude/
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
3. `git push`는 별도로 명시적 요청 시에만 실행

---

## 미결 사항 (TBD)

- **Llama 호스팅:** Ollama 자체 서버 방향으로 검토 중. 확정 전까지 `llamaService.ts`는 인터페이스만 정의, 구현 비워둠 (Phase 2에서 확정)
- **휴지통 적용 범위:** Phase 1은 메모만. Phase 2에서 나중에/언젠가 포함 여부 결정 (알람은 제외)
- **앱 이름:** SmartNote 임시
- **캘린더 상세 기능 범위:** 반복 일정, 색상 구분 등

---

## 상세 문서 위치

`.claude/docs/` 폴더에 전체 설계 문서 보관:
- `SmartNote_PRD_v0.2.md` — 기능 상세 정의
- `SmartNote_아키텍처가이드_v0.2.md` — 폴더 구조, 공유 전략, 스타일 시스템
- `SmartNote_DB스키마_v0.1.md` — Firestore 스키마 + 보안 규칙 + 인덱스
- `SmartNote_API명세서_v0.1.md` — Cloud Functions 명세
- `SmartNote_작업태스크_v0.2.md` — Phase별 전체 태스크 목록 (72개)
- `SmartNote_컴포넌트명세_v0.2.md` — 컴포넌트 Props/State 명세 (웹 기준)
- `SmartNote_사용자스토리_v0.2.md` — 사용자 스토리 + 인수 조건
- `smartnote_wireframe_v2.html` — 웹 화면 와이어프레임 (브라우저에서 직접 열어서 확인)

`.claude/docs/mmd/` 폴더에 Mermaid 흐름도 보관:
- `SmartNote_유저플로우_v0.2.mmd` — 사용자 관점 플로우 (Flow A~I, subgraph)
- `SmartNote_서비스흐름도_v0.2.mmd` — 시스템 관점 플로우 (Flow A~I, subgraph)
- `SmartNote_흐름도_통합.md` — 기능별로 유저플로우 + 서비스흐름도 묶은 참고용 문서
