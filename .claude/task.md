# TASK — 기능 구현 목록 (인덱스)

> 아키텍처 seam(공통 백엔드 + 플랫폼별 프론트) 기준으로 분리.
> 상태: `[ ]` 미시작 · `[~]` 진행 중 · `[x]` 완료. Step별 세부는 `todos/` 참고.

| 영역 | task | 비고 |
|---|---|---|
| 백엔드 (공통) | [tasks/backend.md](tasks/backend.md) | functions/ + Firestore + FCM/기기 라우팅. 3플랫폼 공유 |
| 웹 | [tasks/web.md](tasks/web.md) | apps/web 프론트엔드 (Phase 1 MVP 대부분 완료) |
| 데스크탑 | [tasks/electron.md](tasks/electron.md) | Phase 3 — 셸/OS알람/트레이/패키징 (착수 전) |
| 모바일 | [tasks/mobile.md](tasks/mobile.md) | Phase 4 — Expo/FCM/UI/배포 (착수 전) |

---

## 미결 사항 (TBD)

- [ ] Llama 호스팅 방식 결정 — Groq / Together AI / Ollama 자체 서버 중 선택
- [ ] 휴지통 적용 범위 확정 — 메모만 / 알람 포함 전체 / 알람 제외 전체
- [ ] 앱 이름 확정 — SmartNote 임시
