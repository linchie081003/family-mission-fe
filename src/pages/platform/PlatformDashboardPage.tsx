import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Megaphone, UserPlus } from 'lucide-react'
import { api } from '../../api'
import { PlatformFamily, PlatformNotification, PlatformStats } from '../../types'
import GradientOrbButton from '../../components/colorful/GradientOrbButton'
import GradientFeatureCard from '../../components/colorful/GradientFeatureCard'

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

  const pendingCount = stats?.pending_activation_count ?? 0

  return (
    <div className="space-y-5">
      {stats && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="doodle-card p-4">
            <p className="text-white/90 text-xs font-bold">Total Keluarga</p>
            <p className="text-2xl font-extrabold">{stats.families_total}</p>
          </div>
          <div className="doodle-card-muted p-4">
            <p className="text-white/90 text-xs font-bold">Menunggu Aktivasi</p>
            <p className="text-2xl font-extrabold">{pendingCount}</p>
          </div>
        </div>
      )}

      <div className="flex justify-around gap-2 px-1">
        <GradientOrbButton
          to="/admin/activations"
          label="Activation"
          icon={UserPlus}
          badge={pendingCount}
        />
        <GradientOrbButton to="/admin/broadcast" label="Broadcast" icon={Megaphone} />
        <GradientOrbButton to="/admin/billing" label="Billing" icon={CreditCard} />
      </div>

      <div className="space-y-3">
        <GradientFeatureCard
          to="/admin/activations"
          title="New Activations"
          subtitle="Approve families"
          art="rocket"
          gradient="rose"
        />
        <GradientFeatureCard
          to="/admin/tenants"
          title="Tenant Manager"
          subtitle="Features & lifecycle"
          art="building"
          gradient="purple"
        />
        <GradientFeatureCard
          to="/admin/billing"
          title="Billing Hub"
          subtitle="Plans & payments"
          art="billing"
          gradient="green"
        />
        <GradientFeatureCard
          to="/admin/broadcast"
          title="Broadcasts"
          subtitle="Reach all tenants"
          art="broadcast"
          gradient="amber"
        />
        <GradientFeatureCard
          to="/admin/referrals"
          title="Referral Program"
          subtitle="Growth tracking"
          art="referral"
          gradient="blue"
        />
        <GradientFeatureCard
          to="/admin/audit"
          title="Audit Trail"
          subtitle="Compliance log"
          art="audit"
          gradient="teal"
        />
        <GradientFeatureCard
          to="/admin/templates"
          title="Quiz Templates"
          subtitle="Platform library"
          art="templates"
          gradient="purple"
        />
        <GradientFeatureCard
          to="/admin/settings"
          title="Admin Settings"
          subtitle="Profile & security"
          art="settings"
          gradient="blue"
        />
      </div>

      {pending.length > 0 && (
        <div className="card space-y-2">
          <h3 className="font-semibold text-sm">Menunggu Aktivasi</h3>
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
                  className="w-full text-left text-sm border-b border-gray-100 pb-2 last:border-0 hover:bg-sky-50 rounded-lg px-1"
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
    </div>
  )
}
