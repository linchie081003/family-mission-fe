import { useEffect, useState } from 'react'
import { api } from '../../api'
import { PendingItem } from '../../types'
import ChildAvatar from '../../components/ChildAvatar'
import { useWebSocket } from '../../hooks/useWebSocket'
import { celebrate } from '../../utils/celebrate'

export default function PendingPage() {
  const [items, setItems] = useState<PendingItem[]>([])
  const [loading, setLoading] = useState<number | null>(null)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  const load = () => api.getPending().then(setItems)
  useEffect(() => { load() }, [])
  useWebSocket(() => load())

  const handleApprove = async (item: PendingItem) => {
    setLoading(item.id)
    try {
      if (item.type === 'mission') await api.approveCompletion(item.id)
      else await api.approveRedemption(item.id)
      celebrate('reward')
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal')
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async (item: PendingItem) => {
    setLoading(item.id)
    try {
      if (item.type === 'mission') await api.rejectCompletion(item.id)
      else await api.rejectRedemption(item.id)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal')
    } finally {
      setLoading(null)
    }
  }

  const proofImage = (item: PendingItem) => {
    const img = item.extra?.proof_image
    return typeof img === 'string' ? img : null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Mission Pending</h2>
      {items.length === 0 ? (
        <div className="card text-center text-gray-400 py-8">✅ Tidak ada yang menunggu persetujuan</div>
      ) : (
        items.map(item => (
          <div key={`${item.type}-${item.id}`} className="card">
            <div className="flex items-start gap-3">
              <ChildAvatar
                name={item.child_name}
                color={item.child_color}
                avatarUrl={item.child_avatar_url}
                size="sm"
                className="w-10 h-10"
              />
              <div className="flex-1">
                <p className="font-bold">{item.child_name}</p>
                <p className="text-sm text-gray-600">{item.title}</p>
                {item.created_at && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(item.created_at).toLocaleString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                )}
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.type === 'mission' ? 'bg-blue-100 text-blue-700' : item.type === 'cash' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                    {item.type === 'mission' ? '📋 Misi' : item.type === 'cash' ? '💵 Uang' : '🎁 Hadiah'}
                  </span>
                  {item.points > 0 && <span className="text-xs text-gray-400">{item.points} poin</span>}
                </div>
                {typeof item.extra?.note === 'string' && item.extra.note && (
                  <p className="text-xs text-gray-500 mt-1">Catatan: {item.extra.note}</p>
                )}
              </div>
            </div>

            {proofImage(item) && (
              <button type="button" onClick={() => setExpandedImage(proofImage(item))} className="mt-3 block w-full">
                <img
                  src={proofImage(item)!}
                  alt="Bukti misi"
                  className="w-full max-h-40 object-cover rounded-xl border border-gray-100"
                />
                <p className="text-xs text-primary-600 mt-1 text-center">Ketuk untuk perbesar</p>
              </button>
            )}

            <div className="flex gap-2 mt-3">
              <button onClick={() => handleApprove(item)} disabled={loading === item.id} className="btn-success flex-1 py-2 text-sm">
                ✓ Setujui
              </button>
              <button onClick={() => handleReject(item)} disabled={loading === item.id} className="btn-secondary flex-1 py-2 text-sm">
                ✗ Tolak
              </button>
            </div>
          </div>
        ))
      )}

      {expandedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setExpandedImage(null)}>
          <img src={expandedImage} alt="Bukti misi" className="max-w-full max-h-[85vh] rounded-xl" />
        </div>
      )}
    </div>
  )
}
