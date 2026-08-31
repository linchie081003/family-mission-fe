import { useEffect, useState } from 'react'
import { Crown, ExternalLink, Home, Star } from 'lucide-react'
import { api } from '../../api'
import { BillingPlan, BillingSubscription, formatRupiah, PaymentSettings } from '../../types'
import { resizeImageToBase64 } from '../../utils/imageToBase64'
import { featuresFromPreset } from '../../utils/planFeatures'

const TIER_ORDER = ['basic', 'standard', 'family']

function tierRank(slug: string) {
  return TIER_ORDER.indexOf(slug)
}

export default function UpgradePage() {
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [subscription, setSubscription] = useState<BillingSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalPlan, setModalPlan] = useState<BillingPlan | null>(null)
  const [method, setMethod] = useState<'qris_static' | 'bank_transfer'>('qris_static')
  const [instructions, setInstructions] = useState<PaymentSettings | null>(null)
  const [providerRef, setProviderRef] = useState('')
  const [proofPreview, setProofPreview] = useState('')
  const [proofData, setProofData] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([api.billingPlans(), api.billingSubscription()])
      .then(([p, s]) => {
        setPlans(p.sort((a, b) => a.sort_order - b.sort_order))
        setSubscription(s)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Gagal memuat'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openModal = async (plan: BillingPlan) => {
    setModalPlan(plan)
    setMethod('qris_static')
    setProviderRef('')
    setProofPreview('')
    setProofData('')
    setError('')
    try {
      const inst = await api.billingPaymentInstructions()
      setInstructions(inst)
    } catch {
      setInstructions(null)
    }
  }

  const currentSlug = subscription?.plan_slug || 'basic'
  const isTrial = subscription?.status === 'trial'
  const isDemo = subscription?.is_demo === true
  const hasPending = Boolean(subscription?.pending_payment)

  const handleProofFile = async (file: File | null) => {
    if (!file) {
      setProofPreview('')
      setProofData('')
      return
    }
    try {
      const dataUrl = await resizeImageToBase64(file)
      setProofPreview(dataUrl)
      setProofData(dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses foto')
    }
  }

  const submitUpgrade = async () => {
    if (!modalPlan || !proofData) {
      setError('Upload bukti pembayaran wajib')
      return
    }
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      const res = await api.billingUpgradeRequest({
        plan_slug: modalPlan.slug,
        method,
        proof_image: proofData,
        provider_ref: providerRef || undefined,
      })
      setMessage(`Permintaan upgrade dicatat (#${res.payment_id}). Admin akan verifikasi pembayaran Anda.`)
      setModalPlan(null)
      setProviderRef('')
      setProofPreview('')
      setProofData('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim permintaan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Memuat paket...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Upgrade Paket</h2>
        <p className="text-sm text-gray-500 mt-1">Pilih paket yang sesuai untuk keluarga Anda</p>
      </div>

      {isDemo && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
          Akun demo aktif — paket <strong>{subscription?.plan_name}</strong>
        </div>
      )}

      {isTrial && subscription?.days_remaining != null && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
          Trial Family — <strong>{subscription.days_remaining} hari</strong> tersisa dengan akses penuh
        </div>
      )}

      {hasPending && subscription?.pending_payment && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Menunggu verifikasi admin untuk upgrade ke paket{' '}
          <strong>{subscription.pending_payment.plan_slug}</strong>
          {subscription.pending_payment.has_proof ? ' (bukti sudah diupload)' : ''}.
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {message && <p className="text-emerald-600 text-sm">{message}</p>}

      <div className="grid gap-3 sm:grid-cols-3">
        {plans.map(plan => {
          const isCurrent = plan.slug === currentSlug && !isTrial && !isDemo
          const isTrialCurrent = isTrial && plan.slug === 'family'
          const showCurrent = isCurrent || isTrialCurrent || (isDemo && plan.slug === currentSlug)
          const isHighlighted = plan.slug === 'family'
          const canUpgrade =
            !hasPending &&
            !isDemo &&
            tierRank(plan.slug) > tierRank(isTrial ? 'family' : currentSlug)
          const features = featuresFromPreset(plan.feature_preset)
          const Icon = plan.slug === 'basic' ? Home : plan.slug === 'standard' ? Star : Crown

          return (
            <div
              key={plan.id}
              className={`card relative flex flex-col gap-3 ${
                isHighlighted ? 'border-2 border-indigo-500 shadow-sm' : 'border border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <Icon size={22} className="text-slate-700" />
                {showCurrent && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Paket saat ini
                  </span>
                )}
                {plan.slug === 'family' && !showCurrent && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                    Paling lengkap
                  </span>
                )}
              </div>
              <div>
                <p className="font-bold text-slate-900">{plan.name}</p>
                <p className="text-2xl font-bold mt-1">
                  {plan.price_monthly === 0 ? 'Rp0' : `${formatRupiah(plan.price_monthly)}/bulan`}
                </p>
              </div>
              <ul className="text-sm space-y-1 flex-1">
                {features.ok.map(f => (
                  <li key={f} className="text-slate-700">✓ {f}</li>
                ))}
                {features.no.map(f => (
                  <li key={f} className="text-slate-400">✕ {f}</li>
                ))}
              </ul>
              {canUpgrade && plan.slug !== 'basic' && (
                <button
                  type="button"
                  onClick={() => openModal(plan)}
                  className="btn-secondary w-full text-sm flex items-center justify-center gap-1"
                >
                  Upgrade <ExternalLink size={14} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {modalPlan && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-4 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg">Upgrade ke {modalPlan.name}</h3>
            <p className="text-sm text-gray-600">
              Total: <strong>{formatRupiah(modalPlan.price_monthly)}</strong> / bulan
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMethod('qris_static')}
                className={`flex-1 text-xs py-2 rounded-lg font-semibold ${method === 'qris_static' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}
              >
                QRIS Statis
              </button>
              <button
                type="button"
                onClick={() => setMethod('bank_transfer')}
                className={`flex-1 text-xs py-2 rounded-lg font-semibold ${method === 'bank_transfer' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}
              >
                Transfer Bank
              </button>
            </div>

            {method === 'qris_static' && instructions?.qris_image_url && (
              <div className="text-center space-y-2">
                <img src={instructions.qris_image_url} alt="QRIS" className="mx-auto max-h-48 rounded-lg border" />
                {instructions.qris_merchant_name && (
                  <p className="text-xs text-gray-500">{instructions.qris_merchant_name}</p>
                )}
              </div>
            )}

            {method === 'bank_transfer' && instructions?.bank_account_number && (
              <div className="rounded-lg bg-slate-50 p-3 text-sm space-y-1">
                <p><strong>{instructions.bank_name}</strong></p>
                <p>No. rekening: {instructions.bank_account_number}</p>
                <p>Atas nama: {instructions.bank_account_holder}</p>
                {instructions.transfer_instructions && (
                  <p className="text-xs text-gray-500 mt-2">{instructions.transfer_instructions}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Upload bukti bayar *</label>
              <input
                type="file"
                accept="image/*"
                className="input w-full text-sm"
                onChange={e => handleProofFile(e.target.files?.[0] ?? null)}
              />
              {proofPreview && (
                <img src={proofPreview} alt="Preview bukti" className="max-h-32 rounded-lg border mx-auto" />
              )}
            </div>

            <input
              className="input w-full text-sm"
              placeholder="Nomor referensi / catatan transfer (opsional)"
              value={providerRef}
              onChange={e => setProviderRef(e.target.value)}
            />

            <div className="flex gap-2">
              <button type="button" className="btn-secondary flex-1" onClick={() => setModalPlan(null)}>
                Batal
              </button>
              <button
                type="button"
                disabled={submitting || !proofData}
                className="btn-primary flex-1"
                onClick={submitUpgrade}
              >
                {submitting ? 'Mengirim...' : 'Kirim Bukti Bayar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
