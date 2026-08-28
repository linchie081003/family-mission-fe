import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Child, Mission, Goal, LEVEL_ICONS } from '../../types'
import { useWebSocket } from '../../hooks/useWebSocket'
import { celebrate } from '../../utils/celebrate'
import MissionCompleteModal from '../../components/MissionCompleteModal'

interface HomeData {
  child: Child
  today_missions: Mission[]
  weekly_progress: number
  active_goal: Goal | null
  recent_badges: { icon: string; name: string }[]
  rewards_enabled?: boolean
  mission_evidence_enabled?: boolean
  daily_mission_limit?: number | null
}

export default function ChildHomePage() {
  const [data, setData] = useState<HomeData | null>(null)
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)

  const load = () => api.childHome().then(d => setData(d as HomeData))
  useEffect(() => { load() }, [])

  useWebSocket((event) => {
    if (['mission_approved', 'achievement', 'punishment', 'redemption_approved'].includes(event)) {
      load()
      if (event === 'mission_approved') celebrate('achievement')
    }
  })

  const handleSubmitMission = async (missionId: number, proofImage?: string, note?: string) => {
    if (!data) return
    await api.completeMission(data.child.id, missionId, proofImage, note)
    load()
  }

  if (!data) return <div className="text-center py-8 text-gray-400">Loading...</div>
  const { child, today_missions, weekly_progress, active_goal } = data
  const rewardsOn = Boolean(data.rewards_enabled)
  const evidenceRequired = Boolean(data.mission_evidence_enabled)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-2 ring-4 ring-white shadow-lg" style={{ backgroundColor: child.color }}>
          {child.avatar_url ? <img src={child.avatar_url} className="w-full h-full rounded-full object-cover" /> : child.name[0]}
        </div>
        <h1 className="text-2xl font-extrabold">{child.name}</h1>
        {rewardsOn && (
          <p className={`font-bold level-${child.level}`}>{LEVEL_ICONS[child.level]} Level {child.level.charAt(0).toUpperCase() + child.level.slice(1)}</p>
        )}
      </div>

      {rewardsOn ? (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="card py-3">
            <p className="text-2xl">🔥</p>
            <p className="font-bold">{child.current_streak}</p>
            <p className="text-xs text-gray-400">Streak</p>
          </div>
          <div className="card py-3">
            <p className="text-2xl">⭐</p>
            <p className="font-bold">{child.spendable_balance ?? child.active_balance}</p>
            <p className="text-xs text-gray-400">Saldo Aktif</p>
          </div>
          <div className="card py-3">
            <p className="text-2xl">🏆</p>
            <p className="font-bold">{child.lifetime_points}</p>
            <p className="text-xs text-gray-400">Total Poin</p>
          </div>
        </div>
      ) : (
        <div className="card py-3 text-center">
          <p className="text-sm text-gray-600">Mode checklist misi — poin & reward belum aktif untuk keluarga ini.</p>
          {data.daily_mission_limit != null && (
            <p className="text-xs text-gray-400 mt-1">Batas {data.daily_mission_limit} misi disetujui per hari</p>
          )}
        </div>
      )}

      {rewardsOn && (
        <div className="card">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold">Target Minggu</span>
            <span>{Math.round(weekly_progress * 100)}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${weekly_progress * 100}%` }} />
          </div>
        </div>
      )}

      {rewardsOn && active_goal && (
        <div className="card bg-purple-50 border-purple-200">
          <p className="text-xs text-purple-600 font-semibold">🎯 Wishlist</p>
          <p className="font-bold">{active_goal.title}</p>
          <p className="text-sm text-gray-500">{child.spendable_balance ?? child.active_balance}/{active_goal.target_points} poin</p>
        </div>
      )}

      <div>
        <h2 className="font-bold mb-2">📋 Misi Hari Ini</h2>
        <div className="space-y-2">
          {today_missions.filter(m => m.category !== 'additional').slice(0, 5).map(m => (
            <div key={m.id} className="card flex items-center justify-between py-3">
              <div>
                <p className="font-semibold text-sm">{m.title}</p>
                {rewardsOn && m.category !== 'ibadah' && <p className="text-xs text-primary-600">+{m.points} poin</p>}
              </div>
              {m.completed_today ? (
                <span className="text-green-500 text-sm font-bold">{m.pending_approval ? '⏳' : '✅'}</span>
              ) : (
                <button onClick={() => setSelectedMission(m)} className="btn-primary py-1.5 px-3 text-sm">Selesai</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {rewardsOn && data.recent_badges.length > 0 && (
        <div className="flex gap-2 justify-center">
          {data.recent_badges.map((b, i) => (
            <span key={i} className="text-2xl" title={b.name}>{b.icon}</span>
          ))}
        </div>
      )}

      <MissionCompleteModal
        mission={selectedMission}
        onClose={() => setSelectedMission(null)}
        onSubmit={handleSubmitMission}
        evidenceRequired={evidenceRequired}
      />
    </div>
  )
}
