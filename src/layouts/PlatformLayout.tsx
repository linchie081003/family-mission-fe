import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Building2, History, LogOut, Shield, BookOpen, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const nav = [
  { to: '/admin', icon: Building2, label: 'Tenant' },
  { to: '/admin/templates', icon: BookOpen, label: 'Quiz' },
  { to: '/admin/settings', icon: Settings, label: 'Admin' },
  { to: '/admin/audit', icon: History, label: 'Audit' },
]

export default function PlatformLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-slate-50 to-indigo-50/30">
      <header className="bg-slate-900 text-white px-4 py-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield size={22} className="text-indigo-300" />
            <h1 className="text-lg font-bold">Super Admin</h1>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg" aria-label="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-gray-200 px-4 py-2">
        <div className="max-w-3xl mx-auto flex justify-around">
          {nav.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg text-xs font-semibold ${
                  active ? 'text-indigo-700' : 'text-gray-400'
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
