import { useEffect, useState } from 'react'

import { Link } from 'react-router-dom'
import PasswordInput from '../../components/PasswordInput'
import { api } from '../../api'
import { isPasswordStrong, passwordsMatch } from '../../utils/passwordPolicy'

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

  const [parents, setParents] = useState<{ id: number; name: string; email: string; role: string; is_primary: boolean }[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<'father' | 'mother'>('mother')
  const [inviteMsg, setInviteMsg] = useState('')
  const [referral, setReferral] = useState<{ referral_code: string; invites_sent: number; families_joined: number } | null>(null)
  const [referralEmail, setReferralEmail] = useState('')
  const [referralMsg, setReferralMsg] = useState('')



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
    api.listParents().then(setParents).catch(() => undefined)
    api.referralStats().then(setReferral).catch(() => undefined)

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

    if (!isPasswordStrong(newPassword) || !passwordsMatch(newPassword, confirmPassword)) {
      setPasswordError('Password tidak memenuhi standar atau konfirmasi tidak cocok')
      return
    }

    try {

      await api.changeParentPassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })

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

      <Link to="/parent/upgrade" className="card block text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
        Kelola paket & upgrade →
      </Link>

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
        <h3 className="font-bold">Ubah Password</h3>
        <PasswordInput value={currentPassword} onChange={setCurrentPassword} placeholder="Password saat ini" showStrength={false} />
        <PasswordInput value={newPassword} onChange={setNewPassword} showStrength placeholder="Password baru" />
        <PasswordInput value={confirmPassword} onChange={setConfirmPassword} confirmWith={newPassword} placeholder="Konfirmasi password baru" />
        {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
        {passwordMessage && <p className="text-emerald-600 text-sm">{passwordMessage}</p>}
        <button type="submit" className="btn w-full py-3 border border-primary-200 text-primary-700">
          Ubah Password
        </button>
      </form>

      <div className="card space-y-3">
        <h3 className="font-bold">Anggota Keluarga (Orang Tua)</h3>
        {parents.map(p => (
          <div key={p.id} className="flex justify-between items-center text-sm border-b pb-2">
            <div>
              <p className="font-semibold">{p.name} {p.is_primary && <span className="text-xs text-gray-400">(utama)</span>}</p>
              <p className="text-gray-500">{p.email} · {p.role === 'father' ? 'Ayah' : 'Ibu'}</p>
            </div>
            {!p.is_primary && (
              <button type="button" className="text-red-500 text-xs" onClick={() => api.removeParent(p.id).then(() => api.listParents().then(setParents))}>
                Hapus
              </button>
            )}
          </div>
        ))}
        {parents.length < 2 && (
          <form className="space-y-2 pt-2" onSubmit={async e => {
            e.preventDefault()
            setInviteMsg('')
            try {
              const res = await api.inviteParent({ email: inviteEmail, name: inviteName, role: inviteRole })
              setInviteMsg(res.message)
              setInviteEmail('')
              setInviteName('')
            } catch (err) {
              setInviteMsg(err instanceof Error ? err.message : 'Gagal mengundang')
            }
          }}>
            <p className="text-xs text-gray-500">Undang co-parent (Ayah/Ibu)</p>
            <input className="input" placeholder="Nama" value={inviteName} onChange={e => setInviteName(e.target.value)} required />
            <input className="input" type="email" placeholder="Email co-parent" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
            <select className="input" value={inviteRole} onChange={e => setInviteRole(e.target.value as 'father' | 'mother')}>
              <option value="mother">Ibu</option>
              <option value="father">Ayah</option>
            </select>
            <button type="submit" className="btn-primary w-full py-2 text-sm">Kirim Undangan</button>
            {inviteMsg && <p className="text-xs text-gray-600">{inviteMsg}</p>}
          </form>
        )}
      </div>

      {referral && (
        <div className="card space-y-3">
          <h3 className="font-bold">Undang Teman</h3>
          <p className="text-sm text-gray-500">Bagikan kode referral keluarga Anda:</p>
          <p className="text-2xl font-mono font-bold text-primary-700">{referral.referral_code}</p>
          <p className="text-xs text-gray-400">{referral.invites_sent} undangan terkirim · {referral.families_joined} keluarga bergabung</p>
          <form className="space-y-2" onSubmit={async e => {
            e.preventDefault()
            setReferralMsg('')
            try {
              const res = await api.referralInvite({ email: referralEmail })
              setReferralMsg(res.message)
              setReferralEmail('')
              api.referralStats().then(setReferral)
            } catch (err) {
              setReferralMsg(err instanceof Error ? err.message : 'Gagal')
            }
          }}>
            <input className="input" type="email" placeholder="Email teman/keluarga" value={referralEmail} onChange={e => setReferralEmail(e.target.value)} required />
            <button type="submit" className="btn-primary w-full py-2 text-sm">Kirim Undangan Referral</button>
            {referralMsg && <p className="text-xs text-gray-600">{referralMsg}</p>}
          </form>
        </div>
      )}

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


