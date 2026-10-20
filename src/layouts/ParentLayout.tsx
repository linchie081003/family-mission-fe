import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, ListTodo, Settings, LogOut, CalendarDays, BarChart3, MessageCircle, BookOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { NotificationBell } from '../context/NotificationContext'
import { useWebSocket } from '../hooks/useWebSocket'
import { useEffect, useMemo, useState } from 'react'
import { AppNotification, Family } from '../types'
import { api } from '../api'
import { CHAT_UNREAD_CHANGED } from '../utils/chatUnread'
import AppShell from '../components/AppShell'
import ColorfulPageHeader from '../components/colorful/ColorfulPageHeader'
import ColorfulBottomNav from '../components/colorful/ColorfulBottomNav'

type NavItem = {
  to: string
  icon: typeof Home
  label: string
  feature?: 'agenda_enabled' | 'quiz_enabled' | 'chat_enabled' | null
}

const moreNav: NavItem[] = [
  { to: '/parent/reports', icon: BarChart3, label: 'Laporan', feature: null },
  { to: '/parent/agenda', icon: CalendarDays, label: 'Agenda', feature: 'agenda_enabled' },
  { to: '/parent/quizzes', icon: BookOpen, label: 'Quiz', feature: 'quiz_enabled' },
  { to: '/parent/chat', icon: MessageCircle, label: 'Chat', feature: 'chat_enabled' },
  { to: '/parent/settings', icon: Settings, label: 'Setting', feature: null },
]

const PAGE_TITLES: Record<string, string> = {
  '/parent': 'Parents',
  '/parent/pending': 'Pending',
  '/parent/missions': 'Missions',
  '/parent/children': 'Kids',
  '/parent/reports': 'Reports',
  '/parent/agenda': 'Agenda',
  '/parent/quizzes': 'Quiz',
  '/parent/chat': 'Chat',
  '/parent/settings': 'Settings',
  '/parent/upgrade': 'Upgrade',
}

function filterNav(items: NavItem[], family: Family | null) {
  return items.filter(item => {
    if (!item.feature) return true
    if (!family) return false
    return family[item.feature]
  })
}

function resolveTitle(pathname: string) {
  if (pathname.startsWith('/parent/children/')) return 'Kid Detail'
  const match = Object.keys(PAGE_TITLES)
    .sort((a, b) => b.length - a.length)
    .find(key => pathname === key || pathname.startsWith(`${key}/`))
  return match ? PAGE_TITLES[match] : 'Parents'
}

export default function ParentLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [pendingCount, setPendingCount] = useState(0)
  const [family, setFamily] = useState<Family | null>(null)
  const [chatUnread, setChatUnread] = useState(0)
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    api.me()
      .then(data => setFamily(data))
      .catch(() => setFamily(null))
  }, [location.pathname])

  useEffect(() => {
    api.getDashboard()
      .then(d => setPendingCount(d.pending_count))
      .catch(() => setPendingCount(0))
  }, [location.pathname])

  useEffect(() => {
    if (!family?.chat_enabled) return
    const refresh = () => {
      api.getChatUnreadCount().then(r => setChatUnread(r.count)).catch(() => setChatUnread(0))
    }
    refresh()
    window.addEventListener(CHAT_UNREAD_CHANGED, refresh)
    return () => window.removeEventListener(CHAT_UNREAD_CHANGED, refresh)
  }, [family?.chat_enabled, location.pathname])

  useWebSocket(event => {
    if (event === 'mission_pending' || event === 'redemption_pending') {
      setPendingCount(c => c + 1)
    }
    if ((event === 'chat_message' || event === 'chat_unread') && family?.chat_enabled) {
      window.dispatchEvent(new Event(CHAT_UNREAD_CHANGED))
    }
  })

  const moreItems = useMemo(() => filterNav(moreNav, family), [family])

  const handleNotificationNav = (n: AppNotification) => {
    if (n.type === 'chat' && family?.chat_enabled) navigate('/parent/chat')
    else if (n.type.includes('pending')) navigate('/parent/pending')
    else if (n.type === 'agenda' && family?.agenda_enabled) navigate('/parent/agenda')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const title = resolveTitle(location.pathname)

  return (
    <AppShell>
      <ColorfulPageHeader
        title={title}
        onMenu={() => setShowMore(true)}
        rightSlot={(
          <div className="flex items-center gap-0.5 text-white">
            <NotificationBell onNavigate={handleNotificationNav} />
            <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10" aria-label="Keluar">
              <LogOut size={20} />
            </button>
          </div>
        )}
      />

      <main className="max-w-lg mx-auto px-4 py-2">
        <Outlet context={{ clearPending: () => setPendingCount(0), family }} />
      </main>

      {showMore && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)}>
          <div
            className="absolute bottom-24 left-4 right-4 max-w-lg mx-auto card p-3 grid grid-cols-4 gap-2 shadow-doodle"
            onClick={e => e.stopPropagation()}
          >
            {moreItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setShowMore(false)}
                className="relative flex flex-col items-center gap-1 p-2 rounded-doodle hover:bg-doodle-cream text-[10px] font-bold text-doodle-muted"
              >
                <Icon size={22} className="text-doodle-sky" />
                {label}
                {to === '/parent/chat' && chatUnread > 0 && (
                  <span className="absolute top-0 right-1 min-w-[14px] h-[14px] px-0.5 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center">
                    {chatUnread > 9 ? '9+' : chatUnread}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      <ColorfulBottomNav
        pathname={location.pathname}
        left={[
          { to: '/parent', icon: Home, label: 'Home', end: true },
          { to: '/parent/missions', icon: ListTodo, label: 'Misi' },
        ]}
        fab={{
          to: '/parent/pending',
          useBrandLogo: true,
          badge: pendingCount,
          ariaLabel: 'Family Mission home',
        }}
        right={[
          { to: '/parent/children', icon: Users, label: 'Anak' },
          { to: '/parent/settings', icon: Settings, label: 'Menu' },
        ]}
      />
    </AppShell>
  )
}
