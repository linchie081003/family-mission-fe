import { useState } from 'react'
import { api } from '../../api'
import { PlatformFamily } from '../../types'

type FeatureToggleKey =
  | 'rewards_enabled'
  | 'mission_evidence_enabled'
  | 'quiz_enabled'
  | 'chat_enabled'
  | 'agenda_enabled'

const FEATURES: { key: FeatureToggleKey; label: string }[] = [
  { key: 'rewards_enabled', label: 'Reward & Poin' },
  { key: 'mission_evidence_enabled', label: 'Bukti Misi' },
  { key: 'quiz_enabled', label: 'Quiz' },
  { key: 'chat_enabled', label: 'Chat' },
  { key: 'agenda_enabled', label: 'Agenda Keluarga' },
]

interface Props {
  family: PlatformFamily
  onClose: () => void
  onUpdated: (family: PlatformFamily) => void
  onDeleted?: (familyId: number) => void
}

export default function TenantDetailDrawer({ family, onClose, onUpdated, onDeleted }: Props) {
  const [current, setCurrent] = useState(family)
  const [limitDraft, setLimitDraft] = useState(
    family.daily_mission_limit != null ? String(family.daily_mission_limit) : '',
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [demoPlan, setDemoPlan] = useState('family')
  const [demoNote, setDemoNote] = useState('')

  const refresh = (updated: PlatformFamily) => {
    setCurrent(updated)
    onUpdated(updated)
  }

  const toggle = async (key: FeatureToggleKey) => {
    setSaving(true)
    setError('')
    setInfo('')
    try {
      const updated = await api.platformUpdateFeatures(current.id, { [key]: !current[key] })
      refresh(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const saveLimit = async () => {
    setSaving(true)
    setError('')
    setInfo('')
    const raw = limitDraft.trim()
    const daily_mission_limit = raw === '' ? null : Number(raw)
    if (raw !== '' && (!Number.isFinite(daily_mission_limit) || daily_mission_limit! < 1)) {
      setError('Batas misi harus angka positif atau kosong')
      setSaving(false)
      return
    }
    try {
      const updated = await api.platformUpdateFeatures(current.id, { daily_mission_limit })
      refresh(updated)
      setLimitDraft(updated.daily_mission_limit != null ? String(updated.daily_mission_limit) : '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const resendVerification = async () => {
    setSaving(true)
    setError('')
    setInfo('')
    try {
      const updated = await api.platformResendVerification(current.id)
      refresh(updated)
      setInfo('Email verifikasi dikirim ulang.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal kirim ulang verifikasi')
    } finally {
      setSaving(false)
    }
  }

  const manualVerify = async () => {
    if (!window.confirm(`Verifikasi email ${current.email} secara manual?`)) return
    setSaving(true)
    setError('')
    setInfo('')
    try {
      const updated = await api.platformManualVerifyEmail(current.id)
      refresh(updated)
      setInfo('Email ditandai terverifikasi.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal verifikasi manual')
    } finally {
      setSaving(false)
    }
  }

  const activate = async (preset: 'standard' | 'family') => {
    setSaving(true)
    setError('')
    setInfo('')
    try {
      const updated = await api.platformActivateFamily(current.id, preset)
      refresh(updated)
      setInfo('Preset diaktifkan. Email welcome dikirim (jika SMTP dikonfigurasi).')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengaktifkan')
    } finally {
      setSaving(false)
    }
  }

  const assignDemo = async () => {
    setSaving(true)
    setError('')
    setInfo('')
    try {
      const updated = await api.platformAssignDemoPlan(current.id, {
        plan_slug: demoPlan,
        note: demoNote || undefined,
      })
      refresh(updated)
      setInfo(`Demo paket ${demoPlan} diaktifkan.`)
      setDemoNote('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal set demo')
    } finally {
      setSaving(false)
    }
  }

  const revokeDemo = async () => {
    if (!window.confirm('Cabut status demo dan turunkan ke Basic?')) return
    setSaving(true)
    setError('')
    setInfo('')
    try {
      const updated = await api.platformRevokeDemo(current.id)
      refresh(updated)
      setInfo('Demo dicabut — paket Basic.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal cabut demo')
    } finally {
      setSaving(false)
    }
  }

  const deleteTenant = async () => {
    if (current.is_active) {
      setError('Nonaktifkan tenant terlebih dahulu sebelum menghapus.')
      return
    }
    if (
      !window.confirm(
        `Hapus permanen "${current.family_name}"?\n\nSemua data keluarga akan dihapus dan tidak bisa dikembalikan.`,
      )
    ) {
      return
    }
    setSaving(true)
    setError('')
    setInfo('')
    try {
      const res = await api.platformDeleteFamily(current.id)
      onDeleted?.(current.id)
      onClose()
      alert(res.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus tenant')
    } finally {
      setSaving(false)
    }
  }

  const verified = current.email_verified === true
  const pendingActivation = !current.activated_at
  const isTrial = current.subscription_status === 'trial'
  const statusLabel = current.is_demo
    ? 'Demo'
    : isTrial
      ? 'Trial'
      : current.subscription_status === 'active'
        ? 'Aktif'
        : current.subscription_status || '—'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">{current.family_name}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-500">{current.email}</p>
          <p className="text-xs font-mono text-indigo-600">Kode: {current.family_code}</p>

          <div className="rounded-xl border border-slate-200 p-3 space-y-2">
            <p className="text-sm font-semibold">Status Akun</p>
            <div className="flex flex-wrap gap-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {verified ? 'Email terverifikasi' : 'Belum verifikasi'}
              </span>
              {current.activation_preset ? (
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                  Preset: {current.activation_preset}
                </span>
              ) : (
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                  Belum diaktivasi preset
                </span>
              )}
            </div>
            {current.activated_at && (
              <p className="text-xs text-gray-400">
                Diaktifkan: {new Date(current.activated_at).toLocaleString('id-ID')}
              </p>
            )}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={saving || verified}
                onClick={resendVerification}
                className="btn-secondary flex-1 text-xs py-2 disabled:opacity-50"
              >
                Kirim ulang verifikasi
              </button>
              <button
                type="button"
                disabled={saving || verified}
                onClick={manualVerify}
                className="btn-secondary flex-1 text-xs py-2 disabled:opacity-50"
              >
                Verifikasi manual
              </button>
            </div>
            {pendingActivation && (
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => activate('standard')}
                  className="btn-secondary flex-1 text-xs py-2"
                >
                  Aktifkan Standar
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => activate('family')}
                  className="btn-primary flex-1 text-xs py-2"
                >
                  Aktifkan Family
                </button>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 p-3 space-y-2">
            <p className="text-sm font-semibold">Langganan / Demo</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {current.plan_name && (
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                  {current.plan_name} ({statusLabel})
                </span>
              )}
              {isTrial && (
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                  Trial{current.days_remaining != null ? ` · ${current.days_remaining} hari tersisa` : ''}
                </span>
              )}
              {current.is_demo && (
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Demo</span>
              )}
            </div>
            {isTrial && current.trial_ends_at && (
              <p className="text-xs text-indigo-600">
                Trial berakhir: {new Date(current.trial_ends_at).toLocaleString('id-ID')}
              </p>
            )}
            {!isTrial && !current.is_demo && current.subscription_status === 'active' && (
              <p className="text-xs text-gray-400">Bukan trial — langganan aktif atau paket Basic gratis.</p>
            )}
            {!current.is_demo && (
              <>
                <select
                  className="input w-full text-sm"
                  value={demoPlan}
                  onChange={e => setDemoPlan(e.target.value)}
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="family">Family</option>
                </select>
                <input
                  className="input w-full text-sm"
                  placeholder="Catatan demo (opsional)"
                  value={demoNote}
                  onChange={e => setDemoNote(e.target.value)}
                />
                <button
                  type="button"
                  disabled={saving}
                  onClick={assignDemo}
                  className="btn-primary w-full text-xs py-2"
                >
                  Set sebagai Demo
                </button>
              </>
            )}
            {current.is_demo && (
              <button
                type="button"
                disabled={saving}
                onClick={revokeDemo}
                className="btn-secondary w-full text-xs py-2"
              >
                Cabut Demo
              </button>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {info && <p className="text-emerald-600 text-sm">{info}</p>}

          <div className="space-y-2">
            {FEATURES.map(f => (
              <button
                key={f.key}
                type="button"
                disabled={saving}
                onClick={() => toggle(f.key)}
                className={`w-full flex justify-between items-center rounded-xl px-4 py-3 border text-sm font-semibold ${
                  current[f.key]
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {f.label}
                <span className="text-xs uppercase">{current[f.key] ? 'ON' : 'OFF'}</span>
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-slate-200 p-3 space-y-2">
            <p className="text-sm font-semibold">Batas misi / hari</p>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                className="input flex-1"
                placeholder="Unlimited"
                value={limitDraft}
                onChange={e => setLimitDraft(e.target.value)}
                onBlur={saveLimit}
              />
            </div>
          </div>

          {!current.is_active && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 space-y-2">
              <p className="text-sm font-semibold text-red-800">Hapus Tenant</p>
              <p className="text-xs text-red-700">
                Tenant nonaktif dapat dihapus permanen beserta seluruh data keluarga.
              </p>
              <button
                type="button"
                disabled={saving}
                onClick={deleteTenant}
                className="btn-danger w-full text-xs py-2"
              >
                Hapus permanen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
