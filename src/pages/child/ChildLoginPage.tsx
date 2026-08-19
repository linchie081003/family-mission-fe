import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'

export default function ChildLoginPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { login, token, role, isReady } = useAuth()
  const code = params.get('code') || ''

  useEffect(() => {
    if (!isReady) return
    if (token && role === 'child') navigate('/child', { replace: true })
  }, [isReady, token, role, navigate])

  const [children, setChildren] = useState<{ id: number; name: string; color: string; has_pin: boolean }[]>([])
  const [selectedChild, setSelectedChild] = useState<number | null>(null)
  const [pin, setPin] = useState('')
  const [setupPin, setSetupPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'select' | 'pin' | 'setup'>('select')

  useEffect(() => {
    if (!code) return
    api.getChildrenByCode(code).then(setChildren).catch(() => setError('Kode keluarga tidak valid'))
  }, [code])

  const selected = children.find(c => c.id === selectedChild)

  const handleSelect = (child: typeof children[0]) => {
    setSelectedChild(child.id)
    if (!child.has_pin) {
      setStep('setup')
    } else {
      setStep('pin')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedChild) return
    setLoading(true)
    setError('')
    try {
      const res = await api.childLogin({ family_code: code, child_id: selectedChild, pin })
      login(res.access_token, 'child', res.family_id, res.child_id)
      navigate('/child')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  const handleSetupPin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (setupPin !== confirmPin) {
      setError('PIN tidak cocok')
      return
    }
    if (setupPin.length < 4) {
      setError('PIN minimal 4 digit')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.firstTimeSetup({ family_code: code, child_id: selectedChild!, pin: setupPin })
      login(res.access_token, 'child', res.family_id, res.child_id)
      navigate('/child')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal atur PIN')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'select') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-bold text-center">Pilih Namamu</h2>
          <p className="text-center text-gray-500 text-sm">Kode: {code}</p>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <div className="space-y-2">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => handleSelect(child)}
                className="w-full card flex items-center gap-3 hover:ring-2 hover:ring-primary-500 transition-all"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: child.color }}>
                  {child.name[0]}
                </div>
                <span className="font-bold text-lg">{child.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (step === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <form onSubmit={handleSetupPin} className="w-full max-w-sm card space-y-4">
          <h2 className="text-2xl font-bold">Buat PIN Baru</h2>
          <p className="text-gray-500 text-sm">Halo {selected?.name}! Buat PIN 4-6 digit untuk kamu.</p>
          <input className="input text-center text-2xl tracking-widest" type="password" inputMode="numeric" maxLength={6} placeholder="PIN baru" value={setupPin} onChange={e => setSetupPin(e.target.value.replace(/\D/g, ''))} required />
          <input className="input text-center text-2xl tracking-widest" type="password" inputMode="numeric" maxLength={6} placeholder="Ulangi PIN" value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))} required />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>Simpan PIN</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleLogin} className="w-full max-w-sm card space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold mb-2" style={{ backgroundColor: selected?.color }}>
            {selected?.name[0]}
          </div>
          <h2 className="text-2xl font-bold">{selected?.name}</h2>
        </div>
        <input className="input text-center text-3xl tracking-widest" type="password" inputMode="numeric" maxLength={6} placeholder="••••" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} required autoFocus />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>Masuk</button>
        <button type="button" onClick={() => setStep('select')} className="w-full text-gray-400 text-sm">← Ganti nama</button>
      </form>
    </div>
  )
}
