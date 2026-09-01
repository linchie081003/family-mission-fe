import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'

export default function PlatformLoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.platformLogin({ email, password })
      login(res.access_token, 'platform_admin')
      navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-indigo-300 mb-4 inline-block font-semibold">← Kembali</Link>
        <form onSubmit={handleSubmit} className="card space-y-4 shadow-2xl border border-white/10 bg-white/95 backdrop-blur">
          <div className="text-center">
            <div className="text-3xl mb-2">🛡️</div>
            <h2 className="text-2xl font-bold">Super Admin</h2>
            <p className="text-sm text-gray-500 mt-1">Kelola permission fitur per tenant</p>
          </div>
          <input
            className="input"
            type="email"
            placeholder="admin@familymission.local"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password default: admin123456"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? 'Loading...' : 'Masuk Panel Admin'}
          </button>
        </form>
      </div>
    </div>
  )
}
