import { useState } from 'react'

type Question = { id: number; question: string; image_url?: string | null; options: string[] }

interface QuizDetail {
  id: number
  title: string
  subject: string
  sub_material?: string | null
  passing_score: number
  points_reward: number
  question_pool_size?: number
  questions_per_attempt?: number
  questions: Question[]
}

export type QuizAnswerPayload = { question_id: number; selected_option: string }

interface Props {
  quiz: QuizDetail
  onBack: () => void
  onComplete: (answers: QuizAnswerPayload[]) => Promise<void>
}

export default function QuizPlaySession({ quiz, onBack, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<(QuizAnswerPayload | null)[]>(
    () => new Array(quiz.questions.length).fill(null),
  )
  const [submitting, setSubmitting] = useState(false)

  const total = quiz.questions.length
  const current = quiz.questions[step]
  const progress = ((step + 1) / total) * 100
  const selected = answers[step]

  const goNext = async () => {
    if (!selected) return
    if (step < total - 1) {
      setStep(step + 1)
      return
    }
    setSubmitting(true)
    try {
      await onComplete(answers.filter((a): a is QuizAnswerPayload => a !== null))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <button type="button" onClick={onBack} className="text-sm text-primary-600 font-semibold">
        ← Kembali
      </button>

      <div className="rounded-2xl bg-white/80 backdrop-blur border border-white shadow-sm p-4">
        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
          <span>{quiz.title}</span>
          <span>Soal {step + 1} / {total}</span>
        </div>
        <p className="text-[11px] text-gray-400 mb-2">
          {quiz.subject}
          {quiz.sub_material ? ` · ${quiz.sub_material}` : ''}
          {quiz.question_pool_size && quiz.question_pool_size > total
            ? ` · ${total} dari ${quiz.question_pool_size} soal`
            : ''}
          {' · '}+{quiz.points_reward} poin jika benar ≥ {quiz.passing_score}%
        </p>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 py-6 space-y-4">
        <p className="text-lg font-bold text-slate-800 leading-snug">{current.question}</p>
        {current.image_url && (
          <img
            src={current.image_url}
            alt=""
            className="w-full max-h-56 object-contain rounded-xl border border-indigo-100 bg-white"
          />
        )}
      </div>

      <div className="space-y-2">
        {current.options.map((opt, oi) => (
          <button
            key={oi}
            type="button"
            onClick={() => setAnswers(prev => {
              const next = [...prev]
              next[step] = { question_id: current.id, selected_option: opt }
              return next
            })}
            className={`w-full text-left px-4 py-3 rounded-2xl border-2 font-semibold text-sm transition-all ${
              selected?.selected_option === opt
                ? 'border-indigo-500 bg-indigo-50 text-indigo-900 scale-[1.02] shadow-md'
                : 'border-gray-100 bg-white hover:border-indigo-200 hover:shadow-sm'
            }`}
          >
            <span className="inline-flex w-7 h-7 rounded-full bg-gray-100 items-center justify-center text-xs mr-2 font-bold">
              {String.fromCharCode(65 + oi)}
            </span>
            {opt}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={goNext}
        disabled={!selected || submitting}
        className="btn-primary w-full py-3 text-base font-bold"
      >
        {submitting ? 'Mengirim...' : step < total - 1 ? 'Lanjut →' : 'Selesai Quest!'}
      </button>
    </div>
  )
}
