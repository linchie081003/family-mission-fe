import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import AppShell from '../../components/AppShell'
import FamilyMissionLogo from '../../components/brand/FamilyMissionLogo'

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
    <AppShell className="flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-doodle-skyDark mb-4 inline-block font-extrabold">← Kembali</Link>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="text-center">
            <FamilyMissionLogo size={72} variant="full" className="mb-2 mx-auto" />
            <h2 className="text-2xl font-extrabold text-doodle-ink">Super Admin</h2>
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
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? 'Loading...' : 'Masuk Admin'}
          </button>
        </form>
      </div>
    </AppShell>
  )
}
