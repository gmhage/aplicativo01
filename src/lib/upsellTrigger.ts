import type { JournalEntry, MoodId, User } from '../types'
import { readValue, writeValue } from '../services/localStorageDb'

// ─────────────────────────────────────────────────────────────────────────────
// Quando mostrar o convite do SoulSpace Conexão (botão "Treinar conversa") na
// home, para quem ainda NÃO tem o plano.
//
// Regra (decidida com o produto):
//   - aparece com 7 dias de uso  E  sinal de evolução (humor melhorando /
//     ansiedade caindo);  OU
//   - aparece com 10 dias de uso, independente de evolução.
//
// A ideia é só oferecer depois que a pessoa sentiu valor — nunca logo na
// contratação, para não soar forçado.
// ─────────────────────────────────────────────────────────────────────────────

export const UPSELL_MIN_DAYS_WITH_PROGRESS = 7
export const UPSELL_MIN_DAYS_ANYWAY = 10

// Dias-calendário desde a criação da conta (proxy de "dias usando o app").
function daysSinceSignup(user: User, today: Date): number {
  const start = new Date(user.createdAt)
  const a = new Date(today.toISOString().slice(0, 10) + 'T00:00:00')
  const b = new Date(start.toISOString().slice(0, 10) + 'T00:00:00')
  return Math.max(0, Math.round((a.getTime() - b.getTime()) / 86_400_000))
}

// "Evolução": compara a primeira metade dos registros com a segunda (mesma ideia
// do resumo da evolução). Considera que houve evolução se o humor melhorou OU a
// ansiedade caiu de forma perceptível. Precisa de um mínimo de registros.
export function hasEvolution(entries: JournalEntry[]): boolean {
  if (entries.length < 4) return false

  // Pontuação de humor por id (1 = pior, 5 = melhor) — alinhada à ordem usada no
  // app (sad < neutral < happy < veryHappy < excited).
  const moodScore: Record<string, number> = {
    sad: 1,
    neutral: 2,
    happy: 3,
    veryHappy: 4,
    excited: 5,
  }

  const ordered = [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const mid = Math.floor(ordered.length / 2)
  const first = ordered.slice(0, mid)
  const second = ordered.slice(mid)

  const avg = (xs: number[]) => (xs.length ? xs.reduce((s, n) => s + n, 0) / xs.length : 0)

  const moodFirst = avg(first.map((e) => moodScore[e.mood] ?? 2))
  const moodSecond = avg(second.map((e) => moodScore[e.mood] ?? 2))
  const anxFirst = avg(first.map((e) => e.anxietyLevel))
  const anxSecond = avg(second.map((e) => e.anxietyLevel))

  const moodImproved = moodSecond - moodFirst >= 0.4
  const anxietyImproved = anxFirst - anxSecond >= 1

  return moodImproved || anxietyImproved
}

export function shouldShowConexaoUpsell(
  user: User | null,
  entries: JournalEntry[],
  today: Date = new Date(),
): boolean {
  if (!user) return false
  const days = daysSinceSignup(user, today)

  if (days >= UPSELL_MIN_DAYS_ANYWAY) return true
  if (days >= UPSELL_MIN_DAYS_WITH_PROGRESS && hasEvolution(entries)) return true
  return false
}

// ─────────────────────────────────────────────────────────────────────────────
// Abertura AUTOMÁTICA da tela de upsell.
//
// Regra:
//   - 1ª vez: assim que o gatilho do botão dispara, abre a tela sozinha.
//   - Depois, se a pessoa não comprou: reabre no máximo 1x por semana, e SÓ num
//     "bom momento" (humor em evolução OU ansiedade baixa hoje).
//   - Para de abrir sozinha após 3 aberturas no total (o botão continua sempre).
//
// O estado (quantas vezes abriu e quando foi a última) é persistido por usuário.
// ─────────────────────────────────────────────────────────────────────────────

export const UPSELL_MAX_AUTO_OPENS = 3
export const UPSELL_AUTO_REOPEN_DAYS = 7
// Ansiedade considerada "baixa" (escala 1–10) para caracterizar um bom momento.
const LOW_ANXIETY_MAX = 4

interface AutoOpenState {
  count: number // quantas vezes a tela já abriu sozinha
  lastOpenDate: string // YYYY-MM-DD da última abertura automática
}

function autoOpenKey(userId: string): string {
  return `conexaoUpsellAutoOpen:${userId}`
}

function readAutoOpenState(userId: string): AutoOpenState {
  return readValue<AutoOpenState>(autoOpenKey(userId)) ?? { count: 0, lastOpenDate: '' }
}

function daysBetweenDates(aIso: string, bIso: string): number {
  const a = new Date(`${aIso}T00:00:00`).getTime()
  const b = new Date(`${bIso}T00:00:00`).getTime()
  return Math.round(Math.abs(a - b) / 86_400_000)
}

// "Bom momento": ansiedade baixa hoje OU humor em evolução na série do diário.
// O humor de hoje (positivo) também conta como bom momento.
function isGoodMoment(todayMood: MoodId, entries: JournalEntry[]): boolean {
  const positiveMoodToday = todayMood === 'happy' || todayMood === 'veryHappy' || todayMood === 'excited'
  const lowAnxietyToday = (entries[0]?.anxietyLevel ?? 10) <= LOW_ANXIETY_MAX
  return positiveMoodToday || lowAnxietyToday || hasEvolution(entries)
}

// Decide se a tela de upsell deve ABRIR SOZINHA agora. Não tem efeito colateral:
// quem chama deve, ao abrir, registrar com markUpsellAutoOpened().
export function shouldAutoOpenUpsell(
  user: User | null,
  entries: JournalEntry[],
  todayMood: MoodId,
  today: Date = new Date(),
): boolean {
  if (!user) return false
  // Só faz sentido para quem ainda não tem o Conexão e já passou do gatilho.
  if (!shouldShowConexaoUpsell(user, entries, today)) return false

  const state = readAutoOpenState(user.id)
  if (state.count >= UPSELL_MAX_AUTO_OPENS) return false

  // 1ª abertura: dispara assim que o gatilho liga (sem esperar bom momento).
  if (state.count === 0) return true

  // Reaberturas: respeitar o intervalo de 1 semana e exigir bom momento.
  const todayIso = today.toISOString().slice(0, 10)
  const enoughTimePassed =
    !state.lastOpenDate || daysBetweenDates(todayIso, state.lastOpenDate) >= UPSELL_AUTO_REOPEN_DAYS
  if (!enoughTimePassed) return false

  return isGoodMoment(todayMood, entries)
}

// Registra que a tela abriu sozinha agora (incrementa contador + data).
export function markUpsellAutoOpened(user: User | null, today: Date = new Date()): void {
  if (!user) return
  const state = readAutoOpenState(user.id)
  writeValue(autoOpenKey(user.id), {
    count: state.count + 1,
    lastOpenDate: today.toISOString().slice(0, 10),
  })
}

// (apenas para testes/dev) zera o estado de auto-abertura.
export function resetUpsellAutoOpen(user: User | null): void {
  if (!user) return
  writeValue(autoOpenKey(user.id), { count: 0, lastOpenDate: '' })
}
