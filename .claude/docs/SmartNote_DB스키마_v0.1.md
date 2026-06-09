# SmartNote DB 스키마 v0.1

> Firestore 기반 / 클라이언트 로컬 시간 기준 / 카카오 로그인 (방법 A)

---

## 컬렉션 구조 개요

```
users/{uid}
  ├── alarmGroups/{groupId}
  ├── alarms/{alarmId}
  ├── memos/{memoId}
  ├── later/{laterId}
  ├── someday/{somedayId}
  ├── workDays/{date}
  └── devices/{deviceId}
```

---

## 1. users/{uid}

카카오 로그인 후 최초 생성. `uid` = `kakao:{kakaoId}`

| 필드 | 타입 | 예시 | 설명 |
|---|---|---|---|
| `uid` | string | `kakao:123456` | Firebase Auth UID |
| `kakaoId` | string | `"123456"` | 카카오 사용자 ID |
| `nickname` | string | `"홍길동"` | 카카오 닉네임 |
| `profileImage` | string | `"https://..."` | 카카오 프로필 이미지 URL |
| `settings.defaultSound` | string | `"default"` | 마지막 사용 알람 소리 |
| `settings.defaultVibration` | boolean | `true` | 마지막 사용 진동 여부 |
| `settings.rightPanelWidth` | number | `192` | 우측 패널 너비 (px). 웹/Electron 간 동기화. 미설정 시 기본값 192 |
| `settings.timeFormat` | string | `"24h"` | 시간 표시 형식. `"24h"` (07:30) \| `"12h"` (7:30 AM). 기본값 `"24h"` |
| `createdAt` | timestamp | - | 계정 생성 시각 (로컬) |
| `updatedAt` | timestamp | - | 마지막 업데이트 시각 (로컬) |

---

## 2. users/{uid}/alarmGroups/{groupId}

| 필드 | 타입 | 예시 | 설명 |
|---|---|---|---|
| `groupId` | string | 자동 생성 | 문서 ID |
| `name` | string | `"직장"` | 그룹명 |
| `color` | string | `"#185FA5"` | 그룹 대표 색상 (hex) |
| `icon` | string | `"briefcase"` | 아이콘 이름 |
| `isEnabled` | boolean | `true` | 그룹 ON/OFF 토글 |
| `isDefault` | boolean | `false` | 기타 그룹 여부 (삭제 불가) |
| `order` | number | `0` | 목록 정렬 순서 |
| `isDeleted` | boolean | `false` | 휴지통 여부 |
| `deletedAt` | timestamp \| null | `null` | 삭제 시각 (30일 후 자동 삭제) |
| `createdAt` | timestamp | - | 생성 시각 (로컬) |

---

## 3. users/{uid}/alarms/{alarmId}

| 필드 | 타입 | 예시 | 설명 |
|---|---|---|---|
| `alarmId` | string | 자동 생성 | 문서 ID |
| `groupId` | string | `"abc123"` | 소속 그룹 참조 |
| `label` | string | `"기상"` | 알람 이름 |
| `hour` | number | `7` | 시 (0~23) |
| `minute` | number | `30` | 분 (0~59) |
| `repeatDays` | number[] | `[1,2,3,4,5]` | 반복 요일 (0=일 ~ 6=토) |
| `isEnabled` | boolean | `true` | 개별 알람 ON/OFF |
| `sound` | string | `"default"` | 소리 파일명 |
| `vibration` | boolean | `true` | 진동 여부 |
| `snooze` | number | `5` | 스누즈 분 (0=없음) |
| `sourceType` | string | `"manual"` | `manual` \| `quickAlarm` \| `memoDetected` |
| `sourceMemoId` | string \| null | `null` | 메모 감지 시 참조 memoId |
| `isDeleted` | boolean | `false` | 휴지통 여부 |
| `deletedAt` | timestamp \| null | `null` | 삭제 시각 |
| `createdAt` | timestamp | - | 생성 시각 (로컬) |
| `updatedAt` | timestamp | - | 수정 시각 (로컬) |

---

## 4. users/{uid}/memos/{memoId}

