import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import type { Alarm } from '@smartnote/shared/types'
import { useAlarmStore } from '@/stores/useAlarmStore'
import { sendTestNotification } from '@/services/notificationService'
import { startAlarmSound, stopAlarmSound } from '@/services/alarmSound'
import { matchesNow, minuteKey, isOneTime } from './alarmFireUtils'
import AlarmRingModal from './AlarmRingModal'

const TICK_MS = 15_000 // 15초마다 검사

/**
 * 포그라운드 알람 발생기. 탭이 열려있는 동안 알람 시각을 감지해
 * 소리 + 울림 모달 + OS 알림을 띄운다. (백그라운드는 후속: Service Worker)
 */
export default function AlarmScheduler() {
  const { alarms, groups, toggleAlarm } = useAlarmStore(useShallow(s => ({
    alarms: s.alarms, groups: s.groups, toggleAlarm: s.toggleAlarm,
  })))
  const { t } = useTranslation()
  const [ringing, setRinging] = useState<Alarm | null>(null)

  // 항상 최신 값을 티커가 읽도록 ref로 보관
  const dataRef = useRef({ alarms, groups, ringing })
  dataRef.current = { alarms, groups, ringing }
  // 같은 분 내 중복 발생 방지 (분이 바뀌면 초기화)
  const firedRef = useRef<{ minute: string; ids: Set<string> }>({ minute: '', ids: new Set() })

  useEffect(() => {
    function fire(alarm: Alarm) {
      setRinging(alarm)
      startAlarmSound()
      void sendTestNotification(alarm.label || t('alarm.ringTitle'))
      if (isOneTime(alarm)) toggleAlarm(alarm.alarmId) // 일회성: 발생 후 끔
    }

    function tick() {
      const now = new Date()
      const mk = minuteKey(now)
      if (firedRef.current.minute !== mk) firedRef.current = { minute: mk, ids: new Set() }

      const { alarms, groups, ringing } = dataRef.current
      if (ringing) return // 울리는 중엔 새로 안 잡음

      for (const alarm of alarms) {
        if (!alarm.isEnabled) continue
        const group = groups.find(g => g.groupId === alarm.groupId)
        if (!group?.isEnabled) continue
        if (!matchesNow(alarm, now)) continue
        if (firedRef.current.ids.has(alarm.alarmId)) continue
        firedRef.current.ids.add(alarm.alarmId)
        fire(alarm)
        break // 한 번에 하나만
      }
    }

    tick()
    const id = setInterval(tick, TICK_MS)
    return () => clearInterval(id)
  }, [t, toggleAlarm])

  function handleDismiss() {
    stopAlarmSound()
    setRinging(null)
  }

  if (!ringing) return null
  return <AlarmRingModal alarm={ringing} onDismiss={handleDismiss} />
}
