import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../../api'
import { AgendaItem, Child, Family } from '../../types'
import UnifiedCalendar from '../../components/UnifiedCalendar'
import FamilyOverviewCalendar from '../../components/FamilyOverviewCalendar'

export default function AgendaPage() {
  const [family, setFamily] = useState<Family | null>(null)
  const [items, setItems] = useState<AgendaItem[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [calendarMode, setCalendarMode] = useState<'overview' | number>('overview')
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [allDay, setAllDay] = useState(true)
  const [childId, setChildId] = useState<number | ''>('')
  const [description, setDescription] = useState('')
  const [reminderHours, setReminderHours] = useState<number | ''>('')

  const load = () => {
    api.getAgenda().then(setItems)
  }

  useEffect(() => {
    api.me().then(setFamily)
    load()
    api.getChildren().then(data => {
      setChildren(data)
      if (data.length > 0 && calendarMode === 'overview') {
        // keep overview as default
      }
    })
  }, [])

  if (family && !family.agenda_enabled) {
    return <Navigate to="/parent" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.createAgenda({
      title,
      description: description || undefined,
      event_date: eventDate,
      event_time: allDay ? undefined : eventTime || undefined,
      all_day: allDay,
      child_id: childId === '' ? undefined : Number(childId),
      reminder_hours_before: reminderHours === '' ? undefined : Number(reminderHours),
    })
    setTitle('')
    setDescription('')
    setEventDate('')
    setEventTime('')
    setChildId('')
    setReminderHours('')
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus agenda ini?')) return
    await api.deleteAgenda(id)
    load()
  }

  const loadChildCalendar = useCallback(
    (month: string) => {
      if (typeof calendarMode !== 'number') {
        return Promise.resolve({ month, child_id: 0, days: {} })
      }
      return api.getParentCalendar(calendarMode, month)
    },
    [calendarMode],
  )

  const loadOverviewCalendar = useCallback(
    (month: string) => api.getFamilyCalendarOverview(month),
    [],
  )

  const childName = (id?: number) => children.find(c => c.id === id)?.name

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">📅 Agenda & Kalender</h2>

      <form onSubmit={handleSubmit} className="card space-y-3">
        <h3 className="font-semibold text-sm">Tambah Agenda</h3>
        <input className="input" placeholder="Judul acara" value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea className="input min-h-[60px]" placeholder="Keterangan (opsional)" value={description} onChange={e => setDescription(e.target.value)} />
        <input className="input" type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)} />
          Sepanjang hari
        </label>
        {!allDay && (
          <input className="input" type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} />
        )}
        <select className="input" value={childId} onChange={e => setChildId(e.target.value === '' ? '' : Number(e.target.value))}>
          <option value="">Semua anak (agenda keluarga)</option>
          {children.map(c => (
            <option key={c.id} value={c.id}>{c.name} (pribadi)</option>
          ))}
        </select>
        <input
          className="input"
          type="number"
          placeholder="Pengingat (jam sebelum acara, opsional)"
          value={reminderHours}
          onChange={e => setReminderHours(e.target.value === '' ? '' : Number(e.target.value))}
          min={1}
          max={168}
        />
        <button type="submit" className="btn-primary w-full">Simpan Agenda</button>
      </form>

      <div className="space-y-2">
        <h3 className="font-semibold text-sm">Agenda Mendatang</h3>
        {items.length === 0 ? (
          <p className="text-gray-400 text-sm">Belum ada agenda</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="card flex justify-between items-start gap-2">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(item.event_date + 'T12:00:00').toLocaleDateString('id-ID')}
                    {item.event_time && !item.all_day ? ` · ${item.event_time}` : ''}
                    {item.child_id ? ` · ${childName(item.child_id)}` : ' · Semua anak'}
                  </p>
                  {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
                </div>
              </div>
              <button type="button" onClick={() => handleDelete(item.id)} className="text-red-500 text-xs font-semibold">Hapus</button>
            </div>
          ))
        )}
      </div>

      <div className="card space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCalendarMode('overview')}
            className={`shrink-0 px-3 py-2 rounded-xl text-sm font-semibold border ${
              calendarMode === 'overview' ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-gray-200'
            }`}
          >
            Semua Keluarga
          </button>
          {children.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCalendarMode(c.id)}
              className={`shrink-0 px-3 py-2 rounded-xl text-sm font-semibold border ${
                calendarMode === c.id ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-gray-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {calendarMode === 'overview' ? (
          <FamilyOverviewCalendar loadCalendar={loadOverviewCalendar} />
        ) : (
          <UnifiedCalendar loadCalendar={loadChildCalendar} />
        )}
      </div>
    </div>
  )
}
