import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, ListTodo, User, LogOut, BookOpen, MessageCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { NotificationBell } from '../context/NotificationContext'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { CHAT_UNREAD_CHANGED } from '../utils/chatUnread'
import { celebrate } from '../utils/celebrate'
import { useWebSocket } from '../hooks/useWebSocket'
import AppShell from '../components/AppShell'
import ColorfulPageHeader from '../components/colorful/ColorfulPageHeader'
import ColorfulBottomNav from '../components/colorful/ColorfulBottomNav'

const PAGE_TITLES: Record<string, string> = {
  '/child': 'Kids',
  '/child/missions': 'Missions',
  '/child/quiz': 'Quiz',
  '/child/chat': 'Chat',
  '/child/exchange': 'Rewards',
  '/child/profile': 'Profile',
}

function resolveTitle(pathname: string) {
  return PAGE_TITLES[pathname] ?? 'Kids'
}

export default function ChildLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [features, setFeatures] = useState<{
    quiz_enabled: boolean
    chat_enabled: boolean
    chat_unread_count: number
    rewards_enabled: boolean
  } | null>(null)
  const levelKey = 'fm_child_level'

  useEffect(() => {
    api.childHome().then(data => {
      const home = data as {
        child: { level: string }
        quiz_enabled?: boolean
        chat_enabled?: boolean
        chat_unread_count?: number
        rewards_enabled?: boolean
      }
      setFeatures({
        quiz_enabled: Boolean(home.quiz_enabled),
        chat_enabled: Boolean(home.chat_enabled),
        chat_unread_count: Number(home.chat_unread_count || 0),
        rewards_enabled: Boolean(home.rewards_enabled),
      })
      const prev = sessionStorage.getItem(levelKey)
      if (prev && prev !== home.child.level) celebrate('level')
      sessionStorage.setItem(levelKey, home.child.level)
    }).catch(() => setFeatures({
      quiz_enabled: false,
      chat_enabled: false,
      chat_unread_count: 0,
      rewards_enabled: false,
    }))
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

  const rightNav = useMemo(() => {
    const items = []
    if (features?.quiz_enabled) {
      items.push({ to: '/child/quiz', icon: BookOpen, label: 'Quiz' })
    }
    if (features?.chat_enabled) {
      items.push({
        to: '/child/chat',
        icon: MessageCircle,
        label: 'Chat',
        badge: features.chat_unread_count,
      })
    }
    if (items.length < 2) {
      items.push({ to: '/child/profile', icon: User, label: 'Profil' })
    }
    while (items.length < 2) {
      items.push({ to: '/child/missions', icon: ListTodo, label: 'Misi' })
    }
    return items.slice(0, 2)
  }, [features])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const fabTo = features?.rewards_enabled ? '/child/exchange' : '/child/missions'

  return (
    <AppShell>
      <ColorfulPageHeader
        title={resolveTitle(location.pathname)}
        rightSlot={(
          <div className="flex items-center gap-0.5 text-white">
            <NotificationBell onNavigate={() => navigate('/child/profile')} />
            <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10" aria-label="Keluar">
              <LogOut size={20} />
            </button>
          </div>
        )}
      />

      <main className="max-w-lg mx-auto px-4 py-2">
        <Outlet />
      </main>

      <ColorfulBottomNav
        pathname={location.pathname}
        left={[
          { to: '/child', icon: Home, label: 'Home', end: true },
          { to: '/child/missions', icon: ListTodo, label: 'Misi' },
        ]}
        fab={{
          to: fabTo,
          useBrandLogo: true,
          ariaLabel: features?.rewards_enabled ? 'Tukar reward' : 'Misi',
        }}
        right={rightNav}
      />
    </AppShell>
  )
}
