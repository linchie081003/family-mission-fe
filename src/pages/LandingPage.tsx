import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import PasswordInput from '../components/PasswordInput'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { isPasswordStrong, passwordsMatch } from '../utils/passwordPolicy'

type ParentRole = 'father' | 'mother'

export default function LandingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const refCode = searchParams.get('ref') || ''
  const { login } = useAuth()
  const [mode, setMode] = useState<'landing' | 'parent-login' | 'parent-register' | 'child-code'>('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [parentName, setParentName] = useState('')
  const [parentRole, setParentRole] = useState<ParentRole>('father')
  const [familyCode, setFamilyCode] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptConsent, setAcceptConsent] = useState(false)
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
    if (!isPasswordStrong(password) || !passwordsMatch(password, confirmPassword)) {
      setError('Password tidak memenuhi standar atau konfirmasi tidak cocok')
      return
    }
    if (!acceptTerms || !acceptConsent) {
      setError('Anda harus menyetujui syarat & ketentuan serta persetujuan data anak')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.register({
        email,
        password,
        confirm_password: confirmPassword,
        family_name: familyName,
        name: parentName,
        role: parentRole,
        referral_code: refCode || undefined,
        accept_terms: acceptTerms,
        accept_privacy: acceptTerms,
        accept_parental_consent: acceptConsent,
        accept_child_data_protection: acceptConsent,
      })
      setMode('landing')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setFamilyName('')
      setParentName('')
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

  const footer = (
    <div className="mt-8 text-center text-xs text-indigo-200/80 space-x-3">
      <Link to="/privacy" className="hover:underline">Kebijakan Privasi</Link>
      <span>·</span>
      <Link to="/terms" className="hover:underline">Syarat & Ketentuan</Link>
    </div>
  )

  if (mode === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-primary-600 to-indigo-800 text-white">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">👨‍👩‍👧</div>
          <h1 className="text-4xl font-extrabold mb-2">Family Mission</h1>
          <p className="text-indigo-200 text-lg">Bangun kebiasaan baik bersama keluarga</p>
          {refCode && <p className="text-sm text-indigo-200 mt-2">Kode referral: {refCode}</p>}
        </div>

        <div className="w-full max-w-sm space-y-3">
          <button onClick={() => setMode('parent-register')} className="w-full btn bg-white/20 text-white py-4 text-lg border border-white/30">
            Daftar Keluarga Baru
          </button>
          <button onClick={() => setMode('parent-login')} className="w-full btn bg-white text-primary-700 py-4 text-lg">
            👨‍👩 Login Orang Tua
          </button>
          <button onClick={() => setMode('child-code')} className="w-full btn bg-white/20 text-white py-4 text-lg border border-white/30">
            🧒 Login Anak
          </button>
        </div>
        {footer}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-50 py-8">
      <div className="w-full max-w-sm">
        <button onClick={() => setMode('landing')} className="text-primary-600 mb-4 font-semibold">← Kembali</button>

        {mode === 'parent-login' && (
          <form onSubmit={handleParentLogin} className="card space-y-4">
            <h2 className="text-2xl font-bold">Login Orang Tua</h2>
            <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <PasswordInput value={password} onChange={setPassword} placeholder="Password" showStrength={false} />
            <Link to="/forgot-password" className="text-sm text-primary-600">Lupa password?</Link>
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
            <input className="input" placeholder="Nama Anda" value={parentName} onChange={e => setParentName(e.target.value)} required />
            <select className="input" value={parentRole} onChange={e => setParentRole(e.target.value as ParentRole)}>
              <option value="father">Ayah</option>
              <option value="mother">Ibu</option>
            </select>
            <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <PasswordInput value={password} onChange={setPassword} showStrength placeholder="Password" />
            <PasswordInput value={confirmPassword} onChange={setConfirmPassword} confirmWith={password} placeholder="Konfirmasi Password" />
            <label className="flex gap-2 text-xs text-gray-600 items-start">
              <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} className="mt-0.5" />
              <span>Saya setuju dengan <Link to="/terms" className="text-primary-600 underline" target="_blank">Syarat & Ketentuan</Link> dan <Link to="/privacy" className="text-primary-600 underline" target="_blank">Kebijakan Privasi</Link></span>
            </label>
            <label className="flex gap-2 text-xs text-gray-600 items-start">
              <input type="checkbox" checked={acceptConsent} onChange={e => setAcceptConsent(e.target.checked)} className="mt-0.5" />
              <span>Saya memberikan persetujuan sebagai orang tua/wali. Saya memahami bahwa <strong>data anak tidak akan digunakan dan disebarluaskan di media manapun</strong>. Apabila data anak tersebar karena kelalaian platform, <strong>operator bersedia menutup aplikasi dan bertanggung jawab sepenuhnya</strong>.</span>
            </label>
            <p className="text-xs text-gray-500">Setelah daftar, verifikasi email diperlukan sebelum login.</p>
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
              maxLength={6}
              required
            />
            <button type="submit" className="btn-primary w-full py-3">Lanjut</button>
          </form>
        )}
      </div>
      {footer}
    </div>
  )
}
