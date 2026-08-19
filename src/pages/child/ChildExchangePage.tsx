import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api'
import { Reward } from '../../types'
import { useWebSocket } from '../../hooks/useWebSocket'

export default function ChildExchangePage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [activeBalance, setActiveBalance] = useState(0)
  const [totalRedeemed, setTotalRedeemed] = useState(0)
  const [history, setHistory] = useState<{
    type: string
    points: number
    status: string
    reward_title?: string
    created_at: string
  }[]>([])
  const [tab, setTab] = useState<'rewards' | 'history'>('rewards')
  const [redeemingId, setRedeemingId] = useState<number | null>(null)

  const loadRewards = useCallback(() => {
    api.getChildRewards().then(setRewards).catch(() => setRewards([]))
  }, [])

  const loadPoints = useCallback(() => {
    api.childPointsSummary().then(summary => {
      setActiveBalance(summary.active_balance)
    }).catch(() => undefined)
  }, [])

  const loadRedemptions = useCallback(() => {
    api.childRedemptions().then(data => {
      setTotalRedeemed(data.total_redeemed)
      setHistory(data.redemptions.filter(r => r.status === 'approved'))
    }).catch(() => undefined)
  }, [])

  const loadAll = useCallback(() => {
    loadRewards()
    loadPoints()
    loadRedemptions()
  }, [loadRewards, loadPoints, loadRedemptions])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useWebSocket(event => {
    if (['redemption_approved', 'redemption_rejected', 'redemption_pending'].includes(event)) {
      loadAll()
    }
  })

  const handleRedeemReward = async (reward: Reward) => {
    if (activeBalance < reward.points_cost) return
    const confirmed = window.confirm(
      `Tukar ${reward.points_cost} poin untuk "${reward.title}"?\n\nPermintaan perlu persetujuan orang tua.`,
    )
    if (!confirmed) return

    setRedeemingId(reward.id)
    try {
      await api.redeem({ redemption_type: 'reward', reward_id: reward.id, points: reward.points_cost })
      alert('Permintaan hadiah diajukan! Tunggu persetujuan orang tua.')
      loadRedemptions()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal')
    } finally {
      setRedeemingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Tukar Poin</h2>

      <div className="grid grid-cols-2 gap-2">
        <div className="card bg-primary-50 border-primary-100 text-center py-3">
          <p className="text-xs text-gray-500">Poin aktif</p>
          <p className="text-2xl font-bold text-primary-700">{activeBalance}</p>
        </div>
        <div className="card bg-green-50 border-green-200 text-center py-3">
          <p className="text-xs text-gray-500">Total poin ditukar</p>
          <p className="text-2xl font-bold text-green-700">{totalRedeemed}</p>
        </div>
      </div>

      <div className="flex gap-1">
        {(['rewards', 'history'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold ${tab === t ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
          >
            {t === 'rewards' ? '🎁 Hadiah' : '📜 Riwayat'}
          </button>
        ))}
      </div>

      {tab === 'rewards' && (
        <div className="space-y-2">
          {rewards.map(r => {
            const canRedeem = activeBalance >= r.points_cost
            return (
              <div key={r.id} className="card flex justify-between items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{r.title}</p>
                  {r.description && <p className="text-xs text-gray-400 mt-0.5">{r.description}</p>}
                  <p className="text-xs font-semibold text-primary-600 mt-1">{r.points_cost} poin</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRedeemReward(r)}
                  disabled={!canRedeem || redeemingId === r.id}
                  className="btn-primary py-1.5 px-3 text-sm shrink-0 disabled:opacity-40"
                >
                  {redeemingId === r.id ? '...' : 'Tukar'}
                </button>
              </div>
            )
          })}
          {rewards.length === 0 && <p className="text-center text-gray-400 py-8">Belum ada hadiah</p>}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-2">
          {history.map((r, i) => (
            <div key={`${r.created_at}-${i}`} className="card flex justify-between items-center py-3">
              <div>
                <p className="font-semibold text-sm">
                  {r.type === 'cash' ? '💵 Penukaran' : `🎁 ${r.reward_title || 'Hadiah'}`}
                </p>
                <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('id-ID')}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-600">-{r.points} poin</p>
                <p className="text-xs text-green-600 font-semibold">Disetujui</p>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-center text-gray-400 py-8">Belum ada riwayat penukaran</p>
          )}
        </div>
      )}
    </div>
  )
}
