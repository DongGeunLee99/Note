import { Timestamp } from 'firebase/firestore'
import type { Alarm, AlarmGroup } from '@smartnote/shared/types'

// 더미데이터 단계용 초기 알람 데이터 (앱 재시작 시 이 상태로 돌아감)

const now = Timestamp.now()

function group(groupId: string, name: string, icon: string, color: string, order: number, isDefault = false): AlarmGroup {
  return { groupId, name, icon, color, order, isDefault, isEnabled: true, isDeleted: false, deletedAt: null, createdAt: now }
}

function alarm(alarmId: string, groupId: string, label: string, hour: number, minute: number, repeatDays: number[], isEnabled = true): Alarm {
  return {
    alarmId, groupId, label, hour, minute, repeatDays, isEnabled,
    sound: 'default', vibration: true, snooze: 0,
    sourceType: 'manual', sourceMemoId: null,
    isDeleted: false, deletedAt: null, createdAt: now, updatedAt: now,
  }
}

export const DUMMY_GROUPS: AlarmGroup[] = [
  group('g-work', '업무', '💼', '#185FA5', 0),
  group('g-life', '생활', '🏠', '#27500A', 1),
  group('g-etc', '기타', 'default', 'theme', 99, true),
]

export const DUMMY_ALARMS: Alarm[] = [
  alarm('a-1', 'g-work', '출근 준비', 7, 0, [1, 2, 3, 4, 5]),
  alarm('a-2', 'g-work', '주간 회의', 10, 30, [1]),
  alarm('a-3', 'g-work', '퇴근 정리', 18, 0, [1, 2, 3, 4, 5], false),
  alarm('a-4', 'g-life', '운동', 20, 0, [1, 3, 5]),
  alarm('a-5', 'g-life', '늦잠 기상', 9, 0, [0, 6]),
  alarm('a-6', 'g-etc', '약 먹기', 13, 0, [0, 1, 2, 3, 4, 5, 6]),
]
