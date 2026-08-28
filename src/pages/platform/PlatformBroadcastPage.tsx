import { useEffect, useState } from 'react'
import { api } from '../../api'
import { PlatformBroadcast } from '../../types'

export default function PlatformBroadcastPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [history, setHistory] = useState<PlatformBroadcast[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadHistory = () => {
    api.platformBroadcasts(20).then(setHistory).catch(() => undefined)
  }

  useEffect(() => { loadHistory() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirm('Kirim pengumuman ke semua keluarga aktif?')) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await api.platformCreateBroadcast({ title, body, send_email: sendEmail })
      setSuccess(`Terkirim ke ${res.families_reached} keluarga`)
      setTitle('')
      setBody('')
      loadHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Broadcast Notifikasi</h2>
        <p className="text-sm text-gray-500 mt-1">Kirim pengumuman ke semua keluarga aktif</p>
      </div>

      <form onSubmit={submit} className="card space-y-3">
        <input className="input w-full" placeholder="Judul" value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea
          className="input w-full min-h-[100px]"
          placeholder="Isi pengumuman..."
          value={body}
          onChange={e => setBody(e.target.value)}
          required
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} />
          Kirim email juga ke orang tua
        </label>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-emerald-600 text-sm">{success}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Mengirim...' : 'Kirim Broadcast'}
        </button>
      </form>

      <div className="card space-y-2">
        <h3 className="font-semibold text-sm">Riwayat Broadcast</h3>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada broadcast</p>
        ) : (
          history.map(b => (
            <div key={b.id} className="text-sm border-b border-gray-100 pb-2 last:border-0">
              <p className="font-semibold">{b.title}</p>
              <p className="text-xs text-gray-500">{b.families_reached} keluarga · {new Date(b.created_at).toLocaleString('id-ID')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
