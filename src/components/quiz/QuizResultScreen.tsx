interface Props {
  score: number
  passed: boolean
  pointsAwarded: number
  pointsReward: number
  passingScore: number
  correctCount?: number
  totalQuestions?: number
  onBack: () => void
}

function starsFor(score: number, passing: number): number {
  if (score < passing) return 0
  if (score >= 95) return 3
  if (score >= passing + 10) return 2
  return 1
}

export default function QuizResultScreen({
  score,
  passed,
  pointsAwarded,
  pointsReward,
  passingScore,
  correctCount,
  totalQuestions,
  onBack,
}: Props) {
  const stars = starsFor(score, passingScore)

  return (
    <div className="space-y-6 text-center py-4">
      <div className="card py-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-indigo-100">
        <p className="text-5xl mb-3">{passed ? '🏆' : '💪'}</p>
        <h2 className="text-3xl font-extrabold text-slate-800">{score}%</h2>
        {correctCount !== undefined && totalQuestions !== undefined && (
          <p className="text-sm text-gray-500 mt-1">
            Benar {correctCount} dari {totalQuestions} soal · Butuh {passingScore}% untuk +{pointsReward} poin
          </p>
        )}

        <div className="flex justify-center gap-2 my-4">
          {[1, 2, 3].map(i => (
            <span key={i} className={`text-3xl ${i <= stars ? 'opacity-100 scale-110' : 'opacity-20 grayscale'}`}>
              ⭐
            </span>
          ))}
        </div>

        <p className="text-gray-600 mt-2 px-4">
          {passed
            ? pointsAwarded > 0
              ? `Quest berhasil! +${pointsAwarded} poin masuk saldo (target ${passingScore}%)`
              : `Quest memenuhi target ${passingScore}%, tapi poin tidak diberikan (batas harian atau sudah lulus hari ini)`
            : `Belum dapat poin — butuh minimal ${passingScore}% benar untuk +${pointsReward} poin`}
        </p>
      </div>

      <button type="button" onClick={onBack} className="btn-primary w-full py-3 font-bold">
        Kembali ke Quest Board
      </button>
    </div>
  )
}

export { starsFor }
