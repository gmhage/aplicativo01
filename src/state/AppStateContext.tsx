import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import copy from '../i18n/pt-BR'
import {
  aiService,
  authService,
  calculateStreakDays,
  paymentService,
  PaymentError,
  storageService,
} from '../services'
import { consumeCrashFlag } from '../services/crashTracker'
import type { CardDetails, EvolutionSummaryPoint } from '../services'
import { formatExerciseForChat, getExerciseById, type Exercise } from '../lib/exercises'
import { lifeStageFromStatus } from '../lib/lifeStage'
import type {
  AIChatMessage,
  GoalId,
  JournalEntry,
  MoodId,
  Plan,
  PlanExercise,
  Subscription,
  SubscriptionPlanType,
  SyncBannerState,
  User,
} from '../types'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

export type View =
  | 'welcome'
  | 'auth'
  | 'profile'
  | 'goal'
  | 'subscription'
  | 'dashboard'
  | 'journal'
  | 'aiCoach'
  | 'evolution'
  | 'exercise'
  | 'settings'

interface AppState {
  view: View
  bootstrapping: boolean
  isOnline: boolean
  user: User | null
  mood: MoodId
  journalEntries: JournalEntry[]
  chatMessages: AIChatMessage[]
  chatPending: boolean
  plan: Plan | null
  planExercises: PlanExercise[]
  activeExercise: Exercise | null
  completedChallengeCount: number
  justCompletedChallenge: Plan | null
  subscription: Subscription | null
  banner: SyncBannerState | null
  streakDays: number
}

interface AppActions {
  navigate: (view: View) => void
  continueWithGoogle: () => Promise<void>
  continueWithApple: () => Promise<void>
  continueWithEmail: (email: string) => Promise<void>
  saveProfile: (patch: { name: string; age: number; status: string }) => Promise<void>
  updateRelationshipStatus: (status: string) => Promise<void>
  updateEmail: (email: string) => Promise<void>
  chooseGoal: (goal: GoalId) => Promise<void>
  subscribe: (planType: SubscriptionPlanType, card: CardDetails) => Promise<void>
  upgradeToLoyalty: () => Promise<void>
  setMood: (mood: MoodId) => void
  submitJournal: (text: string, anxietyLevel: number, activityDone: boolean) => Promise<void>
  sendChatMessage: (text: string) => Promise<void>
  completeExercise: () => Promise<void>
  openExerciseOfTheDay: () => Promise<void>
  startNextChallenge: () => Promise<void>
  devCompleteChallenge: () => Promise<void>
  devAdvanceOneDay: () => Promise<void>
  devAddEvolutionDay: () => Promise<void>
  dismissChallengeComplete: () => void
  requestReflection: (entry: JournalEntry) => Promise<string[]>
  requestEvolutionSummary: (points: EvolutionSummaryPoint[]) => Promise<string>
  markActivityDone: (entryId: string) => Promise<void>
  seedDemoData: () => Promise<void>
  cancelSubscription: () => Promise<void>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
  dismissBanner: () => void
}

const AppStateContext = createContext<(AppState & AppActions) | null>(null)

function resumeView(user: User): View {
  if (!user.name) return 'profile'
  if (!user.goal) return 'goal'
  if (user.subscriptionStatus !== 'active') return 'subscription'
  return 'dashboard'
}

// Só o primeiro nome para as falas da IA — tratar por nome completo ("Maria da
// Silva") soa formal/burocrático; o primeiro nome é mais íntimo e acolhedor.
function firstName(name?: string | null): string {
  return name?.trim().split(/\s+/)[0] ?? ''
}

function todayMoodKey(userId: string) {
  return `soulspace:todayMood:${userId}`
}

function loadTodayMood(userId: string): MoodId {
  try {
    const raw = localStorage.getItem(todayMoodKey(userId))
    if (!raw) return 'neutral'
    const parsed = JSON.parse(raw) as { date: string; mood: MoodId }
    const today = new Date().toISOString().slice(0, 10)
    return parsed.date === today ? parsed.mood : 'neutral'
  } catch {
    return 'neutral'
  }
}

