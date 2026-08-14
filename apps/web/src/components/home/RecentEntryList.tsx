import { useState, useRef, useEffect } from 'react'
import { IconBell } from '@tabler/icons-react'
import Badge from '@/components/common/Badge'
import { TONES } from '@/theme/tones'
import { formatRelTime } from '@/utils/formatDate'
import { useTranslation } from 'react-i18next'
import { useLang } from '@/i18n'
import { useToast } from '@/contexts/ToastContext'
import { useHomeStore } from '@/stores/useHomeStore'
import { sendTestNotification } from '@/services/notificationService'
import { CATEGORY_CONFIG } from './categoryConfig'

export default function RecentEntryList() {
  const entries = useHomeStore(s => s.entries)
  const { t } = useTranslation()
  const lang = useLang()
  const toast = useToast()
  const [showNotifTips, setShowNotifTips] = useState(false)
  const tipsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showNotifTips) return
    function handleClick(e: MouseEvent) {
      if (tipsRef.current && !tipsRef.current.contains(e.target as Node)) {
        setShowNotifTips(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showNotifTips])

  async function handleTestNotification() {
    const result = await sendTestNotification(t('notification.testBody'))
    if (result === 'unsupported') toast(t('home.notifUnsupported'), 'error')
    if (result === 'denied') toast(t('home.notifDenied'), 'error')
  }

  return (
    <>
      <p className="text-[calc(10px*var(--fs))] font-medium" style={{ color: 'var(--color-muted)' }}>
        {t('home.recent', { n: entries.length })}
      </p>

      {entries.slice(0, 20).map(entry => {
        const cfg = CATEGORY_CONFIG[entry.category]
        return (
          <div
            key={entry.id}
            className="flex items-center gap-2 py-1.5 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: TONES[cfg.tone].bg }}
            >
              {cfg.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[calc(11px*var(--fs))] font-medium truncate">{entry.text}</p>
              <p className="text-[calc(9px*var(--fs))]" style={{ color: 'var(--color-muted)' }}>
                {formatRelTime(entry.createdAt, lang)}
              </p>
            </div>
            <Badge variant={cfg.tone}>{t(`category.${entry.category}`)}</Badge>
          </div>
        )
      })}

      <div className="relative mt-2" ref={tipsRef}>
        <div className="flex gap-1.5">
          <button
            onClick={handleTestNotification}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[calc(10px*var(--fs))] border transition-colors hover:opacity-80"
            style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
          >
            <IconBell size={12} />
            {t('home.notifTest')}
          </button>
          <button
            onClick={() => setShowNotifTips(v => !v)}
            className="w-6 h-6 my-auto flex items-center justify-center rounded-full border text-[calc(10px*var(--fs))] font-bold transition-colors hover:opacity-80 flex-shrink-0"
            style={showNotifTips
              ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }
              : { borderColor: 'var(--color-border-2)', color: 'var(--color-muted)' }
            }
          >
            ?
          </button>
        </div>
        {showNotifTips && (
          <div
            className="absolute right-0 top-8 z-50 w-52 rounded-xl border p-3 flex flex-col gap-2 shadow-lg"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-2)' }}
          >
            <p className="text-[calc(10px*var(--fs))] font-semibold" style={{ color: 'var(--color-text)' }}>
              {t('home.notifTipsTitle')}
            </p>
            {(t('notification.tips', { returnObjects: true }) as Array<{ step: string; label: string; desc: string }>).map(tip => (
              <div key={tip.step} className="flex gap-2">
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[calc(8px*var(--fs))] font-bold flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
                >
                  {tip.step}
                </span>
                <div>
                  <p className="text-[calc(10px*var(--fs))] font-medium leading-tight" style={{ color: 'var(--color-text)' }}>{tip.label}</p>
                  <p className="text-[calc(9px*var(--fs))] leading-tight mt-0.5" style={{ color: 'var(--color-muted)' }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
