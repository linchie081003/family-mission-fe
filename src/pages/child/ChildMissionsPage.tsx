import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Mission, DIFFICULTY_ICONS } from '../../types'
import { useAuth } from '../../context/AuthContext'
import MissionCompleteModal from '../../components/MissionCompleteModal'

const CATEGORIES = [
  { key: 'regular', label: '📋 Reguler', desc: 'Berpoin, perlu approval + foto bukti' },
  { key: 'ibadah', label: '🕌 Ibadah', desc: 'Catat ibadah harian + foto bukti' },
  { key: 'additional', label: '➕ Tambahan', desc: 'Referensi dari orang tua' },
]

export default function ChildMissionsPage() {
  const { childId } = useAuth()
  const [category, setCategory] = useState('regular')
  const [missions, setMissions] = useState<Mission[]>([])
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [rewardsEnabled, setRewardsEnabled] = useState(true)
  const [evidenceRequired, setEvidenceRequired] = useState(true)

  useEffect(() => {
    api.childHome().then(home => {
      setRewardsEnabled(Boolean((home as { rewards_enabled?: boolean }).rewards_enabled))
      setEvidenceRequired(Boolean((home as { mission_evidence_enabled?: boolean }).mission_evidence_enabled))
    }).catch(() => undefined)
  }, [])

  const load = () => api.childMissions(category).then(setMissions)
  useEffect(() => { load() }, [category])

  const handleSubmitMission = async (missionId: number, proofImage?: string, note?: string) => {
    await api.completeMission(childId!, missionId, proofImage, note)
    load()
  }

  const categoryDesc = (key: string) => {
    if (key === 'regular') return rewardsEnabled ? 'Berpoin, perlu approval' + (evidenceRequired ? ' + foto bukti' : '') : 'Checklist misi harian'
    if (key === 'ibadah') return evidenceRequired ? 'Catat ibadah harian + foto bukti' : 'Catat ibadah harian'
    return 'Referensi dari orang tua'
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Mission</h2>

      <div className="flex gap-1">
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCategory(c.key)} className={`flex-1 py-2 rounded-xl text-xs font-semibold ${category === c.key ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>
            {c.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center">{categoryDesc(category)}</p>

      <div className="space-y-2">
        {missions.map(m => (
          <div key={m.id} className={`card ${m.completed_today ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{DIFFICULTY_ICONS[m.difficulty]} {m.title}</p>
                {m.description && <p className="text-xs text-gray-400 mt-0.5">{m.description}</p>}
                {rewardsEnabled && m.category !== 'ibadah' && m.points > 0 && <p className="text-sm text-primary-600 font-bold mt-1">+{m.points} poin</p>}
              </div>
              {category !== 'additional' && (
                m.completed_today ? (
                  <span className="text-lg">{m.pending_approval ? '⏳' : '✅'}</span>
                ) : (
                  <button onClick={() => setSelectedMission(m)} className="btn-primary py-1.5 px-3 text-sm shrink-0">Selesai</button>
                )
              )}
            </div>
          </div>
        ))}
        {missions.length === 0 && <p className="text-center text-gray-400 py-8">Belum ada misi</p>}
      </div>

      <MissionCompleteModal
        mission={selectedMission}
        onClose={() => setSelectedMission(null)}
        onSubmit={handleSubmitMission}
        evidenceRequired={evidenceRequired}
      />
    </div>
  )
}
