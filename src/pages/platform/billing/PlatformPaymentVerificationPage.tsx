import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../../api'
import { PaymentEntry, formatRupiah } from '../../../types'

export default function PlatformPaymentVerificationPage() {
  const [searchParams] = useSearchParams()
  const highlightId = searchParams.get('payment_id')
  const [items, setItems] = useState<PaymentEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const [rejectId, setRejectId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    api.platformPayments({ status: 'pending', limit: 100 })
      .then(res => setItems(res.items))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const confirm = async (payment: PaymentEntry) => {
    setConfirmingId(payment.id)
    try {
      await api.platformConfirmPayment(payment.id)
      load()
    } finally {
      setConfirmingId(null)
    }
  }

  const reject = async () => {
    if (!rejectId || !rejectReason.trim()) return
    setConfirmingId(rejectId)
    try {
      await api.platformRejectPayment(rejectId, rejectReason.trim())
      setRejectId(null)
      setRejectReason('')
      load()
    } finally {
      setConfirmingId(null)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Memuat antrian verifikasi...</div>
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{items.length} pembayaran menunggu verifikasi</p>

      {items.length === 0 ? (
        <div className="card text-center text-gray-400 py-8">Tidak ada bukti pembayaran pending</div>
      ) : (
        items.map(p => (
          <div
            key={p.id}
            id={`payment-${p.id}`}
            className={`card space-y-3 ${highlightId === String(p.id) ? 'ring-2 ring-indigo-500' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{p.family_name}</p>
                <p className="text-xs text-gray-500">{p.email}</p>
              </div>
              <p className="font-bold">{formatRupiah(p.amount)}</p>
            </div>
            <p className="text-xs text-gray-500">
              Paket: {p.plan_slug || '—'} · {p.provider} · {new Date(p.created_at).toLocaleString('id-ID')}
            </p>
            {p.provider_ref && <p className="text-xs text-gray-400">Ref: {p.provider_ref}</p>}
            {p.proof_image_url && (
              <button type="button" onClick={() => setPreviewUrl(p.proof_image_url!)}>
                <img
                  src={p.proof_image_url}
                  alt="Bukti bayar"
                  className="max-h-40 rounded-lg border cursor-pointer"
                />
              </button>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={confirmingId === p.id}
                onClick={() => confirm(p)}
                className="btn-primary flex-1 text-xs py-2"
              >
                {confirmingId === p.id ? 'Memproses...' : 'Setujui & Aktifkan Paket'}
              </button>
              <button
                type="button"
                disabled={confirmingId === p.id}
                onClick={() => { setRejectId(p.id); setRejectReason('') }}
                className="btn-secondary flex-1 text-xs py-2"
              >
                Tolak
              </button>
            </div>
          </div>
        ))
      )}

      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <img src={previewUrl} alt="Bukti fullscreen" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}

      {rejectId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-sm space-y-3">
            <h3 className="font-bold">Tolak pembayaran</h3>
            <textarea
              className="input w-full text-sm min-h-[80px]"
              placeholder="Alasan penolakan..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex gap-2">
              <button type="button" className="btn-secondary flex-1" onClick={() => setRejectId(null)}>
                Batal
              </button>
              <button
                type="button"
                className="btn-primary flex-1"
                disabled={!rejectReason.trim() || confirmingId === rejectId}
                onClick={reject}
              >
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
