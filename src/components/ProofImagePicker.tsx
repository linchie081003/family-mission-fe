import { useState } from 'react'
import { UserCheck } from 'lucide-react'
import ImageSourcePicker from './ImageSourcePicker'

interface ProofImagePickerProps {
  preview: string | null
  onChange: (base64: string | null) => void
  onError?: (message: string) => void
  label?: string
  optional?: boolean
  /** Parent backdate: default tanpa foto, bisa pilih lampirkan bukti */
  parentEntry?: boolean
}

export default function ProofImagePicker({
  preview,
  onChange,
  onError,
  label = 'Foto bukti',
  optional = false,
  parentEntry = false,
}: ProofImagePickerProps) {
  const [attachPhoto, setAttachPhoto] = useState(false)

  const showPhotoOptions = !parentEntry || attachPhoto || Boolean(preview)

  const selectDefault = () => {
    setAttachPhoto(false)
    onChange(null)
  }

  const selectAttachPhoto = () => {
    setAttachPhoto(true)
  }

  return (
    <div className="space-y-2">
      {parentEntry && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 px-3 py-2.5 flex gap-2">
          <UserCheck size={18} className="text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-900 leading-relaxed">
            <p className="font-semibold">Dicatat oleh orang tua</p>
            <p className="text-indigo-700/90 mt-0.5">
              Misi langsung tercatat tanpa approval anak. Foto bukti opsional — default tanpa foto.
            </p>
          </div>
        </div>
      )}

      <label className="block text-sm font-semibold text-gray-600">
        📷 {label}{optional && !parentEntry ? ' (opsional)' : ''}{!optional && !parentEntry ? ' (wajib)' : ''}
      </label>

      {parentEntry && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={selectDefault}
            className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
              !preview && !attachPhoto
                ? 'border-primary-300 bg-primary-50 text-primary-900 ring-1 ring-primary-200'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <p className="font-semibold">Tanpa bukti</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Default</p>
          </button>
          <button
            type="button"
            onClick={selectAttachPhoto}
            className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
              attachPhoto || preview
                ? 'border-primary-300 bg-primary-50 text-primary-900 ring-1 ring-primary-200'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <p className="font-semibold">Lampirkan foto</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Kamera / galeri</p>
          </button>
        </div>
      )}

      {showPhotoOptions && (
        <ImageSourcePicker
          cameraLabel="Ambil Foto"
          galleryLabel="Galeri"
          onError={onError}
          onSelect={base64 => {
            setAttachPhoto(true)
            onChange(base64)
          }}
        />
      )}

      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview bukti"
            className="w-full max-h-48 object-cover rounded-xl border border-gray-100"
          />
          <button
            type="button"
            onClick={selectDefault}
            className="absolute top-2 right-2 rounded-full bg-black/60 text-white text-xs px-2 py-1"
          >
            Hapus
          </button>
        </div>
      )}

      {parentEntry && !preview && !attachPhoto && (
        <p className="text-[11px] text-gray-400">Tidak ada foto bukti — entri orang tua tetap disimpan.</p>
      )}
    </div>
  )
}
