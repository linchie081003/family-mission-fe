import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../api'
import { Child, Family, Mission, Punishment, Transaction, LEVEL_ICONS, WeeklyPointsReport, PointsSummary, RedemptionSummary } from '../../types'
import WeeklyPointsChart from '../../components/WeeklyPointsChart'
import UnifiedCalendar from '../../components/UnifiedCalendar'
import ActivityFeed from '../../components/ActivityFeed'
import ApprovedRedemptionList from '../../components/ApprovedRedemptionList'
import ChildAvatar from '../../components/ChildAvatar'
import ProofImagePicker from '../../components/ProofImagePicker'

interface ChildDetail {
  child: Child
  weekly_points: number
  weekly_evaluations: WeeklyPointsReport[]
  badges: { icon: string; name: string; description: string; earned_at?: string }[]
  recent_transactions: Transaction[]
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function ChildDetailPage() {
  const { id } = useParams()
  const childId = Number(id)
  const [tab, setTab] = useState<'summary' | 'calendar' | 'history' | 'evaluation' | 'badges'>('summary')
  const [detail, setDetail] = useState<ChildDetail | null>(null)
  const [pointsSummary, setPointsSummary] = useState<PointsSummary | null>(null)
  const [redemptions, setRedemptions] = useState<RedemptionSummary | null>(null)
  const [missions, setMissions] = useState<Mission[]>([])
  const [punishments, setPunishments] = useState<Punishment[]>([])
  const [showAchievement, setShowAchievement] = useState(false)
  const [showPunishment, setShowPunishment] = useState(false)
  const [showMission, setShowMission] = useState(false)
  const [achTitle, setAchTitle] = useState('')
  const [achPoints, setAchPoints] = useState(5)
  const [punTitle, setPunTitle] = useState('')
  const [punPoints, setPunPoints] = useState(5)
  const [missionId, setMissionId] = useState<number | ''>('')
  const [missionDate, setMissionDate] = useState(todayIso())
  const [missionNote, setMissionNote] = useState('')
  const [missionProof, setMissionProof] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [family, setFamily] = useState<Family | null>(null)

  const load = () => {
    api.getChildDetail(childId).then(d => {
      setDetail(d as ChildDetail)
      setDisplayName((d as ChildDetail).child.display_name || '')
    })
    api.getChildPointsSummary(childId).then(setPointsSummary).catch(() => setPointsSummary(null))
    api.getChildRedemptions(childId).then(setRedemptions).catch(() => setRedemptions(null))
    api.getPunishments().then(setPunishments)
    api.getMissions().then(list => setMissions(list.filter(m => m.is_active && m.category !== 'additional')))
  }
  useEffect(() => { load() }, [id])
  useEffect(() => { api.me().then(setFamily).catch(() => setFamily(null)) }, [])

  const agendaEnabled = Boolean(family?.agenda_enabled)
  const rewardsEnabled = Boolean(family?.rewards_enabled)

  const handleAchievement = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.recordAchievement(childId, { title: achTitle, points: achPoints })
    setShowAchievement(false)
    setAchTitle('')
    load()
  }

