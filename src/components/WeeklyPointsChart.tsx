import { WeeklyPointsReport } from '../types'

interface Props {
  data: WeeklyPointsReport[]
  showSalary?: boolean
}

export default function WeeklyPointsChart({ data, showSalary = false }: Props) {
  if (data.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-4">Belum ada data mingguan</p>
  }

  const ordered = [...data].reverse()
  const maxAbs = Math.max(...ordered.map(d => Math.abs(d.net_points)), 1)

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2 h-36 px-1">
        {ordered.map((week, i) => {
          const height = Math.max(8, (Math.abs(week.net_points) / maxAbs) * 100)
          const positive = week.net_points >= 0
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className={`text-[10px] font-bold ${positive ? 'text-green-600' : 'text-red-500'}`}>
                {positive ? '+' : ''}{week.net_points}
              </span>
              <div className="w-full flex items-end justify-center h-24">
                <div
                  className={`w-full max-w-[2.5rem] rounded-t-lg transition-all ${
                    positive ? 'bg-gradient-to-t from-emerald-500 to-emerald-300' : 'bg-gradient-to-t from-rose-500 to-rose-300'
                  }`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-[9px] text-gray-400 text-center leading-tight">
                {new Date(week.week_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          )
        })}
      </div>

      {showSalary && (
        <div className="space-y-1">
          {ordered.map((week, i) => {
            const salary = (week as WeeklyPointsReport & { salary_rupiah?: number }).salary_rupiah
            if (salary == null) return null
            return (
              <div key={i} className="flex justify-between text-xs text-gray-500 px-1">
                <span>Minggu {new Date(week.week_start).toLocaleDateString('id-ID')}</span>
                <span className="font-semibold text-slate-700">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(salary)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
