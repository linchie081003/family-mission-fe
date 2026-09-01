import { useEffect, useState } from 'react'
import { api } from '../../api'
import { PlatformFamily } from '../../types'

export default function PlatformActivationsPage() {
  const [families, setFamilies] = useState<PlatformFamily[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [actionFamilyId, setActionFamilyId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const load = () => {
    setLoading(true)
    api.platformPendingActivation(50, 0)
      .then(res => setFamilies(res.items))
      .catch(err => setError(err instanceof Error ? err.message : 'Gagal memuat'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const updateFamily = (updated: PlatformFamily) => {
    setFamilies(prev => prev.map(f => (f.id === updated.id ? updated : f)))
  }

  const activate = async (familyId: number, preset: 'standard' | 'family') => {
    setSavingId(familyId)
    setError('')
    setInfo('')
    try {
      await api.platformActivateFamily(familyId, preset)
      setFamilies(prev => prev.filter(f => f.id !== familyId))
      setInfo('Aktivasi berhasil. Email welcome dikirim ke keluarga (jika SMTP dikonfigurasi).')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengaktifkan')
    } finally {
      setSavingId(null)
    }
  }

  const resendVerification = async (family: PlatformFamily) => {
    setActionFamilyId(family.id)
    setError('')
    setInfo('')
    try {
      const updated = await api.platformResendVerification(family.id)
      updateFamily(updated)
      setInfo(`Email verifikasi dikirim ulang ke ${family.email}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal kirim ulang verifikasi')
    } finally {
      setActionFamilyId(null)
    }
  }

  const manualVerify = async (family: PlatformFamily) => {
    if (!window.confirm(`Verifikasi email ${family.email} secara manual? User bisa login tanpa klik link.`)) {
      return
    }
    setActionFamilyId(family.id)
    setError('')
    setInfo('')
    try {
      const updated = await api.platformManualVerifyEmail(family.id)
      updateFamily(updated)
      setInfo(`Email ${family.email} ditandai terverifikasi.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal verifikasi manual')
    } finally {
      setActionFamilyId(null)
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
        <p className="text-xs text-gray-400 mt-2">
          Ada dua langkah: (1) user verifikasi email agar bisa login, (2) Super Admin aktifkan preset fitur.
          Keduanya bisa dilakukan dalam urutan apa pun.
        </p>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {info && <p className="text-emerald-600 text-sm">{info}</p>}
      {families.length === 0 ? (
        <div className="card text-center text-gray-400 py-8">Semua keluarga sudah diaktifkan</div>
      ) : (
        <div className="space-y-3">
          {families.map(family => {
            const busy = savingId === family.id || actionFamilyId === family.id
            const verified = family.email_verified === true
            return (
              <div key={family.id} className="card border border-amber-200 bg-amber-50/30 space-y-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-900">{family.family_name}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        verified
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {verified ? 'Email terverifikasi' : 'Belum verifikasi'}
                    </span>
                  </div>
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
                    disabled={busy || verified}
                    onClick={() => resendVerification(family)}
                    className="btn-secondary flex-1 text-sm py-2 disabled:opacity-50"
                  >
                    Kirim ulang verifikasi
                  </button>
                  <button
                    type="button"
                    disabled={busy || verified}
                    onClick={() => manualVerify(family)}
                    className="btn-secondary flex-1 text-sm py-2 disabled:opacity-50"
                  >
                    Verifikasi manual
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => activate(family.id, 'standard')}
                    className="btn-secondary flex-1 text-sm py-2"
                  >
                    Aktifkan Standar
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => activate(family.id, 'family')}
                    className="btn-primary flex-1 text-sm py-2"
                  >
                    Aktifkan Family
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
