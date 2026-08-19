import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { api } from '../../api'
import { Mission, Punishment, Reward, DIFFICULTY_ICONS } from '../../types'

type Tab = 'regular' | 'ibadah' | 'additional' | 'punishments' | 'rewards'

export default function MissionsPage() {
  const [tab, setTab] = useState<Tab>('regular')
  const [missions, setMissions] = useState<Mission[]>([])
  const [punishments, setPunishments] = useState<Punishment[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState('')
  const [points, setPoints] = useState(5)
  const [difficulty, setDifficulty] = useState('easy')

  const load = () => {
    if (['regular', 'ibadah', 'additional'].includes(tab)) {
      api.getMissions(tab).then(setMissions)
    } else if (tab === 'punishments') {
      api.getPunishments().then(setPunishments)
    } else {
      api.getRewards().then(setRewards)
    }
  }
  useEffect(() => { load() }, [tab])

  const handleAddMission = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.createMission({ title, category: tab, points: tab === 'ibadah' ? 0 : points, difficulty })
    setShowAdd(false)
    setTitle('')
    load()
  }

  const handleAddPunishment = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.createPunishment({ title, points_deducted: points })
    setShowAdd(false)
    setTitle('')
    load()
  }

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.createReward({ title, points_cost: points })
    setShowAdd(false)
    setTitle('')
    load()
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'regular', label: '📋 Reguler' },
    { key: 'ibadah', label: '🕌 Ibadah' },
    { key: 'additional', label: '➕ Tambahan' },
    { key: 'punishments', label: '⚠️ Punishment' },
    { key: 'rewards', label: '🎁 Reward' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Kelola Daftar</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1 py-2 text-sm">
          <Plus size={16} /> Tambah
        </button>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setShowAdd(false) }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${tab === t.key ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {showAdd && (
        <form onSubmit={tab === 'punishments' ? handleAddPunishment : tab === 'rewards' ? handleAddReward : handleAddMission} className="card space-y-3">
          <input className="input" placeholder="Judul" value={title} onChange={e => setTitle(e.target.value)} required />
          {tab !== 'ibadah' && (
            <input className="input" type="number" placeholder={tab === 'rewards' ? 'Biaya poin' : tab === 'punishments' ? 'Poin dikurangi' : 'Poin'} value={points} onChange={e => setPoints(Number(e.target.value))} />
          )}
          {['regular', 'additional'].includes(tab) && (
            <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="easy">🟢 Easy</option>
              <option value="medium">🟡 Medium</option>
              <option value="hard">🔴 Hard</option>
            </select>
          )}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">Simpan</button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Batal</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {['regular', 'ibadah', 'additional'].includes(tab) && missions.map(m => (
          <div key={m.id} className="card flex justify-between items-center">
            <div>
              <p className="font-semibold">{DIFFICULTY_ICONS[m.difficulty]} {m.title}</p>
              <p className="text-xs text-gray-400">{m.category === 'ibadah' ? 'Tanpa poin' : `${m.points} poin`}</p>
            </div>
          </div>
        ))}
        {tab === 'punishments' && punishments.map(p => (
          <div key={p.id} className="card flex justify-between">
            <span>{p.title}</span>
            <span className="text-red-600 font-bold">-{p.points_deducted}</span>
          </div>
        ))}
        {tab === 'rewards' && rewards.map(r => (
          <div key={r.id} className="card flex justify-between">
            <span>{r.title}</span>
            <span className="text-primary-600 font-bold">{r.points_cost} poin</span>
          </div>
        ))}
      </div>
    </div>
  )
}
