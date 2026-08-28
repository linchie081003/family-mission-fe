import { useEffect, useState } from 'react'
import { api } from '../../api'
import { PlatformFamily } from '../../types'

export default function PlatformActivationsPage() {
  const [families, setFamilies] = useState<PlatformFamily[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    api.platformPendingActivation(50, 0)
      .then(res => setFamilies(res.items))
      .catch(err => setError(err instanceof Error ? err.message : 'Gagal memuat'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const activate = async (familyId: number, preset: 'standard' | 'family') => {
    setSavingId(familyId)
    setError('')
    try {
      await api.platformActivateFamily(familyId, preset)
      setFamilies(prev => prev.filter(f => f.id !== familyId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengaktifkan')
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Memuat aktivasi baru...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Aktivasi Baru</h2>
        <p className="text-sm text-gray-500 mt-1">
          Keluarga baru belum diaktifkan — pilih preset sekali klik
        </p>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {families.length === 0 ? (
        <div className="card text-center text-gray-400 py-8">Semua keluarga sudah diaktifkan</div>
      ) : (
        <div className="space-y-3">
          {families.map(family => (
            <div key={family.id} className="card border border-amber-200 bg-amber-50/30 space-y-3">
              <div>
                <p className="font-bold text-slate-900">{family.family_name}</p>
                <p className="text-sm text-gray-600">{family.email}</p>
                <p className="text-xs font-mono text-indigo-600 mt-1">Kode: {family.family_code}</p>
                {family.referrer_name && (
                  <p className="text-xs text-gray-500 mt-1">Referral dari: {family.referrer_name}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Daftar: {new Date(family.created_at).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={savingId === family.id}
                  onClick={() => activate(family.id, 'standard')}
                  className="btn-secondary flex-1 text-sm py-2"
                >
                  Aktifkan Standar
                </button>
                <button
                  type="button"
                  disabled={savingId === family.id}
                  onClick={() => activate(family.id, 'family')}
                  className="btn-primary flex-1 text-sm py-2"
                >
                  Aktifkan Family
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
