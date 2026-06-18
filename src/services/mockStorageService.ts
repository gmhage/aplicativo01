import type {
  AIChatMessage,
  Badge,
  GoalId,
  Insight,
  JournalEntry,
  MoodId,
  Plan,
  PlanExercise,
  User,
} from '../types'
import { firstChallengeIdForGoal, getChallengeById, getNextChallenge } from '../lib/challenges'
import { exercises } from '../lib/exercises'
import { delay, generateId, readCollection, readValue, removeCollections, writeCollection } from './localStorageDb'
import type { SaveOutcome, StorageService } from './types'

// Mock de Firebase Firestore. Cada coleção do schema vira uma "tabela" em
// localStorage. Para trocar por Firestore de verdade, esta é a única classe
// que precisa de outra implementação — o restante do app fala só com StorageService.
const FIREBASE_FAILURE_RATE = 0.08

function isSameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10)
}

function buildExercisesFor(planId: string, totalDays: number): PlanExercise[] {
  return Array.from({ length: totalDays }, (_, index) => ({
    id: generateId('exercise'),
    planId,
    day: index + 1,
    exerciseType: 'respiracao' as const,
    durationSeconds: 30,
    completed: false,
    completedAt: null,
  }))
}

class MockStorageService implements StorageService {
  async getUser(userId: string): Promise<User | null> {
    await delay(150)
    const user = readValue<User>('currentUser')
    return user && user.id === userId ? user : null
  }

