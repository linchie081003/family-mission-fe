import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, ListTodo, Settings, ClipboardCheck, LogOut, CalendarDays, BarChart3, MessageCircle, BookOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { NotificationBell } from '../context/NotificationContext'
import { useWebSocket } from '../hooks/useWebSocket'
import { useEffect, useMemo, useState } from 'react'
import { AppNotification, Family } from '../types'
import { api } from '../api'
import { CHAT_UNREAD_CHANGED } from '../utils/chatUnread'

const baseNav = [
  { to: '/parent', icon: Home, label: 'Dashboard', feature: null },
  { to: '/parent/pending', icon: ClipboardCheck, label: 'Pending', feature: null },
  { to: '/parent/reports', icon: BarChart3, label: 'Laporan', feature: null },
  { to: '/parent/agenda', icon: CalendarDays, label: 'Agenda', feature: 'agenda_enabled' as const },
  { to: '/parent/quizzes', icon: BookOpen, label: 'Quiz', feature: 'quiz_enabled' as const },
  { to: '/parent/chat', icon: MessageCircle, label: 'Chat', feature: 'chat_enabled' as const },
  { to: '/parent/children', icon: Users, label: 'Anak', feature: null },
  { to: '/parent/missions', icon: ListTodo, label: 'Misi', feature: null },
  { to: '/parent/settings', icon: Settings, label: 'Setting', feature: null },
]

export default function ParentLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [pendingAlert, setPendingAlert] = useState(false)
  const [family, setFamily] = useState<Family | null>(null)
  const [chatUnread, setChatUnread] = useState(0)

  useEffect(() => {
    api.me().then(setFamily).catch(() => setFamily(null))
  }, [])

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

  const nav = useMemo(() => {
    return baseNav.filter(item => {
      if (!item.feature) return true
      if (!family) return false
      return family[item.feature]
    })
  }, [family])

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
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <Outlet context={{ pendingAlert, clearAlert: () => setPendingAlert(false), family }} />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2">
        <div className="max-w-lg mx-auto flex justify-around">
          {nav.map(({ to, icon: Icon, label }) => {
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
                  {to === '/parent/chat' && chatUnread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center">
                      {chatUnread > 9 ? '9+' : chatUnread}
                    </span>
                  )}
                  {to === '/parent/pending' && pendingAlert && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                  )}
                </div>
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
