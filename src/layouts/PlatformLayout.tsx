import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Building2, History, LogOut, Shield, BookOpen, Settings,
  LayoutDashboard, UserPlus, Share2, Megaphone, CreditCard, MoreHorizontal,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'

const primaryNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Home', end: true },
  { to: '/admin/activations', icon: UserPlus, label: 'Aktivasi', badge: true },
  { to: '/admin/tenants', icon: Building2, label: 'Tenant' },
  { to: '/admin/referrals', icon: Share2, label: 'Referral' },
  { to: '/admin/broadcast', icon: Megaphone, label: 'Broadcast' },
]

const moreNav = [
  { to: '/admin/billing', icon: CreditCard, label: 'Billing' },
  { to: '/admin/templates', icon: BookOpen, label: 'Quiz' },
  { to: '/admin/audit', icon: History, label: 'Audit' },
  { to: '/admin/settings', icon: Settings, label: 'Admin' },
]

export default function PlatformLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [pendingCount, setPendingCount] = useState(0)
  const [unreadNotif, setUnreadNotif] = useState(0)
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    api.platformPendingActivationCount().then(r => setPendingCount(r.count)).catch(() => undefined)
    api.platformNotificationsUnreadCount().then(r => setUnreadNotif(r.count)).catch(() => undefined)
    const interval = setInterval(() => {
      api.platformPendingActivationCount().then(r => setPendingCount(r.count)).catch(() => undefined)
    }, 60000)
    return () => clearInterval(interval)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isMoreActive = moreNav.some(item => location.pathname.startsWith(item.to))

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-slate-50 to-indigo-50/30">
      <header className="bg-slate-900 text-white px-4 py-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield size={22} className="text-indigo-300" />
            <h1 className="text-lg font-bold">Super Admin</h1>
            {unreadNotif > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadNotif}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Link to="/admin/settings" className="p-2 hover:bg-white/10 rounded-lg" aria-label="Settings">
              <Settings size={20} />
            </Link>
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg" aria-label="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-4">
        <Outlet />
      </main>

      {showMore && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-16 left-4 right-4 max-w-3xl mx-auto bg-white rounded-xl shadow-xl border p-2 grid grid-cols-4 gap-1"
            onClick={e => e.stopPropagation()}>
            {moreNav.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} onClick={() => setShowMore(false)}
                className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-600">
                <Icon size={20} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-gray-200 px-2 py-2">
        <div className="max-w-3xl mx-auto flex justify-around">
          {primaryNav.map(({ to, icon: Icon, label, end, badge }) => {
            const active = end ? location.pathname === to : location.pathname.startsWith(to)
            return (
              <Link key={to} to={to}
                className={`relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-semibold ${
                  active ? 'text-indigo-700' : 'text-gray-400'
                }`}>
                <Icon size={18} />
                {label}
                {badge && pendingCount > 0 && (
                  <span className="absolute -top-0.5 right-0 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </Link>
            )
          })}
          <button type="button" onClick={() => setShowMore(v => !v)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-semibold ${
              isMoreActive ? 'text-indigo-700' : 'text-gray-400'
            }`}>
            <MoreHorizontal size={18} />
            More
          </button>
        </div>
      </nav>
    </div>
  )
}
