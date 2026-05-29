# SmartNote 아키텍처 가이드 v0.2

> 모노레포 구조 · 공유 전략 · 스타일 시스템
> 인증: 카카오 로그인 + Firebase 커스텀 토큰 | AI: Llama

---

## 1. 전체 구조 개요

### 플랫폼별 특징

| 플랫폼 | 기술 | 폴더 | 특징 |
|---|---|---|---|
| 웹 | React + Vite | `apps/web` | PWA, Service Worker 알람 |
| 설치형 | Electron | `apps/electron` | 웹 래핑, OS 네이티브 알람 |
| 모바일 | React Native + Expo | `apps/mobile` | FCM 푸시 알람, NativeWind |

### 무엇을 공유하고 무엇을 분리하나

| 레이어 | 공유 여부 | 위치 |
|---|---|---|
| TypeScript 타입 | 100% 공유 | `packages/shared/types` |
| Firebase 훅 | 100% 공유 | `packages/shared/hooks` |
| 비즈니스 로직 | 100% 공유 | `packages/shared/services` |
| 유틸리티 | 100% 공유 | `packages/shared/utils` |
| 디자인 토큰 | 80% 공유 | `packages/shared/tokens` |
| UI 컴포넌트 | 웹↔Electron만 | `apps/web/components` |
| 화면 레이아웃 | 플랫폼별 독립 | 각 `apps/` 내부 |
| 알람 발생 로직 | 플랫폼별 독립 | 각 `apps/` 내부 |

---

## 2. 폴더 구조

```
smartnote/
├── package.json                  ← pnpm workspace 설정
├── pnpm-workspace.yaml
├── turbo.json                    ← Turborepo 빌드 파이프라인
│
├── packages/
│   └── shared/                   ← 3개 플랫폼 공통
│       ├── types/
│       │   ├── alarm.ts          ← Alarm, AlarmGroup 타입
│       │   ├── memo.ts           ← Memo, DetectedAlarm 타입
│       │   ├── device.ts         ← Device, Platform 타입
│       │   ├── later.ts          ← Later, Someday 타입
│       │   └── index.ts          ← 통합 export
│       ├── hooks/
│       │   ├── useAlarms.ts      ← Firestore 알람 CRUD 훅
│       │   ├── useMemos.ts       ← Firestore 메모 CRUD 훅
│       │   ├── useDevice.ts      ← 기기 활성 상태 관리 훅
│       │   ├── useKakaoAuth.ts   ← 카카오 로그인 + Firebase 커스텀 토큰
│       │   └── useLater.ts       ← 나중에 알려줘 훅
│       ├── services/
│       │   ├── alarmService.ts   ← 알람 생성/수정/삭제 로직
│       │   ├── memoService.ts    ← 메모 저장/AI 요청 로직
│       │   ├── deviceService.ts  ← 기기 등록/상태 업데이트
│       │   └── llamaService.ts   ← Llama API 호출 래퍼 (호스팅 방식 미정)
│       ├── utils/
│       │   ├── parseTime.ts      ← 자연어 시간 파싱 (chrono-node)
│       │   ├── formatDate.ts     ← 날짜 포맷 유틸
│       │   └── constants.ts      ← 공통 상수
│       ├── tokens/
│       │   └── design.ts         ← 색상, 간격, 폰트 토큰
│       ├── firebase/
│       │   └── config.ts         ← Firebase 초기화 (공통)
│       └── package.json
│
├── apps/
│   ├── web/                      ← React + Vite PWA
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── AlarmPage.tsx
│   │   │   │   ├── MemoPage.tsx
│   │   │   │   ├── LaterPage.tsx
│   │   │   │   ├── SomedayPage.tsx
│   │   │   │   ├── CalendarPage.tsx
│   │   │   │   └── TrashPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── alarm/
│   │   │   │   │   ├── AlarmGroupList.tsx
│   │   │   │   │   ├── AlarmGroupCard.tsx
│   │   │   │   │   ├── AlarmCard.tsx
│   │   │   │   │   └── QuickAlarmInput.tsx
│   │   │   │   ├── memo/
│   │   │   │   │   ├── MemoList.tsx
│   │   │   │   │   ├── MemoCard.tsx
│   │   │   │   │   ├── MemoEditor.tsx
│   │   │   │   │   └── AiToggleButton.tsx
│   │   │   │   └── common/
│   │   │   │       ├── ToggleSwitch.tsx
│   │   │   │       ├── Modal.tsx
│   │   │   │       ├── Toast.tsx
│   │   │   │       └── Sidebar.tsx
│   │   │   └── alarm/
│   │   │       └── webAlarm.ts   ← Web Audio API + 모달 트리거
│   │   ├── service-worker.ts     ← PWA 백그라운드 알람
│   │   ├── tailwind.config.ts
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   ├── electron/                 ← 최소한의 네이티브 코드
│   │   ├── src/
│   │   │   ├── main.ts           ← Electron Main Process
│   │   │   ├── tray.ts           ← 시스템 트레이
│   │   │   ├── osAlarm.ts        ← OS 네이티브 알림
│   │   │   └── scheduler.ts      ← node-schedule 로컬 스케줄러
│   │   ├── electron-builder.yml
│   │   └── package.json
│   │
│   └── mobile/                   ← React Native + Expo
│       ├── src/
│       │   ├── screens/
│       │   │   ├── HomeScreen.tsx
│       │   │   ├── AlarmScreen.tsx
│       │   │   ├── MemoScreen.tsx
│       │   │   ├── LaterScreen.tsx
│       │   │   ├── SomedayScreen.tsx
│       │   │   ├── CalendarScreen.tsx
│       │   │   └── TrashScreen.tsx
│       │   ├── components/
│       │   │   ├── AlarmGroupList.native.tsx
│       │   │   ├── MemoCard.native.tsx
│       │   │   └── ToggleSwitch.native.tsx
│       │   └── navigation.tsx    ← React Navigation
│       ├── app.json
│       └── package.json
│
├── functions/                    ← Firebase Cloud Functions
│   └── src/
│       ├── kakaoAuth.ts          ← 카카오 → Firebase 커스텀 토큰
│       ├── alarmScheduler.ts     ← 매분 알람 체크 + 기기 라우팅
│       ├── memoAI.ts             ← 메모 저장 시 Llama 처리 트리거
│       ├── workDayScheduler.ts   ← 자정 출근일 확인 + 그룹 OFF
│       ├── laterScheduler.ts     ← 나중에 알려줘 알림 발송
│       └── trashCleaner.ts       ← 30일 초과 휴지통 자동 영구 삭제
│
└── docs/                         ← 설계 문서
```

