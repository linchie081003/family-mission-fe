import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, ListTodo, Settings, ClipboardCheck, LogOut, CalendarDays, BarChart3, MessageCircle, BookOpen, MoreHorizontal } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { NotificationBell } from '../context/NotificationContext'
import { useWebSocket } from '../hooks/useWebSocket'
import { useEffect, useMemo, useState } from 'react'
import { AppNotification, Family } from '../types'
import { api } from '../api'
import { CHAT_UNREAD_CHANGED } from '../utils/chatUnread'

type NavItem = {
  to: string
  icon: typeof Home
  label: string
  feature?: 'agenda_enabled' | 'quiz_enabled' | 'chat_enabled' | null
}

const primaryNav: NavItem[] = [
  { to: '/parent', icon: Home, label: 'Dashboard', feature: null },
  { to: '/parent/pending', icon: ClipboardCheck, label: 'Pending', feature: null },
  { to: '/parent/missions', icon: ListTodo, label: 'Misi', feature: null },
  { to: '/parent/children', icon: Users, label: 'Anak', feature: null },
]

const moreNav: NavItem[] = [
  { to: '/parent/reports', icon: BarChart3, label: 'Laporan', feature: null },
  { to: '/parent/agenda', icon: CalendarDays, label: 'Agenda', feature: 'agenda_enabled' },
  { to: '/parent/quizzes', icon: BookOpen, label: 'Quiz', feature: 'quiz_enabled' },
  { to: '/parent/chat', icon: MessageCircle, label: 'Chat', feature: 'chat_enabled' },
  { to: '/parent/settings', icon: Settings, label: 'Setting', feature: null },
]

function filterNav(items: NavItem[], family: Family | null) {
  return items.filter(item => {
    if (!item.feature) return true
    if (!family) return false
    return family[item.feature]
  })
}

export default function ParentLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [pendingAlert, setPendingAlert] = useState(false)
  const [family, setFamily] = useState<Family | null>(null)
  const [chatUnread, setChatUnread] = useState(0)
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    api.me()
      .then(data => {
        setFamily(data)
        // #region agent log
        fetch('http://127.0.0.1:7410/ingest/854632dd-cdea-49d3-96b1-81d13bd84cb6', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b984bf' }, body: JSON.stringify({ sessionId: 'b984bf', runId: 'parent-nav', hypothesisId: 'H1', location: 'ParentLayout.tsx:me', message: 'family loaded', data: { chat_enabled: data.chat_enabled, quiz_enabled: data.quiz_enabled, agenda_enabled: data.agenda_enabled }, timestamp: Date.now() }) }).catch(() => {})
        // #endregion
      })
      .catch(err => {
        setFamily(null)
        // #region agent log
        fetch('http://127.0.0.1:7410/ingest/854632dd-cdea-49d3-96b1-81d13bd84cb6', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b984bf' }, body: JSON.stringify({ sessionId: 'b984bf', runId: 'parent-nav', hypothesisId: 'H2', location: 'ParentLayout.tsx:me', message: 'api.me failed', data: { error: err instanceof Error ? err.message : String(err) }, timestamp: Date.now() }) }).catch(() => {})
        // #endregion
      })
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
    if (event === 'mission_pending' || (event === 'redemption_pending' && family?.rewards_enabled)) {
      setPendingAlert(true)
    }
    if ((event === 'chat_message' || event === 'chat_unread') && family?.chat_enabled) {
      window.dispatchEvent(new Event(CHAT_UNREAD_CHANGED))
    }
  })

  const moreItems = useMemo(() => filterNav(moreNav, family), [family])

  useEffect(() => {
    if (!family) return
    const chatInMore = moreItems.some(item => item.to === '/parent/chat')
    // #region agent log
    fetch('http://127.0.0.1:7410/ingest/854632dd-cdea-49d3-96b1-81d13bd84cb6', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b984bf' }, body: JSON.stringify({ sessionId: 'b984bf', runId: 'parent-nav', hypothesisId: 'H3', location: 'ParentLayout.tsx:nav', message: 'nav computed', data: { chatInMore, moreCount: moreItems.length, chat_enabled: family.chat_enabled }, timestamp: Date.now() }) }).catch(() => {})
    // #endregion
  }, [family, moreItems])

  const isMoreActive = moreItems.some(item => location.pathname.startsWith(item.to))

  const handleNotificationNav = (n: AppNotification) => {
    if (n.type === 'chat' && family?.chat_enabled) navigate('/parent/chat')
    else if (n.type.includes('pending')) navigate('/parent/pending')
    else if (n.type === 'agenda' && family?.agenda_enabled) navigate('/parent/agenda')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-primary-600 text-white px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">👨‍👩‍👧 Family Mission</h1>
          <div className="flex items-center gap-1">
            <NotificationBell onNavigate={handleNotificationNav} />
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg" aria-label="Keluar">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <Outlet context={{ pendingAlert, clearAlert: () => setPendingAlert(false), family }} />
      </main>

      {showMore && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)}>
          <div
            className="absolute bottom-16 left-4 right-4 max-w-lg mx-auto bg-white rounded-xl shadow-xl border p-2 grid grid-cols-4 gap-1"
            onClick={e => e.stopPropagation()}
          >
            {moreItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setShowMore(false)}
                className="relative flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-50 text-xs font-semibold text-gray-600"
              >
                <Icon size={20} />
                {label}
                {to === '/parent/chat' && chatUnread > 0 && (
                  <span className="absolute top-1 right-2 min-w-[14px] h-[14px] px-0.5 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center">
                    {chatUnread > 9 ? '9+' : chatUnread}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2">
        <div className="max-w-lg mx-auto flex justify-around">
          {primaryNav.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-semibold ${
                  active ? 'text-primary-600' : 'text-gray-400'
                }`}
              >
                <div className="relative">
                  <Icon size={20} />
                  {to === '/parent/pending' && pendingAlert && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                  )}
                </div>
                {label}
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => setShowMore(v => !v)}
            className={`relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-semibold ${
              isMoreActive ? 'text-primary-600' : 'text-gray-400'
            }`}
          >
            <MoreHorizontal size={20} />
            More
            {chatUnread > 0 && family?.chat_enabled && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center">
                {chatUnread > 9 ? '9+' : chatUnread}
              </span>
            )}
          </button>
        </div>
      </nav>
    </div>
  )
}
