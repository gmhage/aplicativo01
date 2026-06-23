import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Send, Sparkles } from 'lucide-react'
import { ChatBubble } from '../components/ui/ChatBubble'
import { Button } from '../components/ui/Button'
import copy from '../i18n/pt-BR'
import { PRACTICE_SCENARIOS, type PracticeScenario } from '../lib/practiceScenarios'
import { aiService } from '../services'
import { useAppState } from '../state/AppStateContext'

// ─────────────────────────────────────────────────────────────────────────────
// Treino de conversa do SoulSpace Conexão.
//
// Três passos numa tela: menu de cenários → conversa guiada no papel do cenário
// → feedback final. Usa aiService.practiceReply (a IA atua no papel) e
// practiceFeedback (análise no fim). Funciona com a IA real LIGADA (conversa de
// verdade) ou DESLIGADA (banco local simulado, custo zero) — mesma interface.
// ─────────────────────────────────────────────────────────────────────────────

type Step = 'menu' | 'chat' | 'feedback'
type Msg = { id: string; from: 'user' | 'ai'; text: string }

function firstName(name: string | undefined): string {
  return (name ?? '').trim().split(/\s+/)[0] ?? ''
}

export function PracticeScreen() {
  const { user, navigate } = useAppState()
  const [step, setStep] = useState<Step>('menu')
  const [scenario, setScenario] = useState<PracticeScenario | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [pending, setPending] = useState(false)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pending, step])

  const startScenario = (s: PracticeScenario) => {
    setScenario(s)
    setMessages([{ id: `ai-open-${Date.now()}`, from: 'ai', text: s.opening }])
    setStep('chat')
  }

  const send = async (text: string) => {
    if (!text.trim() || !scenario || !user) return
    const userText = text.trim()
    setInput('')
    const historyForAI = messages.map((m) => ({ from: m.from, text: m.text }))
    setMessages((cur) => [...cur, { id: `u-${Date.now()}`, from: 'user', text: userText }])
    setPending(true)
    try {
      // A IA atua NO PAPEL do cenário. Com a IA ligada, é conversa real; com ela
      // desligada, cai no banco local (simulado). Mesma interface nos dois casos.
      const reply = await aiService.practiceReply({
        userName: firstName(user.name),
        scenarioTitle: scenario.title,
        scenarioRole: scenario.aiRole,
        history: historyForAI,
        userMessage: userText,
      })
      setMessages((cur) => [...cur, { id: `ai-${Date.now()}`, from: 'ai', text: reply.text }])
    } catch {
      setMessages((cur) => [
        ...cur,
        { id: `ai-err-${Date.now()}`, from: 'ai', text: copy.practice.feedbackOfflineMessage },
      ])
    } finally {
      setPending(false)
    }
  }

  const endTraining = () => {
    setStep('feedback')
    setFeedback('')
    if (!scenario || !user) return
    // Feedback do treino: a IA analisa a conversa (history). Com a IA desligada,
    // vem um retorno acolhedor padrão do banco local.
    void aiService
      .practiceFeedback({
        userName: firstName(user.name),
        scenarioTitle: scenario.title,
        scenarioRole: scenario.aiRole,
        history: messages.map((m) => ({ from: m.from, text: m.text })),
      })
      .then((r) => setFeedback(r.text))
      .catch(() => setFeedback(copy.practice.feedbackOfflineMessage))
  }

  const reset = () => {
    setScenario(null)
    setMessages([])
    setStep('menu')
  }

  // ── Passo: menu de cenários ────────────────────────────────────────────────
  if (step === 'menu') {
    return (
      <div className="flex flex-1 flex-col">
        <header className="relative mb-5 overflow-hidden rounded-[26px] px-6 pb-7 pt-5 shadow-aura">
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg,#10B981 0%,#6D28D9 52%,#FB5436 100%)' }}
          />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white ring-1 ring-white/20">
              <Sparkles size={12} strokeWidth={2.5} /> Conexão
            </span>
            <h1 className="mt-2.5 font-display text-[26px] font-semibold leading-tight text-white">
              {copy.practice.title}
            </h1>
          </div>
        </header>

        <p className="mb-4 text-[14px] leading-relaxed text-ink/70">{copy.practice.intro}</p>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-grape/60">
          {copy.practice.menuLabel}
        </p>

        <div className="space-y-3">
          {PRACTICE_SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => startScenario(s)}
              className="flex w-full items-center gap-3.5 rounded-[20px] border border-grape/10 bg-white p-4 text-left shadow-card transition-all hover:border-grape/30"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-grape/[0.07] text-[22px]">
                {s.emoji}
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-bold text-ink">{s.title}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-ink/60">{s.subtitle}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6">
          <Button variant="ghost" onClick={() => navigate('dashboard')}>
            {copy.practice.feedbackClose}
          </Button>
        </div>
      </div>
    )
  }

  // ── Passo: feedback ────────────────────────────────────────────────────────
  if (step === 'feedback') {
    return (
      <div className="flex flex-1 flex-col">
        <header className="relative mb-5 overflow-hidden rounded-[26px] px-6 pb-7 pt-5 shadow-aura">
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg,#10B981 0%,#6D28D9 52%,#FB5436 100%)' }}
          />
          <h1 className="relative font-display text-[24px] font-semibold leading-tight text-white">
            {copy.practice.feedbackTitle}
          </h1>
        </header>

        <div className="rounded-[22px] border border-grape/10 bg-white p-6 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-grape/55">
            {scenario?.title}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink/80">
            {feedback || copy.practice.feedbackLoading}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <Button onClick={reset}>{copy.practice.feedbackAgain}</Button>
          <Button variant="ghost" onClick={() => navigate('dashboard')}>
            {copy.practice.feedbackClose}
          </Button>
        </div>
      </div>
    )
  }

  // ── Passo: conversa ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col">
      <header className="relative mb-4 flex items-center gap-3 overflow-hidden rounded-[22px] px-5 py-4 shadow-aura">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg,#10B981 0%,#6D28D9 52%,#FB5436 100%)' }}
        />
        <button
          type="button"
          onClick={reset}
          aria-label={copy.practice.backToMenuCta}
          className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white"
        >
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
        <div className="relative min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/85">{copy.practice.title}</p>
          <p className="truncate text-[16px] font-bold text-white">
            {scenario?.emoji} {scenario?.title}
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {messages.map((m) => (
          <ChatBubble key={m.id} from={m.from} text={m.text} />
        ))}
        {pending && <ChatBubble from="ai" text="" pending />}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <Button variant="secondary" onClick={endTraining}>
          {copy.practice.endTrainingCta}
        </Button>
        <Button variant="ghost" fullWidth={false} className="flex-shrink-0" onClick={() => navigate('dashboard')}>
          {copy.practice.endTrainingNoFeedbackCta}
        </Button>
      </div>

      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          void send(input)
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={copy.practice.chatInputPlaceholder}
          className="flex-1 rounded-2xl border border-grape/15 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink/35 transition-colors focus:border-grape"
        />
        <button
          type="submit"
          aria-label={copy.practice.chatSendLabel}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_10px_22px_-10px_rgba(219,39,119,0.6)]"
          style={{ background: 'linear-gradient(120deg,#FB5436,#DB2777)' }}
        >
          <Send size={18} strokeWidth={2} />
        </button>
      </form>
    </div>
  )
}
