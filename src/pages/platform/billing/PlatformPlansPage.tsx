import { useEffect, useState } from 'react'
import { api } from '../../../api'
import { Plan, formatRupiah } from '../../../types'

export default function PlatformPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({ price_monthly: 0, price_yearly: 0, trial_days: 14 })

  const load = () => {
    setLoading(true)
    api.platformPlans().then(setPlans).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const save = async (plan: Plan) => {
    await api.platformUpdatePlan(plan.id, form)
    setEditId(null)
    load()
  }

  const toggle = async (plan: Plan) => {
    await api.platformTogglePlan(plan.id, !plan.is_active)
    load()
  }

  if (loading) return <div className="text-center py-8 text-gray-400">Memuat paket...</div>

  return (
    <div className="space-y-3">
      {plans.map(plan => (
        <div key={plan.id} className="card space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold">{plan.name} <span className="text-xs text-gray-400">({plan.slug})</span></p>
              <p className="text-sm text-gray-500">{plan.description}</p>
              <p className="text-xs text-gray-400 mt-1">{plan.subscriber_count} subscriber · trial {plan.trial_days} hari</p>
            </div>
            <span className={`text-xs font-bold uppercase ${plan.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
              {plan.is_active ? 'Aktif' : 'Off'}
            </span>
          </div>
          {editId === plan.id ? (
            <div className="space-y-2">
              <input type="number" className="input w-full" placeholder="Harga bulanan" value={form.price_monthly}
                onChange={e => setForm(f => ({ ...f, price_monthly: Number(e.target.value) }))} />
              <input type="number" className="input w-full" placeholder="Harga tahunan" value={form.price_yearly}
                onChange={e => setForm(f => ({ ...f, price_yearly: Number(e.target.value) }))} />
              <input type="number" className="input w-full" placeholder="Trial days" value={form.trial_days}
                onChange={e => setForm(f => ({ ...f, trial_days: Number(e.target.value) }))} />
              <div className="flex gap-2">
                <button type="button" className="btn-primary flex-1 text-sm" onClick={() => save(plan)}>Simpan</button>
                <button type="button" className="btn-secondary flex-1 text-sm" onClick={() => setEditId(null)}>Batal</button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-sm">{formatRupiah(plan.price_monthly)}/bln · {formatRupiah(plan.price_yearly)}/thn</p>
              <div className="flex gap-2">
                <button type="button" className="text-xs text-indigo-600 font-semibold"
                  onClick={() => { setEditId(plan.id); setForm({ price_monthly: plan.price_monthly, price_yearly: plan.price_yearly, trial_days: plan.trial_days }) }}>
                  Edit
                </button>
                <button type="button" className="text-xs text-slate-500 font-semibold" onClick={() => toggle(plan)}>
                  {plan.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
