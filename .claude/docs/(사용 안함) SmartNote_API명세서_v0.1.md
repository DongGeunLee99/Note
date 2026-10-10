# SmartNote API 명세서 v0.2

> Firebase Cloud Functions 기반 / 모든 요청은 Firebase Auth 인증 필요

---

## 인증 방식

모든 API는 Firebase Auth 토큰을 헤더에 포함해야 해요.

```
Authorization: Bearer {firebaseIdToken}
```

Cloud Functions `onCall` 방식은 Firebase SDK가 자동으로 토큰을 처리해요.

---

## 구현 상태 (2026-06-16)

| Function | 상태 |
|---|---|
| `kakaoLogin` | ✅ 구현 (`functions/src/kakaoAuth.ts`) |
| 그 외 전부 (`onAlarmWrite`, `triggerAlarm`, `memoAIProcess`, `memoAIReprocess`, `classifyInput`, `onLaterWrite`, `triggerLater`, `trashCleaner`, `registerFCMToken`) | ⏳ Phase 2 설계 — 미구현 |

> `workDayScheduler`(출근일 기반 조건부 그룹 자동 OFF)는 **출근일 기능 폐기로 명세에서 제거됨**. 알람 그룹은 수동 토글만 지원.

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

### 2-1. 알람 Firestore 트리거 (자동 실행)

알람 문서 생성/수정/삭제 시 Cloud Task를 생성·수정·취소.

```
Function : onAlarmWrite
Type     : onDocumentWritten
Trigger  : users/{uid}/alarms/{alarmId}
```

**처리 흐름**
- **생성 / isEnabled=true**: 다음 발화 시각 계산 → Cloud Tasks에 태스크 생성 (`taskId = alarm_{alarmId}`)
- **수정** (시각 또는 활성 상태 변경): 기존 태스크 삭제 → 새 태스크 재생성
- **삭제 / isEnabled=false**: Cloud Tasks에서 태스크 취소

---

### 2-2. 알람 발송 (Cloud Task 호출)

Cloud Task가 알람 발화 시각에 직접 호출하는 HTTP 함수.

```
Function : triggerAlarm
Type     : onRequest (HTTP)
Called by: Google Cloud Tasks
```

**Request** (Cloud Tasks 자동 전송)
```json
{
  "uid": "사용자 UID",
  "alarmId": "알람 문서 ID"
}
```

**처리 흐름**
1. `alarms/{alarmId}` 조회 → `isEnabled`, `isDeleted`, `groupId` 확인
2. 그룹 `isEnabled` 확인
3. `devices` 컬렉션에서 활성 기기 조회
4. 우선순위에 따라 발송:
   - 웹 탭 활성 → `alarmTriggers/{alarmId}` Firestore 문서 업데이트 (클라이언트 실시간 리스너 감지 → `new Notification()`으로 OS 알림 표시)
   - 웹 비활성 + Electron 활성 → Electron FCM push
   - 모두 비활성 → 모바일 FCM push
5. 반복 알람(`repeatDays` 존재)인 경우 → 다음 발화 시각 계산 후 새 Cloud Task 생성

**에러**
| 코드 | 메시지 | 설명 |
|---|---|---|
| `alarm/not-found` | 알람을 찾을 수 없음 | 삭제된 알람 |
| `alarm/group-disabled` | 그룹이 비활성 상태 | 그룹 OFF |
| `alarm/no-active-device` | 활성 기기 없음 | 모든 기기 오프라인 |

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

### 5-1. 나중에 Firestore 트리거 (자동 실행)

나중에 항목 생성/수정 시 Cloud Task를 생성·수정·취소.

```
Function : onLaterWrite
Type     : onDocumentWritten
Trigger  : users/{uid}/later/{laterId}
```

**처리 흐름**
- **생성**: `notifyAt` 시각으로 Cloud Task 생성 (`taskId = later_{laterId}`)
- **수정** (`notifyAt` 변경): 기존 태스크 삭제 → 새 시각으로 재생성
- **완료 / 삭제**: Cloud Tasks에서 태스크 취소

---

### 5-2. 나중에 알림 발송 (Cloud Task 호출)

```
Function : triggerLater
Type     : onRequest (HTTP)
Called by: Google Cloud Tasks
```

**처리 흐름**
1. `later/{laterId}` 조회 → `isCompleted`, `isDeleted` 확인
2. 기기 라우팅 후 FCM push 발송 (`triggerAlarm`의 라우팅 로직 재사용)
3. `isCompleted = true` 업데이트

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
