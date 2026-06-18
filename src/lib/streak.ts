import type { JournalEntry } from '../types'

// Regra da ofensiva (estilo Duolingo, com tolerância):
// - registrar o diário hoje ou ontem mantém a ofensiva intacta;
// - até 3 dias seguidos sem registrar, a ofensiva é PERDOADA (continua valendo),
//   mas o app avisa que a pessoa faltou;
// - passou de 3 dias de buraco, a ofensiva ZERA.
// A contagem é em dias-calendário distintos com registro, sem exigir que sejam
// perfeitamente consecutivos (os perdões contam como parte da sequência).

export const GRACE_DAYS = 3

export type StreakStatus = 'intact' | 'grace' | 'reset' | 'none'

export interface StreakState {
  count: number // dias da ofensiva atual
  status: StreakStatus
  daysSinceLast: number // dias-calendário desde o último registro (0 = hoje)
}

function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

function daysBetween(aKey: string, bKey: string): number {
  const a = new Date(`${aKey}T00:00:00`)
  const b = new Date(`${bKey}T00:00:00`)
  return Math.round((a.getTime() - b.getTime()) / 86_400_000)
}

export function computeStreak(entries: JournalEntry[], today = new Date()): StreakState {
  if (entries.length === 0) {
    return { count: 0, status: 'none', daysSinceLast: Infinity }
  }

  const todayKey = today.toISOString().slice(0, 10)
  const uniqueDays = [...new Set(entries.map((e) => dayKey(e.createdAt)))].sort((a, b) => b.localeCompare(a))

  const daysSinceLast = daysBetween(todayKey, uniqueDays[0])

  // Buraco maior que a tolerância desde o último registro: ofensiva zerada.
  if (daysSinceLast > GRACE_DAYS) {
    return { count: 0, status: 'reset', daysSinceLast }
  }

  // Conta a sequência andando para trás, permitindo buracos de até GRACE_DAYS
  // entre registros consecutivos.
  let count = 1
  for (let i = 0; i < uniqueDays.length - 1; i += 1) {
    const gap = daysBetween(uniqueDays[i], uniqueDays[i + 1])
    if (gap <= GRACE_DAYS) count += 1
    else break
  }

  const status: StreakStatus = daysSinceLast <= 1 ? 'intact' : 'grace'
  return { count, status, daysSinceLast }
}
