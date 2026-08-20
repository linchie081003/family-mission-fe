import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import PasswordInput from '../components/PasswordInput'
import { api } from '../api'
import { isPasswordStrong, passwordsMatch } from '../utils/passwordPolicy'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
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
      const res = await api.resetPassword({ token, new_password: password, confirm_password: confirm })
      setMessage(res.message)
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset gagal')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-red-500">Link reset tidak valid.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold">Password Baru</h2>
        <PasswordInput value={password} onChange={setPassword} showStrength placeholder="Password baru" />
        <PasswordInput value={confirm} onChange={setConfirm} confirmWith={password} placeholder="Konfirmasi password" />
        {message && <p className="text-green-600 text-sm">{message}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Set Password Baru'}
        </button>
        <Link to="/" className="block text-center text-primary-600 text-sm">← Ke login</Link>
      </form>
    </div>
  )
}
