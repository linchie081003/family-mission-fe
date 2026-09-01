import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api'
import TenantDetailDrawer from '../../components/platform/TenantDetailDrawer'
import { PlatformFamily } from '../../types'

type StatusFilter = 'all' | 'active' | 'inactive'

export default function PlatformTenantsPage() {
  const [families, setFamilies] = useState<PlatformFamily[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [detailFamily, setDetailFamily] = useState<PlatformFamily | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api.platformFamilies({
      search: debouncedSearch.length >= 2 ? debouncedSearch : debouncedSearch.length === 0 ? '' : debouncedSearch,
      status,
      limit: 50,
      offset: 0,
    })
      .then(res => {
        setFamilies(res.items)
        setTotal(res.total)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Gagal memuat'))
      .finally(() => setLoading(false))
  }, [debouncedSearch, status])

  useEffect(() => { load() }, [load])

  const toggleActive = async (family: PlatformFamily) => {
    setSavingId(family.id)
    setError('')
    try {
      const updated = await api.platformUpdateFeatures(family.id, { is_active: !family.is_active })
      setFamilies(prev => prev.map(f => (f.id === updated.id ? updated : f)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSavingId(null)
    }
  }

  const handleUpdated = (updated: PlatformFamily) => {
    setFamilies(prev => prev.map(f => (f.id === updated.id ? updated : f)))
    setDetailFamily(updated)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Kelola Tenant</h2>
        <p className="text-sm text-gray-500 mt-1">Cari keluarga dan atur fitur per tenant</p>
      </div>

      <input
        className="input w-full"
        placeholder="Cari nama, email, atau kode keluarga..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="flex gap-2">
        {(['all', 'active', 'inactive'] as StatusFilter[]).map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              status === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {s === 'all' ? 'Semua' : s === 'active' ? 'Aktif' : 'Nonaktif'}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">Menampilkan {families.length} dari {total} keluarga</p>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {loading ? (
        <div className="text-center py-8 text-gray-400">Memuat...</div>
      ) : families.length === 0 ? (
        <div className="card text-center text-gray-400 py-8">Tidak ada keluarga ditemukan</div>
      ) : (
        <div className="space-y-2">
          {families.map(family => (
            <div key={family.id} className="card py-3 border border-slate-100">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-bold text-slate-900 truncate">{family.family_name}</p>
                    {!family.email_verified && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                        Email belum verify
                      </span>
                    )}
                    {!family.activated_at && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold">
                        Belum preset
                      </span>
                    )}
                    {family.subscription_status === 'trial' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold">
                        Trial{family.days_remaining != null ? ` ${family.days_remaining}d` : ''}
                      </span>
                    )}
                    {family.is_demo && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold">
                        Demo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{family.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Kode {family.family_code} · {family.children_count} anak
                    {family.activation_preset && ` · ${family.activation_preset}`}
                    {' · '}{new Date(family.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={savingId === family.id}
                  onClick={() => toggleActive(family)}
                  className={`shrink-0 w-12 h-7 rounded-full transition-colors ${
                    family.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                  aria-label={family.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
                      family.is_active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setDetailFamily(family)}
                className="text-xs text-indigo-600 font-semibold mt-2"
              >
                Detail fitur ›
              </button>
            </div>
          ))}
        </div>
      )}

      {detailFamily && (
        <TenantDetailDrawer
          family={detailFamily}
          onClose={() => setDetailFamily(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  )
}
