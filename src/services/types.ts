import type {
  AIChatMessage,
  AuthProvider,
  Badge,
  GoalId,
  Insight,
  JournalEntry,
  MoodId,
  Plan,
  PlanExercise,
  Subscription,
  SubscriptionPlanType,
  User,
} from '../types'
import type { LifeStage } from '../lib/lifeStage'

// Contratos de serviço. Cada um tem hoje uma implementação mock (services/mock*.ts)
// e pode ser substituído por uma implementação real (Firebase, OpenAI, Stripe) sem
// tocar em telas ou no estado da aplicação — só troca o que é instanciado em services/index.ts.

export interface AuthResult {
  user: User
}

export interface AuthService {
  getCurrentUser(): Promise<User | null>
  signInWithGoogle(): Promise<AuthResult>
  signInWithApple(): Promise<AuthResult>
  signInWithEmail(email: string): Promise<AuthResult>
  signOut(): Promise<void>
  updateProfile(
    userId: string,
    patch: Partial<Pick<User, 'name' | 'age' | 'status' | 'goal' | 'email' | 'subscriptionPlan' | 'subscriptionStatus'>>,
  ): Promise<User>
}

export type SaveOutcome = 'synced' | 'savedLocally'

export interface StorageService {
  getUser(userId: string): Promise<User | null>
  addJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt'>): Promise<{ entry: JournalEntry; outcome: SaveOutcome }>
  listJournalEntries(userId: string): Promise<JournalEntry[]>
  markActivityDone(entryId: string): Promise<JournalEntry | null>
  /** Atualiza o humor de um registro existente (ex.: usuário muda o humor no mesmo dia). */
  updateEntryMood(entryId: string, mood: MoodId): Promise<JournalEntry | null>
  /** Apenas para demonstração: popula dias passados para a tela de evolução ter o que mostrar. */
  seedDemoJournal(userId: string): Promise<JournalEntry[]>
  /** Apenas para desenvolvimento: adiciona um registro datado no dia seguinte ao último, para testar o gráfico dia a dia. */
  addDevDayEntry(userId: string): Promise<JournalEntry>
  addChatMessage(message: Omit<AIChatMessage, 'id' | 'createdAt'>): Promise<AIChatMessage>
  listChatMessages(userId: string): Promise<AIChatMessage[]>
  getOrCreatePlan(userId: string, goal: GoalId): Promise<Plan>
  listUserPlans(userId: string): Promise<Plan[]>
  startNextChallenge(userId: string, currentChallengeId: string): Promise<Plan>
  listPlanExercises(planId: string): Promise<PlanExercise[]>
  advanceChallengeDay(planId: string): Promise<Plan>
  markExerciseDone(planId: string): Promise<PlanExercise | null>
  // Sorteia um exercício para o canal pedido ('home' = botão Exercício do dia,
  // 'coach' = IA Coach), evitando repetir na mesma semana e evitando repetir,
  // no mesmo dia, o que já apareceu no outro canal. Devolve o id do exercício.
  pickExercise(userId: string, channel: 'home' | 'coach'): Promise<string>
  listInsights(userId: string): Promise<Insight[]>
  addInsight(insight: Omit<Insight, 'id' | 'createdAt'>): Promise<Insight>
  listBadges(userId: string): Promise<Badge[]>
  awardBadgeIfNew(userId: string, name: string, description: string): Promise<Badge | null>
  /** Apaga permanentemente todos os dados do usuário (diário, conversas, plano, perfil). Irreversível. */
  deleteAllData(): Promise<void>
}

export interface AIReplyRequest {
  userName: string
  mood: MoodId
  anxietyLevel: number
  journalText: string
  history: AIChatMessage[]
  userMessage: string
  // Desafio que a pessoa está fazendo agora, para a IA focar as respostas no tema.
  challengeId: string | null
  // Momento de vida (derivado do estado civil), para a IA ajustar o tom de
  // bem-estar: solteiro, comprometido ou em superação.
  lifeStage: LifeStage
}

export interface PositiveReflectionRequest {
  userName: string
  goal: GoalId | null
  mood: MoodId
  anxietyLevel: number
  journalText: string
}

export interface EvolutionSummaryPoint {
  date: string // YYYY-MM-DD
  moodScore: number // 1 a 5
  anxietyLevel: number // 1 a 10
}

export interface AIService {
  greetingForMood(userName: string, mood: MoodId, anxietyLevel: number): string
  reply(request: AIReplyRequest): Promise<{ text: string; exerciseSuggested: string | null }>
  // Gera uma reflexão curta e acolhedora (3–4 parágrafos) a partir do que a
  // pessoa escreveu naquele dia, para os dias críticos da tela de evolução.
  positiveReflection(request: PositiveReflectionRequest): Promise<{ paragraphs: string[] }>
  // Resumo curto (até 2 linhas) interpretando a evolução de humor e ansiedade
  // ao longo dos dias, em linguagem neutra de gênero, para a tela de Evolução.
  evolutionSummary(points: EvolutionSummaryPoint[]): Promise<{ text: string }>
}

export interface CardDetails {
  number: string
  expiry: string
  cvv: string
}

export interface PaymentResult {
  subscription: Subscription
}

export class PaymentError extends Error {
  code: 'card_declined' | 'invalid_number' | 'invalid_expiry' | 'invalid_cvv' | 'network_error'
  constructor(code: PaymentError['code'], message: string) {
    super(message)
    this.code = code
  }
}

export interface PaymentService {
  charge(userId: string, planType: SubscriptionPlanType, card: CardDetails): Promise<PaymentResult>
  // Upgrade para o plano de fidelização reusando o cartão já salvo (1 clique),
  // como faria uma oferta de retenção real. Devolve a nova assinatura.
  upgradeToLoyalty(userId: string): Promise<PaymentResult>
  getSubscription(userId: string): Promise<Subscription | null>
  cancel(userId: string): Promise<Subscription | null>
}

export interface EmailPreview {
  to: string
  subject: string
  body: string
  sentAt: string
}

export interface NotificationService {
  isEnabled(): Promise<boolean>
  setEnabled(enabled: boolean): Promise<void>
  getDailyReminderPreview(user: User): Promise<EmailPreview>
}
