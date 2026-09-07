import { useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  IconHome, IconBell, IconNote, IconClock, IconStar,
  IconCalendar, IconTrash, IconSettings, IconLogout, IconLayoutDashboard,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { useAuthContext } from '@/contexts/AuthContext'
import { useAlarmStore } from '@/stores/useAlarmStore'
import { useTrashStore } from '@/stores/useTrashStore'
import Tooltip from '@/components/common/Tooltip'

type NavItem = { to: string; icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; labelKey: 'home' | 'memo' | 'calendar' | 'alarm' | 'later' | 'someday' | 'dashboard' | 'trash' }

const NAV_ITEMS: NavItem[] = [
  { to: '/home', icon: IconHome, labelKey: 'home' },
  { to: '/memo', icon: IconNote, labelKey: 'memo' },
  { to: '/calendar', icon: IconCalendar, labelKey: 'calendar' },
  { to: '/alarm', icon: IconBell, labelKey: 'alarm' },
  { to: '/later', icon: IconClock, labelKey: 'later' },
  { to: '/someday', icon: IconStar, labelKey: 'someday' },
  { to: '/dashboard', icon: IconLayoutDashboard, labelKey: 'dashboard' },
  { to: '/trash', icon: IconTrash, labelKey: 'trash' },
]

function navLinkStyle({ isActive }: { isActive: boolean }) {
  return {
    background: isActive ? 'var(--color-primary-subtle)' : 'transparent',
    color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
  }
}

export default function Sidebar() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { logout, profile } = useAuthContext()
  const alarms = useAlarmStore(s => s.alarms)
  const groups = useAlarmStore(s => s.groups)
  const trashCount = useTrashStore(s => s.items.length)

  const name = profile?.nickname ?? ''
  const initial = name.charAt(0) || '·'

  // 활성 알람 수 = 알람 ON + 소속 그룹 ON
  const activeAlarmCount = useMemo(
    () => alarms.filter(a => a.isEnabled && groups.find(g => g.groupId === a.groupId)?.isEnabled).length,
    [alarms, groups],
  )
  // 메뉴별 뱃지 개수 (0이면 미표시). later는 Firestore 미연동이라 제외
  const countByPath: Record<string, number> = { '/alarm': activeAlarmCount, '/trash': trashCount }

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className="w-12 flex-shrink-0 flex flex-col items-center py-2 gap-1 border-r"
      style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
    >
      <nav className="flex flex-col items-center gap-1 flex-1">
        {NAV_ITEMS.map(({ to, icon: Icon, labelKey }) => {
          const count = countByPath[to]
          return (
            <Tooltip key={to} label={t(`sidebar.${labelKey}`)}>
              <NavLink
                to={to}
                end={to === '/home'}
                className={({ isActive }) => `relative w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${isActive ? '' : 'hover-tint'}`}
                style={navLinkStyle}
              >
                <Icon size={18} />
                {count > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-[3px] rounded-full flex items-center justify-center text-[calc(8px*var(--fs))] font-semibold"
                    style={{ background: 'var(--color-primary)', color: '#fff' }}
                  >
                    {count}
                  </span>
                )}
              </NavLink>
            </Tooltip>
          )
        })}
      </nav>

      <div className="flex flex-col items-center gap-1">
        <Tooltip label={t('sidebar.settings')}>
          <NavLink
            to="/settings"
            className={({ isActive }) => `w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${isActive ? '' : 'hover-tint'}`}
            style={navLinkStyle}
          >
            <IconSettings size={17} />
          </NavLink>
        </Tooltip>

        <Tooltip label={name}>
          {profile?.profileImage ? (
            <img src={profile.profileImage} alt="" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[calc(10px*var(--fs))] font-medium text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              {initial}
            </div>
          )}
        </Tooltip>

        <Tooltip label={t('sidebar.logout')}>
          <button
            onClick={handleLogout}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover-tint transition-colors"
          >
            <IconLogout size={16} style={{ color: 'var(--color-muted)' }} />
          </button>
        </Tooltip>
      </div>
    </aside>
  )
}
