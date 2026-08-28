import { useEffect, useState } from 'react'
import { api } from '../../../api'
import { TrialEntry } from '../../../types'

export default function PlatformTrialsPage() {
  const [items, setItems] = useState<TrialEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [extending, setExtending] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    api.platformTrials(50, 0).then(res => setItems(res.items)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const extend = async (sub: TrialEntry, days: number) => {
    const reason = prompt(`Alasan perpanjangan +${days} hari:`)
    if (!reason?.trim()) return
    setExtending(sub.subscription_id)
    try {
      await api.platformExtendTrial(sub.subscription_id, { extra_days: days, reason: reason.trim() })
      load()
    } finally {
      setExtending(null)
    }
  }

  if (loading) return <div className="text-center py-8 text-gray-400">Memuat trial...</div>

  if (items.length === 0) {
    return <div className="card text-center text-gray-400 py-8">Tidak ada trial aktif</div>
  }

  return (
    <div className="space-y-3">
      {items.map(sub => {
        const urgent = sub.days_remaining != null && sub.days_remaining <= 3
        const warn = sub.days_remaining != null && sub.days_remaining <= 7
        return (
          <div key={sub.subscription_id} className={`card space-y-2 ${urgent ? 'border-red-200 bg-red-50/30' : warn ? 'border-amber-200 bg-amber-50/30' : ''}`}>
            <div className="flex justify-between">
              <div>
                <p className="font-bold">{sub.family_name}</p>
                <p className="text-sm text-gray-500">{sub.email}</p>
                <p className="text-xs text-gray-400">{sub.plan_name} · sisa {sub.days_remaining ?? '?'} hari</p>
              </div>
              {sub.days_remaining != null && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${urgent ? 'bg-red-100 text-red-700' : warn ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                  {sub.days_remaining}d
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {[7, 14, 30].map(d => (
                <button key={d} type="button" disabled={extending === sub.subscription_id}
                  onClick={() => extend(sub, d)}
                  className="btn-secondary flex-1 text-xs py-1.5">
                  +{d}h
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