| 필드 | 타입 | 예시 | 설명 |
|---|---|---|---|
| `memoId` | string | 자동 생성 | 문서 ID |
| `title` | string | `"치과 예약"` | 제목 |
| `body` | string | `"내일 9시..."` | 원문 본문 |
| `aiSummary` | string \| null | `null` | AI 정리 결과 |
| `aiProcessed` | boolean | `false` | AI 처리 완료 여부 |
| `aiProcessedAt` | timestamp \| null | `null` | AI 처리 시각 |
| `detectedAlarms` | object[] | `[]` | 감지된 알람 제안 목록 |
| `detectedAlarms[].datetime` | string | `"2026-05-28T09:00"` | 감지된 날짜/시간 |
| `detectedAlarms[].label` | string | `"치과 예약"` | 감지된 라벨 |
| `detectedAlarms[].confirmed` | boolean | `false` | 사용자 확인 여부 |
| `location.lat` | number \| null | `37.4979` | 위도 |
| `location.lng` | number \| null | `127.0276` | 경도 |
| `location.label` | string \| null | `"강남역 근처"` | 역주소 변환 결과 |
| `isDeleted` | boolean | `false` | 휴지통 여부 |
| `deletedAt` | timestamp \| null | `null` | 삭제 시각 |
| `createdAt` | timestamp | - | 작성 시각 (로컬) |
| `updatedAt` | timestamp | - | 수정 시각 (로컬) |

---

## 5. users/{uid}/later/{laterId}

| 필드 | 타입 | 예시 | 설명 |
|---|---|---|---|
| `laterId` | string | 자동 생성 | 문서 ID |
| `title` | string | `"치과 예약하기"` | 항목명 |
| `notifyAt` | timestamp | - | 알림 예정 시각 (로컬) |
| `isCompleted` | boolean | `false` | 완료 여부 |
| `completedAt` | timestamp \| null | `null` | 완료 시각 |
| `snoozedCount` | number | `0` | 미루기 횟수 |
| `isDeleted` | boolean | `false` | 휴지통 여부 |
| `deletedAt` | timestamp \| null | `null` | 삭제 시각 |
| `createdAt` | timestamp | - | 생성 시각 (로컬) |

---

## 6. users/{uid}/someday/{somedayId}

| 필드 | 타입 | 예시 | 설명 |
|---|---|---|---|
| `somedayId` | string | 자동 생성 | 문서 ID |
| `title` | string | `"아이슬란드 여행"` | 항목명 |
| `category` | string | `"여행"` | `여행` \| `배움` \| `구매` \| `기타` |
| `aiCategory` | string \| null | `"여행"` | AI 분류 결과 |
| `isFavorite` | boolean | `false` | 즐겨찾기 |
| `isDeleted` | boolean | `false` | 휴지통 여부 |
| `deletedAt` | timestamp \| null | `null` | 삭제 시각 |
| `createdAt` | timestamp | - | 생성 시각 (로컬) |

---

## 7. users/{uid}/workDays/{date}

`date` = `YYYY-MM-DD` 형식 (문서 ID)

| 필드 | 타입 | 예시 | 설명 |
|---|---|---|---|
| `date` | string | `"2026-05-27"` | 날짜 (문서 ID와 동일) |
| `isWorkDay` | boolean | `true` | 출근 여부 |
| `note` | string | `"재택"` | 비고 (재택, 반차 등) |
| `updatedAt` | timestamp | - | 수정 시각 (로컬) |

---

## 8. users/{uid}/devices/{deviceId}

`deviceId` = 기기별 고유 ID (UUID 생성)

| 필드 | 타입 | 예시 | 설명 |
|---|---|---|---|
| `deviceId` | string | `"uuid-..."` | 문서 ID |
| `platform` | string | `"web"` | `web` \| `electron` \| `mobile` |
| `isActive` | boolean | `true` | 현재 활성 여부 |
| `lastActiveAt` | timestamp | - | 마지막 활동 시각 (로컬) |
| `fcmToken` | string \| null | `"token..."` | FCM 푸시 토큰 |
| `userAgent` | string | `"Chrome/..."` | 브라우저/OS 정보 |
| `createdAt` | timestamp | - | 기기 최초 등록 시각 (로컬) |

---

## 휴지통 공통 규칙

모든 컬렉션에 `isDeleted`, `deletedAt` 필드 적용.

```
삭제 시      → isDeleted = true, deletedAt = 현재 시각
복원 시      → isDeleted = false, deletedAt = null
30일 후      → Cloud Scheduler가 deletedAt 기준 30일 초과 문서 영구 삭제
영구 삭제 시  → Firestore 문서 delete()
```

> **조회 시 반드시 `where('isDeleted', '==', false)` 필터 적용**

---

## Firestore 보안 규칙 요약

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

## 인덱스 필요 항목

| 컬렉션 | 필드 조합 | 용도 |
|---|---|---|
| alarms | `groupId` + `isDeleted` | 그룹별 알람 조회 |
| alarms | `isEnabled` + `isDeleted` | 활성 알람 전체 조회 |
| memos | `createdAt` + `isDeleted` | 최신순 메모 조회 |
| memos | `aiProcessed` + `isDeleted` | AI 미처리 메모 조회 |
| later | `notifyAt` + `isCompleted` | 알림 예정 항목 조회 |
| devices | `platform` + `isActive` | 활성 기기 라우팅 |
