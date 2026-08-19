import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../../api'
import { QuizTemplate, QuizTemplateDetail } from '../../types'
import QuizEditorForm, { EMPTY_QUIZ_EDITOR, detailToEditor } from '../../components/QuizEditorForm'

export default function PlatformTemplatesPage() {
  const [templates, setTemplates] = useState<QuizTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<'new' | number | null>(null)
  const [editorInitial, setEditorInitial] = useState(EMPTY_QUIZ_EDITOR)

  const load = () => {
    setLoading(true)
    api.platformQuizTemplates()
      .then(setTemplates)
      .catch(err => setError(err instanceof Error ? err.message : 'Gagal memuat'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditorInitial(EMPTY_QUIZ_EDITOR)
    setEditing('new')
  }

  const openEdit = async (id: number) => {
    setError('')
    try {
      const detail: QuizTemplateDetail = await api.platformQuizTemplate(id)
      setEditorInitial(detailToEditor(detail))
      setEditing(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat template')
    }
  }

  const toggle = async (template: QuizTemplate) => {
    setSavingId(template.id)
    setError('')
    try {
      const next = !(template.is_active ?? true)
      await api.platformToggleQuizTemplate(template.id, next)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSavingId(null)
    }
  }

  const remove = async (template: QuizTemplate) => {
    if (!confirm(`Hapus/nonaktifkan template "${template.title}"?`)) return
    setSavingId(template.id)
    setError('')
    try {
      const res = await api.platformDeleteQuizTemplate(template.id)
      alert(res.message)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus')
    } finally {
      setSavingId(null)
    }
  }

  const handleSave = async (data: typeof EMPTY_QUIZ_EDITOR) => {
    if (editing === 'new') {
      await api.platformCreateQuizTemplate(data)
    } else if (typeof editing === 'number') {
      await api.platformUpdateQuizTemplate(editing, data)
    }
    setEditing(null)
    load()
  }

  if (loading && !editing) {
    return <div className="text-center py-12 text-gray-400">Memuat template...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Bank Template Quiz</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola template platform untuk di-clone keluarga</p>
        </div>
        {!editing && (
          <button type="button" onClick={openCreate} className="btn-primary py-2 px-3 text-sm flex items-center gap-1">
            <Plus size={16} /> Tambah
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {editing !== null ? (
        <QuizEditorForm
          mode="template"
          initial={editorInitial}
          onSubmit={handleSave}
          onCancel={() => setEditing(null)}
          submitLabel={editing === 'new' ? 'Buat Template' : 'Simpan Perubahan'}
        />
      ) : (
        <div className="space-y-2">
          {templates.map(t => {
            const active = t.is_active ?? true
            return (
              <div key={t.id} className="card flex justify-between items-center gap-3">
                <div>
                  <p className="font-semibold">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.subject} · {t.grade_level}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => openEdit(t.id)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={savingId === t.id}
                    onClick={() => toggle(t)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {active ? 'Aktif' : 'Off'}
                  </button>
                  <button type="button" onClick={() => remove(t)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
