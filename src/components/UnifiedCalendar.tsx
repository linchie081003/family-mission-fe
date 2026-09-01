import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarDayPointEntry, CalendarResponse, CalendarDayData } from '../types'

interface UnifiedCalendarProps {
  loadCalendar: (month: string) => Promise<CalendarResponse>
}

const POINT_TYPE_LABELS: Record<string, string> = {
  punishment: 'Hukuman',
  achievement: 'Bonus pencapaian',
  redemption: 'Penukaran',
  quiz: 'Quiz',
  adjustment: 'Penyesuaian',
  mission: 'Misi disetujui',
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

function pointTypeLabel(type: string) {
  return POINT_TYPE_LABELS[type] || type
}

function summarizePoints(entries: CalendarDayPointEntry[]) {
  const totalIn = entries.filter(e => e.points > 0).reduce((s, e) => s + e.points, 0)
  const totalOut = entries.filter(e => e.points < 0).reduce((s, e) => s + e.points, 0)
  return { totalIn, totalOut, net: totalIn + totalOut }
}

function DayDetail({ day }: { day: CalendarDayData }) {
  const entries = day.point_entries ?? []
  const otherEntries = entries.filter(e => e.type !== 'mission')
  const creditOther = otherEntries.filter(e => e.points > 0)
  const debitOther = otherEntries.filter(e => e.points < 0)
  const approvedMissionTotal = day.missions
    .filter(m => m.status === 'approved')
    .reduce((s, m) => s + m.points, 0)
  const otherNet = otherEntries.reduce((s, e) => s + e.points, 0)
  const unexplainedDelta = day.net_points - approvedMissionTotal - otherNet
  const { totalIn, totalOut, net } = summarizePoints(entries)
  const hasActivity = day.missions.length > 0 || day.agenda.length > 0 || entries.length > 0 || day.net_points !== 0

  if (!hasActivity) {
    return <p className="text-sm text-gray-400">Tidak ada aktivitas</p>
  }

  return (
    <>
      {day.missions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-green-700 mb-1">Misi</p>
          {day.missions.map(m => (
            <div key={m.id} className="flex justify-between text-sm py-1">
              <span>{m.title}</span>
              <span className="text-gray-500">
                {m.status === 'approved' ? `+${m.points}` : m.status === 'pending' ? '⏳ menunggu' : '✓'}
              </span>
            </div>
          ))}
          <p className="text-[10px] text-gray-400 mt-1">
            Poin misi di bawah = status penyelesaian. Poin masuk rekening setelah disetujui orang tua.
          </p>
        </div>
      )}

      {creditOther.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-green-700 mb-1">Poin masuk lainnya</p>
          {creditOther.map(e => (
            <div key={e.id} className="flex justify-between text-sm py-1 gap-2">
              <span className="min-w-0">
                <span className="text-[10px] uppercase text-gray-400 block">{pointTypeLabel(e.type)}</span>
                {e.title}
              </span>
              <span className="shrink-0 font-semibold text-green-600">+{e.points}</span>
            </div>
          ))}
        </div>
      )}

      {debitOther.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red-700 mb-1">Poin keluar / pengurangan</p>
          {debitOther.map(e => (
            <div key={e.id} className="flex justify-between text-sm py-1 gap-2">
              <span className="min-w-0">
                <span className="text-[10px] uppercase text-gray-400 block">{pointTypeLabel(e.type)}</span>
                {e.title}
              </span>
              <span className="shrink-0 font-semibold text-red-600">{e.points}</span>
            </div>
          ))}
        </div>
      )}

      {day.net_points !== 0 && (
        <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-sm space-y-1">
          <p className="font-semibold text-gray-800">Rincian net poin {day.net_points >= 0 ? '+' : ''}{day.net_points}</p>
          {approvedMissionTotal !== 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Misi disetujui</span>
              <span className="text-green-600 font-semibold">+{approvedMissionTotal}</span>
            </div>
          )}
          {otherNet !== 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Quiz, penukaran, hukuman, dll.</span>
              <span className={`font-semibold ${otherNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {otherNet >= 0 ? '+' : ''}{otherNet}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-1 border-t border-dashed">
            <span>Net poin</span>
            <span className={day.net_points >= 0 ? 'text-green-600' : 'text-red-600'}>
              {day.net_points >= 0 ? '+' : ''}{day.net_points}
            </span>
          </div>
        </div>
      )}

      {otherEntries.length === 0 && unexplainedDelta !== 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-sm">
          <p className="font-semibold text-amber-900 mb-1">Ada selisih poin yang belum terdeteksi</p>
          <p className="text-amber-800">
            Selisih <strong>{unexplainedDelta >= 0 ? '+' : ''}{unexplainedDelta}</strong> poin — cek riwayat poin di tab 30 Hari.
          </p>
        </div>
      )}

      {day.agenda.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-blue-700 mb-1">Agenda</p>
          {day.agenda.map(a => (
            <div key={a.id} className="flex items-start gap-2 text-sm py-1">
              <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: a.color }} />
              <div>
                <p className="font-semibold">{a.title}</p>
                {a.time && !a.all_day && <p className="text-xs text-gray-400">{a.time}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {entries.length > 0 && (
        <div className="text-sm pt-2 border-t space-y-1">
          <div className="flex justify-between text-gray-600">
            <span>Total semua poin masuk (transaksi)</span>
            <span className="text-green-600 font-semibold">+{totalIn}</span>
          </div>
          {totalOut < 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Total semua poin keluar (transaksi)</span>
              <span className="text-red-600 font-semibold">{totalOut}</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-1 border-t border-dashed">
            <span>Net dari transaksi</span>
            <span className={net >= 0 ? 'text-green-600' : 'text-red-600'}>
              {net >= 0 ? '+' : ''}{net}
            </span>
          </div>
        </div>
      )}
    </>
  )
}

export default function UnifiedCalendar({ loadCalendar }: UnifiedCalendarProps) {
  const [month, setMonth] = useState(currentMonth)
  const [data, setData] = useState<CalendarResponse | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    loadCalendar(month)
      .then(setData)
      .finally(() => setLoading(false))
  }, [month, loadCalendar])

  const [year, mon] = month.split('-').map(Number)
  const firstDay = new Date(year, mon - 1, 1).getDay()
  const daysInMonth = new Date(year, mon, 0).getDate()
  const blanks = (firstDay + 6) % 7

  const selectedDay: CalendarDayData | null = selectedDate && data?.days[selectedDate]
    ? data.days[selectedDate]
    : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setMonth(m => shiftMonth(m, -1))} className="p-2 rounded-lg bg-gray-100">
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-bold capitalize">{monthLabel(month)}</h3>
        <button onClick={() => setMonth(m => shiftMonth(m, 1))} className="p-2 rounded-lg bg-gray-100">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400">
        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-8">Memuat kalender...</p>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: blanks }).map((_, i) => (
            <div key={`b-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1
            const dateKey = `${month}-${String(dayNum).padStart(2, '0')}`
            const dayData = data?.days[dateKey]
            const hasMissions = (dayData?.missions.length || 0) > 0
            const hasAgenda = (dayData?.agenda.length || 0) > 0
            const hasPointActivity = (dayData?.point_entries?.length || 0) > 0 || (dayData?.net_points || 0) !== 0
            const isToday = dateKey === new Date().toISOString().slice(0, 10)
            const isSelected = selectedDate === dateKey

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(dateKey)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative border ${
                  isSelected ? 'border-primary-500 bg-primary-50' :
                  isToday ? 'border-primary-300 bg-primary-50/50' : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <span className="font-semibold">{dayNum}</span>
                <div className="flex gap-0.5 mt-0.5">
                  {(hasMissions || hasPointActivity) && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                  {hasAgenda && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </div>
                {dayData && dayData.net_points !== 0 && (
                  <span className={`text-[9px] font-bold ${dayData.net_points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {dayData.net_points > 0 ? '+' : ''}{dayData.net_points}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Misi / Poin</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Agenda</span>
      </div>

      {selectedDate && (
        <div className="card space-y-3">
          <h4 className="font-bold text-sm">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h4>
          {selectedDay ? <DayDetail day={selectedDay} /> : <p className="text-sm text-gray-400">Tidak ada aktivitas</p>}
        </div>
      )}
    </div>
  )
}
