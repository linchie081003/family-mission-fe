import { useEffect, useState } from 'react'
import { api } from '../../api'
import { PlatformFamily, PlatformNotification, PlatformStats } from '../../types'

const FEATURES = [
  { key: 'is_active' as const, label: 'Tenant Aktif', emoji: '🏠' },
  { key: 'quiz_enabled' as const, label: 'Quiz', emoji: '📝' },
  { key: 'chat_enabled' as const, label: 'Chat', emoji: '💬' },
  { key: 'agenda_enabled' as const, label: 'Agenda Keluarga', emoji: '📅' },
]

export default function PlatformTenantsPage() {
  const [families, setFamilies] = useState<PlatformFamily[]>([])
  const [notifications, setNotifications] = useState<PlatformNotification[]>([])
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    Promise.allSettled([
      api.platformFamilies(),
      api.platformStats(),
      api.platformNotifications(true),
    ])
      .then(([familiesResult, statsResult, notificationsResult]) => {
        if (familiesResult.status === 'fulfilled') {
          setFamilies(familiesResult.value)
        } else {
          setFamilies([])
          setError(familiesResult.reason instanceof Error ? familiesResult.reason.message : 'Gagal memuat keluarga')
        }
        if (statsResult.status === 'fulfilled') {
          setStats(statsResult.value)
        }
        if (notificationsResult.status === 'fulfilled') {
          setNotifications(notificationsResult.value)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const toggleFeature = async (family: PlatformFamily, key: typeof FEATURES[number]['key']) => {
    setSavingId(family.id)
    setError('')
    try {
      const updated = await api.platformUpdateFeatures(family.id, { [key]: !family[key] })
      setFamilies(prev => prev.map(f => (f.id === updated.id ? updated : f)))
      api.platformStats().then(setStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSavingId(null)
    }
  }

  const approveFamily = async (familyId: number) => {
    setSavingId(familyId)
    setError('')
    try {
      const updated = await api.platformApproveFamily(familyId)
      setFamilies(prev => prev.map(f => (f.id === updated.id ? updated : f)))
      const notif = notifications.find(n => n.family_id === familyId && !n.is_read)
      if (notif) {
        await api.platformMarkNotificationRead(notif.id).catch(() => undefined)
      }
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyetujui')
    } finally {
      setSavingId(null)
    }
  }

  const pendingFamilies = families.filter(f => !f.is_active)

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Memuat tenant...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Kelola Tenant</h2>
        <p className="text-sm text-gray-500 mt-1">
          Setujui pendaftaran baru dan kelola fitur per keluarga
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-2">
          <div className="card bg-slate-900 text-white">
            <p className="text-xs text-slate-300">Total Keluarga</p>
            <p className="text-2xl font-bold">{stats.families_total}</p>
          </div>
          <div className="card border-amber-200 bg-amber-50">
            <p className="text-xs text-amber-700">Menunggu Persetujuan</p>
            <p className="text-2xl font-bold text-amber-700">{stats.families_pending ?? pendingFamilies.length}</p>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {pendingFamilies.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-amber-800">Pendaftaran Baru</h3>
          {pendingFamilies.map(family => (
            <div key={family.id} className="card border-amber-200 bg-amber-50/70 flex justify-between items-center gap-3">
              <div>
                <p className="font-bold">{family.family_name}</p>
                <p className="text-sm text-gray-600">{family.email}</p>
                <p className="text-xs font-mono text-indigo-600">Kode: {family.family_code}</p>
              </div>
              <button
                type="button"
                disabled={savingId === family.id}
                onClick={() => approveFamily(family.id)}
                className="btn-primary shrink-0"
              >
                Setujui
              </button>
            </div>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="card space-y-2">
          <h3 className="font-semibold text-sm">Notifikasi Platform</h3>
          {notifications.slice(0, 5).map(n => (
            <div key={n.id} className="text-sm border-b border-gray-100 pb-2 last:border-0">
              <p className="font-semibold">{n.title}</p>
              <p className="text-gray-500">{n.body}</p>
            </div>
          ))}
        </div>
      )}

      {families.length === 0 ? (
        <div className="card text-center text-gray-400">Belum ada keluarga terdaftar</div>
      ) : (
        families.map(family => (
          <div
            key={family.id}
            className={`card space-y-4 shadow-sm border ${
              family.is_active ? 'border-slate-100' : 'border-amber-200 bg-amber-50/30'
            }`}
          >
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {family.family_name}
                  {!family.is_active && (
                    <span className="text-[10px] uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-500">{family.email}</p>
                <p className="text-xs text-indigo-600 font-mono mt-1">Kode: {family.family_code}</p>
                <p className="text-xs text-gray-400 mt-1">{family.children_count} anak aktif</p>
              </div>
              {!family.is_active && (
                <button
                  type="button"
                  disabled={savingId === family.id}
                  onClick={() => approveFamily(family.id)}
                  className="btn-primary text-sm px-3 py-2"
                >
                  Setujui
                </button>
              )}
            </div>

            <div className="grid gap-2">
              {FEATURES.map(feature => {
                const enabled = family[feature.key]
                const busy = savingId === family.id
                return (
                  <button
                    key={feature.key}
                    type="button"
                    disabled={busy}
                    onClick={() => toggleFeature(family, feature.key)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-all ${
                      enabled
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    } ${busy ? 'opacity-60' : 'hover:shadow-sm'}`}
                  >
                    <span className="font-semibold text-sm">
                      {feature.emoji} {feature.label}
                    </span>
                    <span className={`text-xs font-bold uppercase ${enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {enabled ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
