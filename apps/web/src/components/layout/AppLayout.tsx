import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-surface-3)' }}>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--color-surface)' }}>
        <Outlet />
      </main>
    </div>
  )
}
