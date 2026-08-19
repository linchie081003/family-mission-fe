import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Child, QuizEditorPayload, QuizQuestion } from '../types'
import ImageSourcePicker from './ImageSourcePicker'

const EMPTY_QUESTION = (): QuizQuestion => ({
  question: '',
  options: ['', ''],
  correct_index: 0,
  explanation: '',
})

export const EMPTY_QUIZ_EDITOR: QuizEditorPayload = {
  subject: '',
  title: '',
  description: '',
  sub_material: '',
  grade_level: 'SD',
  points_reward: 10,
  passing_score: 70,
  questions_per_attempt: null,
  target_all_children: true,
  assigned_child_ids: [],
  questions: [EMPTY_QUESTION()],
}

interface QuizEditorFormProps {
  mode: 'template' | 'family'
  initial: QuizEditorPayload
  childrenOptions?: Child[]
  onSubmit: (data: QuizEditorPayload) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

function normalizeQuestion(q: QuizQuestion): QuizQuestion {
  const options = q.options.map(o => o.trim()).filter(Boolean)
  const originalCorrect = q.options[q.correct_index]?.trim()
  const correct_index = originalCorrect && options.includes(originalCorrect)
    ? options.indexOf(originalCorrect)
    : 0
  return {
    ...q,
    question: q.question.trim(),
    options,
    correct_index,
    image_url: q.image_url || null,
  }
}

export default function QuizEditorForm({
  mode,
  initial,
  childrenOptions = [],
  onSubmit,
  onCancel,
  submitLabel = 'Simpan',
}: QuizEditorFormProps) {
  const [form, setForm] = useState<QuizEditorPayload>(initial)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(initial)
    setError('')
  }, [initial])

  const updateQuestion = (index: number, patch: Partial<QuizQuestion>) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    }))
  }

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== qIndex) return q
        const options = [...q.options]
        options[oIndex] = value
        return { ...q, options }
      }),
    }))
  }

  const addQuestion = () => {
    setForm(prev => ({ ...prev, questions: [...prev.questions, EMPTY_QUESTION()] }))
  }

  const removeQuestion = (index: number) => {
    if (form.questions.length <= 1) return
    setForm(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }))
  }

  const addOption = (qIndex: number) => {
    const q = form.questions[qIndex]
    if (q.options.length >= 6) return
    updateQuestion(qIndex, { options: [...q.options, ''] })
  }

  const removeOption = (qIndex: number, oIndex: number) => {
    const q = form.questions[qIndex]
    if (q.options.length <= 2) return
    const options = q.options.filter((_, i) => i !== oIndex)
    let correct_index = q.correct_index
    if (oIndex === correct_index) correct_index = 0
    else if (oIndex < correct_index) correct_index -= 1
    updateQuestion(qIndex, { options, correct_index })
  }

  const toggleChildAssignment = (childId: number) => {
    setForm(prev => {
      const ids = prev.assigned_child_ids || []
      const next = ids.includes(childId) ? ids.filter(id => id !== childId) : [...ids, childId]
      return { ...prev, assigned_child_ids: next }
    })
  }

  const uploadImage = async (qIndex: number, base64: string) => {
    updateQuestion(qIndex, { image_url: base64 })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.subject.trim() || !form.title.trim()) {
      setError('Mata pelajaran dan judul wajib diisi')
      return
    }
    if (mode === 'family' && form.questions_per_attempt && form.questions_per_attempt > form.questions.length) {
      setError('Soal per attempt tidak boleh melebihi bank soal')
      return
    }
    if (mode === 'family' && !form.target_all_children && !(form.assigned_child_ids?.length)) {
      setError('Pilih minimal satu anak atau aktifkan untuk semua anak')
      return
    }
    const pointsReward = Number(form.points_reward)
    const passingScore = Number(form.passing_score)
    if (mode === 'family') {
      if (!Number.isFinite(pointsReward) || pointsReward < 1) {
        setError('Poin per quiz minimal 1')
        return
      }
      if (!Number.isFinite(passingScore) || passingScore < 50 || passingScore > 100) {
        setError('Minimal benar untuk poin harus antara 50–100%')
        return
      }
    }
    for (const [i, q] of form.questions.entries()) {
      if (!q.question.trim()) {
        setError(`Soal ${i + 1}: pertanyaan wajib diisi`)
        return
      }
      const opts = q.options.map(o => o.trim()).filter(Boolean)
      if (opts.length < 2) {
        setError(`Soal ${i + 1}: minimal 2 pilihan jawaban`)
        return
      }
      const normalized = normalizeQuestion(q)
      if (normalized.correct_index >= normalized.options.length) {
        setError(`Soal ${i + 1}: tandai jawaban benar`)
        return
      }
    }
    setSaving(true)
    try {
      await onSubmit({
        ...form,
        subject: form.subject.trim(),
        title: form.title.trim(),
        sub_material: form.sub_material?.trim() || null,
        points_reward: pointsReward,
        passing_score: passingScore,
        questions: form.questions.map(normalizeQuestion),
        questions_per_attempt: form.questions_per_attempt || null,
        target_all_children: form.target_all_children ?? true,
        assigned_child_ids: form.target_all_children ? [] : (form.assigned_child_ids || []),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 border border-primary-100">
      <div className="grid grid-cols-2 gap-2">
        <input
          className="input"
          placeholder="Mata pelajaran"
          value={form.subject}
          onChange={e => setForm({ ...form, subject: e.target.value })}
          required
        />
        <input
          className="input"
          placeholder="Judul quiz"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      <input
        className="input"
        placeholder="Sub materi (opsional)"
        value={form.sub_material || ''}
        onChange={e => setForm({ ...form, sub_material: e.target.value })}
      />

      {mode === 'template' ? (
        <div className="grid grid-cols-2 gap-2">
          <input
            className="input"
            placeholder="Tingkat (SD/SMP)"
            value={form.grade_level || 'SD'}
            onChange={e => setForm({ ...form, grade_level: e.target.value })}
          />
          <input
            className="input"
            placeholder="Deskripsi (opsional)"
            value={form.description || ''}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-primary-100 bg-primary-50/40 p-3 space-y-2">
            <p className="text-sm font-semibold text-primary-800">Pengaturan Poin</p>
            <p className="text-xs text-gray-500">
              Tentukan berapa poin yang didapat anak dan minimal persentase benar untuk mendapatkan poin.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-gray-600">Poin per quiz</span>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={form.points_reward ?? 10}
                  onChange={e => setForm({ ...form, points_reward: Number(e.target.value) })}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-gray-600">Minimal benar untuk poin (%)</span>
                <input
                  className="input"
                  type="number"
                  min={50}
                  max={100}
                  value={form.passing_score ?? 70}
                  onChange={e => setForm({ ...form, passing_score: Number(e.target.value) })}
                />
              </label>
            </div>
            <p className="text-xs text-primary-700 font-medium">
              Contoh: minimal {form.passing_score ?? 70}% benar → anak mendapat {form.points_reward ?? 10} poin (max 1x lulus/hari).
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="input"
              type="number"
              min={1}
              max={form.questions.length}
              placeholder={`Soal per attempt (max ${form.questions.length})`}
              value={form.questions_per_attempt ?? ''}
              onChange={e => setForm({
                ...form,
                questions_per_attempt: e.target.value ? Number(e.target.value) : null,
              })}
            />
            <div className="input flex items-center text-sm text-gray-600">
              Bank soal: {form.questions.length} · Target poin: {form.passing_score ?? 70}%
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 p-3 space-y-2 bg-slate-50/50">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.target_all_children ?? true}
                onChange={e => setForm({ ...form, target_all_children: e.target.checked })}
              />
              Tampilkan untuk semua anak
            </label>
            {!form.target_all_children && (
              <div className="flex flex-wrap gap-2">
                {childrenOptions.map(child => {
                  const selected = (form.assigned_child_ids || []).includes(child.id)
                  return (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => toggleChildAssignment(child.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                        selected ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600'
                      }`}
                    >
                      {child.name}
                    </button>
                  )
                })}
                {childrenOptions.length === 0 && (
                  <p className="text-xs text-gray-400">Belum ada anak terdaftar</p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-sm">Daftar Soal</h4>
          <button type="button" onClick={addQuestion} className="text-xs font-semibold text-primary-600 flex items-center gap-1">
            <Plus size={14} /> Tambah Soal
          </button>
        </div>

        {form.questions.map((q, qi) => (
          <div key={qi} className="rounded-xl border border-gray-100 p-3 space-y-2 bg-slate-50/50">
            <div className="flex justify-between items-start gap-2">
              <p className="text-xs font-bold text-gray-500">Soal {qi + 1}</p>
              {form.questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(qi)} className="text-red-500">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <input
              className="input"
              placeholder="Pertanyaan"
              value={q.question}
              onChange={e => updateQuestion(qi, { question: e.target.value })}
            />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500">Gambar soal (opsional)</p>
              <ImageSourcePicker
                cameraLabel="Kamera"
                galleryLabel="Galeri"
                onError={setError}
                onSelect={base64 => uploadImage(qi, base64)}
              />
              {q.image_url && (
                <div className="flex items-center gap-2">
                  <img src={q.image_url} alt="" className="w-12 h-12 rounded-lg object-cover border" />
                  <button type="button" className="text-xs text-red-500" onClick={() => updateQuestion(qi, { image_url: null })}>
                    Hapus
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs font-semibold text-emerald-700">Tandai jawaban benar:</p>
            <div className="space-y-1">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={q.correct_index === oi}
                    onChange={() => updateQuestion(qi, { correct_index: oi })}
                  />
                  <input
                    className={`input flex-1 py-1.5 text-sm ${q.correct_index === oi ? 'border-emerald-400 bg-emerald-50/50' : ''}`}
                    placeholder={`Pilihan ${oi + 1}`}
                    value={opt}
                    onChange={e => updateOption(qi, oi, e.target.value)}
                  />
                  {q.options.length > 2 && (
                    <button type="button" onClick={() => removeOption(qi, oi)} className="text-gray-400">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              {q.options.length < 6 && (
                <button type="button" onClick={() => addOption(qi)} className="text-xs text-primary-600 font-semibold">
                  + Pilihan
                </button>
              )}
            </div>
            <input
              className="input text-sm"
              placeholder="Penjelasan (opsional)"
              value={q.explanation || ''}
              onChange={e => updateQuestion(qi, { explanation: e.target.value })}
            />
          </div>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Batal</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1">
          {saving ? 'Menyimpan...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export function detailToEditor(
  detail: {
    subject: string
    title: string
    description?: string | null
    sub_material?: string | null
    grade_level?: string
    points_reward?: number
    passing_score?: number
    questions_per_attempt?: number | null
    target_all_children?: boolean
    assigned_child_ids?: number[]
    questions: QuizQuestion[]
  },
): QuizEditorPayload {
  return {
    subject: detail.subject,
    title: detail.title,
    description: detail.description || '',
    sub_material: detail.sub_material || '',
    grade_level: detail.grade_level || 'SD',
    points_reward: detail.points_reward ?? 10,
    passing_score: detail.passing_score ?? 70,
    questions_per_attempt: detail.questions_per_attempt ?? null,
    target_all_children: detail.target_all_children ?? true,
    assigned_child_ids: detail.assigned_child_ids || [],
    questions: detail.questions.map(q => ({
      question: q.question,
      image_url: q.image_url,
      options: [...q.options],
      correct_index: q.correct_index,
      explanation: q.explanation || '',
    })),
  }
}
