import { useEffect, useState } from 'react'

import { api } from '../../api'

import { PlatformFamily, PlatformNotification, PlatformStats } from '../../types'



type FeatureToggleKey =

  | 'is_active'

  | 'rewards_enabled'

  | 'mission_evidence_enabled'

  | 'quiz_enabled'

  | 'chat_enabled'

  | 'agenda_enabled'



const FEATURES: { key: FeatureToggleKey; label: string; emoji: string }[] = [

  { key: 'is_active', label: 'Tenant Aktif', emoji: '🏠' },

  { key: 'rewards_enabled', label: 'Reward & Poin', emoji: '🎁' },

  { key: 'mission_evidence_enabled', label: 'Bukti Misi', emoji: '📷' },

  { key: 'quiz_enabled', label: 'Quiz', emoji: '📝' },

  { key: 'chat_enabled', label: 'Chat', emoji: '💬' },

  { key: 'agenda_enabled', label: 'Agenda Keluarga', emoji: '📅' },

]



export default function PlatformTenantsPage() {

  const [families, setFamilies] = useState<PlatformFamily[]>([])

  const [notifications, setNotifications] = useState<PlatformNotification[]>([])

  const [stats, setStats] = useState<PlatformStats | null>(null)

  const [loading, setLoading] = useState(true)

  const [savingId, setSavingId] = useState<number | null>(null)

  const [error, setError] = useState('')

  const [limitDrafts, setLimitDrafts] = useState<Record<number, string>>({})



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

          const drafts: Record<number, string> = {}

          familiesResult.value.forEach(f => {

            drafts[f.id] = f.daily_mission_limit != null ? String(f.daily_mission_limit) : ''

          })

          setLimitDrafts(drafts)

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



  const toggleFeature = async (family: PlatformFamily, key: FeatureToggleKey) => {

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



  const saveMissionLimit = async (family: PlatformFamily) => {

    setSavingId(family.id)

    setError('')

    const raw = (limitDrafts[family.id] ?? '').trim()

    const daily_mission_limit = raw === '' ? null : Number(raw)

    if (raw !== '' && (!Number.isFinite(daily_mission_limit) || daily_mission_limit! < 1)) {

      setError('Batas misi harian harus angka positif atau kosong (unlimited)')

      setSavingId(null)

      return

    }

    try {

      const updated = await api.platformUpdateFeatures(family.id, { daily_mission_limit })

      setFamilies(prev => prev.map(f => (f.id === updated.id ? updated : f)))

      setLimitDrafts(prev => ({

        ...prev,

        [family.id]: updated.daily_mission_limit != null ? String(updated.daily_mission_limit) : '',

      }))

    } catch (err) {

      setError(err instanceof Error ? err.message : 'Gagal menyimpan batas misi')

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

          Toggle fitur per keluarga: Reward, Bukti Misi, Quiz, Chat, Agenda

        </p>

      </div>



      {stats && (

        <div className="grid grid-cols-2 gap-2">

          <div className="card bg-slate-900 text-white">

            <p className="text-xs text-slate-300">Total Keluarga</p>

            <p className="text-2xl font-bold">{stats.families_total}</p>

          </div>

          <div className="card border-slate-200 bg-slate-50">

            <p className="text-xs text-slate-600">Tenant Nonaktif</p>

            <p className="text-2xl font-bold text-slate-700">{pendingFamilies.length}</p>

          </div>

        </div>

      )}



      {error && <p className="text-red-500 text-sm">{error}</p>}



      {pendingFamilies.length > 0 && (

        <div className="space-y-2">

          <h3 className="font-semibold text-sm text-slate-700">Tenant Dinonaktifkan</h3>

          {pendingFamilies.map(family => (

            <div key={family.id} className="card border-slate-200 bg-slate-50/70 flex justify-between items-center gap-3">

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

                Aktifkan

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

                    <span className="text-[10px] uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">

                      Nonaktif

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

                  Aktifkan

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



            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-2">

              <p className="text-sm font-semibold text-slate-700">Batas misi / hari (per anak)</p>

              <p className="text-xs text-gray-500">Kosongkan untuk unlimited. Contoh paket gratis: 5</p>

              <div className="flex gap-2">

                <input

                  type="number"

                  min={1}

                  className="input flex-1"

                  placeholder="Unlimited"

                  value={limitDrafts[family.id] ?? ''}

                  onChange={e => setLimitDrafts(prev => ({ ...prev, [family.id]: e.target.value }))}

                />

                <button

                  type="button"

                  disabled={savingId === family.id}

                  onClick={() => saveMissionLimit(family)}

                  className="btn-secondary shrink-0 px-4"

                >

                  Simpan

                </button>

              </div>

              <p className="text-xs text-gray-400">

                Saat ini: {family.daily_mission_limit != null ? `${family.daily_mission_limit} misi/hari` : 'Unlimited'}

              </p>

            </div>

          </div>

        ))

      )}

    </div>

  )

}


