import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, ClipboardCheck, Settings } from 'lucide-react'
import { api } from '../../api'
import { DashboardSummary, FamilyPointsSummary, LEVEL_ICONS } from '../../types'
import ChildAvatar from '../../components/ChildAvatar'
import { useWebSocket } from '../../hooks/useWebSocket'
import GradientOrbButton from '../../components/colorful/GradientOrbButton'
import GradientFeatureCard from '../../components/colorful/GradientFeatureCard'
import { useOutletContext } from 'react-router-dom'
import { Family } from '../../types'

export default function ParentDashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [pointsSummary, setPointsSummary] = useState<FamilyPointsSummary | null>(null)
  const [family, setFamily] = useState<{ family_code: string; family_name: string } | null>(null)
  const outlet = useOutletContext<{ family: Family | null } | undefined>()
  const familyFeatures = outlet?.family

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
    <div className="space-y-5">
      {family && (
        <p className="text-sm text-family-muted font-medium px-1">
          {family.family_name} · Kode <span className="font-extrabold text-doodle-skyDark tracking-widest">{family.family_code}</span>
        </p>
      )}

      <div className="flex justify-around gap-2 px-1">
        <GradientOrbButton
          to="/parent/pending"
          label="Pending"
          icon={ClipboardCheck}
          badge={data.pending_count}
        />
        <GradientOrbButton to="/parent/reports" label="Reports" icon={BarChart3} />
        <GradientOrbButton to="/parent/settings" label="Settings" icon={Settings} />
      </div>

      <div className="space-y-3">
        <GradientFeatureCard
          to="/parent/children"
          title="Kids Activity"
          subtitle="Play · Learn · Grow"
          art="kids"
          gradient="rose"
        />
        <GradientFeatureCard
          to="/parent/missions"
          title="Daily Missions"
          subtitle="Habit & responsibility"
          art="missions"
          gradient="purple"
        />
        <GradientFeatureCard
          to="/parent/pending"
          title="Approvals"
          subtitle="Review & celebrate"
          art="pending"
          gradient="green"
        />
        <GradientFeatureCard
          to="/parent/reports"
          title="Family Reports"
          subtitle="Points & progress"
          art="reports"
          gradient="amber"
        />
        {familyFeatures?.agenda_enabled && (
          <GradientFeatureCard
            to="/parent/agenda"
            title="Family Agenda"
            subtitle="Plan together"
            art="agenda"
            gradient="blue"
          />
        )}
        {familyFeatures?.quiz_enabled && (
          <GradientFeatureCard
            to="/parent/quizzes"
            title="Quiz Studio"
            subtitle="Fun learning"
            art="quiz"
            gradient="teal"
          />
        )}
        {familyFeatures?.chat_enabled && (
          <GradientFeatureCard
            to="/parent/chat"
            title="Family Chat"
            subtitle="Stay connected"
            art="chat"
            gradient="purple"
          />
        )}
        <GradientFeatureCard
          to="/parent/upgrade"
          title="Upgrade Plan"
          subtitle="Unlock more features"
          art="star"
          gradient="amber"
        />
      </div>

      {pointsSummary && (
        <div className="card space-y-3">
          <h3 className="font-bold text-sm text-family-ink">Ringkasan Poin</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-400">Saldo aktif</span><p className="font-bold">{pointsSummary.total_active_balance}</p></div>
            <div><span className="text-gray-400">Net minggu</span><p className="font-bold text-primary-600">{pointsSummary.total_weekly_net}</p></div>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-bold text-base mb-3 text-family-ink px-1">Ranking Minggu Ini</h2>
        <div className="space-y-2">
          {data.children_ranking.map(child => (
            <Link key={child.id} to={`/parent/children/${child.id}`} className="card flex items-center gap-3 hover:ring-2 hover:ring-doodle-sky/40">
              <span className="text-xl font-bold text-gray-300 w-8">#{child.rank}</span>
              <ChildAvatar name={child.name} color={child.color} avatarUrl={child.avatar_url} size="sm" className="w-10 h-10" />
              <div className="flex-1">
                <p className="font-bold">{child.name} {LEVEL_ICONS[child.level]}</p>
                <p className="text-xs text-gray-400">{child.weekly_points} poin minggu ini</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary-600">{child.active_balance}</p>
                <p className="text-xs text-gray-400">saldo</p>
              </div>
            </Link>
          ))}
          {data.children_ranking.length === 0 && (
            <p className="text-doodle-muted text-center py-4 font-semibold">Belum ada anak. <Link to="/parent/children" className="text-doodle-skyDark font-extrabold">Tambah anak →</Link></p>
          )}
        </div>
      </div>
    </div>
  )
}
