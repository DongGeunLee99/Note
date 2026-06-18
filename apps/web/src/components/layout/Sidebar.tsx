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
      className="w-40 flex-shrink-0 flex flex-col border-r"
      style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
    >
      <NavLink
        to="/home"
        className="px-3 py-2.5 text-[calc(12px*var(--fs))] font-medium border-b hover:opacity-75 transition-opacity"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span style={{ color: 'var(--color-primary)' }}>Smart</span>Note
      </NavLink>

      <p className="px-3 pt-2 pb-0.5 text-[calc(9px*var(--fs))] uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
        {t('sidebar.menu')}
      </p>

      <nav className="flex flex-col flex-1">
        {NAV_ITEMS.map(({ to, icon: Icon, labelKey }) => {
          const count = countByPath[to]
          return (
          <NavLink
            key={to}
            to={to}
            end={to === '/home'}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-[6px] text-[calc(11px*var(--fs))] border-r-2 transition-colors ${
                isActive
                  ? 'font-medium border-[var(--color-primary)] bg-[var(--color-surface)]'
                  : 'border-transparent hover-tint'
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
            })}
          >
            <Icon size={15} />
            <span className="flex-1">{t(`sidebar.${labelKey}`)}</span>
            {count > 0 && (
              <span
                className="text-[calc(9px*var(--fs))] px-1.5 py-px rounded-full"
                style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary-emphasis)' }}
              >
                {count}
              </span>
            )}
          </NavLink>
          )
        })}

        <div className="mt-auto border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="px-3 pt-2 pb-0.5 text-[calc(9px*var(--fs))] uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
            {t('sidebar.account')}
          </p>

          {/* 프로필 행 */}
          <div className="flex items-center gap-2 px-3 py-2">
            {profile?.profileImage ? (
              <img
                src={profile.profileImage}
                alt=""
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[calc(10px*var(--fs))] font-medium text-white"
                style={{ background: 'var(--color-primary)' }}
              >
                {initial}
              </div>
            )}
            <span className="flex-1 text-[calc(11px*var(--fs))] font-medium truncate">{name}</span>
            <button
              onClick={handleLogout}
              className="p-1 rounded hover-tint transition-colors flex-shrink-0"
              title={t('sidebar.logout')}
            >
              <IconLogout size={13} style={{ color: 'var(--color-muted)' }} />
            </button>
          </div>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-[6px] text-[calc(11px*var(--fs))] border-r-2 transition-colors ${
                isActive
                  ? 'font-medium border-[var(--color-primary)] bg-[var(--color-surface)]'
                  : 'border-transparent hover-tint'
              }`
            }
            style={{ color: 'var(--color-muted)' }}
          >
            <IconSettings size={15} />
            <span>{t('sidebar.settings')}</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  )
}
