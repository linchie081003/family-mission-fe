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

  const subscriptionStatusLabel = isDemo
    ? 'Demo'
    : isTrial
      ? 'Trial Family'
      : subscription?.status === 'active'
        ? 'Aktif'
        : subscription?.status || 'Basic'

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

      {subscription && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">Status langganan</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {subscription.plan_name}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isTrial
                  ? 'bg-indigo-100 text-indigo-700'
                  : isDemo
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {subscriptionStatusLabel}
            </span>
          </div>
          {isTrial && (
            <p className="text-sm text-indigo-700 mt-2 leading-relaxed">
              {subscription.days_remaining != null
                ? <>Trial aktif — <strong>{subscription.days_remaining} hari</strong> tersisa dengan akses penuh Family</>
                : 'Trial aktif — akses penuh Family'}
              {subscription.trial_ends_at && (
                <> · berakhir {new Date(subscription.trial_ends_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</>
              )}
            </p>
          )}
          {isDemo && (
            <p className="text-sm text-purple-700 mt-2 leading-relaxed">
              Akun demo — fitur paket {subscription.plan_name} tanpa batas waktu.
            </p>
          )}
          {!isTrial && !isDemo && (
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              {subscription.status === 'active'
                ? 'Anda tidak sedang dalam masa trial.'
                : 'Belum ada langganan berbayar.'}
            </p>
          )}
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

      <div className="grid grid-cols-1 gap-4">
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
          const isFree = plan.price_monthly === 0

          return (
            <div
              key={plan.id}
              className={`relative flex h-full min-w-0 flex-col rounded-2xl bg-white p-4 shadow-sm ${
                showCurrent
                  ? 'border-2 border-indigo-500 ring-1 ring-indigo-100'
                  : isHighlighted
                    ? 'border border-indigo-200'
                    : 'border border-slate-200'
              }`}
            >
              {showCurrent && (
                <span className="absolute top-3 right-3 z-10 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-600 text-white whitespace-nowrap">
                  Paket saat ini
                </span>
              )}
              {!showCurrent && plan.slug === 'family' && (
                <span className="absolute top-3 right-3 z-10 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 whitespace-nowrap">
                  Paling lengkap
                </span>
              )}

              <div className="flex items-center gap-2 pr-28 mb-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <Icon size={18} className="text-slate-700" />
                </span>
                <p className="font-bold text-slate-900 truncate">{plan.name}</p>
              </div>

              <div className="mb-4 min-h-[2.75rem]">
                {isFree ? (
                  <p className="text-xl font-bold text-slate-900 leading-none">Gratis</p>
                ) : (
                  <>
                    <p className="text-lg font-bold text-slate-900 leading-tight break-words">
                      {formatRupiah(plan.price_monthly)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">per bulan</p>
                  </>
                )}
              </div>

              <ul className="flex-1 space-y-1.5 text-sm mb-4">
                {features.ok.map(f => (
                  <li key={f} className="flex gap-2 text-slate-700 leading-snug">
                    <span className="shrink-0 text-emerald-600">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
                {features.no.map(f => (
                  <li key={f} className="flex gap-2 text-slate-400 leading-snug">
                    <span className="shrink-0">✕</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {canUpgrade && plan.slug !== 'basic' ? (
                <button
                  type="button"
                  onClick={() => openModal(plan)}
                  className="btn-secondary mt-auto w-full text-sm flex items-center justify-center gap-1"
                >
                  Upgrade <ExternalLink size={14} />
                </button>
              ) : (
                <div className="mt-auto h-10" aria-hidden />
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
