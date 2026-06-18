import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { SelectableCard } from '../components/ui/Card'
import { ProgressDots } from '../components/ui/ProgressDots'
import copy from '../i18n/pt-BR'
import { useAppState } from '../state/AppStateContext'
import type { GoalId } from '../types'

export function GoalSelectionScreen() {
  const { chooseGoal } = useAppState()
  const [selected, setSelected] = useState<GoalId | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selected) {
      setError(copy.goal.error)
      return
    }
    setLoading(true)
    await chooseGoal(selected)
    setLoading(false)
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6">
        <ProgressDots total={3} current={2} />
      </div>
      <h1 className="font-display text-[27px] font-semibold leading-tight text-ink">{copy.goal.title}</h1>
      <p className="mt-2 text-[15px] text-ink/55">{copy.goal.subtitle}</p>

      <div className="mt-8 space-y-3">
        {copy.goal.options.map((option) => (
          <SelectableCard
            key={option.id}
            selected={selected === option.id}
            onClick={() => {
              setSelected(option.id)
              setError(null)
            }}
          >
            <span className="flex items-center gap-3.5 text-[15px] font-bold text-ink/85">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-grape/[0.08] text-xl">
                {option.emoji}
              </span>
              {option.label}
            </span>
          </SelectableCard>
        ))}
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      </div>

      <div className="mt-8">
        <Button loading={loading} onClick={handleSubmit}>
          {copy.goal.continueButton}
        </Button>
      </div>
    </div>
  )
}
