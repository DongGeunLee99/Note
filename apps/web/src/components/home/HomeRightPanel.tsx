import { useState, useRef, useEffect, useMemo } from 'react'
import { IconBell } from '@tabler/icons-react'
import Badge from '@/components/common/Badge'
import SectionLabel from '@/components/common/SectionLabel'
import Divider from '@/components/common/Divider'
import StatCards from '@/components/common/StatCards'
import { useToast } from '@/contexts/ToastContext'
import { useTranslation } from 'react-i18next'
import { useHomeStore } from '@/stores/useHomeStore'
import type { ClassifiedCategory } from '@/services/llamaService'
import { sendTestNotification } from '@/services/notificationService'
import { HOME_CATEGORIES, CATEGORY_CONFIG } from './categoryConfig'

export default function HomeRightPanel() {
  const toast = useToast()
  const { t } = useTranslation()
  const entries = useHomeStore(s => s.entries)
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

  const { todayCount, countByCategory } = useMemo(() => {
    const now = new Date()
    const counts: Partial<Record<ClassifiedCategory, number>> = {}
    let today = 0
    for (const e of entries) {
      counts[e.category] = (counts[e.category] ?? 0) + 1
      const d = e.createdAt
      if (d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        today++
      }
    }
    return { todayCount: today, countByCategory: counts }
  }, [entries])

  async function handleTestNotification() {
    const result = await sendTestNotification(t('notification.testBody'))
    if (result === 'unsupported') toast(t('home.notifUnsupported'), 'error')
    if (result === 'denied') toast(t('home.notifDenied'), 'error')
  }

  return (
    <div className="p-3 flex flex-col gap-3 h-full overflow-auto">
      <SectionLabel>{t('home.todayRecord')}</SectionLabel>
      <StatCards
        items={[
          { value: todayCount, label: t('common.all') },
          { value: countByCategory['할일'] ?? 0, label: t('category.할일') },
          { value: countByCategory['메모'] ?? 0, label: t('category.메모') },
        ]}
      />

      <Divider />

      <SectionLabel>{t('home.nextAlarm')}</SectionLabel>
      <div
        className="flex items-center gap-2 p-2 rounded-lg"
        style={{ background: 'var(--color-primary-subtle)' }}
      >
        <IconBell size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
        <div>
          <p className="text-[11px] font-medium" style={{ color: 'var(--color-primary-emphasis)' }}>오전 7:30</p>
          <p className="text-[9px]" style={{ color: 'var(--color-primary)' }}>기상 · 직장</p>
        </div>
      </div>

      <div className="relative" ref={tipsRef}>
        <div className="flex gap-1.5">
          <button
            onClick={handleTestNotification}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] border transition-colors hover:opacity-80"
            style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
          >
            <IconBell size={12} />
            {t('home.notifTest')}
          </button>
          <button
            onClick={() => setShowNotifTips(v => !v)}
            className="w-6 h-6 my-auto flex items-center justify-center rounded-full border text-[10px] font-bold transition-colors hover:opacity-80 flex-shrink-0"
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
            <p className="text-[10px] font-semibold" style={{ color: 'var(--color-text)' }}>
              {t('home.notifTipsTitle')}
            </p>
            {(t('notification.tips', { returnObjects: true }) as Array<{ step: string; label: string; desc: string }>).map(tip => (
              <div key={tip.step} className="flex gap-2">
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
                >
                  {tip.step}
                </span>
                <div>
                  <p className="text-[10px] font-medium leading-tight" style={{ color: 'var(--color-text)' }}>{tip.label}</p>
                  <p className="text-[9px] leading-tight mt-0.5" style={{ color: 'var(--color-muted)' }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Divider />

      <SectionLabel>{t('home.byCategory')}</SectionLabel>
      {HOME_CATEGORIES.map(cat => {
        const count = cat === 'AI' ? 0 : countByCategory[cat] ?? 0
        if (count === 0) return null
        return (
          <div key={cat} className="flex items-center justify-between text-[10px]">
            <span style={{ color: 'var(--color-muted)' }}>{t(`category.${cat}`)}</span>
            <Badge variant={CATEGORY_CONFIG[cat].tone}>{count}</Badge>
          </div>
        )
      })}
    </div>
  )
}
