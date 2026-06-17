import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuthContext } from '@/contexts/AuthContext'
import { useAlarmStore } from '@/stores/useAlarmStore'

export default function AppLayout() {
  const { user } = useAuthContext()
  const subscribe = useAlarmStore(s => s.subscribe)
  const unsubscribe = useAlarmStore(s => s.unsubscribe)

  useEffect(() => {
    if (!user) return
    subscribe(user.uid)
    return () => unsubscribe()
  }, [user, subscribe, unsubscribe])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-surface-3)' }}>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--color-surface)' }}>
        <Outlet />
      </main>
    </div>
  )
}
