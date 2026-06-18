import type { JournalEntry, MoodId } from '../types'

// Escala numérica de humor, do pior (1) ao melhor (5), para plotar no gráfico.
export const MOOD_SCORE: Record<MoodId, number> = {
  sad: 1,
  neutral: 2,
  happy: 3,
  veryHappy: 4,
  excited: 5,
}

// Os "2 piores moods" pedidos: triste e neutro são os dois mais baixos da escala.
const WORST_MOODS: MoodId[] = ['sad', 'neutral']
const ANXIETY_THRESHOLD = 5

export interface EvolutionPoint {
  entryId: string
  date: string // YYYY-MM-DD
  dayLabel: string // "16/06"
  moodScore: number
  mood: MoodId
  anxietyLevel: number
  activityDone: boolean
  text: string
  isCritical: boolean
}

function dayLabel(isoDate: string): string {
  const [, month, day] = isoDate.split('-')
  return `${day}/${month}`
}

// Um dia é crítico quando o humor é um dos dois piores E/OU a ansiedade >= 5.
export function isCriticalDay(mood: MoodId, anxietyLevel: number): boolean {
  return WORST_MOODS.includes(mood) || anxietyLevel >= ANXIETY_THRESHOLD
}

// Monta a série diária a partir dos registros. Se houver mais de um registro no
// mesmo dia, fica o mais recente (o estado mais atual daquele dia).
export function buildEvolutionSeries(entries: JournalEntry[]): EvolutionPoint[] {
  const byDay = new Map<string, JournalEntry>()
  for (const entry of entries) {
    const date = entry.createdAt.slice(0, 10)
    const existing = byDay.get(date)
    if (!existing || entry.createdAt > existing.createdAt) {
      byDay.set(date, entry)
    }
  }

  return [...byDay.values()]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((entry) => ({
      entryId: entry.id,
      date: entry.createdAt.slice(0, 10),
      dayLabel: dayLabel(entry.createdAt.slice(0, 10)),
      moodScore: MOOD_SCORE[entry.mood],
      mood: entry.mood,
      anxietyLevel: entry.anxietyLevel,
      activityDone: entry.activityDone,
      text: entry.text,
      isCritical: isCriticalDay(entry.mood, entry.anxietyLevel),
    }))
}

export function isToday(isoDate: string): boolean {
  return isoDate === new Date().toISOString().slice(0, 10)
}