  async addJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt'>): Promise<{ entry: JournalEntry; outcome: SaveOutcome }> {
    await delay(500)
    const full: JournalEntry = { ...entry, id: generateId('journal'), createdAt: new Date().toISOString() }
    const all = readCollection<JournalEntry>('journalEntries')
    all.push(full)
    writeCollection('journalEntries', all)
    const outcome: SaveOutcome = Math.random() < FIREBASE_FAILURE_RATE ? 'savedLocally' : 'synced'
    return { entry: full, outcome }
  }

  async listJournalEntries(userId: string): Promise<JournalEntry[]> {
    await delay(200)
    return readCollection<JournalEntry>('journalEntries')
      .filter((e) => e.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async seedDemoJournal(userId: string): Promise<JournalEntry[]> {
    await delay(400)
    // 9 dias de exemplo: começa difícil (triste/ansiedade alta) e melhora aos
    // poucos, com recaídas, para o gráfico mostrar tendência e dias críticos.
    const demo: Array<{ mood: MoodId; anxiety: number; activity: boolean; text: string }> = [
      { mood: 'sad', anxiety: 9, activity: false, text: 'Me senti muito sozinho hoje. Bati o olho nas fotos dos amigos e veio aquele aperto.' },
      { mood: 'sad', anxiety: 8, activity: false, text: 'Dia pesado no trabalho, fiquei com ansiedade antes da reunião e quase não dormi.' },
      { mood: 'neutral', anxiety: 6, activity: false, text: 'Dia mais ou menos. Nada de especial, só seguindo o ritmo.' },
      { mood: 'neutral', anxiety: 5, activity: true, text: 'Fiz uma caminhada à noite e ajudou a esvaziar a cabeça.' },
      { mood: 'happy', anxiety: 4, activity: true, text: 'Conversei com uma pessoa nova e foi tranquilo. Saí leve.' },
      { mood: 'neutral', anxiety: 6, activity: false, text: 'Voltou um pouco da ansiedade pensando no fim de semana sozinho.' },
      { mood: 'happy', anxiety: 3, activity: true, text: 'Andei de bike de manhã e o dia rendeu bem melhor.' },
      { mood: 'veryHappy', anxiety: 2, activity: true, text: 'Dia muito bom! Me senti em paz comigo pela primeira vez em um tempo.' },
      { mood: 'happy', anxiety: 4, activity: false, text: 'Dia bom no geral, só um friozinho na barriga de leve.' },
    ]

    const all = readCollection<JournalEntry>('journalEntries')
    const seeded: JournalEntry[] = demo.map((day, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (demo.length - 1 - index))
      date.setHours(20, 0, 0, 0)
      return {
        id: generateId('journal'),
        userId,
        mood: day.mood,
        text: day.text,
        anxietyLevel: day.anxiety,
        activityDone: day.activity,
        createdAt: date.toISOString(),
      }
    })
    writeCollection('journalEntries', [...all, ...seeded])
    return seeded
  }

  // Apenas para desenvolvimento: cria um registro de diário datado no dia
  // seguinte ao registro mais recente (ou hoje, se não houver nenhum), para
  // testar o gráfico de evolução dia a dia sem precisar esperar virar o dia.
  async addDevDayEntry(userId: string): Promise<JournalEntry> {
    await delay(150)
    const all = readCollection<JournalEntry>('journalEntries')
    const mine = all.filter((e) => e.userId === userId)

    const lastDate = mine.reduce<string | null>((max, e) => (max && max >= e.createdAt ? max : e.createdAt), null)
    const date = lastDate ? new Date(lastDate) : new Date()
    if (lastDate) date.setDate(date.getDate() + 1)
    date.setHours(20, 0, 0, 0)

    // Varia humor/ansiedade de forma leve para o gráfico mostrar movimento.
    const moods: MoodId[] = ['sad', 'neutral', 'happy', 'veryHappy', 'excited']
    const mood = moods[Math.floor(Math.random() * moods.length)]
    const anxietyLevel = 1 + Math.floor(Math.random() * 9)

    const entry: JournalEntry = {
      id: generateId('journal'),
      userId,
      mood,
      text: `[DEV] Dia simulado em ${date.toLocaleDateString('pt-BR')}.`,
      anxietyLevel,
      activityDone: Math.random() < 0.5,
      createdAt: date.toISOString(),
    }
    all.push(entry)
    writeCollection('journalEntries', all)
    return entry
  }

  async markActivityDone(entryId: string): Promise<JournalEntry | null> {
    await delay(250)
    const all = readCollection<JournalEntry>('journalEntries')
    const index = all.findIndex((e) => e.id === entryId)
    if (index === -1) return null
    all[index] = { ...all[index], activityDone: true }
    writeCollection('journalEntries', all)
    return all[index]
  }

  async updateEntryMood(entryId: string, mood: MoodId): Promise<JournalEntry | null> {
    const all = readCollection<JournalEntry>('journalEntries')
    const index = all.findIndex((e) => e.id === entryId)
    if (index === -1) return null
    all[index] = { ...all[index], mood }
    writeCollection('journalEntries', all)
    return all[index]
  }

  async addChatMessage(message: Omit<AIChatMessage, 'id' | 'createdAt'>): Promise<AIChatMessage> {
    await delay(150)
    const full: AIChatMessage = { ...message, id: generateId('msg'), createdAt: new Date().toISOString() }
    const all = readCollection<AIChatMessage>('chatMessages')
    all.push(full)
    writeCollection('chatMessages', all)
    return full
  }

  async listChatMessages(userId: string): Promise<AIChatMessage[]> {
    await delay(150)
    return readCollection<AIChatMessage>('chatMessages')
      .filter((m) => m.userId === userId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  async getOrCreatePlan(userId: string, goal: GoalId): Promise<Plan> {
    await delay(300)
    const plans = readCollection<Plan>('plans')
    const existing = plans.find((p) => p.userId === userId && p.status === 'active')
    if (existing) {
      // Migra planos salvos no formato antigo (sem challengeId/order, ou com a
      // duração fixa antiga de 21 dias). Ajusta para a duração do desafio atual.
      const challenge = getChallengeById(existing.challengeId ?? firstChallengeIdForGoal(goal)) ?? getChallengeById('loneliness')!
      if (!existing.challengeId || existing.totalDays !== challenge.days) {
        const migrated: Plan = {
          ...existing,
          challengeId: challenge.id,
          order: challenge.order,
          goal: challenge.title,
          totalDays: challenge.days,
          currentDay: Math.min(existing.currentDay, challenge.days),
        }
        writeCollection(
          'plans',
          plans.map((p) => (p.id === existing.id ? migrated : p)),
        )
        return migrated
      }
      return existing
    }

    const challengeId = firstChallengeIdForGoal(goal)
    const challenge = getChallengeById(challengeId)!
    const plan: Plan = {
      id: generateId('plan'),
      userId,
      challengeId: challenge.id,
      order: challenge.order,
      goal: challenge.title,
      totalDays: challenge.days,
      currentDay: 1,
      startedAt: new Date().toISOString(),
      completedAt: null,
      status: 'active',
    }
    plans.push(plan)
    writeCollection('plans', plans)

    const allExercises = readCollection<PlanExercise>('planExercises')
    writeCollection('planExercises', [...allExercises, ...buildExercisesFor(plan.id, challenge.days)])

    return plan
  }

  async listUserPlans(userId: string): Promise<Plan[]> {
    await delay(120)
    return readCollection<Plan>('plans')
      .filter((p) => p.userId === userId)
      .sort((a, b) => a.order - b.order)
  }

  async startNextChallenge(userId: string, currentChallengeId: string): Promise<Plan> {
    await delay(300)
    const next = getNextChallenge(currentChallengeId)
    const plans = readCollection<Plan>('plans')

    const plan: Plan = {
      id: generateId('plan'),
      userId,
      challengeId: next.id,
      order: next.order,
      goal: next.title,
      totalDays: next.days,
      currentDay: 1,
      startedAt: new Date().toISOString(),
      completedAt: null,
      status: 'active',
    }
    plans.push(plan)
    writeCollection('plans', plans)

    const allExercises = readCollection<PlanExercise>('planExercises')
    writeCollection('planExercises', [...allExercises, ...buildExercisesFor(plan.id, next.days)])

    return plan
  }

  async listPlanExercises(planId: string): Promise<PlanExercise[]> {
    await delay(150)
    return readCollection<PlanExercise>('planExercises')
      .filter((e) => e.planId === planId)
      .sort((a, b) => a.day - b.day)
  }

  // Avança o desafio em um dia (chamado quando a pessoa faz o input do diário).
  // Ao alcançar o total de dias, marca o desafio como concluído.
  async advanceChallengeDay(planId: string): Promise<Plan> {
    await delay(250)
    const plans = readCollection<Plan>('plans')
    const planIndex = plans.findIndex((p) => p.id === planId)
    if (planIndex === -1) throw new Error('plan_not_found')
    const plan = plans[planIndex]
    if (plan.status !== 'active') return plan

    const now = new Date().toISOString()
    const reachedEnd = plan.currentDay >= plan.totalDays
    const updatedPlan: Plan = reachedEnd
      ? { ...plan, status: 'completed', completedAt: now }
      : { ...plan, currentDay: plan.currentDay + 1 }

    plans[planIndex] = updatedPlan
    writeCollection('plans', plans)
    return updatedPlan
  }

  // Marca como feito o exercício de respiração do dia atual (prática opcional,
  // não altera o progresso do desafio, que vem do diário).
  async markExerciseDone(planId: string): Promise<PlanExercise | null> {
    await delay(200)
    const plans = readCollection<Plan>('plans')
    const plan = plans.find((p) => p.id === planId)
    if (!plan) return null

    const planExercises = readCollection<PlanExercise>('planExercises')
    const exerciseIndex = planExercises.findIndex((e) => e.planId === planId && e.day === plan.currentDay)
    if (exerciseIndex === -1) return null

    planExercises[exerciseIndex] = { ...planExercises[exerciseIndex], completed: true, completedAt: new Date().toISOString() }
    writeCollection('planExercises', planExercises)
    return planExercises[exerciseIndex]
  }

  async pickExercise(userId: string, channel: 'home' | 'coach'): Promise<string> {
    await delay(120)
    type Shown = { userId: string; exerciseId: string; date: string; channel: 'home' | 'coach' }
    const log = readCollection<Shown>('shownExercises').filter((s) => s.userId === userId)

    const today = new Date().toISOString().slice(0, 10)
    const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10)

    const shownThisWeek = new Set(log.filter((s) => s.date > weekAgo).map((s) => s.exerciseId))
    const shownTodayAnyChannel = new Set(log.filter((s) => s.date === today).map((s) => s.exerciseId))

    const allIds = exercises.map((e) => e.id)
    // 1ª escolha: nem mostrado na semana, nem hoje (em qualquer canal).
    let pool = allIds.filter((id) => !shownThisWeek.has(id) && !shownTodayAnyChannel.has(id))
    // Se esgotou a semana, relaxa: basta não ter aparecido hoje (em nenhum canal).
    if (pool.length === 0) pool = allIds.filter((id) => !shownTodayAnyChannel.has(id))
    // Último recurso: qualquer um (catálogo todo já apareceu hoje, caso raríssimo).
    if (pool.length === 0) pool = allIds

    const chosen = pool[Math.floor(Math.random() * pool.length)]

    const fullLog = readCollection<Shown>('shownExercises')
    fullLog.push({ userId, exerciseId: chosen, date: today, channel })
    // Mantém o log enxuto: só os registros dos últimos ~30 dias.
    const cutoff = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10)
    writeCollection(
      'shownExercises',
      fullLog.filter((s) => s.date >= cutoff),
    )

    return chosen
  }

  async listInsights(userId: string): Promise<Insight[]> {
    await delay(150)
    return readCollection<Insight>('insights').filter((i) => i.userId === userId)
  }

  async addInsight(insight: Omit<Insight, 'id' | 'createdAt'>): Promise<Insight> {
    await delay(150)
    const full: Insight = { ...insight, id: generateId('insight'), createdAt: new Date().toISOString() }
    const all = readCollection<Insight>('insights')
    all.push(full)
    writeCollection('insights', all)
    return full
  }

  async listBadges(userId: string): Promise<Badge[]> {
    await delay(100)
    return readCollection<Badge>('badges').filter((b) => b.userId === userId)
  }

  async awardBadgeIfNew(userId: string, name: string, description: string): Promise<Badge | null> {
    const all = readCollection<Badge>('badges')
    if (all.some((b) => b.userId === userId && b.name === name)) return null
    const badge: Badge = { id: generateId('badge'), userId, name, description, earnedAt: new Date().toISOString() }
    all.push(badge)
    writeCollection('badges', all)
    return badge
  }

  async deleteAllData(): Promise<void> {
    await delay(300)
    // Apaga apenas o CONTEÚDO do usuário (diário, conversas, plano, progresso,
    // conquistas, memória da IA). Preserva 'currentUser' e 'subscription': a
    // pessoa continua logada e com a assinatura ativa — a cobrança vive na
    // loja/gateway, não aqui, então excluir dados não cancela o plano.
    removeCollections([
      'journalEntries',
      'chatMessages',
      'plans',
      'planExercises',
      'shownExercises',
      'insights',
      'badges',
      'evolutionSummaryShown',
    ])
  }
}

export function calculateStreakDays(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0
  const days = [...new Set(entries.map((e) => e.createdAt.slice(0, 10)))].sort((a, b) => b.localeCompare(a))
  let streak = 1
  for (let i = 0; i < days.length - 1; i += 1) {
    const current = new Date(days[i])
    const previous = new Date(days[i + 1])
    const diffDays = Math.round((current.getTime() - previous.getTime()) / 86_400_000)
    if (diffDays === 1) streak += 1
    else break
  }
  const today = new Date().toISOString().slice(0, 10)
  if (!isSameDay(days[0], today)) return 0
  return streak
}

export const mockStorageService = new MockStorageService()
