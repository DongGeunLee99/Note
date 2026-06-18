import { IconBell } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import type { Alarm } from '@smartnote/shared/types'
import { formatClock, useSettingsStore } from '@/stores/useSettingsStore'

interface AlarmRingModalProps {
  alarm: Alarm
  onDismiss: () => void
}

/** 알람 발생 시 뜨는 울림 화면. 배경 클릭으로 안 닫히고 "끄기"로만 종료. */
export default function AlarmRingModal({ alarm, onDismiss }: AlarmRingModalProps) {
  const { t } = useTranslation()
  const timeFormat = useSettingsStore(s => s.timeFormat)

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)' }}
    >
      <div
        className="w-72 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-xl"
        style={{ background: 'var(--color-surface)' }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center animate-pulse"
          style={{ background: 'var(--color-primary-subtle)' }}
        >
          <IconBell size={28} style={{ color: 'var(--color-primary)' }} />
        </div>

        <p className="text-[calc(11px*var(--fs))] font-semibold" style={{ color: 'var(--color-muted)' }}>
          {t('alarm.ringTitle')}
        </p>
        <p className="text-[calc(28px*var(--fs))] font-bold leading-none" style={{ color: 'var(--color-text)' }}>
          {formatClock(alarm.hour, alarm.minute, timeFormat)}
        </p>
        {alarm.label && (
          <p className="text-[calc(13px*var(--fs))] text-center" style={{ color: 'var(--color-text)' }}>{alarm.label}</p>
        )}

        <button
          onClick={onDismiss}
          className="mt-2 w-full py-2.5 rounded-xl text-white text-[calc(13px*var(--fs))] font-medium"
          style={{ background: 'var(--color-primary)' }}
        >
          {t('alarm.ringDismiss')}
        </button>
      </div>
    </div>
  )
}
