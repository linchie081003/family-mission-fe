import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarResponse, CalendarDayData } from '../types'

interface UnifiedCalendarProps {
  loadCalendar: (month: string) => Promise<CalendarResponse>
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
                  {hasMissions && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
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
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Misi</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Agenda</span>
      </div>

      {selectedDate && (
        <div className="card space-y-3">
          <h4 className="font-bold text-sm">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h4>

          {!selectedDay || (selectedDay.missions.length === 0 && selectedDay.agenda.length === 0) ? (
            <p className="text-sm text-gray-400">Tidak ada aktivitas</p>
          ) : (
            <>
              {selectedDay.missions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-green-700 mb-1">Misi</p>
                  {selectedDay.missions.map(m => (
                    <div key={m.id} className="flex justify-between text-sm py-1">
                      <span>{m.title}</span>
                      <span className="text-gray-500">
                        {m.status === 'approved' ? `+${m.points}` : m.status === 'pending' ? '⏳' : '✓'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {selectedDay.agenda.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-blue-700 mb-1">Agenda</p>
                  {selectedDay.agenda.map(a => (
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
              {selectedDay.net_points !== 0 && (
                <p className="text-sm font-bold pt-1 border-t">
                  Net poin: <span className={selectedDay.net_points >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {selectedDay.net_points >= 0 ? '+' : ''}{selectedDay.net_points}
                  </span>
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
