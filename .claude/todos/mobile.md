# TODO — mobile

> [tasks/mobile.md](../tasks/mobile.md)의 Step별 세부.

---

## 미완료

### 방향 결정 (2026-09-03)

> 웹을 지금 상태로 계속 다듬기보다, **모바일 버전을 먼저 만들어서 실제로 써보며 데이터를 쌓고**, 그걸 바탕으로 편의성 개선 방향을 잡기로 결정.

### 계획서 — 모바일 앱(apps/mobile) 착수

**접근 방식**
- **A안 (채택): Expo Go로 우선 개발, 네이티브 기능 필요해지면 EAS Dev Client로 전환**
  - 화면 UI/CRUD부터 빠르게 만들어서 바로 휴대폰에서 써볼 수 있음 — "먼저 만들고 데이터 쌓기" 목적에 부합
  - Firebase는 `@react-native-firebase`(네이티브) 대신 **웹과 동일한 `firebase` JS SDK** 사용 — Expo Go에서 동작하고 `packages/shared`의 타입/서비스/훅을 거의 그대로 재사용 가능
  - 카카오 로그인도 네이티브 SDK 없이 `expo-auth-session`으로 브라우저 기반 OAuth — **웹용으로 새로 만든 `kakaoLogin` Cloud Function(Authorization Code 방식)을 그대로 재사용** (redirectUri만 커스텀 스킴으로 다르게)
  - 단점: 진짜 FCM 푸시(앱 완전 종료 상태 알람)는 이 단계에서 안 됨 → 대신 `expo-notifications`의 **로컬 알림**(OS 예약 방식)으로 우선 처리. 앱이 꺼져 있어도 OS가 울려주므로 지금 웹의 "탭 닫으면 알람 안 울림" 문제보다 오히려 나음
- **B안 (기각): 처음부터 EAS Dev Client + `@react-native-firebase`(완전 네이티브)로 시작**
  - 장점: 나중에 전환 비용 없음, FCM까지 한 번에
  - 단점: 빌드 한 번 할 때마다 EAS 클라우드 빌드 대기 필요(로컬 즉시 리로드 안 됨), 초기 설정이 훨씬 복잡, "일단 써보면서 데이터 쌓기"라는 목적엔 안 맞음
- **채택 이유**: 목적이 "빠르게 실사용 시작"이라 지금 단계에서 네이티브 전환 비용을 치를 이유가 없음. FCM은 로컬 알림의 한계를 실제로 체감했을 때 넘어가면 됨.

**생성 파일 (개략 — 실제 작업 시 세분화)**
| 경로 | 역할 |
|---|---|
| `apps/mobile/` | Expo 프로젝트 루트 (app.json, App.tsx, tsconfig 등) |
| `apps/mobile/src/screens/*Screen.tsx` | HomeScreen, AlarmScreen, MemoScreen, CalendarScreen 등 (`Screen` suffix 컨벤션) |
| `apps/mobile/src/navigation/` | React Navigation 스택/탭 구성 |
| `apps/mobile/src/firebase/` | 모바일용 Firebase 초기화 (AsyncStorage persistence) |

**수정 파일**
| 경로 | 작업 |
|---|---|
| `packages/shared/hooks`, `services`, `types` | 웹 전용으로 짜인 부분(있다면) 플랫폼 무관하게 확인/분리 |
| `functions/src/kakaoAuth.ts` | 리다이렉트 URI 검증 로직이 웹 도메인만 가정하고 있다면 모바일 커스텀 스킴도 허용하도록 소폭 조정 |

**예상 규모**: 신규 다수(Expo 표준 구조 + 화면 6~8개) · 수정 2곳 내외 · 위험도: 중(새 플랫폼 전체 세팅) · 되돌리기: 쉬움(새 폴더라 기존 코드 영향 없음)

**검증**
- Expo Go 앱으로 QR 스캔 → 로그인 → 알람/메모 CRUD가 실제 휴대폰에서 동작하는지 확인
- 로컬 알림이 화면 꺼짐/앱 백그라운드 상태에서도 울리는지 확인

### Phase 4 — 모바일 1단계 (Expo Go 범위 — 네이티브 모듈 없이 되는 것부터)
- [ ] Expo 앱 세팅 — `apps/mobile`, TypeScript + NativeWind v4 + React Navigation
- [ ] `packages/shared` 재사용 검토 — 타입/서비스/훅은 그대로, Firebase는 JS SDK(AsyncStorage persistence)로 시작해 Expo Go 호환 유지
- [ ] 모바일 카카오 로그인 — `expo-auth-session`/`expo-web-browser`로 OAuth, 기존 `kakaoLogin` Cloud Function 그대로 재사용(redirectUri만 커스텀 스킴으로)
- [ ] 홈 화면 (자연어 입력 등 웹과 동일 기능)
- [ ] 알람 화면 — 그룹/CRUD, 로컬 알림(`expo-notifications`)으로 발생 처리
- [ ] 메모 화면 — CRUD, AI 정리(Cloud Function 재사용)
- [ ] 캘린더 화면

### Phase 4 — 모바일 2단계 (나머지 화면)
- [ ] 나중에 / 언젠가 / 휴지통 / 설정 화면

### Phase 4 — 모바일 3단계 (네이티브 전환 필요 시점)
- [ ] EAS 개발 빌드(dev client)로 전환
- [ ] FCM 푸시 알람 연동 (기기 라우팅 포함)
- [ ] 앱스토어 배포 — iOS(App Store) / Android(Play Store)

### MVP 이후
- [ ] 컨텍스트 인식 알람 — 모바일 동작 감지

---

## 완료

<!-- Phase 4 착수 후 기록 -->