function storeTodayMood(userId: string, mood: MoodId) {
  try {
    localStorage.setItem(todayMoodKey(userId), JSON.stringify({ date: new Date().toISOString().slice(0, 10), mood }))
  } catch {
    // sessão atual segue funcionando mesmo sem persistir
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>('welcome')
  const [bootstrapping, setBootstrapping] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [mood, setMoodState] = useState<MoodId>('neutral')
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([])
  const [chatPending, setChatPending] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [planExercises, setPlanExercises] = useState<PlanExercise[]>([])
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null)
  const [completedChallengeCount, setCompletedChallengeCount] = useState(0)
  const [justCompletedChallenge, setJustCompletedChallenge] = useState<Plan | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [banner, setBanner] = useState<SyncBannerState | null>(null)
  const [streakDays, setStreakDays] = useState(0)

  const isOnline = useOnlineStatus()
  const wasOffline = useRef(false)

  const showBanner = useCallback((kind: SyncBannerState['kind'], text: string) => {
    setBanner({ id: `${Date.now()}`, kind, text })
  }, [])

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true
      showBanner('info', copy.banners.offline)
    } else if (wasOffline.current) {
      wasOffline.current = false
      showBanner('success', copy.banners.backOnline)
      const timer = setTimeout(() => setBanner((current) => (current?.text === copy.banners.backOnline ? null : current)), 4000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, showBanner])

  const loadUserData = useCallback(async (loadedUser: User) => {
    const [entries, messages, sub] = await Promise.all([
      storageService.listJournalEntries(loadedUser.id),
      storageService.listChatMessages(loadedUser.id),
      paymentService.getSubscription(loadedUser.id),
    ])
    setJournalEntries(entries)
    setChatMessages(messages)
    setSubscription(sub)
    setStreakDays(calculateStreakDays(entries))
    setMoodState(loadTodayMood(loadedUser.id))

    if (loadedUser.goal) {
      const userPlan = await storageService.getOrCreatePlan(loadedUser.id, loadedUser.goal)
      const exercises = await storageService.listPlanExercises(userPlan.id)
      const allPlans = await storageService.listUserPlans(loadedUser.id)
      setPlan(userPlan)
      setPlanExercises(exercises)
      setCompletedChallengeCount(allPlans.filter((p) => p.status === 'completed').length)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const hadCrash = consumeCrashFlag()
      try {
        const existing = await authService.getCurrentUser()
        if (existing && isMounted) {
          setUser(existing)
          await loadUserData(existing)
          setView(resumeView(existing))
          if (hadCrash) {
            showBanner('info', copy.banners.appRestored)
            setTimeout(() => setBanner((current) => (current?.text === copy.banners.appRestored ? null : current)), 3500)
          }
        }
      } catch {
        // sem sessão anterior válida — fica na tela de boas-vindas
      } finally {
        if (isMounted) setBootstrapping(false)
      }
    })()
    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const navigate = useCallback((next: View) => setView(next), [])
  const dismissBanner = useCallback(() => setBanner(null), [])

  const continueWithGoogle = useCallback(async () => {
    try {
      const { user: signedIn } = await authService.signInWithGoogle()
      setUser(signedIn)
      await loadUserData(signedIn)
      setView(resumeView(signedIn))
    } catch {
      showBanner('error', copy.auth.socialError)
    }
  }, [loadUserData, showBanner])

  const continueWithApple = useCallback(async () => {
    try {
      const { user: signedIn } = await authService.signInWithApple()
      setUser(signedIn)
      await loadUserData(signedIn)
      setView(resumeView(signedIn))
    } catch {
      showBanner('error', copy.auth.socialError)
    }
  }, [loadUserData, showBanner])

  const continueWithEmail = useCallback(
    async (email: string) => {
      const { user: signedIn } = await authService.signInWithEmail(email)
      setUser(signedIn)
      await loadUserData(signedIn)
      setView(resumeView(signedIn))
    },
    [loadUserData],
  )

  const saveProfile = useCallback(
    async (patch: { name: string; age: number; status: string }) => {
      if (!user) return
      const updated = await authService.updateProfile(user.id, patch)
      setUser(updated)
      setView(resumeView(updated))
    },
    [user],
  )

  // Atualiza só o estado civil (a partir das Configurações), sem navegar para
  // fora da tela. O status pode mudar ao longo do uso e ajusta os lembretes.
  const updateRelationshipStatus = useCallback(
    async (status: string) => {
      if (!user) return
      const updated = await authService.updateProfile(user.id, { status })
      setUser(updated)
    },
    [user],
  )

  // Atualiza o e-mail (a partir das Configurações). É por onde a pessoa recebe
  // dicas e avisos da assinatura, então pode mudar ao longo do tempo.
  const updateEmail = useCallback(
    async (email: string) => {
      if (!user) return
      const updated = await authService.updateProfile(user.id, { email: email.trim() })
      setUser(updated)
    },
    [user],
  )

  const chooseGoal = useCallback(
    async (goal: GoalId) => {
      if (!user) return
      const updated = await authService.updateProfile(user.id, { goal })
      setUser(updated)
      const userPlan = await storageService.getOrCreatePlan(updated.id, goal)
      const exercises = await storageService.listPlanExercises(userPlan.id)
      setPlan(userPlan)
      setPlanExercises(exercises)
      setView('subscription')
    },
    [user],
  )

  const subscribe = useCallback(
    async (planType: SubscriptionPlanType, card: CardDetails) => {
      if (!user) return
      const { subscription: newSubscription } = await paymentService.charge(user.id, planType, card)
      const updated = await authService.updateProfile(user.id, { subscriptionPlan: planType, subscriptionStatus: 'active' })
      setUser(updated)
      setSubscription(newSubscription)
      setView('dashboard')
    },
    [user],
  )

  // Upgrade para o plano de fidelização (12 meses) em 1 clique, reusando o
  // cartão salvo. Usado pela oferta de retenção.
  const upgradeToLoyalty = useCallback(async () => {
    if (!user) return
    const { subscription: newSubscription } = await paymentService.upgradeToLoyalty(user.id)
    const updated = await authService.updateProfile(user.id, { subscriptionPlan: 'loyalty', subscriptionStatus: 'active' })
    setUser(updated)
    setSubscription(newSubscription)
  }, [user])

  const setMood = useCallback(
    (next: MoodId) => {
      setMoodState(next)
      if (!user) return
      storeTodayMood(user.id, next)

      // Se já existe um registro de diário hoje, sincroniza o humor dele com o
      // seletor — assim o gráfico de evolução reflete a mudança no mesmo dia.
      // (Sem registro de hoje, o dia entra no gráfico só quando a pessoa
      // escrever o diário, que já usará o humor atual.)
      const today = new Date().toISOString().slice(0, 10)
      const todayEntry = journalEntries.find((e) => e.createdAt.slice(0, 10) === today)
      if (todayEntry && todayEntry.mood !== next) {
        setJournalEntries((current) =>
          current.map((e) => (e.id === todayEntry.id ? { ...e, mood: next } : e)),
        )
        void storageService.updateEntryMood(todayEntry.id, next)
      }
    },
    [user, journalEntries],
  )

  const submitJournal = useCallback(
    async (text: string, anxietyLevel: number, activityDone: boolean) => {
      if (!user) return
      const alreadyJournaledToday = journalEntries.some((e) => e.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10))

      const { entry, outcome } = await storageService.addJournalEntry({
        userId: user.id,
        mood,
        text,
        anxietyLevel,
        activityDone,
      })
      const updatedEntries = [entry, ...journalEntries]
      setJournalEntries(updatedEntries)
      setStreakDays(calculateStreakDays(updatedEntries))
      showBanner(outcome === 'synced' ? 'success' : 'warning', outcome === 'synced' ? copy.journal.savedSynced : copy.journal.savedOffline)

      // O registro do diário é o "input" da ofensiva: o primeiro do dia avança
      // o desafio em um dia. Ao chegar a 21, o desafio é concluído.
      if (plan && plan.status === 'active' && !alreadyJournaledToday) {
        const updatedPlan = await storageService.advanceChallengeDay(plan.id)
        setPlan(updatedPlan)
        if (updatedPlan.status === 'completed') {
          setJustCompletedChallenge(updatedPlan)
          setCompletedChallengeCount((count) => count + 1)
          await storageService.awardBadgeIfNew(
            user.id,
            `Desafio: ${updatedPlan.goal}`,
            `Você completou os 21 dias do desafio "${updatedPlan.goal}".`,
          )
        }
      }

      if (anxietyLevel >= 6) {
        const proactive = await storageService.addChatMessage({
          userId: user.id,
          messageFrom: 'ai',
          text: aiService.greetingForMood(firstName(user.name), mood, anxietyLevel),
          exerciseSuggested: 'Respiração 4-4-6 (30s)',
        })
        setChatMessages((current) => [...current, proactive])
      }
    },
    [user, mood, journalEntries, plan, showBanner],
  )

  const sendChatMessage = useCallback(
    async (text: string) => {
      if (!user) return
      if (!isOnline) {
        showBanner('error', copy.aiCoach.offlineMessage)
        return
      }
      const userMessage = await storageService.addChatMessage({
        userId: user.id,
        messageFrom: 'user',
        text,
        exerciseSuggested: null,
      })
      setChatMessages((current) => [...current, userMessage])
      setChatPending(true)

      // Pedido de exercício físico: sorteia do catálogo compartilhado (canal
      // 'coach'), que evita repetir o que apareceu hoje no "Exercício do dia".
      const wantsExercise = /exerc[íi]cio f[íi]sic|atividade f[íi]sic|sugira um exerc|me movimentar|exerc[íi]cio leve|caminh|alonga|agacha|pedal/.test(
        text.toLowerCase(),
      )
      if (wantsExercise) {
        const exId = await storageService.pickExercise(user.id, 'coach')
        const ex = getExerciseById(exId)
        if (ex) {
          const aiMessage = await storageService.addChatMessage({
            userId: user.id,
            messageFrom: 'ai',
            text: formatExerciseForChat(ex, firstName(user.name)),
            exerciseSuggested: ex.title,
          })
          setChatMessages((current) => [...current, aiMessage])
          setChatPending(false)
          return
        }
      }

      const latestAnxiety = journalEntries[0]?.anxietyLevel ?? 4
      let reply: { text: string; exerciseSuggested: string | null } | null = null
      for (let attempt = 0; attempt < 3 && !reply; attempt += 1) {
        try {
          reply = await aiService.reply({
            userName: firstName(user.name),
            mood,
            anxietyLevel: latestAnxiety,
            journalText: journalEntries[0]?.text ?? '',
            history: chatMessages,
            userMessage: text,
            challengeId: plan?.challengeId ?? null,
            lifeStage: lifeStageFromStatus(user.status),
          })
        } catch {
          if (attempt === 0) showBanner('info', copy.aiCoach.timeoutMessage)
        }
      }

      if (reply) {
        const aiMessage = await storageService.addChatMessage({
          userId: user.id,
          messageFrom: 'ai',
          text: reply.text,
          exerciseSuggested: reply.exerciseSuggested,
        })
        setChatMessages((current) => [...current, aiMessage])
      } else {
        const fallback = await storageService.addChatMessage({
          userId: user.id,
          messageFrom: 'ai',
          text: copy.aiCoach.supportFallback(copy.settings.helpEmail),
          exerciseSuggested: null,
        })
        setChatMessages((current) => [...current, fallback])
        showBanner('error', copy.aiCoach.unavailableMessage)
      }
      setChatPending(false)
    },
    [user, isOnline, mood, journalEntries, chatMessages, plan, showBanner],
  )

  const completeExercise = useCallback(async () => {
    if (plan) {
      const exercise = await storageService.markExerciseDone(plan.id)
      if (exercise) {
        setPlanExercises((current) => current.map((item) => (item.id === exercise.id ? exercise : item)))
      }
    }

    // Concluir o exercício também conta como "atividade física de hoje": marca o
    // registro de hoje no diário, para que o gráfico de evolução pare de dizer
    // "você não registrou atividade nesse dia". Só atualiza se já houver um
    // registro de hoje (sem ele, o dia ainda não aparece no gráfico).
    const today = new Date().toISOString().slice(0, 10)
    const todayEntry = journalEntries.find((e) => e.createdAt.slice(0, 10) === today)
    if (todayEntry && !todayEntry.activityDone) {
      const updated = await storageService.markActivityDone(todayEntry.id)
      if (updated) {
        setJournalEntries((current) => current.map((e) => (e.id === updated.id ? updated : e)))
      }
    }
  }, [plan, journalEntries])

  // Sorteia o "Exercício do dia" (canal home), respeitando as regras de não
  // repetir na semana / entre canais no mesmo dia, e abre a tela do exercício.
  const openExerciseOfTheDay = useCallback(async () => {
    if (!user) return
    const id = await storageService.pickExercise(user.id, 'home')
    setActiveExercise(getExerciseById(id) ?? null)
    setView('exercise')
  }, [user])

  const startNextChallenge = useCallback(async () => {
    if (!user || !plan) return
    const next = await storageService.startNextChallenge(user.id, plan.challengeId)
    const exercises = await storageService.listPlanExercises(next.id)
    setPlan(next)
    setPlanExercises(exercises)
    setJustCompletedChallenge(null)
  }, [user, plan])

  // Apenas para demonstração: avança o desafio até o fim para ver a tela de
  // conclusão sem registrar todos os dias. Só usado pelo botão dev do Dashboard.
  const devCompleteChallenge = useCallback(async () => {
    if (!user || !plan || plan.status !== 'active') return
    let current = plan
    while (current.status === 'active') {
      current = await storageService.advanceChallengeDay(current.id)
    }
    setPlan(current)
    setJustCompletedChallenge(current)
    setCompletedChallengeCount((count) => count + 1)
  }, [user, plan])

  // Apenas para demonstração: avança um único dia no desafio (sem precisar
  // registrar o diário), para ver a barra de progresso e a ofensiva mexerem.
  const devAdvanceOneDay = useCallback(async () => {
    if (!user || !plan || plan.status !== 'active') return
    const updated = await storageService.advanceChallengeDay(plan.id)
    setPlan(updated)
    if (updated.status === 'completed') {
      setJustCompletedChallenge(updated)
      setCompletedChallengeCount((count) => count + 1)
    }
  }, [user, plan])

  // Apenas para desenvolvimento: adiciona um registro de diário datado no dia
  // seguinte ao último, para testar o gráfico de evolução dia a dia sem ter de
  // esperar virar o dia. Só usado pelo botão dev da tela de Evolução.
  const devAddEvolutionDay = useCallback(async () => {
    if (!user) return
    const entry = await storageService.addDevDayEntry(user.id)
    const merged = [entry, ...journalEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    setJournalEntries(merged)
    setStreakDays(calculateStreakDays(merged))
  }, [user, journalEntries])

  const dismissChallengeComplete = useCallback(() => setJustCompletedChallenge(null), [])

  const requestReflection = useCallback(
    async (entry: JournalEntry): Promise<string[]> => {
      const { paragraphs } = await aiService.positiveReflection({
        userName: firstName(user?.name),
        goal: user?.goal ?? null,
        mood: entry.mood,
        anxietyLevel: entry.anxietyLevel,
        journalText: entry.text,
      })
      return paragraphs
    },
    [user],
  )

  const requestEvolutionSummary = useCallback(
    async (points: EvolutionSummaryPoint[]): Promise<string> => {
      const { text } = await aiService.evolutionSummary(points)
      return text
    },
    [],
  )

  const markActivityDone = useCallback(async (entryId: string) => {
    const updated = await storageService.markActivityDone(entryId)
    if (updated) {
      setJournalEntries((current) => current.map((e) => (e.id === entryId ? updated : e)))
      showBanner('success', copy.evolution.activityLogged)
    }
  }, [showBanner])

  const seedDemoData = useCallback(async () => {
    if (!user) return
    const seeded = await storageService.seedDemoJournal(user.id)
    const merged = [...seeded, ...journalEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    setJournalEntries(merged)
    setStreakDays(calculateStreakDays(merged))
  }, [user, journalEntries])

  const cancelSubscription = useCallback(async () => {
    if (!user) return
    const updated = await paymentService.cancel(user.id)
    setSubscription(updated)
    if (updated) {
      const updatedUser = await authService.updateProfile(user.id, { subscriptionStatus: 'cancelled' })
      setUser(updatedUser)
    }
  }, [user])

  // Zera todo o estado em memória e volta para a tela inicial. Usado tanto pelo
  // "Sair" quanto pela exclusão de conta.
  const resetToWelcome = useCallback(() => {
    setUser(null)
    setJournalEntries([])
    setChatMessages([])
    setPlan(null)
    setPlanExercises([])
    setActiveExercise(null)
    setCompletedChallengeCount(0)
    setJustCompletedChallenge(null)
    setSubscription(null)
    setMoodState('neutral')
    setStreakDays(0)
    setView('welcome')
  }, [])

  const signOut = useCallback(async () => {
    await authService.signOut()
    resetToWelcome()
  }, [resetToWelcome])

  // Exclusão de dados: apaga diário, conversas, plano e progresso de forma
  // permanente, mas PRESERVA o perfil e a assinatura. A pessoa continua logada e
  // paga — a cobrança vive na loja/gateway, então excluir dados não cancela o
  // plano (a tela avisa isso). Recarregamos os dados (agora zerados, com um plano
  // novo recriado) e voltamos ao dashboard, sem pedir login nem cartão de novo.
  const deleteAccount = useCallback(async () => {
    if (!user) return
    await storageService.deleteAllData()
    // Limpa o estado em memória do conteúdo apagado...
    setJournalEntries([])
    setChatMessages([])
    setPlan(null)
    setPlanExercises([])
    setActiveExercise(null)
    setCompletedChallengeCount(0)
    setJustCompletedChallenge(null)
    setStreakDays(0)
    setMoodState('neutral')
    // ...e recarrega a partir do usuário preservado (recria um plano limpo).
    await loadUserData(user)
    setView('dashboard')
    showBanner('success', copy.settings.deleteDone)
  }, [user, loadUserData, showBanner])

  const value = useMemo<AppState & AppActions>(
    () => ({
      view,
      bootstrapping,
      isOnline,
      user,
      mood,
      journalEntries,
      chatMessages,
      chatPending,
      plan,
      planExercises,
      activeExercise,
      completedChallengeCount,
      justCompletedChallenge,
      subscription,
      banner,
      streakDays,
      navigate,
      continueWithGoogle,
      continueWithApple,
      continueWithEmail,
      saveProfile,
      updateRelationshipStatus,
      updateEmail,
      chooseGoal,
      subscribe,
      upgradeToLoyalty,
      setMood,
      submitJournal,
      sendChatMessage,
      completeExercise,
      openExerciseOfTheDay,
      startNextChallenge,
      devCompleteChallenge,
      devAdvanceOneDay,
      devAddEvolutionDay,
      dismissChallengeComplete,
      requestReflection,
      requestEvolutionSummary,
      markActivityDone,
      seedDemoData,
      cancelSubscription,
      signOut,
      deleteAccount,
      dismissBanner,
    }),
    [
      view,
      bootstrapping,
      isOnline,
      user,
      mood,
      journalEntries,
      chatMessages,
      chatPending,
      plan,
      planExercises,
      activeExercise,
      completedChallengeCount,
      justCompletedChallenge,
      subscription,
      banner,
      streakDays,
      navigate,
      continueWithGoogle,
      continueWithApple,
      continueWithEmail,
      saveProfile,
      updateRelationshipStatus,
      updateEmail,
      chooseGoal,
      subscribe,
      upgradeToLoyalty,
      setMood,
      submitJournal,
      sendChatMessage,
      completeExercise,
      openExerciseOfTheDay,
      startNextChallenge,
      devCompleteChallenge,
      devAdvanceOneDay,
      devAddEvolutionDay,
      dismissChallengeComplete,
      requestReflection,
      requestEvolutionSummary,
      markActivityDone,
      seedDemoData,
      cancelSubscription,
      signOut,
      deleteAccount,
      dismissBanner,
    ],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState deve ser usado dentro de AppStateProvider')
  return ctx
}

export { PaymentError }
