import { useState } from 'react'
import { Lock } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { TextAreaField } from '../components/ui/TextField'
import copy from '../i18n/pt-BR'
import { useAppState } from '../state/AppStateContext'
import { moodThemes } from '../theme/moodTheme'
import type { MoodId } from '../types'

const MAX_LENGTH = 10_000

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

// Cor do "thumb" do slider conforme a intensidade: verde (calmo) → âmbar → vermelho.
function anxietyThumbColor(level: number): string {
  if (level <= 3) return '#10B981'
  if (level <= 6) return '#F5A524'
  return '#EF4444'
}

export function JournalScreen() {
  const { submitJournal, journalEntries, navigate } = useAppState()
  const [text, setText] = useState('')
  const [anxietyLevel, setAnxietyLevel] = useState(5)
  const [activityDone, setActivityDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    const trimmed = text.trim()
    if (!trimmed) {
      setError(copy.journal.emptyError)
      return
    }
    if (trimmed.length > MAX_LENGTH) {
      setError(copy.journal.tooLongError)
      return
    }
    setError(null)
    setLoading(true)
    await submitJournal(trimmed, anxietyLevel, activityDone)
    setLoading(false)
    setText('')
    navigate('dashboard')
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header title={copy.journal.title} />

      <TextAreaField
        label={copy.journal.fieldLabel}
        placeholder={copy.journal.placeholder}
        rows={6}
        value={text}
        error={error ?? undefined}
        onChange={(e) => {
          setText(e.target.value)
          if (error) setError(null)
        }}
      />

      <p className="mt-2.5 flex items-center gap-1.5 text-xs text-ink/45">
        <Lock size={13} strokeWidth={2} className="flex-shrink-0" />
        {copy.journal.privacyNote}
      </p>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <label htmlFor="anxiety" className="text-sm font-semibold text-ink/75">
            {copy.journal.anxietyLabel}
          </label>
          <span
            className="tabular rounded-full px-2.5 py-0.5 text-sm font-extrabold text-white"
            style={{ backgroundColor: anxietyThumbColor(anxietyLevel) }}
          >
            {anxietyLevel}/10
          </span>
        </div>
        <input
          id="anxiety"
          type="range"
          min={1}
          max={10}
          value={anxietyLevel}
          onChange={(e) => setAnxietyLevel(Number(e.target.value))}
          className="anxiety-range mt-3 w-full"
          style={{ ['--thumb' as string]: anxietyThumbColor(anxietyLevel) }}
        />
        <div className="mt-1.5 flex justify-between text-[11px] font-semibold text-ink/45">
          <span>{copy.journal.anxietyCalm}</span>
          <span>{copy.journal.anxietyIntense}</span>
        </div>
      </div>

      <label className="mt-5 flex items-center gap-3 rounded-2xl border border-grape/10 bg-white px-4 py-3.5 text-sm font-medium text-ink/75 shadow-card">
        <input
          type="checkbox"
          checked={activityDone}
          onChange={(e) => setActivityDone(e.target.checked)}
          className="h-5 w-5 rounded-md accent-grape"
        />
        {copy.journal.activityLabel}
      </label>

      <div className="mt-6">
        <Button loading={loading} onClick={handleSave}>
          {copy.journal.saveButton}
        </Button>
      </div>

      <div className="mt-9">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-grape/55">{copy.journal.historyTitle}</p>
        {journalEntries.length === 0 ? (
          <p className="mt-3 text-sm text-ink/45">{copy.journal.historyEmpty}</p>
        ) : (
          // A "trilha emocional": uma fita vertical contínua, cada dia um nó
          // colorido pelo humor daquele registro.
          <div className="relative mt-4 pl-6">
            <span className="absolute left-[7px] top-2 bottom-2 w-[3px] rounded-full bg-grape/10" aria-hidden />
            <div className="space-y-2.5">
              {journalEntries.slice(0, 5).map((entry) => {
                const theme = moodThemes[entry.mood as MoodId]
                return (
                  <div key={entry.id} className="relative">
                    <span
                      className="absolute -left-[22px] top-5 h-3.5 w-3.5 rounded-full ring-4 ring-mist"
                      style={{ backgroundColor: theme.bar }}
                      aria-hidden
                    />
                    <div className="rounded-[18px] border border-grape/10 bg-white p-4 shadow-card">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-ink/55">{formatDate(entry.createdAt)}</span>
                        <span className="flex items-center gap-1 font-semibold" style={{ color: theme.primaryStrong }}>
                          <span aria-hidden>{theme.emoji}</span>
                          {theme.label}
                        </span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-sm text-ink/70">{entry.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
