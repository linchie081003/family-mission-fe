import { Transaction } from '../types'
import { activityTypeIcon, activityTypeLabel } from '../utils/activityLabels'

interface Props {
  items: Transaction[]
  emptyMessage?: string
}

function formatDateKey(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export default function ActivityFeed({ items, emptyMessage = 'Belum ada aktivitas' }: Props) {
  if (items.length === 0) {
    return <p className="text-center text-gray-400 text-sm py-8">{emptyMessage}</p>
  }

  const grouped = items.reduce<Record<string, Transaction[]>>((acc, item) => {
    const key = item.created_at.slice(0, 10)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-4">
      {dates.map(dateKey => (
        <div key={dateKey}>
          <p className="text-xs font-semibold text-gray-400 mb-2 sticky top-0 bg-gray-50 py-1">
            {formatDateKey(grouped[dateKey][0].created_at)}
          </p>
          <div className="space-y-2">
            {grouped[dateKey].map(item => (
              <div key={item.id} className="card flex justify-between items-start gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                    {activityTypeIcon(item.transaction_type)} {activityTypeLabel(item.transaction_type)}
                  </p>
                  <p className="text-sm font-semibold mt-0.5">{item.description}</p>
                  <p className="text-xs text-gray-400">{formatTime(item.created_at)}</p>
                </div>
                <span className={`shrink-0 font-bold text-sm ${item.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.points >= 0 ? '+' : ''}{item.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
