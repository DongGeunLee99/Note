// Phase 1 로컬 목업 데이터 모음.
// 알람·메모·휴지통·나중에·언젠가·오늘일정 mock은 전부 Firestore/실데이터 연동으로 대체됨.
// 홈 "최근 기록"만 아직 로컬 전용(별도 후속 작업 예정)이라 시드로 남아있음.

import type { RecentEntry } from '@/types/localItems'

export const INITIAL_HOME_ENTRIES: RecentEntry[] = [
  { id: 'e1', text: '내일 9시 병원 예약', category: '일정', createdAt: new Date(Date.now() - 1000 * 60 * 25) },
  { id: 'e2', text: '회사 프로젝트 회의 준비', category: '할일', createdAt: new Date(Date.now() - 1000 * 60 * 75) },
  { id: 'e3', text: '아이디어 — 주말에 블로그 포스팅', category: '메모', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25) },
]
