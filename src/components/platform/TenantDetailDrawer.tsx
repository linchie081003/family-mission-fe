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
}

export default function TenantDetailDrawer({ family, onClose, onUpdated }: Props) {
  const [current, setCurrent] = useState(family)
  const [limitDraft, setLimitDraft] = useState(
    family.daily_mission_limit != null ? String(family.daily_mission_limit) : '',
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const toggle = async (key: FeatureToggleKey) => {
    setSaving(true)
    setError('')
    try {
      const updated = await api.platformUpdateFeatures(current.id, { [key]: !current[key] })
      setCurrent(updated)
      onUpdated(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const saveLimit = async () => {
    setSaving(true)
    setError('')
    const raw = limitDraft.trim()
    const daily_mission_limit = raw === '' ? null : Number(raw)
    if (raw !== '' && (!Number.isFinite(daily_mission_limit) || daily_mission_limit! < 1)) {
      setError('Batas misi harus angka positif atau kosong')
      setSaving(false)
      return
    }
    try {
      const updated = await api.platformUpdateFeatures(current.id, { daily_mission_limit })
      setCurrent(updated)
      setLimitDraft(updated.daily_mission_limit != null ? String(updated.daily_mission_limit) : '')
      onUpdated(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

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
          {current.activation_preset && (
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
              Preset: {current.activation_preset}
            </span>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
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
        </div>
      </div>
    </div>
  )
}
