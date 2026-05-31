# SmartNote — Web App

알람·메모·캘린더를 하나로 통합한 개인용 웹 앱 (PWA)

## 기술 스택

- **React 19** + TypeScript + Vite
- **Tailwind CSS v4**
- **React Router v6**
- **@tabler/icons-react**
- **chrono-node** — 자연어 시간 파싱

## 개발 서버 실행

프로젝트 루트(`smartnote/`)에서 실행:

```bash
pnpm dev
```

`http://localhost:5173` 에서 확인

> **Node.js 22.13+** / **pnpm 11.4.0** 필요
>
> Node 20 이하에서는 pnpm 11이 동작하지 않습니다. [nvm](https://github.com/coreybutler/nvm-windows)으로 버전을 맞춰주세요.
>
> ```bash
> nvm install 22
> nvm use 22
> npm install -g pnpm@11.4.0
> ```

## 주요 화면

| 경로 | 화면 |
|---|---|
| `/` | 홈 — 자연어 입력 & 최근 기록 |
| `/alarm` | 알람 — 그룹 CRUD, 빠른 알람 입력 |
| `/memo` | 메모 — AI 정리 토글, 위치 태그 |
| `/calendar` | 캘린더 — 출근일 설정, 알람 일정 |
| `/later` | 나중에 알려줘 |
| `/someday` | 언젠가 리스트 |
| `/trash` | 휴지통 — 복원 / 영구 삭제 |

## 현재 개발 상태

- Phase 1 UI 목업 완료 (로컬 상태 기반)
- Firebase / Firestore 연동 예정 (Phase 1 백엔드)
- Llama AI 연동 예정 (Phase 2)

## 환경변수

`.env.example` 참고:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_KAKAO_JS_KEY=
```
