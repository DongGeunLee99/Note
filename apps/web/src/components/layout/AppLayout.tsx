import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuthContext } from '@/contexts/AuthContext'
import { useAlarmStore } from '@/stores/useAlarmStore'
import { useMemoStore } from '@/stores/useMemoStore'
import { useTrashStore } from '@/stores/useTrashStore'
import { useCalendarStore } from '@/stores/useCalendarStore'

export default function AppLayout() {
  const { user } = useAuthContext()
  const subscribeAlarms = useAlarmStore(s => s.subscribe)
  const unsubscribeAlarms = useAlarmStore(s => s.unsubscribe)
  const subscribeMemos = useMemoStore(s => s.subscribe)
  const unsubscribeMemos = useMemoStore(s => s.unsubscribe)
  const subscribeTrash = useTrashStore(s => s.subscribe)
  const unsubscribeTrash = useTrashStore(s => s.unsubscribe)
  const subscribeEvents = useCalendarStore(s => s.subscribe)
  const unsubscribeEvents = useCalendarStore(s => s.unsubscribe)

  useEffect(() => {
    if (!user) return
    subscribeAlarms(user.uid)
    subscribeMemos(user.uid)
    subscribeTrash(user.uid)
    subscribeEvents(user.uid)
    return () => {
      unsubscribeAlarms()
      unsubscribeMemos()
      unsubscribeTrash()
      unsubscribeEvents()
    }
  }, [user, subscribeAlarms, unsubscribeAlarms, subscribeMemos, unsubscribeMemos, subscribeTrash, unsubscribeTrash, subscribeEvents, unsubscribeEvents])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-surface-3)' }}>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--color-surface)' }}>
        <Outlet />
      </main>
    </div>
  )
}
