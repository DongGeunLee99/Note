import type { ToolbarProps } from 'react-big-calendar'
import type { CalView, RbcEvent } from './types'

export default function CalendarToolbar({ label, onNavigate, view, onView }: ToolbarProps<RbcEvent>) {
  return (
    <div className="rbc-toolbar">
      <div className="rbc-btn-group">
        <button onClick={() => onNavigate('PREV')}>‹</button>
        <button onClick={() => onNavigate('TODAY')}>Today</button>
        <button onClick={() => onNavigate('NEXT')}>›</button>
      </div>
      <span className="rbc-toolbar-label">{label}</span>
      <div className="rbc-btn-group">
        {(['month', 'week', 'day'] as CalView[]).map(v => (
          <button key={v} onClick={() => onView(v)} className={view === v ? 'rbc-active' : ''}>
            {v === 'month' ? 'Month' : v === 'week' ? 'Week' : 'Day'}
          </button>
        ))}
      </div>
    </div>
  )
}
