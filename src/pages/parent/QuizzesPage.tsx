import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../../api'
import { Child, FamilyQuiz, QuizAttemptSummary, QuizEditorPayload, QuizTemplate } from '../../types'
import QuizEditorForm, { EMPTY_QUIZ_EDITOR, detailToEditor } from '../../components/QuizEditorForm'

function toFamilyQuizPayload(data: QuizEditorPayload) {
  const pointsReward = Number(data.points_reward)
  const passingScore = Number(data.passing_score)
  return {
    subject: data.subject,
    title: data.title,
    sub_material: data.sub_material ?? null,
    points_reward: Number.isFinite(pointsReward) && pointsReward >= 1 ? pointsReward : 10,
    passing_score: Number.isFinite(passingScore) && passingScore >= 50 && passingScore <= 100 ? passingScore : 70,
    questions_per_attempt: data.questions_per_attempt ?? null,
    target_all_children: data.target_all_children ?? true,
    assigned_child_ids: data.target_all_children ? [] : (data.assigned_child_ids ?? []),
    questions: data.questions,
  }
}

export default function QuizzesPage() {
  const [tab, setTab] = useState<'templates' | 'mine' | 'history'>('templates')
  const [templates, setTemplates] = useState<QuizTemplate[]>([])
  const [quizzes, setQuizzes] = useState<FamilyQuiz[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [attempts, setAttempts] = useState<QuizAttemptSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cloning, setCloning] = useState<number | null>(null)
  const [editing, setEditing] = useState<'new' | number | null>(null)
  const [editorInitial, setEditorInitial] = useState(EMPTY_QUIZ_EDITOR)
  const [clonePoints, setClonePoints] = useState(10)
  const [clonePassingScore, setClonePassingScore] = useState(90)

  const load = () => {
    setLoading(true)
    Promise.all([api.getQuizTemplates(), api.getFamilyQuizzes(), api.getQuizAttempts()])
      .then(([t, q, a]) => {
        setTemplates(t)
        setQuizzes(q)
        setAttempts(a)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Gagal memuat'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])
  useEffect(() => { api.getChildren().then(setChildren).catch(() => {}) }, [])

  const handleCloneAndEdit = async (templateId: number) => {
    setCloning(templateId)
    setError('')
    try {
      const res = await api.cloneQuizTemplate(templateId, {
        points_reward: clonePoints,
        passing_score: clonePassingScore,
      })
      const detail = await api.getFamilyQuiz(res.id)
      setEditorInitial(detailToEditor(detail))
      setEditing(res.id)
      setTab('mine')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambahkan quiz')
    } finally {
      setCloning(null)
    }
  }

  const openCreate = () => {
    setEditorInitial(EMPTY_QUIZ_EDITOR)
    setEditing('new')
    setTab('mine')
  }

  const openEdit = async (id: number) => {
    setError('')
    try {
      const detail = await api.getFamilyQuiz(id)
      setEditorInitial(detailToEditor(detail))
      setEditing(id)
      setTab('mine')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat quiz')
    }
  }

  const handleSave = async (data: QuizEditorPayload) => {
    const payload = toFamilyQuizPayload(data)
    if (editing === 'new') {
      await api.createFamilyQuiz(payload)
    } else if (typeof editing === 'number') {
      await api.updateFamilyQuiz(editing, payload)
    }
    setEditing(null)
    load()
  }

  const deactivate = async (quiz: FamilyQuiz) => {
    if (!confirm(`Nonaktifkan quiz "${quiz.title}"?`)) return
    try {
      await api.deleteFamilyQuiz(quiz.id)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menonaktifkan')
    }
  }

  const reactivate = async (quiz: FamilyQuiz) => {
    try {
      await api.setFamilyQuizActive(quiz.id, true)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengaktifkan')
    }
  }

  if (loading && editing === null) {
    return <div className="text-center py-8 text-gray-400">Memuat quiz...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">Quiz Pelajaran</h2>
          <p className="text-sm text-gray-500">Gunakan template atau buat quiz sendiri untuk anak</p>
        </div>
        {tab === 'mine' && editing === null && (
          <button type="button" onClick={openCreate} className="btn-primary py-2 px-3 text-sm flex items-center gap-1">
            <Plus size={16} /> Buat Baru
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-1">
        {(['templates', 'mine', 'history'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setEditing(null) }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold ${
              tab === t ? 'bg-primary-600 text-white' : 'bg-gray-100'
            }`}
          >
            {t === 'templates' ? 'Template' : t === 'mine' ? 'Quiz Saya' : 'Riwayat'}
          </button>
        ))}
      </div>

      {editing !== null && tab === 'mine' && (
        <QuizEditorForm
          key={editing === 'new' ? 'new' : editing}
          mode="family"
          initial={editorInitial}
          childrenOptions={children}
          onSubmit={handleSave}
          onCancel={() => setEditing(null)}
          submitLabel={editing === 'new' ? 'Buat Quiz' : 'Simpan Quiz'}
        />
      )}

      {editing === null && tab === 'templates' && (
        <div className="space-y-2">
          <div className="card grid grid-cols-2 gap-2 bg-primary-50/40 border-primary-100">
            <label className="space-y-1">
              <span className="text-xs font-semibold text-gray-600">Poin per quiz (saat clone)</span>
              <input
                className="input"
                type="number"
                min={1}
                value={clonePoints}
                onChange={e => setClonePoints(Number(e.target.value) || 1)}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-gray-600">Minimal benar untuk poin (%)</span>
              <input
                className="input"
                type="number"
                min={50}
                max={100}
                value={clonePassingScore}
                onChange={e => setClonePassingScore(Number(e.target.value) || 50)}
              />
            </label>
          </div>
          {templates.map(t => (
            <div key={t.id} className="card flex justify-between items-center gap-3">
              <div>
                <p className="font-semibold">{t.title}</p>
                <p className="text-xs text-gray-400">{t.subject} · {t.grade_level}</p>
              </div>
              <button
                type="button"
                disabled={cloning === t.id}
                onClick={() => handleCloneAndEdit(t.id)}
                className="btn-primary py-1.5 px-3 text-sm shrink-0"
              >
                {cloning === t.id ? '...' : 'Gunakan & Edit'}
              </button>
            </div>
          ))}
          {templates.length === 0 && <p className="text-center text-gray-400 py-6">Belum ada template</p>}
        </div>
      )}

      {editing === null && tab === 'mine' && (
        <div className="space-y-2">
          {quizzes.map(q => (
            <div key={q.id} className={`card ${!q.is_active ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold">{q.title}</p>
                  <p className="text-xs text-gray-400">
                    {q.subject}
                    {q.sub_material ? ` · ${q.sub_material}` : ''}
                  </p>
                  <p className="text-sm text-primary-600 mt-1">
                    +{q.points_reward} poin jika benar ≥ {q.passing_score}%
                    {q.question_pool_size ? ` · Bank ${q.question_pool_size} soal` : ''}
                    {q.questions_per_attempt ? ` · Tampil ${q.questions_per_attempt}` : ''}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {q.target_all_children ? 'Semua anak' : `Anak tertentu (${q.assigned_child_ids?.length || 0})`}
                  </p>
                  {!q.is_active && <span className="text-xs text-red-500 font-semibold">Nonaktif</span>}
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => openEdit(q.id)} className="p-2 text-primary-600">
                    <Pencil size={16} />
                  </button>
                  {q.is_active ? (
                    <button type="button" onClick={() => deactivate(q)} className="p-2 text-red-500">
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <button type="button" onClick={() => reactivate(q)} className="text-xs font-semibold text-emerald-600 px-2">
                      Aktifkan
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {quizzes.length === 0 && (
            <p className="text-center text-gray-400 py-6">Belum ada quiz. Clone template atau buat baru.</p>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-2">
          {attempts.map(a => (
            <div key={a.id} className="card flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">{a.child_name}</p>
                <p className="text-xs text-gray-400">{a.quiz_title}</p>
                <p className="text-xs text-gray-400">{new Date(a.completed_at).toLocaleString('id-ID')}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold ${a.passed ? 'text-green-600' : 'text-red-500'}`}>
                  {a.score}% {a.passed ? '✓' : '✗'}
                </p>
                {a.points_awarded > 0 && (
                  <p className="text-xs text-primary-600">+{a.points_awarded} poin</p>
                )}
              </div>
            </div>
          ))}
          {attempts.length === 0 && <p className="text-center text-gray-400 py-6">Belum ada riwayat</p>}
        </div>
      )}
    </div>
  )
}
