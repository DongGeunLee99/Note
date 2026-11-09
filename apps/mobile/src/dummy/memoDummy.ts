import { Timestamp } from 'firebase/firestore'
import type { Memo, MemoLocation } from '@smartnote/shared/types'

// 더미데이터 단계용 초기 메모 (앱 재시작 시 이 상태로 돌아감)

const NO_LOCATION: MemoLocation = { lat: null, lng: null, label: null }

/** 지금으로부터 minutesAgo분 전 Timestamp */
const ago = (minutesAgo: number) => Timestamp.fromMillis(Date.now() - minutesAgo * 60_000)

function memo(memoId: string, title: string, body: string, minutesAgo: number, extra: Partial<Memo> = {}): Memo {
  const at = ago(minutesAgo)
  return {
    memoId, title, body,
    aiSummary: null, aiProcessed: false, aiProcessedAt: null, aiSummaryBody: null, aiSummaryEdited: false,
    detectedAlarms: [], location: NO_LOCATION, pinnedAt: null,
    isDeleted: false, deletedAt: null, createdAt: at, updatedAt: at,
    ...extra,
  }
}

const PROJECT_BODY = '모바일 앱 1단계 알람 화면 완료. 다음은 메모 화면 작업. 더미데이터로 먼저 만들고 Firebase는 나중에 붙이기. 캘린더 로직은 다시 설계 필요.'

export const DUMMY_MEMOS: Memo[] = [
  memo('m-1', '자주 쓰는 비밀번호 힌트', '은행: 첫 강아지 이름 + 생일\n회사 메일: 분기마다 변경', 60 * 24 * 10, {
    pinnedAt: Date.now() - 1000,
  }),
  memo('m-2', '치과 예약', '내일 오전 10시 치과 예약. 보험증이랑 신분증 챙기기', 30, {
    location: { lat: null, lng: null, label: '역삼동' },
  }),
  memo('m-3', '프로젝트 진행 메모', PROJECT_BODY, 60 * 5, {
    aiSummary: '모바일 앱 1단계 알람 화면 완료. 다음은 메모 화면 작업. (외 2개 항목)',
    aiProcessed: true,
    aiProcessedAt: ago(60 * 5),
    aiSummaryBody: PROJECT_BODY,
  }),
  memo('m-4', '', '장보기: 우유, 계란, 두부, 바나나', 60 * 24 * 2),
  memo('m-5', '읽고 싶은 책', '사피엔스, 데미안, 아몬드', 60 * 24 * 7, {
    location: { lat: null, lng: null, label: '판교동' },
  }),
]
