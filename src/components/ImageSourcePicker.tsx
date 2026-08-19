import { useRef, useState } from 'react'
import { Camera, ImageIcon } from 'lucide-react'
import { resizeImageToBase64 } from '../utils/imageToBase64'
import CameraCaptureModal from './CameraCaptureModal'

interface ImageSourcePickerProps {
  onSelect: (base64: string) => void | Promise<void>
  onError?: (message: string) => void
  disabled?: boolean
  cameraLabel?: string
  galleryLabel?: string
}

export default function ImageSourcePicker({
  onSelect,
  onError,
  disabled = false,
  cameraLabel = 'Kamera',
  galleryLabel = 'Galeri',
}: ImageSourcePickerProps) {
  const cameraFallbackRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const canUseLiveCamera =
    typeof navigator !== 'undefined'
    && !!navigator.mediaDevices
    && typeof navigator.mediaDevices.getUserMedia === 'function'

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || disabled) return
    setBusy(true)
    try {
      await onSelect(await resizeImageToBase64(file))
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Gagal memproses foto')
    } finally {
      setBusy(false)
    }
  }

  const openCamera = () => {
    if (disabled || busy) return
    if (canUseLiveCamera) {
      setCameraOpen(true)
      return
    }
    cameraFallbackRef.current?.click()
  }

  const handleCameraCapture = async (base64: string) => {
    if (disabled) return
    setBusy(true)
    try {
      await onSelect(base64)
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Gagal memproses foto')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <CameraCaptureModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
        onError={onError}
      />

      <input
        ref={cameraFallbackRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
        disabled={disabled || busy}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
        disabled={disabled || busy}
      />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={openCamera}
          disabled={disabled || busy}
          className="flex items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50 py-2.5 text-sm font-semibold text-primary-800 hover:bg-primary-100 transition-colors disabled:opacity-50"
        >
          <Camera size={18} />
          {busy ? 'Memproses...' : cameraLabel}
        </button>
        <button
          type="button"
          onClick={() => !disabled && !busy && galleryRef.current?.click()}
          disabled={disabled || busy}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <ImageIcon size={18} />
          {galleryLabel}
        </button>
      </div>
    </>
  )
}