  const handlePunishment = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.recordPunishment(childId, { title: punTitle, points_deducted: punPoints })
    setShowPunishment(false)
    setPunTitle('')
    load()
  }

  const handleRecordMission = async (e: React.FormEvent) => {
    e.preventDefault()
    if (missionId === '') return
    try {
      const res = await api.recordMissionForChild(childId, {
        mission_id: Number(missionId),
        completed_date: missionDate,
        note: missionNote || undefined,
        proof_image: missionProof || undefined,
      })
      alert(`Misi dicatat (+${res.points_awarded} poin) · ${res.completed_date}`)
      setShowMission(false)
      setMissionId('')
      setMissionDate(todayIso())
      setMissionNote('')
      setMissionProof(null)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal mencatat misi')
    }
  }

  const handleResetPin = async () => {
    if (confirm('Reset PIN anak? Anak harus buat PIN baru.')) {
      await api.resetPin(childId)
      alert('PIN berhasil direset')
    }
  }

  const loadCalendar = useCallback(
    (month: string) => api.getParentCalendar(childId, month),
    [childId],
  )

  if (!detail) return <div className="text-center py-8 text-gray-400">Loading...</div>
  const { child } = detail
  const selectedMission = missions.find(m => m.id === missionId)

  const tabs = [
    { key: 'summary' as const, label: 'Ringkasan' },
    { key: 'calendar' as const, label: agendaEnabled ? 'Kalender' : 'Aktivitas' },
    { key: 'history' as const, label: 'Riwayat 30hr' },
    { key: 'evaluation' as const, label: 'Evaluasi 5 mgg' },
    { key: 'badges' as const, label: 'Badge' },
  ]

  return (
    <div className="space-y-4">
      <div className="card flex items-center gap-4">
        <ChildAvatar name={child.name} color={child.color} avatarUrl={child.avatar_url} size="lg" />
        <div>
          <h2 className="text-xl font-bold">{child.display_name || child.name} {LEVEL_ICONS[child.level]}</h2>
          <p className="text-xs text-gray-400">Nama akun: {child.name}</p>
          <div className="flex gap-2 mt-2">
            <input
              className="input text-sm flex-1"
              placeholder="Nama tampilan chat"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={100}
            />
            <button
              type="button"
              className="btn-secondary text-xs px-3"
              onClick={() => api.updateChild(childId, { display_name: displayName.trim() || null }).then(() => load())}
            >
              Simpan
            </button>
          </div>
          <p className="text-sm text-gray-400">
            Saldo aktif: {child.spendable_balance} · Total: {child.lifetime_points} · 🔥{child.current_streak}
          </p>
          <p className="text-sm text-primary-600">Poin minggu: {detail.weekly_points}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setShowMission(true)} className="btn bg-primary-100 text-primary-800 py-3 text-sm col-span-2">
          📋 Catat Misi (Backdate)
        </button>
        <button onClick={() => setShowAchievement(true)} className="btn bg-yellow-100 text-yellow-800 py-3 text-sm">🌟 Catat Pencapaian</button>
        <button onClick={() => setShowPunishment(true)} className="btn bg-red-100 text-red-800 py-3 text-sm">⚠️ Catat Punishment</button>
        <button onClick={handleResetPin} className="btn-secondary col-span-2 py-2 text-sm">Reset PIN</button>
      </div>

      {showMission && (
        <form onSubmit={handleRecordMission} className="card space-y-3 border-primary-200 bg-primary-50">
          <h3 className="font-bold">📋 Catat Misi Anak</h3>
          <p className="text-xs text-gray-500">Backdate jika anak lupa input — langsung aktif tanpa menunggu approval.</p>
          <select
            className="input"
            value={missionId}
            onChange={e => setMissionId(e.target.value === '' ? '' : Number(e.target.value))}
            required
          >
            <option value="">Pilih misi...</option>
            {missions.map(m => (
              <option key={m.id} value={m.id}>
                {m.title}{m.category !== 'ibadah' ? ` (+${m.points} poin)` : ''}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="date"
            value={missionDate}
            max={todayIso()}
            onChange={e => setMissionDate(e.target.value)}
            required
          />
          <input
            className="input"
            placeholder="Catatan orang tua (opsional)"
            value={missionNote}
            onChange={e => setMissionNote(e.target.value)}
          />
          <ProofImagePicker
            preview={missionProof}
            onChange={setMissionProof}
            onError={msg => alert(msg)}
            label="Foto bukti"
            optional
            parentEntry
          />
          {selectedMission && selectedMission.category !== 'ibadah' && (
            <p className="text-sm text-primary-700">+{selectedMission.points} poin (batas harian tetap berlaku)</p>
          )}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">Simpan Misi</button>
            <button type="button" onClick={() => setShowMission(false)} className="btn-secondary">Batal</button>
          </div>
        </form>
      )}

      {showAchievement && (
        <form onSubmit={handleAchievement} className="card space-y-3 border-yellow-200 bg-yellow-50">
          <h3 className="font-bold">🌟 Catat Pencapaian Spontan</h3>
          <input className="input" placeholder="Contoh: Bantu adik tanpa diminta" value={achTitle} onChange={e => setAchTitle(e.target.value)} required />
          <input className="input" type="number" placeholder="Poin" value={achPoints} onChange={e => setAchPoints(Number(e.target.value))} />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">Catat (+{achPoints} poin)</button>
            <button type="button" onClick={() => setShowAchievement(false)} className="btn-secondary">Batal</button>
          </div>
        </form>
      )}

      {showPunishment && (
        <form onSubmit={handlePunishment} className="card space-y-3 border-red-200 bg-red-50">
          <h3 className="font-bold">⚠️ Catat Punishment</h3>
          <select className="input" onChange={e => {
            const p = punishments.find(x => x.id === Number(e.target.value))
            if (p) { setPunTitle(p.title); setPunPoints(p.points_deducted) }
          }}>
            <option value="">Pilih atau tulis sendiri</option>
            {punishments.map(p => <option key={p.id} value={p.id}>{p.title} (-{p.points_deducted})</option>)}
          </select>
          <input className="input" placeholder="Judul" value={punTitle} onChange={e => setPunTitle(e.target.value)} required />
          <input className="input" type="number" placeholder="Poin dikurangi" value={punPoints} onChange={e => setPunPoints(Number(e.target.value))} />
          <div className="flex gap-2">
            <button type="submit" className="btn-danger flex-1">Catat (-{punPoints} poin)</button>
            <button type="button" onClick={() => setShowPunishment(false)} className="btn-secondary">Batal</button>
          </div>
        </form>
      )}

      <div className="flex gap-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap ${tab === t.key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'summary' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="card"><p className="text-xs text-gray-400">Poin Minggu</p><p className="text-xl font-bold">{detail.weekly_points}</p></div>
            <div className="card"><p className="text-xs text-gray-400">Total Poin</p><p className="text-xl font-bold">{child.lifetime_points}</p></div>
            <div className="card"><p className="text-xs text-gray-400">Saldo Aktif</p><p className="text-xl font-bold text-primary-600">{child.spendable_balance}</p></div>
            <div className="card"><p className="text-xs text-gray-400">Penukaran Reward</p><p className="text-xl font-bold text-red-600">{child.reward_redeemed_total}</p></div>
          </div>

          {pointsSummary && (
            <div className="card space-y-2">
              <h3 className="font-semibold text-sm">Breakdown Poin</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-400">Earned minggu</span><p className="font-bold text-green-600">+{pointsSummary.weekly_earned}</p></div>
                <div><span className="text-gray-400">Deducted minggu</span><p className="font-bold text-red-600">−{pointsSummary.weekly_deducted}</p></div>
                <div><span className="text-gray-400">Reward ditukar</span><p className="font-bold">{pointsSummary.reward_redeemed_total} poin</p></div>
                <div><span className="text-gray-400">Cash ditukar</span><p className="font-bold">{pointsSummary.cash_redeemed_total} poin</p></div>
              </div>
            </div>
          )}

          {rewardsEnabled && redemptions && (
            <div className="card space-y-2">
              <h3 className="font-semibold text-sm">Riwayat Penukaran Reward</h3>
              <p className="text-xs text-gray-400">
                Total {redemptions.total_redeemed} poin · Reward {redemptions.total_reward_points} · Cash {redemptions.total_cash_points}
              </p>
              <ApprovedRedemptionList redemptions={redemptions} limit={10} />
            </div>
          )}
        </div>
      )}

      {tab === 'calendar' && (
        agendaEnabled ? (
          <UnifiedCalendar loadCalendar={loadCalendar} />
        ) : (
          <ActivityFeed items={detail.recent_transactions} />
        )
      )}

      {tab === 'history' && (
        <div className="space-y-2">
          {detail.recent_transactions.map(tx => (
            <div key={tx.id} className="card flex justify-between items-center py-3">
              <div>
                <p className="text-sm font-semibold">{tx.description}</p>
                <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('id-ID')}</p>
              </div>
              <span className={`font-bold ${tx.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tx.points >= 0 ? '+' : ''}{tx.points}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'evaluation' && (
        <div className="space-y-3">
          <WeeklyPointsChart data={detail.weekly_evaluations} />
          <div className="space-y-2">
            {detail.weekly_evaluations.map((ev, i) => (
            <div key={i} className="card flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold">Minggu {new Date(ev.week_start).toLocaleDateString('id-ID')}</p>
                <p className="text-xs text-gray-400">+{ev.points_earned} / −{ev.points_deducted}</p>
              </div>
              <p className={`text-lg font-bold ${ev.net_points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {ev.net_points >= 0 ? '+' : ''}{ev.net_points} poin
              </p>
            </div>
          ))}
          {detail.weekly_evaluations.length === 0 && <p className="text-gray-400 text-center">Belum ada evaluasi</p>}
          </div>
        </div>
      )}

      {tab === 'badges' && (
        <div className="grid grid-cols-2 gap-3">
          {detail.badges.map((b, i) => (
            <div key={i} className="card text-center">
              <div className="text-3xl mb-1">{b.icon}</div>
              <p className="font-bold text-sm">{b.name}</p>
              <p className="text-xs text-gray-400">{b.description}</p>
            </div>
          ))}
          {detail.badges.length === 0 && <p className="col-span-2 text-gray-400 text-center">Belum ada badge</p>}
        </div>
      )}
    </div>
  )
}
