import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [message, setMessage] = useState('Memverifikasi email...')
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (!token) {
      setMessage('Token verifikasi tidak valid.')
      return
    }
    api.verifyEmail(token)
      .then(res => { setMessage(res.message); setOk(true) })
      .catch(err => setMessage(err instanceof Error ? err.message : 'Verifikasi gagal'))
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="card w-full max-w-sm space-y-4 text-center">
        <h2 className="text-2xl font-bold">Verifikasi Email</h2>
        <p className={ok ? 'text-green-600' : 'text-gray-600'}>{message}</p>
        {ok && <Link to="/" className="btn-primary inline-block px-6 py-2">Login</Link>}
      </div>
    </div>
  )
}
