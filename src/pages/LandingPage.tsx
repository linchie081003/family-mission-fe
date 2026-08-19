import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

export default function LandingPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [mode, setMode] = useState<'landing' | 'parent-login' | 'parent-register' | 'child-code'>('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [familyCode, setFamilyCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.login({ email, password })
      login(res.access_token, 'parent', res.family_id)
      navigate('/parent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.register({ email, password, family_name: familyName })
      setMode('landing')
      setEmail('')
      setPassword('')
      setFamilyName('')
      alert(res.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  const handleChildCode = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/child/login?code=${familyCode.toUpperCase()}`)
  }

  if (mode === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-primary-600 to-indigo-800 text-white">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">👨‍👩‍👧</div>
          <h1 className="text-4xl font-extrabold mb-2">Family Mission</h1>
          <p className="text-indigo-200 text-lg">Bangun kebiasaan baik bersama keluarga</p>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <button onClick={() => setMode('parent-register')} className="w-full btn bg-white/20 text-white py-4 text-lg border border-white/30">
            Daftar Keluarga Baru
          </button>
          <p></p>
          <button onClick={() => setMode('parent-login')} className="w-full btn bg-white text-primary-700 py-4 text-lg">
            👨‍👩 Login Orang Tua
          </button>
          <button onClick={() => setMode('child-code')} className="w-full btn bg-white/20 text-white py-4 text-lg border border-white/30">
            🧒 Login Anak
          </button>
          <Link to="/admin/login" className="block w-full btn bg-black/20 text-white/90 py-3 text-sm border border-white/20 text-center">
            🛡️ Super Admin
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="w-full max-w-sm">
        <button onClick={() => setMode('landing')} className="text-primary-600 mb-4 font-semibold">← Kembali</button>

        {mode === 'parent-login' && (
          <form onSubmit={handleParentLogin} className="card space-y-4">
            <h2 className="text-2xl font-bold">Login Orang Tua</h2>
            <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Loading...' : 'Masuk'}
            </button>
          </form>
        )}

        {mode === 'parent-register' && (
          <form onSubmit={handleRegister} className="card space-y-4">
            <h2 className="text-2xl font-bold">Daftar Keluarga</h2>
            <input className="input" placeholder="Nama Keluarga" value={familyName} onChange={e => setFamilyName(e.target.value)} required />
            <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="input" type="password" placeholder="Password (min 6 karakter)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            <p className="text-xs text-gray-500">Setelah daftar, akun perlu disetujui Super Admin sebelum bisa login.</p>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Loading...' : 'Daftar'}
            </button>
          </form>
        )}

        {mode === 'child-code' && (
          <form onSubmit={handleChildCode} className="card space-y-4">
            <h2 className="text-2xl font-bold">Login Anak</h2>
            <p className="text-gray-500 text-sm">Masukkan kode keluarga dari orang tua</p>
            <input
              className="input text-center text-2xl tracking-widest font-bold uppercase"
              placeholder="ABC123"
              value={familyCode}
              onChange={e => setFamilyCode(e.target.value.toUpperCase())}
              maxLength={8}
              required
            />
            <button type="submit" className="btn-primary w-full py-3">Lanjut →</button>
          </form>
        )}
      </div>
    </div>
  )
}
