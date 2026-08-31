import { useEffect, useState } from 'react'
import { api } from '../../../api'
import { PaymentSettings } from '../../../types'

export default function PlatformPaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null)
  const [form, setForm] = useState({
    qris_merchant_name: '',
    bank_name: '',
    bank_account_number: '',
    bank_account_holder: '',
    transfer_instructions: '',
    qris_static: true,
    bank_transfer: true,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const load = () => {
    api.platformPaymentSettings().then(data => {
      setSettings(data)
      const enabled = data.payment_methods_enabled || {}
      setForm({
        qris_merchant_name: data.qris_merchant_name || '',
        bank_name: data.bank_name || '',
        bank_account_number: data.bank_account_number || '',
        bank_account_holder: data.bank_account_holder || '',
        transfer_instructions: data.transfer_instructions || '',
        qris_static: enabled.qris_static !== false,
        bank_transfer: enabled.bank_transfer !== false,
      })
    })
  }

  useEffect(() => { load() }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const updated = await api.platformUpdatePaymentSettings({
        qris_merchant_name: form.qris_merchant_name || undefined,
        bank_name: form.bank_name || undefined,
        bank_account_number: form.bank_account_number || undefined,
        bank_account_holder: form.bank_account_holder || undefined,
        transfer_instructions: form.transfer_instructions || undefined,
        payment_methods_enabled: {
          qris_static: form.qris_static,
          bank_transfer: form.bank_transfer,
        },
      })
      setSettings(updated)
      setMessage('Pengaturan pembayaran disimpan')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const uploadQris = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMessage('')
    try {
      const res = await api.platformUploadQris(file)
      setSettings(prev => (prev ? { ...prev, qris_image_url: res.qris_image_url } : prev))
      setMessage('Gambar QRIS diunggah')
      load()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Gagal upload')
    } finally {
      setUploading(false)
    }
  }

  if (!settings) {
    return <div className="text-center py-8 text-gray-400">Memuat...</div>
  }

  const qrisSrc = settings.qris_image_url || null

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Konfigurasi QRIS statis dan rekening transfer untuk halaman Upgrade keluarga
      </p>

      <form onSubmit={save} className="card space-y-4">
        <div>
          <p className="text-sm font-semibold mb-2">QRIS Statis</p>
          {qrisSrc && (
            <img src={qrisSrc} alt="QRIS" className="max-w-[200px] rounded-lg border mb-2" />
          )}
          <input type="file" accept="image/*" onChange={uploadQris} disabled={uploading} className="text-sm" />
          <input
            className="input w-full mt-2"
            placeholder="Nama merchant (opsional)"
            value={form.qris_merchant_name}
            onChange={e => setForm(f => ({ ...f, qris_merchant_name: e.target.value }))}
          />
          <label className="flex items-center gap-2 mt-2 text-sm">
            <input type="checkbox" checked={form.qris_static} onChange={e => setForm(f => ({ ...f, qris_static: e.target.checked }))} />
            Aktifkan metode QRIS
          </label>
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">Transfer Bank</p>
          <input className="input w-full mb-2" placeholder="Nama bank" value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))} />
          <input className="input w-full mb-2" placeholder="Nomor rekening" value={form.bank_account_number} onChange={e => setForm(f => ({ ...f, bank_account_number: e.target.value }))} />
          <input className="input w-full mb-2" placeholder="Atas nama" value={form.bank_account_holder} onChange={e => setForm(f => ({ ...f, bank_account_holder: e.target.value }))} />
          <textarea className="input w-full" placeholder="Instruksi tambahan" rows={3} value={form.transfer_instructions} onChange={e => setForm(f => ({ ...f, transfer_instructions: e.target.value }))} />
          <label className="flex items-center gap-2 mt-2 text-sm">
            <input type="checkbox" checked={form.bank_transfer} onChange={e => setForm(f => ({ ...f, bank_transfer: e.target.checked }))} />
            Aktifkan metode transfer
          </label>
        </div>

        {message && <p className="text-sm text-indigo-600">{message}</p>}
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </form>
    </div>
  )
}
