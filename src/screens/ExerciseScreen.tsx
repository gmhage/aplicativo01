import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import copy from '../i18n/pt-BR'
import { SAFETY_NOTES } from '../lib/exercises'
import { useAppState } from '../state/AppStateContext'

function pickSafetyNote(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) hash = (hash + seed.charCodeAt(i)) % SAFETY_NOTES.length
  return SAFETY_NOTES[hash]
}

export function ExerciseScreen() {
  const { activeExercise, completeExercise, openExerciseOfTheDay, navigate } = useAppState()

  const exercise = activeExercise
  const isBreathing = exercise?.kind === 'breathing'
  const totalDuration = exercise?.durationSeconds ?? 30

  const [secondsLeft, setSecondsLeft] = useState(totalDuration)
  const [done, setDone] = useState(!isBreathing) // exercício físico já permite concluir

  // Recomeça quando o exercício muda (ex.: "quero outra sugestão").
  useEffect(() => {
    setSecondsLeft(totalDuration)
    setDone(!isBreathing)
  }, [exercise?.id, isBreathing, totalDuration])

  useEffect(() => {
    if (!isBreathing) return
    if (secondsLeft <= 0) {
      setDone(true)
      return
    }
    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft, isBreathing])

  const safetyNote = useMemo(() => (exercise ? pickSafetyNote(exercise.id) : SAFETY_NOTES[0]), [exercise])

  const handleComplete = async () => {
    await completeExercise()
    navigate('dashboard')
  }

  if (!exercise) {
    // Acesso direto sem ter sorteado (ex.: refresh). Oferece sortear um.
    return (
      <div className="flex flex-1 flex-col">
        <Header title={copy.exercise.title} />
        <Card className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm text-slate-500">Vamos escolher um exercício leve para hoje?</p>
          <div className="mt-5 w-full">
            <Button onClick={() => void openExerciseOfTheDay()}>{copy.dashboard.exerciseCta}</Button>
          </div>
        </Card>
      </div>
    )
  }

  const progress = isBreathing ? (totalDuration - secondsLeft) / totalDuration : 1

  return (
    <div className="flex flex-1 flex-col">
      <Header title={copy.exercise.title} />

      <Card className="flex flex-1 flex-col items-center justify-center py-10 text-center">
        <p className="text-lg font-semibold text-slate-900">{exercise.title}</p>

        {isBreathing ? (
          <>
            <motion.div
              animate={{ scale: done ? 1 : [1, 1.35, 1] }}
              transition={{ duration: 4, repeat: done ? 0 : Infinity, ease: 'easeInOut' }}
              className="mt-6 flex h-32 w-32 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--color-primary-soft)' }}
            >
              <span className="tabular text-3xl font-semibold" style={{ color: 'var(--color-primary-strong)' }}>
                {done ? '✓' : secondsLeft}
              </span>
            </motion.div>

            <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-1.5 transition-[width]" style={{ width: `${progress * 100}%`, backgroundColor: 'var(--color-primary)' }} />
            </div>

            <div className="mt-8 space-y-2 text-left">
              {exercise.steps?.map((step, index) => (
                <p key={step} className="text-[15px] text-slate-600">
                  <span className="tabular mr-2 font-semibold text-slate-400">{index + 1}.</span>
                  {step}
                </p>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-400">{copy.exercise.breathingFooter}</p>
          </>
        ) : (
          <>
            <div
              className="mt-6 flex h-20 w-20 items-center justify-center rounded-full text-3xl"
              style={{ backgroundColor: 'var(--color-primary-soft)' }}
            >
              🤸
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.exercise.physicalLabel}</p>
            <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-slate-700">{exercise.instruction}</p>
          </>
        )}

        <p className="mt-6 max-w-xs rounded-2xl bg-amber-50 px-4 py-2.5 text-xs leading-relaxed text-amber-800">
          {safetyNote}
        </p>
      </Card>

      <div className="mt-6 space-y-2">
        {done ? (
          <>
            <Button onClick={handleComplete}>{copy.exercise.completeButton}</Button>
            <Button variant="ghost" icon={<RefreshCw size={16} strokeWidth={1.6} />} onClick={() => void openExerciseOfTheDay()}>
              {copy.exercise.anotherButton}
            </Button>
            <Button variant="ghost" onClick={() => navigate('dashboard')}>
              {copy.exercise.laterButton}
            </Button>
          </>
        ) : (
          <Button variant="ghost" onClick={() => navigate('dashboard')}>
            {copy.exercise.laterButton}
          </Button>
        )}
      </div>
    </div>
  )
}
