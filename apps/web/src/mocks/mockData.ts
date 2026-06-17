// Phase 1 로컬 목업 데이터 모음.
// Phase 2에서 Firestore 연동 시 이 파일과 스토어의 초기값 참조만 제거하면 된다.

import type { LocalMemo } from '@/types/localMemo'
import type { LaterItem, SomedayItem, TrashItem, RecentEntry, TodayScheduleItem } from '@/types/localItems'

// 알람 그룹/알람 mock은 Step 1에서 Firestore 연동으로 대체됨 (useAlarmStore가 실시간 구독)

export const INITIAL_MEMOS: LocalMemo[] = [
  {
    memoId: 'm1',
    title: '프로젝트 회의 메모',
    body: 'UI 리뷰 결과 — 모바일 대응 필요. 다음 스프린트에 반영하기로. 담당자 미정.',
    aiSummary: 'UI 리뷰 결론: 모바일 UI 개선을 다음 스프린트에 포함. (외 1개 항목)',
    aiReady: true,
    aiLoading: false,
    location: { lat: 37.5, lng: 127.03, label: '강남구 역삼동' },
    alarmSuggestion: null,
    alarmConfirmed: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 90),
  },
  {
    memoId: 'm2',
    title: '',
    body: '주말 장보기 목록\n우유, 계란, 두부, 양파, 감자, 소고기 (불고기용)',
    aiSummary: null,
    aiReady: false,
    aiLoading: false,
    location: { lat: null, lng: null, label: null },
    alarmSuggestion: null,
    alarmConfirmed: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
  },
  {
    memoId: 'm3',
    title: '블로그 아이디어',
    body: 'React 성능 최적화 시리즈. useMemo / useCallback 실전 사례 위주로 작성하기. 내일 오전 10시에 초안 작성 시작.',
    aiSummary: 'React 성능 최적화 블로그 시리즈 계획. useMemo/useCallback 중심으로 구성.',
    aiReady: true,
    aiLoading: false,
    location: { lat: null, lng: null, label: null },
    alarmSuggestion: (() => {
      const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0); return { datetime: d, label: '초안 작성 시작' }
    })(),
    alarmConfirmed: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
]

export const INITIAL_LATER: LaterItem[] = [
  { id: 'l1', text: '병원 예약 다시 확인하기', notifyAt: '오늘 오후 3:00', isCompleted: false },
  { id: 'l2', text: '프로젝트 제안서 이메일 보내기', notifyAt: '내일 오전 9:00', isCompleted: false },
  { id: 'l3', text: '도서관 책 반납', notifyAt: '이번 주 금요일', isCompleted: true },
]

export const INITIAL_SOMEDAY: SomedayItem[] = [
  { id: 's1', title: '일본 교토 여행', category: '여행', isFavorite: true },
  { id: 's2', title: 'TypeScript 심화 강의 듣기', category: '배움', isFavorite: false },
  { id: 's3', title: '스탠딩 데스크 구입', category: '구매', isFavorite: true },
  { id: 's4', title: '주말 캠핑 계획', category: '여행', isFavorite: false },
]

export const INITIAL_TRASH: TrashItem[] = [
  { id: 't1', type: 'memo',  title: '마케팅 아이디어 메모',   preview: 'SNS 캠페인 아이디어, 인플루언서 협업 방안 정리',  deletedAt: new Date(Date.now() - 1000 * 60 * 60 * 48) },
  { id: 't2', type: 'memo',  title: '회의 노트 초안',         preview: '3/14 스프린트 회고 — 이슈 목록 및 액션 아이템', deletedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 16) },
  { id: 't3', type: 'alarm', title: '헬스장 알람',            preview: '오전 6:30 · 평일',                               deletedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 27) },
  { id: 't4', type: 'later', title: '도서관 책 반납 확인',    preview: '이번 주 금요일까지',                             deletedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
  { id: 't5', type: 'memo',  title: '임시 메모',              preview: '...',                                            deletedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 29) },
]

export const INITIAL_HOME_ENTRIES: RecentEntry[] = [
  { id: 'e1', text: '내일 9시 병원 예약', category: '일정', createdAt: new Date(Date.now() - 1000 * 60 * 25) },
  { id: 'e2', text: '회사 프로젝트 회의 준비', category: '할일', createdAt: new Date(Date.now() - 1000 * 60 * 75) },
  { id: 'e3', text: '아이디어 — 주말에 블로그 포스팅', category: '메모', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25) },
]

export const INITIAL_TODAY_SCHEDULE: TodayScheduleItem[] = [
  { id: 'ts1', hour: 7,  minute: 30, title: '기상',         kind: '알람', group: '직장', tone: 'blue' },
  { id: 'ts2', hour: 9,  minute: 0,  title: '팀 회의',       kind: '일정', group: null,   tone: 'violet' },
  { id: 'ts3', hour: 12, minute: 30, title: '점심 약속',     kind: '일정', group: null,   tone: 'green' },
  { id: 'ts4', hour: 14, minute: 0,  title: '치과 예약',     kind: '일정', group: null,   tone: 'amber' },
  { id: 'ts5', hour: 16, minute: 0,  title: '프로젝트 리뷰',  kind: '일정', group: null,   tone: 'blue' },
  { id: 'ts6', hour: 18, minute: 30, title: '퇴근',          kind: '알람', group: '직장', tone: 'blue' },
  { id: 'ts7', hour: 20, minute: 0,  title: '운동',          kind: '일정', group: null,   tone: 'green' },
  { id: 'ts8', hour: 22, minute: 30, title: '취침 준비',     kind: '알람', group: '집',   tone: 'amber' },
]
