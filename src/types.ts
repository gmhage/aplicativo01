// Modelo de dados do SoulSpace — espelha as 8 entidades do Backend Schema do
// documento de requisitos. Em produção isso seria o schema do Firestore/Postgres;
// aqui cada entidade é uma interface TypeScript persistida pela camada de serviços mock.

export type MoodId = 'sad' | 'neutral' | 'happy' | 'veryHappy' | 'excited'

export type GoalId = 'lonely' | 'anxiety' | 'selfLove' | 'emotionalIntelligence'

// 'loyalty' = plano de fidelização de 12 meses em pagamento único (oferta de retenção).
export type SubscriptionPlanType = 'monthly' | 'annual' | 'loyalty'

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired'

export type AuthProvider = 'google' | 'apple' | 'email'

// 1. USER
export interface User {
  id: string
  email: string
  name: string
  age: number
  status: string
  goal: GoalId | null
  authProvider: AuthProvider
  createdAt: string
  subscriptionPlan: SubscriptionPlanType | null
  subscriptionStatus: SubscriptionStatus | null
}

// 2. JOURNAL_ENTRY
export interface JournalEntry {
  id: string
  userId: string
  mood: MoodId
  text: string
  anxietyLevel: number
  // Atividade física registrada no dia. Fica aqui (e não numa entidade nova)
  // porque o diário já é o registro diário da pessoa — ver AUDITORIA.md.
  activityDone: boolean
  createdAt: string
}

export type SelfCareActivityKind = 'walk' | 'bike' | 'breathing'

// 3. AI_CHAT_MESSAGE
export interface AIChatMessage {
  id: string
  userId: string
  messageFrom: 'user' | 'ai'
  text: string
  exerciseSuggested: string | null
  createdAt: string
}

// 4. PLAN
// Cada Plan é um desafio de 21 dias dentro da trilha (ver lib/challenges.ts).
// `challengeId` liga ao catálogo; `order` é a posição na trilha de 12.
export interface Plan {
  id: string
  userId: string
  challengeId: string
  order: number
  goal: string // título do desafio, legível
  totalDays: number
  currentDay: number
  startedAt: string
  completedAt: string | null
  status: 'active' | 'completed' | 'paused'
}

// 5. PLAN_EXERCISE
export interface PlanExercise {
  id: string
  planId: string
  day: number
  exerciseType: 'respiracao' | 'meditacao' | 'diario'
  durationSeconds: number
  completed: boolean
  completedAt: string | null
}

// 6. INSIGHT
export interface Insight {
  id: string
  userId: string
  text: string
  category: 'ansiedade' | 'humor' | 'padroes'
  createdAt: string
}

// 7. BADGE — estrutura leve (sem UI dedicada no MVP, ver AUDITORIA.md)
export interface Badge {
  id: string
  userId: string
  name: string
  description: string
  earnedAt: string
}

// 8. SUBSCRIPTION
export interface Subscription {
  id: string
  userId: string
  planType: SubscriptionPlanType
  price: number
  startDate: string
  endDate: string
  status: SubscriptionStatus
  stripeSubscriptionId: string
}

export interface SyncBannerState {
  id: string
  kind: 'info' | 'success' | 'error' | 'warning'
  text: string
}
