# TASK — mobile (apps/mobile, iOS/Android)

> React Native + Expo + NativeWind v4. iOS/Android는 단일 코드베이스 → 차이는 섹션으로 구분.
> 상태: `[ ]` 미시작 · `[~]` 진행 중 · `[x]` 완료. 세부는 [todos/mobile.md](../todos/mobile.md).

---

## 방향 결정 (2026-09-03)

> 웹 UI가 아직 편의성 면에서 부족하다고 판단. 지금은 웹 다듬기보다 **모바일 버전을 먼저 만들어 실사용 데이터를 쌓고, 그 데이터를 보면서 편의성을 개선**해나가는 순서로 우선순위 변경.

## Phase 4 — 모바일 (착수 예정, 계획서는 [todos/mobile.md](../todos/mobile.md) 참고)

- [ ] Expo 앱 세팅 (Expo Go로 우선 개발, 네이티브 모듈 필요 시점에 EAS dev client 전환)
- [ ] 모바일 카카오 로그인 — `expo-auth-session` 기반, 웹과 동일한 `kakaoLogin` Cloud Function 재사용
- [ ] 핵심 화면 — 알람 / 메모 / 홈 / 캘린더
- [ ] 로컬 알림(`expo-notifications`)으로 우선 알람 발생 처리 (FCM은 후속)
- [ ] 나중에 / 언젠가 / 휴지통 / 설정
- [ ] FCM 푸시 알람 (dev client 전환 후)
- [ ] 앱스토어 배포
  - iOS — App Store 심사/배포
  - Android — Play Store 심사/배포

## MVP 이후

- [ ] 컨텍스트 인식 알람 — 모바일 동작 감지
