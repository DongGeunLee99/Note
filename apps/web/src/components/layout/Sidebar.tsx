import { NavLink, useNavigate } from 'react-router-dom'
import {
  IconHome, IconBell, IconNote, IconClock, IconStar,
  IconCalendar, IconTrash, IconSettings, IconLogout,
} from '@tabler/icons-react'

type NavItem = { to: string; icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; label: string; count?: number }

// 실제 배포 시 useAuthContext()에서 가져옴
const MOCK_USER = { name: '홍길동', initial: '홍' }

const NAV_ITEMS: NavItem[] = [
  { to: '/', icon: IconHome, label: '홈' },
  { to: '/memo', icon: IconNote, label: '메모' },
  { to: '/calendar', icon: IconCalendar, label: '캘린더' },
  { to: '/alarm', icon: IconBell, label: '알람', count: 12 },
  { to: '/later', icon: IconClock, label: '나중에', count: 3 },
  { to: '/someday', icon: IconStar, label: '언젠가' },
  { to: '/trash', icon: IconTrash, label: '휴지통', count: 5 },
]

export default function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside
      className="w-40 flex-shrink-0 flex flex-col border-r"
      style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
    >
      <NavLink
        to="/"
        className="px-3 py-2.5 text-[12px] font-medium border-b hover:opacity-75 transition-opacity"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span style={{ color: 'var(--color-primary)' }}>Smart</span>Note
      </NavLink>

      <p className="px-3 pt-2 pb-0.5 text-[9px] uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
        메뉴
      </p>

      <nav className="flex flex-col flex-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label, count }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-[6px] text-[11px] border-r-2 transition-colors ${
                isActive
                  ? 'font-medium border-[var(--color-primary)] bg-[var(--color-surface)]'
                  : 'border-transparent hover:bg-white/60'
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
            })}
          >
            <Icon size={15} />
            <span className="flex-1">{label}</span>
            {count !== undefined && (
              <span
                className="text-[9px] px-1.5 py-px rounded-full"
                style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary-emphasis)' }}
              >
                {count}
              </span>
            )}
          </NavLink>
        ))}

        <div className="mt-auto border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="px-3 pt-2 pb-0.5 text-[9px] uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
            계정
          </p>

          {/* 프로필 행 */}
          <div className="flex items-center gap-2 px-3 py-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-medium text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              {MOCK_USER.initial}
            </div>
            <span className="flex-1 text-[11px] font-medium truncate">{MOCK_USER.name}</span>
            <button
              onClick={() => navigate('/login')}
              className="p-1 rounded hover:bg-black/5 transition-colors flex-shrink-0"
              title="로그아웃"
            >
              <IconLogout size={13} style={{ color: 'var(--color-muted)' }} />
            </button>
          </div>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-[6px] text-[11px] border-r-2 transition-colors ${
                isActive
                  ? 'font-medium border-[var(--color-primary)] bg-[var(--color-surface)]'
                  : 'border-transparent hover:bg-white/60'
              }`
            }
            style={{ color: 'var(--color-muted)' }}
          >
            <IconSettings size={15} />
            <span>설정</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  )
}
