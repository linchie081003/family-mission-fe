import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { api } from '../../api'
import { Child, LEVEL_ICONS } from '../../types'

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [target, setTarget] = useState(100)

  const load = () => api.getChildren().then(setChildren)
  useEffect(() => { load() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.createChild({ name, color, weekly_target: target })
    setShowAdd(false)
    setName('')
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Menu Anak</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1 py-2 text-sm">
          <Plus size={16} /> Tambah
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="card space-y-3">
          <input className="input" placeholder="Nama anak" value={name} onChange={e => setName(e.target.value)} required />
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`} style={{ backgroundColor: c }} />
            ))}
          </div>
          <input className="input" type="number" placeholder="Target poin mingguan" value={target} onChange={e => setTarget(Number(e.target.value))} />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">Simpan</button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Batal</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {children.map(child => (
          <Link key={child.id} to={`/parent/children/${child.id}`} className="card flex items-center gap-3 hover:ring-2 hover:ring-primary-200">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: child.color }}>
              {child.avatar_url ? <img src={child.avatar_url} className="w-full h-full rounded-full object-cover" /> : child.name[0]}
            </div>
            <div className="flex-1">
              <p className="font-bold">{child.name} {LEVEL_ICONS[child.level]}</p>
              <p className="text-xs text-gray-400">Saldo: {child.active_balance} · Lifetime: {child.lifetime_points} · 🔥{child.current_streak}</p>
            </div>
            <span className="text-gray-300">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
