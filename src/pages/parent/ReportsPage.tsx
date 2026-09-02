import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { ChildReportSummary, Transaction, WeeklySalaryReport } from '../../types'
import ChildAvatar from '../../components/ChildAvatar'
import WeeklyPointsChart from '../../components/WeeklyPointsChart'
import { formatRupiah } from '../../types'

export default function ReportsPage() {
  const [reports, setReports] = useState<ChildReportSummary[]>([])
  const [weeklyReports, setWeeklyReports] = useState<WeeklySalaryReport[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [tab, setTab] = useState<'overview' | 'salary'>('overview')

  useEffect(() => {
    api.getChildrenReports().then(data => {
      setReports(data)
      if (data.length > 0) setSelectedId(data[0].id)
    })
    api.getWeeklyReports(5).then(setWeeklyReports).catch(() => setWeeklyReports([]))
  }, [])

  const selected = reports.find(r => r.id === selectedId)
  const selectedWeekly = weeklyReports.find(r => r.child_id === selectedId)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">📊 Laporan Anak</h2>

      {reports.length === 0 ? (
        <p className="text-gray-400 text-center py-8">Belum ada data anak</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2">
            {reports.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`card text-left flex items-center gap-3 ${selectedId === r.id ? 'ring-2 ring-primary-400' : ''}`}
              >
                <ChildAvatar name={r.name} color={r.color} avatarUrl={r.avatar_url} size="sm" className="w-10 h-10" />
                <div className="flex-1">
                  <p className="font-bold">{r.name}</p>
                  <p className="text-xs text-gray-400">Minggu: {r.weekly_points} poin · Total: {r.lifetime_points} poin</p>
                </div>
                <Link to={`/parent/children/${r.id}`} className="text-xs text-primary-600 font-semibold" onClick={e => e.stopPropagation()}>
                  Detail →
                </Link>
              </button>
            ))}
          </div>

          {selected && (
            <div className="space-y-4">
              <div className="flex gap-1">
                {(['overview', 'salary'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold ${tab === t ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
                  >
                    {t === 'overview' ? 'Ringkasan' : 'Slip Gaji Mingguan'}
                  </button>
                ))}
              </div>

              {tab === 'overview' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="card">
                      <p className="text-xs text-gray-400">Total Poin Mingguan</p>
                      <p className="text-2xl font-bold text-primary-600">{selected.weekly_points}</p>
                    </div>
                    <div className="card">
                      <p className="text-xs text-gray-400">Total Poin Keseluruhan</p>
                      <p className="text-2xl font-bold">{selected.lifetime_points}</p>
                    </div>
                    <div className="card col-span-2">
                      <p className="text-xs text-gray-400">Saldo Aktif</p>
                      <p className="text-xl font-bold text-amber-600">{selected.spendable_balance} poin</p>
                      <p className="text-xs text-gray-400 mt-1">Total poin − penukaran reward ({selected.reward_redeemed_total} poin)</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm mb-2">Evaluasi 5 Minggu</h3>
                    <WeeklyPointsChart data={selected.weekly_evaluations} />
                    <div className="space-y-2 mt-3">
                      {selected.weekly_evaluations.map((ev, i) => (
                        <div key={i} className="card flex justify-between items-center">
                          <div>
                            <p className="text-sm font-semibold">
                              Minggu {new Date(ev.week_start).toLocaleDateString('id-ID')}
                            </p>
                            <p className="text-xs text-gray-400">+{ev.points_earned} / −{ev.points_deducted}</p>
                          </div>
                          <p className={`text-lg font-bold ${ev.net_points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {ev.net_points >= 0 ? '+' : ''}{ev.net_points}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm mb-2">Riwayat 30 Hari</h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {selected.recent_transactions.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center">Belum ada transaksi</p>
                      ) : (
                        selected.recent_transactions.map((tx: Transaction) => (
                          <div key={tx.id} className="card flex justify-between items-center py-3">
                            <div>
                              <p className="text-sm font-semibold">{tx.description}</p>
                              <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('id-ID')}</p>
                            </div>
                            <span className={`font-bold ${tx.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {tx.points >= 0 ? '+' : ''}{tx.points}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}

              {tab === 'salary' && (
                <div className="space-y-3">
                  {selectedWeekly && selectedWeekly.weeks.length > 0 ? (
                    selectedWeekly.weeks.map((week, i) => (
                      <div key={i} className="card">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-sm">
                              Minggu {new Date(week.week_start).toLocaleDateString('id-ID')} – {new Date(week.week_end).toLocaleDateString('id-ID')}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Net {week.net_points} poin · Rate {formatRupiah(week.rupiah_per_point || 0)}/poin
                            </p>
                          </div>
                          <p className="text-lg font-bold text-emerald-700">
                            {formatRupiah(week.salary_rupiah || 0)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-8">
                      Slip gaji mingguan akan muncul setelah snapshot Senin pagi.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
