import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { PlatformFamily, PlatformNotification, PlatformStats } from '../../types'

export default function PlatformDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [pending, setPending] = useState<PlatformFamily[]>([])
  const [notifications, setNotifications] = useState<PlatformNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.platformStats(),
      api.platformPendingActivation(5, 0),
      api.platformNotifications(true),
    ]).then(([statsRes, pendingRes, notifRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value)
      if (pendingRes.status === 'fulfilled') setPending(pendingRes.value.items)
      if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Memuat dashboard...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Ringkasan operasional platform</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-2">
          <div className="card bg-slate-900 text-white">
            <p className="text-xs text-slate-300">Total Keluarga</p>
            <p className="text-2xl font-bold">{stats.families_total}</p>
          </div>
          <div className="card border-amber-200 bg-amber-50">
            <p className="text-xs text-amber-700">Menunggu Aktivasi</p>
            <p className="text-2xl font-bold text-amber-800">{stats.pending_activation_count ?? 0}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-500">Tenant Nonaktif</p>
            <p className="text-2xl font-bold">{stats.families_pending ?? 0}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-500">Notif Belum Dibaca</p>
            <p className="text-2xl font-bold">{stats.platform_notifications_unread ?? 0}</p>
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div className="card space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">Menunggu Aktivasi</h3>
            <Link to="/admin/activations" className="text-xs text-indigo-600 font-semibold">Lihat semua ›</Link>
          </div>
          {pending.map(f => (
            <div key={f.id} className="text-sm border-b border-gray-100 pb-2 last:border-0">
              <p className="font-semibold">{f.family_name}</p>
              <p className="text-gray-500 text-xs">{f.email}</p>
            </div>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="card space-y-2">
          <h3 className="font-semibold text-sm">Notifikasi Terbaru</h3>
          {notifications.map(n => {
            const paymentId = n.type === 'payment_proof_uploaded' && n.data?.payment_id
            const inner = (
              <>
                <p className="font-semibold">{n.title}</p>
                <p className="text-gray-500 text-xs">{n.body}</p>
              </>
            )
            if (paymentId) {
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => navigate(`/admin/billing/verification?payment_id=${paymentId}`)}
                  className="w-full text-left text-sm border-b border-gray-100 pb-2 last:border-0 hover:bg-slate-50 rounded-lg px-1"
                >
                  {inner}
                </button>
              )
            }
            return (
              <div key={n.id} className="text-sm border-b border-gray-100 pb-2 last:border-0">
                {inner}
              </div>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Link to="/admin/activations" className="card text-center py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
          Aktivasi Baru
        </Link>
        <Link to="/admin/tenants" className="card text-center py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
          Kelola Tenant
        </Link>
        <Link to="/admin/referrals" className="card text-center py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
          Referral
        </Link>
        <Link to="/admin/broadcast" className="card text-center py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
          Broadcast
        </Link>
        <Link to="/admin/billing" className="card text-center py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
          Billing
        </Link>
        <Link to="/admin/audit" className="card text-center py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
          Audit Trail
        </Link>
      </div>
    </div>
  )
}
