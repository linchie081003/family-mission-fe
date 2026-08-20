import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import PasswordInput from '../components/PasswordInput'
import { api } from '../api'
import { isPasswordStrong, passwordsMatch } from '../utils/passwordPolicy'

export default function AcceptInvitePage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordStrong(password) || !passwordsMatch(password, confirm)) {
      setError('Password tidak memenuhi standar atau konfirmasi tidak cocok')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.acceptParentInvite({ token, password, confirm_password: confirm })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menerima undangan')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Link undangan tidak valid.</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold">Terima Undangan Co-Parent</h2>
        <p className="text-sm text-gray-500">Set password untuk akun orang tua Anda.</p>
        <PasswordInput value={password} onChange={setPassword} showStrength placeholder="Password" />
        <PasswordInput value={confirm} onChange={setConfirm} confirmWith={password} placeholder="Konfirmasi password" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Aktivasi Akun'}
        </button>
        <Link to="/" className="block text-center text-primary-600 text-sm">← Ke login</Link>
      </form>
    </div>
  )
}
