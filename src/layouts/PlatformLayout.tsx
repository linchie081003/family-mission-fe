import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Building2, History, LogOut, BookOpen, Settings,
  LayoutDashboard, UserPlus, Share2, Megaphone, CreditCard, MoreHorizontal,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import AppShell from '../components/AppShell'
import ColorfulPageHeader from '../components/colorful/ColorfulPageHeader'
import ColorfulBottomNav from '../components/colorful/ColorfulBottomNav'

const moreNav = [
  { to: '/admin/billing', icon: CreditCard, label: 'Billing' },
  { to: '/admin/templates', icon: BookOpen, label: 'Quiz' },
  { to: '/admin/audit', icon: History, label: 'Audit' },
  { to: '/admin/referrals', icon: Share2, label: 'Referral' },
  { to: '/admin/broadcast', icon: Megaphone, label: 'Broadcast' },
  { to: '/admin/settings', icon: Settings, label: 'Admin' },
]

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Admin',
  '/admin/activations': 'Activation',
  '/admin/tenants': 'Tenants',
  '/admin/referrals': 'Referral',
  '/admin/broadcast': 'Broadcast',
  '/admin/billing': 'Billing',
  '/admin/templates': 'Templates',
  '/admin/audit': 'Audit',
  '/admin/settings': 'Settings',
}

function resolveTitle(pathname: string) {
  const match = Object.keys(PAGE_TITLES)
    .sort((a, b) => b.length - a.length)
    .find(key => pathname === key || pathname.startsWith(`${key}/`))
  return match ? PAGE_TITLES[match] : 'Admin'
}

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

  return (
    <AppShell>
      <ColorfulPageHeader
        maxWidthClass="max-w-3xl"
        title={resolveTitle(location.pathname)}
        onMenu={() => setShowMore(true)}
        rightSlot={(
          <div className="flex items-center gap-1 text-white">
            {unreadNotif > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-doodle-bar">{unreadNotif}</span>
            )}
            <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10" aria-label="Logout">
              <LogOut size={20} />
            </button>
          </div>
        )}
      />

      <main className="max-w-3xl mx-auto px-4 py-2">
        <Outlet />
      </main>

      {showMore && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)}>
          <div
            className="absolute bottom-24 left-4 right-4 max-w-3xl mx-auto card p-3 grid grid-cols-3 sm:grid-cols-4 gap-2 shadow-doodle"
            onClick={e => e.stopPropagation()}
          >
            {moreNav.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setShowMore(false)}
                className="flex flex-col items-center gap-1 p-2 rounded-doodle hover:bg-doodle-cream text-[10px] font-bold text-doodle-muted"
              >
                <Icon size={22} className="text-doodle-sky" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <ColorfulBottomNav
        maxWidthClass="max-w-3xl"
        pathname={location.pathname}
        left={[
          { to: '/admin', icon: LayoutDashboard, label: 'Home', end: true },
          { to: '/admin/activations', icon: UserPlus, label: 'Activate', badge: pendingCount },
        ]}
        fab={{
          to: '/admin',
          useBrandLogo: true,
          ariaLabel: 'Admin home',
        }}
        right={[
          { to: '/admin/tenants', icon: Building2, label: 'Tenant' },
          { to: '/admin/settings', icon: MoreHorizontal, label: 'More' },
        ]}
      />
    </AppShell>
  )
}
