import { useEffect, useState } from 'react'
import { api } from '../../api'
import { FamilyQuiz } from '../../types'
import { celebrate } from '../../utils/celebrate'
import { useWebSocket } from '../../hooks/useWebSocket'
import QuizLobby from '../../components/quiz/QuizLobby'
import QuizPlaySession, { QuizAnswerPayload } from '../../components/quiz/QuizPlaySession'
import QuizResultScreen from '../../components/quiz/QuizResultScreen'

type QuizDetail = {
  id: number
  title: string
  subject: string
  sub_material?: string | null
  passing_score: number
  points_reward: number
  question_pool_size?: number
  questions_per_attempt?: number
  questions: { id: number; question: string; image_url?: string | null; options: string[] }[]
}

type Screen = 'lobby' | 'play' | 'result'

export default function ChildQuizPage() {
  const [quizzes, setQuizzes] = useState<FamilyQuiz[]>([])
  const [screen, setScreen] = useState<Screen>('lobby')
  const [active, setActive] = useState<QuizDetail | null>(null)
  const [result, setResult] = useState<{
    score: number
    passed: boolean
    points_awarded: number
    points_reward: number
    passing_score: number
    correct_count?: number
    total_questions?: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.getChildQuizzes()
      .then(setQuizzes)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  useWebSocket(event => {
    if (event === 'quiz_passed') load()
  })

  const startQuiz = async (quizId: number) => {
    setResult(null)
    const detail = await api.getChildQuiz(quizId)
    setActive(detail)
    setScreen('play')
  }

  const handleComplete = async (answers: QuizAnswerPayload[]) => {
    if (!active) return
    const res = await api.submitChildQuiz(active.id, answers)
    setResult(res)
    setScreen('result')
    if (res.passed && res.points_awarded > 0) celebrate('level')
    load()
  }

  const backToLobby = () => {
    setActive(null)
    setResult(null)
    setScreen('lobby')
  }

  if (loading) return <div className="text-center py-8 text-gray-400">Memuat quest...</div>

  if (screen === 'play' && active) {
    return (
      <QuizPlaySession
        quiz={active}
        onBack={backToLobby}
        onComplete={handleComplete}
      />
    )
  }

  if (screen === 'result' && active && result) {
    return (
      <QuizResultScreen
        score={result.score}
        passed={result.passed}
        pointsAwarded={result.points_awarded}
        pointsReward={result.points_reward}
        passingScore={result.passing_score}
        correctCount={result.correct_count}
        totalQuestions={result.total_questions}
        onBack={backToLobby}
      />
    )
  }

  return <QuizLobby quizzes={quizzes} onStart={startQuiz} />
}
