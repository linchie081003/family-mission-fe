import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { FamilyOverviewCalendarResponse, FamilyOverviewDay, CalendarDayPointEntry } from '../types'

const POINT_TYPE_LABELS: Record<string, string> = {
  punishment: 'Hukuman',
  achievement: 'Bonus',
  redemption: 'Penukaran',
  quiz: 'Quiz',
  adjustment: 'Penyesuaian',
  mission: 'Misi',
}

function pointTypeLabel(type: string) {
  return POINT_TYPE_LABELS[type] || type
}

function otherEntries(entries: CalendarDayPointEntry[] = []) {
  return entries.filter(e => e.type !== 'mission')
}

interface Props {
  loadCalendar: (month: string) => Promise<FamilyOverviewCalendarResponse>
}

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(month: string) {
  const [y, m] = month.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function FamilyOverviewCalendar({ loadCalendar }: Props) {
  const [month, setMonth] = useState(currentMonth)
  const [data, setData] = useState<FamilyOverviewCalendarResponse | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    loadCalendar(month)
      .then(res => {
        // #region agent log
        const sample = Object.entries(res.days || {}).flatMap(([dateKey, day]) =>
          (day.children || []).flatMap(child =>
            (child.missions || []).map(m => ({
              dateKey,
              child_id: child.child_id,
              mission_id: m.id,
              title: m.title,
              status: m.status,
              points: m.points,
            })),
          ),
        ).filter(m => m.points === 0)
        if (sample.length > 0) {
          fetch('http://127.0.0.1:7410/ingest/854632dd-cdea-49d3-96b1-81d13bd84cb6', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b984bf' },
            body: JSON.stringify({
              sessionId: 'b984bf',
              location: 'FamilyOverviewCalendar.tsx:loadCalendar',
              message: 'zero-point missions from API',
              data: { month, sample },
              hypothesisId: 'E',
              timestamp: Date.now(),
              runId: 'pre-fix',
            }),
          }).catch(() => {})
        }
        // #endregion
        setData(res)
      })
      .finally(() => setLoading(false))
  }, [month, loadCalendar])

  const [year, mon] = month.split('-').map(Number)
  const firstDay = new Date(year, mon - 1, 1).getDay()
  const daysInMonth = new Date(year, mon, 0).getDate()
  const blanks = (firstDay + 6) % 7

  const selectedDay: FamilyOverviewDay | null = selectedDate && data?.days[selectedDate]
    ? data.days[selectedDate]
    : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setMonth(m => shiftMonth(m, -1))} className="p-2 rounded-lg bg-gray-100">
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-bold capitalize">{monthLabel(month)}</h3>
        <button type="button" onClick={() => setMonth(m => shiftMonth(m, 1))} className="p-2 rounded-lg bg-gray-100">
          <ChevronRight size={18} />
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm py-6">Memuat kalender...</p>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: blanks }).map((_, i) => (
              <div key={`b-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1
              const key = `${month}-${String(dayNum).padStart(2, '0')}`
              const day = data?.days[key]
              const dots = (day?.family_agenda.length || 0) + (day?.children.length || 0)
              const active = selectedDate === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(key)}
                  className={`aspect-square rounded-lg text-sm font-semibold relative ${
                    active ? 'bg-primary-600 text-white' : dots ? 'bg-primary-50 text-primary-700' : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  {dayNum}
                  {dots > 0 && !active && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary-500" />
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}

      {selectedDay && (
        <div className="rounded-xl border border-gray-100 bg-white p-3 space-y-3 text-sm">
          <p className="font-bold">
            {selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          {selectedDay.family_agenda.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1">Agenda Keluarga</p>
              {selectedDay.family_agenda.map(a => (
                <p key={a.id} className="font-medium">📅 {a.title}</p>
              ))}
            </div>
          )}
          {selectedDay.children.map(childDay => (
            <div key={childDay.child_id} className="border-t pt-2">
              <p className="font-semibold flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: childDay.child_color }} />
                {childDay.child_name}
                {childDay.net_points !== 0 && (
                  <span className={`text-xs font-semibold ${childDay.net_points > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {childDay.net_points > 0 ? '+' : ''}{childDay.net_points} poin
                  </span>
                )}
              </p>
              {childDay.missions.map(m => (
                <p key={m.id} className="text-gray-600 ml-5">✓ {m.title} ({m.status === 'approved' ? '+' : ''}{m.points} poin)</p>
              ))}
              {otherEntries(childDay.point_entries).map(e => (
                <p key={e.id} className="text-gray-600 ml-5">
                  {e.points >= 0 ? '↑' : '↓'} {pointTypeLabel(e.type)}: {e.title} ({e.points >= 0 ? '+' : ''}{e.points})
                </p>
              ))}
              {childDay.agenda.map(a => (
                <p key={a.id} className="text-gray-600 ml-5">📌 {a.title}</p>
              ))}
            </div>
          ))}
          {selectedDay.family_agenda.length === 0 && selectedDay.children.length === 0 && (
            <p className="text-gray-400">Tidak ada aktivitas</p>
          )}
        </div>
      )}
    </div>
  )
}
