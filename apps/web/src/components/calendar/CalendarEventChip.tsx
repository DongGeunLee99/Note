import type { EventProps } from 'react-big-calendar'
import type { RbcEvent } from './types'
import { useCalendarStore } from '@/stores/useCalendarStore'

/** react-big-calendar 월/주 뷰의 일정 칩. 우클릭 → 수정/삭제 메뉴 */
export default function CalendarEventChip({ event, title }: EventProps<RbcEvent>) {
  const openEventCtxMenu = useCalendarStore(s => s.openEventCtxMenu)
  return (
    <span
      className="block w-full h-full"
      onContextMenu={e => {
        e.preventDefault()
        e.stopPropagation()
        openEventCtxMenu(e.clientX, e.clientY, event.id)
      }}
    >
      {title}
    </span>
  )
}
