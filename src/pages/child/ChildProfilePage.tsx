import { useCallback, useEffect, useState } from 'react'

import { api } from '../../api'

import { Child, Transaction, Goal, LEVEL_ICONS, WeeklyPointsReport, PointsSummary, RedemptionSummary } from '../../types'
import UnifiedCalendar from '../../components/UnifiedCalendar'
import WeeklyPointsChart from '../../components/WeeklyPointsChart'
import ImageSourcePicker from '../../components/ImageSourcePicker'
import { dataUrlToFile } from '../../utils/imageToBase64'



export default function ChildProfilePage() {

  const [child, setChild] = useState<Child | null>(null)

  const [history, setHistory] = useState<Transaction[]>([])

  const [evaluations, setEvaluations] = useState<WeeklyPointsReport[]>([])
  const [pointsSummary, setPointsSummary] = useState<PointsSummary | null>(null)
  const [redemptions, setRedemptions] = useState<RedemptionSummary | null>(null)
  const [uploading, setUploading] = useState(false)

  const [goals, setGoals] = useState<Goal[]>([])

  const [tab, setTab] = useState<'summary' | 'calendar' | 'history' | 'evaluation' | 'goals' | 'pin'>('summary')

  const [newGoal, setNewGoal] = useState('')

  const [goalTarget, setGoalTarget] = useState(200)

  const [currentPin, setCurrentPin] = useState('')

  const [newPin, setNewPin] = useState('')



  useEffect(() => {

    api.childHome().then(d => setChild((d as { child: Child }).child))

    api.childHistory(30).then(setHistory)

    api.childGoals().then(setGoals)

    api.getChildWeeklyEvaluations().then(setEvaluations)
    api.childPointsSummary().then(setPointsSummary).catch(() => setPointsSummary(null))
    api.childRedemptions().then(setRedemptions).catch(() => setRedemptions(null))

  }, [])



  const handleAddGoal = async (e: React.FormEvent) => {

    e.preventDefault()

    await api.createGoal({ title: newGoal, target_points: goalTarget })

    setNewGoal('')

    api.childGoals().then(setGoals)

  }



  const handleChangePin = async (e: React.FormEvent) => {

    e.preventDefault()

    try {

      await api.changePin(newPin, currentPin)

      alert('PIN berhasil diubah')

      setCurrentPin('')

      setNewPin('')

    } catch (err) {

      alert(err instanceof Error ? err.message : 'Gagal')

    }

  }



  const handleAvatarBase64 = async (base64: string) => {
    setUploading(true)
    try {
      const file = dataUrlToFile(base64, 'avatar.jpg')
      const res = await api.uploadChildAvatar(file)
      setChild(prev => prev ? { ...prev, avatar_url: res.avatar_url } : prev)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal upload')
    } finally {
      setUploading(false)
    }
  }

  const loadCalendar = useCallback((month: string) => api.getChildCalendar(month), [])



  if (!child) return <div className="text-center py-8 text-gray-400">Loading...</div>



  return (

    <div className="space-y-4">

      <div className="text-center space-y-3">
        <div
          className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold overflow-hidden ring-4 ring-white shadow-lg"
          style={{ backgroundColor: child.color }}
        >
          {child.avatar_url ? <img src={child.avatar_url} alt="" className="w-full h-full object-cover" /> : child.name[0]}
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Ubah foto</p>
          <div className="max-w-xs mx-auto">
            <ImageSourcePicker
              disabled={uploading}
              cameraLabel="Kamera"
              galleryLabel="Galeri"
              onSelect={handleAvatarBase64}
              onError={msg => alert(msg)}
            />
          </div>
        </div>
        <h2 className="text-xl font-bold">{child.name}</h2>
        <p>{LEVEL_ICONS[child.level]} {child.level}</p>
      </div>



      <div className="flex gap-1 overflow-x-auto">

        {(['summary', 'calendar', 'history', 'evaluation', 'goals', 'pin'] as const).map(t => (

          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${tab === t ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>

            {t === 'summary' ? 'Summary' : t === 'calendar' ? 'Kalender' : t === 'history' ? '30 Hari' : t === 'evaluation' ? '5 Minggu' : t === 'goals' ? 'Wishlist' : 'PIN'}

          </button>

        ))}

      </div>



      {tab === 'calendar' && (

        <UnifiedCalendar loadCalendar={loadCalendar} />

      )}



      {tab === 'summary' && (

        <div className="space-y-3">

          <div className="card">

            <p className="text-xs text-gray-400">Saldo Aktif</p>

            <p className="text-2xl font-bold text-primary-600">{child.spendable_balance} poin</p>

            <p className="text-xs text-gray-400 mt-1">Total poin {child.lifetime_points} − penukaran reward {child.reward_redeemed_total}</p>

          </div>

          <div className="card"><p className="text-xs text-gray-400">Total Poin Keseluruhan</p><p className="text-2xl font-bold">{child.lifetime_points}</p></div>

          {pointsSummary && (
            <div className="card space-y-2">
              <h3 className="font-semibold text-sm">Breakdown Minggu Ini</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-400">Earned</span><p className="font-bold text-green-600">+{pointsSummary.weekly_earned}</p></div>
                <div><span className="text-gray-400">Deducted</span><p className="font-bold text-red-600">−{pointsSummary.weekly_deducted}</p></div>
              </div>
            </div>
          )}

          {redemptions && (
            <div className="card">
              <p className="text-xs text-gray-400">Total poin ditukar</p>
              <p className="text-xl font-bold text-red-600">{redemptions.total_redeemed} poin</p>
              <p className="text-xs text-gray-400 mt-1">Reward {redemptions.total_reward_points} · Cash {redemptions.total_cash_points}</p>
            </div>
          )}

          <div className="card"><p className="text-xs text-gray-400">Streak</p><p className="text-2xl font-bold">🔥 {child.current_streak} (terpanjang: {child.longest_streak})</p></div>

        </div>

      )}



      {tab === 'history' && (

        <div className="space-y-2">

          {history.map(tx => (

            <div key={tx.id} className="card flex justify-between py-3">

              <div>

                <p className="text-sm font-semibold">{tx.description}</p>

                <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('id-ID')}</p>

              </div>

              <span className={`font-bold ${tx.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>{tx.points >= 0 ? '+' : ''}{tx.points}</span>

            </div>

          ))}

        </div>

      )}



      {tab === 'evaluation' && (
        <div className="space-y-3">
          <WeeklyPointsChart data={evaluations} />
          <div className="space-y-2">
            {evaluations.map((ev, i) => (

            <div key={i} className="card flex justify-between items-center">

              <div>

                <p className="text-sm font-semibold">Minggu {new Date(ev.week_start).toLocaleDateString('id-ID')}</p>

                <p className="text-xs text-gray-400">+{ev.points_earned} / −{ev.points_deducted}</p>

              </div>

              <p className={`font-bold ${ev.net_points >= 0 ? 'text-green-600' : 'text-red-600'}`}>

                {ev.net_points >= 0 ? '+' : ''}{ev.net_points} poin

              </p>

            </div>

          ))}

          </div>
        </div>
      )}

      {tab === 'goals' && (

        <div className="space-y-3">

          <form onSubmit={handleAddGoal} className="card space-y-2">

            <input className="input" placeholder="Barang impian..." value={newGoal} onChange={e => setNewGoal(e.target.value)} required />

            <input className="input" type="number" placeholder="Target poin" value={goalTarget} onChange={e => setGoalTarget(Number(e.target.value))} />

            <button type="submit" className="btn-primary w-full">Tambah Wishlist</button>

          </form>

          {goals.map(g => (

            <div key={g.id} className="card">

              <p className="font-semibold">{g.title}</p>

              <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">

                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(child.spendable_balance / g.target_points * 100, 100)}%` }} />

              </div>

              <p className="text-xs text-gray-400 mt-1">{child.spendable_balance}/{g.target_points} poin</p>

            </div>

          ))}

        </div>

      )}



      {tab === 'pin' && (

        <form onSubmit={handleChangePin} className="card space-y-3">

          <input className="input text-center" type="password" inputMode="numeric" placeholder="PIN lama" value={currentPin} onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))} maxLength={6} />

          <input className="input text-center" type="password" inputMode="numeric" placeholder="PIN baru" value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} maxLength={6} />

          <button type="submit" className="btn-primary w-full">Ubah PIN</button>

        </form>

      )}

    </div>

  )

}


