import { FamilyQuiz } from '../../types'

const SUBJECT_THEMES: Record<string, { emoji: string; gradient: string; ring: string }> = {
  Matematika: { emoji: '🔢', gradient: 'from-blue-500 to-indigo-600', ring: 'ring-blue-200' },
  IPA: { emoji: '🧪', gradient: 'from-emerald-500 to-teal-600', ring: 'ring-emerald-200' },
  'Bahasa Indonesia': { emoji: '📖', gradient: 'from-violet-500 to-purple-600', ring: 'ring-violet-200' },
}

function themeFor(subject: string) {
  return SUBJECT_THEMES[subject] || { emoji: '📝', gradient: 'from-indigo-500 to-primary-600', ring: 'ring-indigo-200' }
}

interface Props {
  quizzes: FamilyQuiz[]
  onStart: (quizId: number) => void
}

export default function QuizLobby({ quizzes, onStart }: Props) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-3xl mb-1">⚔️</p>
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Quiz Quest
        </h2>
        <p className="text-sm text-gray-500 mt-1">Selesaikan quest pelajaran — max 1x lulus per hari</p>
      </div>

      <div className="space-y-3">
        {quizzes.map(q => {
          const theme = themeFor(q.subject)
          const attemptCount = q.questions_per_attempt || q.question_pool_size
          return (
            <div
              key={q.id}
              className={`relative overflow-hidden rounded-2xl p-4 text-white shadow-lg bg-gradient-to-br ${theme.gradient}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl ring-2 ${theme.ring}`}>
                    {theme.emoji}
                  </div>
                  <div>
                    <p className="font-bold">{q.title}</p>
                    <p className="text-xs text-white/80">
                      {q.subject}
                      {q.sub_material ? ` · ${q.sub_material}` : ''}
                    </p>
                    <p className="text-[11px] text-white/70 mt-0.5">
                      {attemptCount ? `${attemptCount} soal` : ''}
                      {q.question_pool_size && q.questions_per_attempt && q.question_pool_size > q.questions_per_attempt
                        ? ` · pool ${q.question_pool_size}`
                        : ''}
                      {' · '}+{q.points_reward} poin jika benar ≥ {q.passing_score}%
                    </p>
                    <p className="text-sm font-semibold mt-1">Reward +{q.points_reward} XP</p>
                  </div>
                </div>
                {q.completed_today ? (
                  <span className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold">
                    ✓ Selesai
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onStart(q.id)}
                    className="bg-white text-indigo-700 font-bold text-sm px-4 py-2 rounded-xl shadow hover:scale-105 transition-transform"
                  >
                    Mulai
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {quizzes.length === 0 && (
          <p className="text-center text-gray-400 py-8">Belum ada quest dari orang tua</p>
        )}
      </div>
    </div>
  )
}
