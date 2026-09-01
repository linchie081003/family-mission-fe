import { useState } from 'react'
import { Mission } from '../types'
import ProofImagePicker from './ProofImagePicker'

interface MissionCompleteModalProps {
  mission: Mission | null
  onClose: () => void
  onSubmit: (missionId: number, proofImage?: string, note?: string) => Promise<void>
  evidenceRequired?: boolean
}

export default function MissionCompleteModal({
  mission,
  onClose,
  onSubmit,
  evidenceRequired = true,
}: MissionCompleteModalProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!mission) return null

  const canSubmit = !evidenceRequired || Boolean(preview)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (evidenceRequired && !preview) {
      setError('Upload foto bukti misi wajib')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onSubmit(mission.id, preview || undefined, note || undefined)
      setPreview(null)
      setNote('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim misi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">Selesaikan Misi</h3>
            <p className="text-sm text-gray-600 mt-1">{mission.title}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {evidenceRequired ? (
          <ProofImagePicker
            preview={preview}
            onChange={setPreview}
            onError={setError}
            label="Foto bukti"
          />
        ) : (
          <p className="text-sm text-gray-500 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
            Paket keluarga Anda tidak memerlukan upload foto bukti. Cukup kirim catatan jika perlu.
          </p>
        )}

        <input
          className="input"
          placeholder="Catatan (opsional)"
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
          <button type="submit" disabled={loading || !canSubmit} className="btn-primary flex-1">
            {loading ? 'Mengirim...' : 'Kirim Misi'}
          </button>
        </div>
      </form>
    </div>
  )
}
