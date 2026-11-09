import type { ClassifiedCategory } from '@smartnote/shared/services/llamaService'

// 더미데이터 단계용 홈 최근 기록 (앱 재시작 시 이 상태로 돌아감)

export interface RecentEntry {
  id: string
  text: string
  category: ClassifiedCategory
  createdAt: Date
  /** 실제 알람/메모로 만들어졌는지. false면 받을 화면이 아직 없어 기록만 된 상태 */
  linked: boolean
}

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000)

export const DUMMY_RECENT_ENTRIES: RecentEntry[] = [
  { id: 'r-1', text: '내일 오전 10시 치과 예약', category: '메모', createdAt: minutesAgo(30), linked: true },
  { id: 'r-2', text: '주말에 대청소하기', category: '할일', createdAt: minutesAgo(90), linked: false },
  { id: 'r-3', text: '나중에 보험 약관 읽어보기', category: '나중에', createdAt: minutesAgo(60 * 5), linked: false },
  { id: 'r-4', text: '언젠가 아이슬란드 여행 가기', category: '언젠가', createdAt: minutesAgo(60 * 26), linked: false },
  { id: 'r-5', text: '13시에 약 먹기 알람', category: '알람', createdAt: minutesAgo(60 * 50), linked: true },
]
