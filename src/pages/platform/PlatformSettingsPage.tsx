import { useEffect, useState } from 'react'
import { api } from '../../api'
import { PlatformAdmin } from '../../types'

export default function PlatformSettingsPage() {
  const [admin, setAdmin] = useState<PlatformAdmin | null>(null)
  const [name, setName] = useState('')
  const [notificationEmail, setNotificationEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.platformMe().then(data => {
      setAdmin(data)
      setName(data.name)
      setNotificationEmail(data.notification_email || '')
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const updated = await api.platformUpdateProfile({
        name,
        notification_email: notificationEmail || undefined,
      })
      setAdmin(updated)
      setMessage('Profil admin disimpan')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  if (!admin) return <div className="text-center py-12 text-gray-400">Memuat...</div>

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Pengaturan Admin</h2>
        <p className="text-sm text-gray-500 mt-1">Email notifikasi untuk pendaftaran keluarga baru</p>
      </div>

      <form onSubmit={handleSave} className="card space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500">Login email</label>
          <p className="font-mono text-sm mt-1">{admin.email}</p>
        </div>
        <input className="input" placeholder="Nama admin" value={name} onChange={e => setName(e.target.value)} required />
        <input
          className="input"
          type="email"
          placeholder="Email notifikasi (opsional, default = login email)"
          value={notificationEmail}
          onChange={e => setNotificationEmail(e.target.value)}
        />
        <p className="text-xs text-gray-500">
          Digunakan untuk email pendaftaran baru. Butuh konfigurasi SMTP di server (SMTP_HOST, SMTP_USER, dll).
        </p>
        {message && <p className="text-sm text-indigo-600">{message}</p>}
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </div>
  )
}
