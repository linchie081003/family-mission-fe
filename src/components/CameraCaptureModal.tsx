import { useCallback, useEffect, useRef, useState } from 'react'
import { SwitchCamera } from 'lucide-react'
import { compressDataUrlToBase64 } from '../utils/imageToBase64'

export type CameraFacing = 'user' | 'environment'

interface CameraCaptureModalProps {
  open: boolean
  onClose: () => void
  onCapture: (base64: string) => void
  onError?: (message: string) => void
  title?: string
  defaultFacing?: CameraFacing
  allowFacingToggle?: boolean
}

export default function CameraCaptureModal({
  open,
  onClose,
  onCapture,
  onError,
  title = 'Ambil Foto',
  defaultFacing = 'environment',
  allowFacingToggle = true,
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [ready, setReady] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [facing, setFacing] = useState<CameraFacing>(defaultFacing)

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    setReady(false)
  }, [])

  useEffect(() => {
    if (open) setFacing(defaultFacing)
  }, [open, defaultFacing])

  useEffect(() => {
    if (!open) {
      stopStream()
      return
    }

    let cancelled = false

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        onError?.('Kamera tidak didukung di browser ini.')
        onClose()
        return
      }

      try {
        stopStream()
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })

        if (cancelled) {
          stream.getTracks().forEach(track => track.stop())
          return
        }

        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          await video.play()
          setReady(true)
        }
      } catch (err) {
        const name = err instanceof DOMException ? err.name : ''
        if (name === 'NotAllowedError') {
          onError?.('Izin kamera ditolak. Aktifkan izin kamera untuk situs ini.')
        } else if (name === 'NotFoundError') {
          onError?.('Kamera tidak ditemukan di perangkat ini.')
        } else {
          onError?.('Gagal membuka kamera.')
        }
        onClose()
      }
    }

    start()

    return () => {
      cancelled = true
      stopStream()
    }
  }, [open, facing, onClose, onError, stopStream])

  const handleCapture = async () => {
    const video = videoRef.current
    if (!video || !ready || capturing) return

    setCapturing(true)
    try {
      const width = video.videoWidth
      const height = video.videoHeight
      if (!width || !height) throw new Error('Kamera belum siap')

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas tidak didukung')

      ctx.drawImage(video, 0, 0, width, height)
      const base64 = await compressDataUrlToBase64(canvas.toDataURL('image/jpeg', 0.92))
      onCapture(base64)
      onClose()
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Gagal mengambil foto')
    } finally {
      setCapturing(false)
    }
  }

  const toggleFacing = () => {
    if (!allowFacingToggle) return
    setFacing(prev => (prev === 'environment' ? 'user' : 'environment'))
    setReady(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h3 className="font-bold">{title}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="relative bg-black aspect-[4/3]">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
              Membuka kamera...
            </div>
          )}
          {allowFacingToggle && ready && (
            <button
              type="button"
              onClick={toggleFacing}
              className="absolute top-3 right-3 rounded-full bg-black/50 text-white p-2"
              aria-label="Ganti kamera"
            >
              <SwitchCamera size={20} />
            </button>
          )}
        </div>

        <div className="p-4 flex gap-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
          <button type="button" onClick={handleCapture} disabled={!ready || capturing} className="btn-primary flex-1">
            {capturing ? 'Menyimpan...' : 'Ambil Foto'}
          </button>
        </div>
      </div>
    </div>
  )
}
