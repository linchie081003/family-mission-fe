import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, ListTodo, Gift, User, LogOut, BookOpen, MessageCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { NotificationBell } from '../context/NotificationContext'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { CHAT_UNREAD_CHANGED } from '../utils/chatUnread'
import { celebrate } from '../utils/celebrate'
import { useWebSocket } from '../hooks/useWebSocket'

const baseNav = [
  { to: '/child', icon: Home, label: 'Home', feature: null },
  { to: '/child/missions', icon: ListTodo, label: 'Misi', feature: null },
  { to: '/child/quiz', icon: BookOpen, label: 'Quiz', feature: 'quiz_enabled' as const },
  { to: '/child/chat', icon: MessageCircle, label: 'Chat', feature: 'chat_enabled' as const },
  { to: '/child/exchange', icon: Gift, label: 'Tukar', feature: null },
  { to: '/child/profile', icon: User, label: 'Profil', feature: null },
]

export default function ChildLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [features, setFeatures] = useState<{ quiz_enabled: boolean; chat_enabled: boolean; chat_unread_count: number } | null>(null)
  const levelKey = 'fm_child_level'

  useEffect(() => {
    api.childHome().then(data => {
      const home = data as { child: { level: string }; quiz_enabled?: boolean; chat_enabled?: boolean; chat_unread_count?: number }
      setFeatures({
        quiz_enabled: Boolean(home.quiz_enabled),
        chat_enabled: Boolean(home.chat_enabled),
        chat_unread_count: Number(home.chat_unread_count || 0),
      })
      const prev = sessionStorage.getItem(levelKey)
      if (prev && prev !== home.child.level) celebrate('level')
      sessionStorage.setItem(levelKey, home.child.level)
    }).catch(() => setFeatures({ quiz_enabled: false, chat_enabled: false, chat_unread_count: 0 }))
  }, [])

  useEffect(() => {
    if (!features?.chat_enabled) return
    const refresh = () => {
      api.getChildChatUnreadCount().then(r => {
        setFeatures(prev => prev ? { ...prev, chat_unread_count: r.count } : prev)
      }).catch(() => undefined)
    }
    refresh()
    window.addEventListener(CHAT_UNREAD_CHANGED, refresh)
    return () => window.removeEventListener(CHAT_UNREAD_CHANGED, refresh)
  }, [features?.chat_enabled, location.pathname])

  useWebSocket((event, data) => {
    if (event === 'chat_message' || event === 'chat_unread') {
      window.dispatchEvent(new Event(CHAT_UNREAD_CHANGED))
    }
    if (event === 'quiz_passed' || event === 'mission_approved') {
      api.childHome().then(homeData => {
        const home = homeData as { child: { level: string } }
        const prev = sessionStorage.getItem(levelKey)
        if (prev && prev !== home.child.level) celebrate('level')
        sessionStorage.setItem(levelKey, home.child.level)
      })
    }
    if (event === 'level_up' || (typeof data === 'object' && data && 'level' in data)) {
      celebrate('level')
    }
  })

  const nav = useMemo(() => {
    return baseNav.filter(item => {
      if (!item.feature) return true
      if (!features) return false
      return features[item.feature]
    })
  }, [features])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-indigo-50 to-white">
      <header className="px-4 py-3 flex justify-between items-center">
        <NotificationBell onNavigate={() => navigate('/child/profile')} />
        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-gray-600">
          <LogOut size={20} />
        </button>
      </header>

      <main className="max-w-lg mx-auto px-4 py-2">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-gray-200 px-1 py-2">
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
                {to === '/child/chat' && (features?.chat_unread_count || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center">
                    {(features?.chat_unread_count || 0) > 9 ? '9+' : features?.chat_unread_count}
                  </span>
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
