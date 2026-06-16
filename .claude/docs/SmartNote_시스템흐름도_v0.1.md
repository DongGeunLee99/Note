# SmartNote 시스템 흐름도 v0.1

> 플랫폼: 웹 + Electron + 모바일 | 인증: 카카오 + Firebase 커스텀 토큰

---

## 1. 전체 시스템 아키텍처

```
① 클라이언트           ② Firebase (BaaS)         ③ 외부
─────────────────      ─────────────────────      ──────────────
React (TypeScript)     Firestore (DB)             Llama API
Tailwind CSS           Firebase Auth              (AI 정리/분류)
PWA (SW)               Firebase Hosting
Web Notification API   Cloud Functions            카카오 API
Geolocation API        FCM (푸시 알람)            (로그인)
NativeWind (모바일)    Cloud Scheduler
Electron (PC)
React Native (모바일)
```

---

## 2. Firestore 데이터 구조

```
users/{uid}
├── alarmGroups/{groupId}   ← 그룹 ON/OFF, 색상, 아이콘
├── alarms/{alarmId}        ← 시간, 반복, 그룹 참조
├── memos/{memoId}          ← 원문, AI 정리, 위치, 알람 감지 결과
├── later/{laterId}         ← 나중에 알려줘, 알림 시각
├── someday/{somedayId}     ← 언젠가 리스트, 카테고리
└── devices/{deviceId}      ← 플랫폼, isActive, FCM 토큰
```

---

## 3. 주요 데이터 흐름

### 3.1 카카오 로그인 → Firebase Auth

```
클라이언트               Cloud Functions          Firebase Auth
─────────                ───────────────          ─────────────
카카오 SDK 호출
→ 액세스 토큰 수신
→ CF 전달          →    카카오 API 사용자 확인
                         Firebase Admin
                         커스텀 토큰 발급
← 커스텀 토큰 수신  ←   커스텀 토큰 반환
→ signInWithCustomToken()
                                              →   세션 발급 ✅
```

### 3.2 메모 저장 → Llama 처리

```
클라이언트          Firestore           Cloud Function      Llama API
──────────          ─────────           ──────────────      ─────────
메모 작성
→ 저장         →   memos/{id}
                    onCreate 트리거  →  본문 전달       →   AI 정리
                                                            날짜 감지
                    aiSummary 저장   ←  JSON 응답      ←   결과 반환
← 실시간 갱신   ←  리스너 업데이트
```

### 3.3 알람 발생 → 기기 라우팅

```
Cloud Scheduler (매분)
→ 울릴 알람 조회 (Firestore alarms)
→ 그룹 isEnabled 확인
→ devices 컬렉션 조회

웹 탭 활성?    → YES → Firestore 리스너 트리거 → 웹 소리 + 모달
               → NO  → Electron 실행 중?
                        → YES → FCM 푸시 → OS 네이티브 알림
                        → NO  → 모바일 활성?
                                 → YES → FCM 푸시 → 모바일 알림
                                 → NO  → 모든 기기 FCM 푸시
```

### 3.4 기기 활성 상태 감지

```
웹     : visibilityState 변경 → Firestore isActive 업데이트
         마우스/키보드 감지 → lastActiveAt 갱신
         5분 무활동 → isActive = false

Electron: 윈도우 포커스 감지 → isActive 업데이트

모바일 : AppState 감지 (foreground/background) → isActive 업데이트
```

---

## 4. Firestore 보안 규칙

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == uid;
    }
  }
}
```

---

## 5. 오류 처리 방침

| 오류 상황 | 처리 방식 | 사용자 피드백 |
|---|---|---|
| Llama API 실패 | aiProcessed=false 유지, 재시도 가능 | 'AI 정리 실패 — 재시도' 버튼 |
| Geolocation 거부 | location null 저장 | 위치 태그 없이 정상 저장 |
| 오프라인 | Firestore 오프라인 캐시 | '오프라인 모드' 배너 |
| Cloud Function 타임아웃 | 3회 재시도 후 실패 | 토스트 알림 |
| FCM 토큰 만료 | 재발급 후 재전송 | 사용자 피드백 없음 |
