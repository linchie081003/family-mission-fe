import { useEffect, useState } from 'react'

import { api } from '../../api'

import { AuditLogEntry, Family } from '../../types'



export default function SettingsPage() {

  const [settings, setSettings] = useState<Family | null>(null)

  const [history, setHistory] = useState<{ changed_at: string; rupiah_per_point: number; daily_point_limit: number; min_cash_redemption: number; note?: string }[]>([])

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])

  const [rupiah, setRupiah] = useState(1000)

  const [dailyLimit, setDailyLimit] = useState(50)

  const [minCash, setMinCash] = useState(100)

  const [note, setNote] = useState('')

  const [saved, setSaved] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')

  const [newPassword, setNewPassword] = useState('')

  const [confirmPassword, setConfirmPassword] = useState('')

  const [passwordMessage, setPasswordMessage] = useState('')

  const [passwordError, setPasswordError] = useState('')



  const loadAudit = () => {

    api.getAuditLogs(100).then(setAuditLogs)

    api.getSettingsHistory().then(h => setHistory(h as typeof history))

  }



  useEffect(() => {

    api.getSettings().then(s => {

      setSettings(s)

      setRupiah(s.rupiah_per_point)

      setDailyLimit(s.daily_point_limit)

      setMinCash(s.min_cash_redemption)

    })

    loadAudit()

  }, [])



  const handleSave = async (e: React.FormEvent) => {

    e.preventDefault()

    await api.updateSettings({ rupiah_per_point: rupiah, daily_point_limit: dailyLimit, min_cash_redemption: minCash, note })

    setSaved(true)

    setTimeout(() => setSaved(false), 2000)

    loadAudit()

  }



  const handlePasswordChange = async (e: React.FormEvent) => {

    e.preventDefault()

    setPasswordError('')

    setPasswordMessage('')

    if (newPassword !== confirmPassword) {

      setPasswordError('Konfirmasi password tidak cocok')

      return

    }

    try {

      await api.changeParentPassword({ current_password: currentPassword, new_password: newPassword })

      setPasswordMessage('Password admin berhasil diubah')

      setCurrentPassword('')

      setNewPassword('')

      setConfirmPassword('')

      loadAudit()

    } catch (err) {

      setPasswordError(err instanceof Error ? err.message : 'Gagal mengubah password')

    }

  }



  if (!settings) return <div className="text-center py-8 text-gray-400">Loading...</div>



  return (

    <div className="space-y-4">

      <h2 className="text-xl font-bold">Setting</h2>



      <div className="card bg-primary-50 border-primary-200">

        <p className="text-sm text-gray-600">Kode Keluarga</p>

        <p className="text-3xl font-bold tracking-widest text-primary-700">{settings.family_code}</p>

        <p className="text-xs text-gray-400 mt-1">Bagikan ke anak-anak untuk login</p>

      </div>



      <form onSubmit={handleSave} className="card space-y-4">

        <div>

          <label className="text-sm font-semibold text-gray-600">Nilai Rupiah per Poin</label>

          <input className="input mt-1" type="number" value={rupiah} onChange={e => setRupiah(Number(e.target.value))} />

        </div>

        <div>

          <label className="text-sm font-semibold text-gray-600">Batas Poin Harian</label>

          <input className="input mt-1" type="number" value={dailyLimit} onChange={e => setDailyLimit(Number(e.target.value))} />

        </div>

        <div>

          <label className="text-sm font-semibold text-gray-600">Minimal Tukar Uang Tunai</label>

          <input className="input mt-1" type="number" value={minCash} onChange={e => setMinCash(Number(e.target.value))} />

        </div>

        <div>

          <label className="text-sm font-semibold text-gray-600">Catatan perubahan</label>

          <input className="input mt-1" placeholder="Opsional" value={note} onChange={e => setNote(e.target.value)} />

        </div>

        <button type="submit" className="btn-primary w-full py-3">

          {saved ? '✓ Tersimpan!' : 'Simpan Pengaturan'}

        </button>

      </form>



      <form onSubmit={handlePasswordChange} className="card space-y-4">

        <h3 className="font-bold">Ubah Password Admin</h3>

        <input

          className="input"

          type="password"

          placeholder="Password saat ini"

          value={currentPassword}

          onChange={e => setCurrentPassword(e.target.value)}

          required

        />

        <input

          className="input"

          type="password"

          placeholder="Password baru (min 6 karakter)"

          value={newPassword}

          onChange={e => setNewPassword(e.target.value)}

          required

          minLength={6}

        />

        <input

          className="input"

          type="password"

          placeholder="Konfirmasi password baru"

          value={confirmPassword}

          onChange={e => setConfirmPassword(e.target.value)}

          required

          minLength={6}

        />

        {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}

        {passwordMessage && <p className="text-emerald-600 text-sm">{passwordMessage}</p>}

        <button type="submit" className="btn w-full py-3 border border-primary-200 text-primary-700">

          Ubah Password

        </button>

      </form>



      <div>

        <h3 className="font-bold mb-2">Audit Trail Pengaturan</h3>

        <p className="text-xs text-gray-400 mb-2">

          Perubahan nilai per poin, batas maks poin harian, minimal poin tukar uang, dan password admin

        </p>

        {auditLogs.length === 0 ? (

          <p className="text-gray-400 text-sm">Belum ada perubahan</p>

        ) : (

          <div className="space-y-2 max-h-96 overflow-y-auto">

            {auditLogs.map(log => (

              <div key={log.id} className="card py-3">

                <div className="flex justify-between items-start gap-2">

                  <p className="text-sm font-semibold">{log.summary}</p>

                  <span className="text-[10px] uppercase text-gray-400 shrink-0">{log.entity_type}</span>

                </div>

                <p className="text-xs text-gray-400 mt-1">{log.actor_label}</p>

                <p className="text-[10px] text-gray-400 mt-1">{new Date(log.created_at).toLocaleString('id-ID')}</p>

              </div>

            ))}

          </div>

        )}

      </div>



      <div>

        <h3 className="font-bold mb-2">Riwayat Perubahan Aturan</h3>

        {history.length === 0 ? (

          <p className="text-gray-400 text-sm">Belum ada perubahan</p>

        ) : (

          history.map((h, i) => (

            <div key={i} className="card py-3 mb-2">

              <p className="text-xs text-gray-400">{new Date(h.changed_at).toLocaleString('id-ID')}</p>

              <p className="text-sm">Rp{h.rupiah_per_point}/poin · Limit {h.daily_point_limit}/hr · Min cash {h.min_cash_redemption}</p>

              {h.note && <p className="text-xs text-gray-500">{h.note}</p>}

            </div>

          ))

        )}

      </div>

    </div>

  )

}


