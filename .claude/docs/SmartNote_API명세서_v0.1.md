# SmartNote API 명세서 v0.1

> Firebase Cloud Functions 기반 / 모든 요청은 Firebase Auth 인증 필요

---

## 인증 방식

모든 API는 Firebase Auth 토큰을 헤더에 포함해야 해요.

```
Authorization: Bearer {firebaseIdToken}
```

Cloud Functions `onCall` 방식은 Firebase SDK가 자동으로 토큰을 처리해요.

---

## 1. 인증 (Auth)

### 1-1. 카카오 로그인

카카오 액세스 토큰을 받아 Firebase 커스텀 토큰 발급.

```
Function : kakaoLogin
Type     : onCall
```

**Request**
```json
{
  "accessToken": "카카오 액세스 토큰"
}
```

**Response**
```json
{
  "firebaseToken": "Firebase 커스텀 토큰",
  "isNewUser": true
}
```

**에러**
| 코드 | 메시지 | 설명 |
|---|---|---|
| `auth/invalid-kakao-token` | 유효하지 않은 카카오 토큰 | 토큰 만료 또는 위조 |
| `auth/kakao-api-error` | 카카오 API 오류 | 카카오 서버 문제 |

---

## 2. 알람 (Alarm)

### 2-1. 알람 스케줄러 (자동 실행)

매분 실행. 울릴 알람을 확인하고 기기 라우팅.

```
Function : alarmScheduler
Type     : onSchedule
Schedule : every 1 minutes
```

**처리 흐름**
1. `alarms` 컬렉션에서 현재 시각의 알람 조회
2. 그룹 `isEnabled` 확인
3. `devices` 컬렉션에서 활성 기기 확인
4. 우선순위: 웹 Firestore 트리거 → Electron FCM → 모바일 FCM

---

### 2-2. 조건부 그룹 자동 OFF (자동 실행)

매일 자정 실행. 비출근일 시 직장 그룹 자동 OFF.

```
Function : workDayScheduler
Type     : onSchedule
Schedule : every day 00:00
```

**처리 흐름**
1. 모든 사용자의 오늘 날짜 `workDays` 조회
2. `isWorkDay = false` 이면 직장 그룹 `isEnabled = false`
3. `isWorkDay = true` 이면 직장 그룹 `isEnabled = true` 복구

---

## 3. 메모 AI 처리 (Memo AI)

### 3-1. 메모 AI 정리 (자동 트리거)

메모 저장 시 자동 실행. Llama API로 AI 정리 + 날짜 감지.

```
Function : memoAIProcess
Type     : onDocumentCreated
Trigger  : users/{uid}/memos/{memoId}
```

**처리 흐름**
1. 메모 `body` 텍스트를 Llama API에 전달
2. AI 정리 결과 + 날짜/시간 감지 결과 수신
3. `aiSummary`, `detectedAlarms`, `aiProcessed = true` 저장

**Llama API 요청 형식**
```json
{
  "prompt": "다음 메모를 정리하고 날짜/시간 표현을 감지해줘:\n{body}",
  "response_format": {
    "summary": "string",
    "detectedAlarms": [
      { "datetime": "ISO8601", "label": "string" }
    ]
  }
}
```

---

### 3-2. 메모 AI 재분석 (수동 요청)

사용자가 재분석 버튼 클릭 시 호출.

```
Function : memoAIReprocess
Type     : onCall
```

**Request**
```json
{
  "memoId": "메모 문서 ID"
}
```

**Response**
```json
{
  "success": true,
  "aiSummary": "AI 정리 결과",
  "detectedAlarms": [
    { "datetime": "2026-05-28T09:00", "label": "치과 예약" }
  ]
}
```

**에러**
| 코드 | 메시지 | 설명 |
|---|---|---|
| `memo/not-found` | 메모를 찾을 수 없음 | 잘못된 memoId |
| `ai/llama-error` | AI 처리 실패 | Llama API 오류 |
| `ai/timeout` | AI 처리 시간 초과 | 30초 초과 |

---

## 4. 홈 자연어 분류 (Home AI)

### 4-1. 자연어 입력 분류

홈 화면 입력창에서 텍스트를 받아 카테고리 분류.

```
Function : classifyInput
Type     : onCall
```

**Request**
```json
{
  "text": "내일 9시 병원 예약"
}
```

**Response**
```json
{
  "category": "일정",
  "confidence": 0.95,
  "parsed": {
    "datetime": "2026-05-28T09:00",
    "label": "병원 예약"
  }
}
```

**category 종류**
| 값 | 설명 |
|---|---|
| `일정` | 날짜/시간이 있는 일정 + 알람 생성 제안 |
| `할일` | 기한 없는 할일 |
| `나중에` | 나중에 알려줘 등록 |
| `언젠가` | 언젠가 리스트 등록 |
| `메모` | 자유 형식 메모 |

---

## 5. 나중에 알려줘 (Later)

### 5-1. 나중에 알림 발송 (자동 실행)

```
Function : laterScheduler
Type     : onSchedule
Schedule : every 1 minutes
```

**처리 흐름**
1. `later` 컬렉션에서 `notifyAt <= 현재시각`, `isCompleted = false` 조회
2. 기기 라우팅 (Flow C 동일)
3. 알림 발송 후 `notifyAt` 갱신 (다음 알림 방지)

---

## 6. 휴지통 (Trash)

### 6-1. 휴지통 자동 삭제 (자동 실행)

매일 자정 실행. 30일 초과 항목 영구 삭제.

```
Function : trashCleaner
Type     : onSchedule
Schedule : every day 00:00
```

**처리 대상 컬렉션**
- `alarmGroups`, `alarms`, `memos`, `later`, `someday`

**처리 흐름**
1. 각 컬렉션에서 `isDeleted = true` + `deletedAt <= 30일 전` 조회
2. 해당 문서 영구 삭제 (`delete()`)

---

## 7. FCM 푸시 (공통)

### 7-1. FCM 토큰 등록/갱신

```
Function : registerFCMToken
Type     : onCall
```

**Request**
```json
{
  "deviceId": "기기 UUID",
  "fcmToken": "FCM 토큰",
  "platform": "web"
}
```

**Response**
```json
{
  "success": true
}
```

---

## 에러 코드 공통 규칙

| 코드 형식 | 예시 | 설명 |
|---|---|---|
| `auth/*` | `auth/invalid-kakao-token` | 인증 관련 오류 |
| `memo/*` | `memo/not-found` | 메모 관련 오류 |
| `alarm/*` | `alarm/group-disabled` | 알람 관련 오류 |
| `ai/*` | `ai/llama-error` | AI 처리 오류 |
| `fcm/*` | `fcm/token-expired` | 푸시 관련 오류 |
| `common/*` | `common/permission-denied` | 공통 오류 |
