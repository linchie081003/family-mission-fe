import { useEffect, useState } from 'react'
import { api } from '../../api'
import {
  PlatformReferralActivity,
  PlatformReferralLeaderboardEntry,
  PlatformReferralStats,
} from '../../types'

export default function PlatformReferralsPage() {
  const [stats, setStats] = useState<PlatformReferralStats | null>(null)
  const [leaderboard, setLeaderboard] = useState<PlatformReferralLeaderboardEntry[]>([])
  const [activity, setActivity] = useState<PlatformReferralActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.platformReferralStats(),
      api.platformReferralLeaderboard(10),
      api.platformReferralActivity(20),
    ])
      .then(([s, lb, act]) => {
        setStats(s)
        setLeaderboard(lb)
        setActivity(act)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Memuat referral...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Referral Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Performa referral platform-wide</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-2">
          <div className="card"><p className="text-xs text-gray-500">Total Invite</p><p className="text-xl font-bold">{stats.total_invites}</p></div>
          <div className="card"><p className="text-xs text-gray-500">Konversi</p><p className="text-xl font-bold">{stats.total_conversions}</p></div>
          <div className="card"><p className="text-xs text-gray-500">Rate</p><p className="text-xl font-bold">{stats.conversion_rate}%</p></div>
          <div className="card"><p className="text-xs text-gray-500">Punya Kode</p><p className="text-xl font-bold">{stats.families_with_code}</p></div>
        </div>
      )}

      <div className="card space-y-2">
        <h3 className="font-semibold text-sm">Top Referrers</h3>
        {leaderboard.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada data</p>
        ) : (
          leaderboard.map(row => (
            <div key={row.family_id} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0">
              <div>
                <p className="font-semibold">{row.family_name}</p>
                <p className="text-xs text-gray-500">{row.referral_code}</p>
              </div>
              <div className="text-right text-xs">
                <p>{row.families_joined} join</p>
                <p className="text-gray-400">{row.invites_sent} invite</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card space-y-2">
        <h3 className="font-semibold text-sm">Aktivitas Konversi Terbaru</h3>
        {activity.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada konversi</p>
        ) : (
          activity.map(row => (
            <div key={row.family_id} className="text-sm border-b border-gray-100 pb-2 last:border-0">
              <p className="font-semibold">{row.family_name}</p>
              <p className="text-xs text-gray-500">
                dari {row.referrer_name || '?'} · {new Date(row.created_at).toLocaleDateString('id-ID')}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
