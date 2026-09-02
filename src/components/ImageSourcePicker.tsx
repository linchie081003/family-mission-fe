import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { resizeImageToBase64 } from '../utils/imageToBase64'
import CameraCaptureModal, { CameraFacing } from './CameraCaptureModal'

interface ImageSourcePickerProps {
  onSelect: (base64: string) => void | Promise<void>
  onError?: (message: string) => void
  disabled?: boolean
  cameraLabel?: string
  galleryLabel?: string
  /** When true, hide gallery and only allow camera capture */
  cameraOnly?: boolean
  defaultFacing?: CameraFacing
  allowFacingToggle?: boolean
  cameraModalTitle?: string
}

export default function ImageSourcePicker({
  onSelect,
  onError,
  disabled = false,
  cameraLabel = 'Kamera',
  galleryLabel = 'Galeri',
  cameraOnly = false,
  defaultFacing = 'environment',
  allowFacingToggle = true,
  cameraModalTitle,
}: ImageSourcePickerProps) {
  const cameraFallbackRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [fallbackFacing, setFallbackFacing] = useState<CameraFacing>(defaultFacing)

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

  const toggleFallbackFacing = () => {
    setFallbackFacing(prev => (prev === 'environment' ? 'user' : 'environment'))
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
        title={cameraModalTitle}
        defaultFacing={defaultFacing}
        allowFacingToggle={allowFacingToggle}
      />

      <input
        ref={cameraFallbackRef}
        type="file"
        accept="image/*"
        capture={fallbackFacing === 'user' ? 'user' : 'environment'}
        onChange={handleFile}
        className="hidden"
        disabled={disabled || busy}
      />
      {!cameraOnly && (
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
          disabled={disabled || busy}
        />
      )}

      <div className={cameraOnly ? '' : 'grid grid-cols-2 gap-2'}>
        <button
          type="button"
          onClick={openCamera}
          disabled={disabled || busy}
          className={`flex items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50 py-2.5 text-sm font-semibold text-primary-800 hover:bg-primary-100 transition-colors disabled:opacity-50 ${cameraOnly ? 'w-full' : ''}`}
        >
          <Camera size={18} />
          {busy ? 'Memproses...' : cameraLabel}
        </button>
        {!cameraOnly && (
          <button
            type="button"
            onClick={() => !disabled && !busy && galleryRef.current?.click()}
            disabled={disabled || busy}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {galleryLabel}
          </button>
        )}
        {!canUseLiveCamera && allowFacingToggle && (
          <button
            type="button"
            onClick={toggleFallbackFacing}
            className={`text-xs text-primary-700 underline ${cameraOnly ? 'mt-1 w-full text-center' : 'col-span-2'}`}
          >
            Ganti ke kamera {fallbackFacing === 'environment' ? 'depan' : 'belakang'}
          </button>
        )}
      </div>
    </>
  )
}
