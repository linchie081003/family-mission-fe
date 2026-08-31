import { useCallback, useEffect, useState } from 'react'
import { api } from '../../../api'
import { PaymentEntry, Plan, formatRupiah } from '../../../types'

export default function PlatformPaymentsPage() {
  const [items, setItems] = useState<PaymentEntry[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ family_id: '', plan_id: '', amount: '', description: '' })
  const [confirmingId, setConfirmingId] = useState<number | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.platformPayments({ search: debounced, status, limit: 50 }),
      api.platformPlans(),
    ])
      .then(([res, p]) => {
        setItems(res.items)
        setTotal(res.total)
        setPlans(p)
      })
      .finally(() => setLoading(false))
  }, [debounced, status])

  useEffect(() => { load() }, [load])

  const submitManual = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.platformCreateManualPayment({
      family_id: Number(form.family_id),
      plan_id: Number(form.plan_id),
      amount: Number(form.amount),
      description: form.description || undefined,
    })
    setShowForm(false)
    setForm({ family_id: '', plan_id: '', amount: '', description: '' })
    load()
  }

  const confirmPending = async (payment: PaymentEntry) => {
    setConfirmingId(payment.id)
    try {
      await api.platformConfirmPayment(payment.id)
      load()
    } finally {
      setConfirmingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{total} transaksi</p>
        <button type="button" className="btn-secondary text-sm px-3 py-1" onClick={() => setShowForm(!showForm)}>
          + Manual
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitManual} className="card space-y-2">
          <input className="input w-full" placeholder="Family ID" value={form.family_id} onChange={e => setForm(f => ({ ...f, family_id: e.target.value }))} required />
          <select className="input w-full" value={form.plan_id} onChange={e => setForm(f => ({ ...f, plan_id: e.target.value }))} required>
            <option value="">Pilih paket</option>
            {plans.filter(p => p.slug !== 'basic').map(p => (
              <option key={p.id} value={p.id}>{p.name} — {formatRupiah(p.price_monthly)}/bln</option>
            ))}
          </select>
          <input className="input w-full" type="number" placeholder="Jumlah (IDR)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
          <input className="input w-full" placeholder="Keterangan" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <button type="submit" className="btn-primary w-full text-sm">Catat & Aktifkan Subscription</button>
        </form>
      )}

      <input className="input w-full" placeholder="Cari keluarga, invoice..." value={search} onChange={e => setSearch(e.target.value)} />

      <div className="flex gap-2 flex-wrap">
        {['all', 'paid', 'pending', 'failed'].map(s => (
          <button key={s} type="button" onClick={() => setStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-semibold ${status === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Memuat...</div>
      ) : items.length === 0 ? (
        <div className="card text-center text-gray-400 py-8">Tidak ada transaksi</div>
      ) : (
        items.map(p => (
          <div key={p.id} className="card py-3 text-sm space-y-2">
            <div className="flex justify-between">
              <p className="font-semibold">{p.family_name}</p>
              <p className="font-bold">{formatRupiah(p.amount)}</p>
            </div>
            <p className="text-xs text-gray-500">
              {p.email} · {p.status} · {p.provider}
              {p.plan_slug ? ` · ${p.plan_slug}` : ''}
            </p>
            <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleString('id-ID')}</p>
            {p.status === 'pending' && p.plan_slug && (
              <button
                type="button"
                disabled={confirmingId === p.id}
                onClick={() => confirmPending(p)}
                className="btn-primary text-xs py-1.5 px-3"
              >
                {confirmingId === p.id ? 'Memproses...' : 'Konfirmasi & Aktifkan'}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  )
}
