import type { ToolbarProps } from 'react-big-calendar'
import { useTranslation } from 'react-i18next'
import { formatToolbarTitle } from './calendarUtils'
import { useLang } from '@/i18n'
import type { CalView, RbcEvent } from './types'

export default function CalendarToolbar({ date, onNavigate, view, onView }: ToolbarProps<RbcEvent>) {
  const { t } = useTranslation()
  const lang = useLang()
  const viewLabels: Record<CalView, string> = { month: t('calendar.month'), week: t('calendar.week'), day: t('calendar.day') }

  return (
    <div className="rbc-toolbar">
      <div className="rbc-btn-group">
        <button onClick={() => onNavigate('PREV')}>‹</button>
        <button onClick={() => onNavigate('TODAY')}>{t('calendar.today')}</button>
        <button onClick={() => onNavigate('NEXT')}>›</button>
      </div>
      <span className="rbc-toolbar-label">{formatToolbarTitle(date, view as CalView, lang)}</span>
      <div className="rbc-btn-group">
        {(['month', 'week', 'day'] as CalView[]).map(v => (
          <button key={v} onClick={() => onView(v)} className={view === v ? 'rbc-active' : ''}>
            {viewLabels[v]}
          </button>
        ))}
      </div>
    </div>
  )
}
