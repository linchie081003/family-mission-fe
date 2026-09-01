import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState('Memuat...')

  useEffect(() => {
    api.getPrivacy().then(doc => setContent(doc.content)).catch(() => setContent('Gagal memuat kebijakan privasi.'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-2xl mx-auto card prose prose-sm">
        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">{content}</pre>
        <Link to="/" className="text-primary-600 text-sm">← Kembali</Link>
      </div>
    </div>
  )
}