---

## 3. 공유 전략

### 의존성 방향 (단방향)

```
          packages/shared
         ↙      ↓       ↘
    apps/web  apps/mobile  functions/
       ↑
  apps/electron  ← web 빌드 결과를 로드 (import 아님)
```

> ⚠️ shared가 apps/ 코드를 import하면 순환 의존성 발생. shared는 로직과 타입만.

### Electron이 웹을 로드하는 방식

```typescript
// apps/electron/src/main.ts
const win = new BrowserWindow({ width: 1200, height: 800 });

if (isDev) {
  win.loadURL('http://localhost:5173');  // 개발 중: 웹 dev 서버
} else {
  win.loadFile('../web/dist/index.html'); // 배포: 빌드된 웹 파일
}
```

### 카카오 로그인 공유 훅

```typescript
// packages/shared/hooks/useKakaoAuth.ts
export async function loginWithKakao() {
  // 1. 카카오 SDK 로그인
  const kakaoToken = await Kakao.Auth.loginAsync();

  // 2. Cloud Functions → Firebase 커스텀 토큰
  const { data } = await httpsCallable(functions, 'kakaoLogin')({
    accessToken: kakaoToken.access_token
  });

  // 3. Firebase Auth 로그인
  await signInWithCustomToken(auth, data.firebaseToken);
}
```

---

## 4. 스타일 시스템

### 플랫폼별 스타일 방식

| 플랫폼 | 방식 | 이유 |
|---|---|---|
| 웹 | Tailwind CSS | 빠른 개발, JIT |
| Electron | Tailwind CSS (웹과 동일) | 웹 코드를 그대로 로드 |
| 모바일 | NativeWind v4 | Tailwind 클래스명을 RN에서 사용 |

### 디자인 토큰

```typescript
// packages/shared/tokens/design.ts
export const colors = {
  primary: {
    50:  '#E6F1FB',  // 배경, 배지
    400: '#378ADD',
    600: '#185FA5',  // 버튼, 토글 ON, 포인트
    800: '#0C447C',  // 텍스트 on 배경
  },
  amber: {
    50:  '#FAEEDA',  // 나중에 알려줘, 알람 제안
    600: '#854F0B',
  },
  purple: {
    50:  '#EEEDFE',  // AI 관련 UI (Llama)
    600: '#534AB7',
  },
  danger:  { 50: '#FCEBEB', 600: '#A32D2D' },
  success: { 50: '#EAF3DE', 600: '#3B6D11' },
  gray:    { 50: '#F1EFE8', 600: '#5F5E5A' },
};

export const spacing = { xs:4, sm:8, md:12, lg:16, xl:24 };
export const radius  = { sm:6, md:8, lg:12, full:9999 };
```

---

## 5. 플랫폼별 알람 발생 비교

### 웹 — Web Audio API + 모달

```typescript
// apps/web/alarm/webAlarm.ts
export function triggerWebAlarm(alarm: Alarm) {
  const audio = new Audio('/sounds/alarm.mp3');
  audio.play();
  showAlarmModal(alarm);
}
```

### Electron — OS 네이티브 알림

```typescript
// apps/electron/src/osAlarm.ts
import { Notification } from 'electron';

export function triggerOSAlarm(alarm: Alarm) {
  new Notification({
    title: 'SmartNote',
    body: alarm.label,
    silent: false,
  }).show();
}
```

### 모바일 — FCM 푸시 수신

```typescript
// apps/mobile/src/notifications.ts
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

> ⚠️ 알람 발생 로직은 플랫폼마다 완전히 달라요. 공유하지 말고 각각 구현.
