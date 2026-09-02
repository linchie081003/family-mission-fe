import { RedemptionSummary } from '../types'

interface Props {
  redemptions: RedemptionSummary
  limit?: number
}

function redemptionLabel(r: RedemptionSummary['redemptions'][number]) {
  return r.type === 'cash' ? '💵 Tukar cash' : `🎁 ${r.reward_title || 'Reward'}`
}

function redemptionDate(r: RedemptionSummary['redemptions'][number]) {
  const raw = r.reviewed_at || r.created_at
  return new Date(raw).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ApprovedRedemptionList({ redemptions, limit }: Props) {
  const approved = redemptions.redemptions.filter(r => r.status === 'approved')
  const items = limit ? approved.slice(0, limit) : approved

  if (items.length === 0) {
    return <p className="text-sm text-gray-400">Belum ada penukaran reward yang disetujui</p>
  }

  return (
    <div className="space-y-2">
      {items.map(r => (
        <div key={r.id ?? `${r.created_at}-${r.points}`} className="flex justify-between items-start gap-2 text-sm">
          <div className="min-w-0">
            <p className="font-medium">{redemptionLabel(r)}</p>
            <p className="text-xs text-gray-400">{redemptionDate(r)}</p>
          </div>
          <span className="shrink-0 text-red-600 font-semibold">−{r.points}</span>
        </div>
      ))}
    </div>
  )
}
