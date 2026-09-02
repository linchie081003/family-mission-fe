import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { DashboardSummary, FamilyPointsSummary, LEVEL_ICONS } from '../../types'
import ChildAvatar from '../../components/ChildAvatar'
import { useWebSocket } from '../../hooks/useWebSocket'

export default function ParentDashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [pointsSummary, setPointsSummary] = useState<FamilyPointsSummary | null>(null)
  const [family, setFamily] = useState<{ family_code: string; family_name: string } | null>(null)

  const load = () => {
    api.getDashboard().then(setData)
    api.getPointsSummary().then(setPointsSummary).catch(() => setPointsSummary(null))
    api.me().then(setFamily)
  }

  useEffect(() => { load() }, [])

  useWebSocket((event) => {
    if (['mission_pending', 'mission_approved', 'redemption_pending', 'achievement', 'punishment'].includes(event)) {
      load()
    }
  })

  if (!data) return <div className="text-center py-8 text-gray-400">Loading...</div>

  return (
    <div className="space-y-4">
      {family && (
        <div className="card bg-gradient-to-r from-primary-600 to-indigo-600 text-white">
          <p className="text-indigo-200 text-sm">Keluarga {family.family_name}</p>
          <p className="text-xs text-indigo-200 mt-1">Kode Keluarga: <span className="font-bold text-white text-lg tracking-widest">{family.family_code}</span></p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-gray-400 text-xs">Poin Minggu Ini</p>
          <p className="text-2xl font-bold text-primary-600">{data.total_weekly_points}</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-xs">Saldo Aktif Total</p>
          <p className="text-2xl font-bold text-amber-600">{data.total_active_balance}</p>
        </div>
        <div className="card col-span-2">
          <p className="text-gray-400 text-xs">Total Lifetime Poin</p>
          <p className="text-2xl font-bold">{data.total_lifetime_points}</p>
        </div>
      </div>

      {pointsSummary && (
        <div className="card space-y-3">
          <h3 className="font-bold text-sm">Ringkasan Poin Keluarga</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-400">Saldo aktif</span><p className="font-bold">{pointsSummary.total_active_balance}</p></div>
            <div><span className="text-gray-400">Net minggu</span><p className="font-bold text-primary-600">{pointsSummary.total_weekly_net}</p></div>
            <div><span className="text-gray-400">Total ditukar</span><p className="font-bold text-red-600">{pointsSummary.total_redeemed}</p></div>
          </div>
          <div className="space-y-2 pt-1 border-t">
            {pointsSummary.children.map(c => (
              <Link key={c.child_id} to={`/parent/children/${c.child_id}`} className="flex justify-between items-center text-sm hover:text-primary-600">
                <span className="font-semibold">{c.child_name}</span>
                <span>{c.active_balance} aktif · {c.weekly_net_points >= 0 ? '+' : ''}{c.weekly_net_points} mgg</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {data.pending_count > 0 && (
        <Link to="/parent/pending" className="card flex items-center justify-between bg-orange-50 border-orange-200 hover:bg-orange-100">
          <span className="font-semibold text-orange-700">⏳ {data.pending_count} menunggu persetujuan</span>
          <span className="text-orange-500">→</span>
        </Link>
      )}

      <div>
        <h2 className="font-bold text-lg mb-3">🏆 Ranking Minggu Ini</h2>
        <div className="space-y-2">
          {data.children_ranking.map(child => (
            <Link key={child.id} to={`/parent/children/${child.id}`} className="card flex items-center gap-3 hover:ring-2 hover:ring-primary-200">
              <span className="text-2xl font-bold text-gray-300 w-8">#{child.rank}</span>
              <ChildAvatar name={child.name} color={child.color} avatarUrl={child.avatar_url} size="sm" className="w-10 h-10" />
              <div className="flex-1">
                <p className="font-bold">{child.name} {LEVEL_ICONS[child.level]}</p>
                <p className="text-xs text-gray-400">{child.weekly_points} poin minggu ini</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary-600">{child.active_balance}</p>
                <p className="text-xs text-gray-400">saldo aktif</p>
              </div>
            </Link>
          ))}
          {data.children_ranking.length === 0 && (
            <p className="text-gray-400 text-center py-4">Belum ada anak. <Link to="/parent/children" className="text-primary-600">Tambah anak →</Link></p>
          )}
        </div>
      </div>
    </div>
  )
}
