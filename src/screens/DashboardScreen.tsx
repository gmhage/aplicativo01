import { useEffect, useMemo, useState } from 'react'
import { BookHeart, MessageCircleHeart, RotateCcw, Sparkles, Trophy, Wind } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmojiMoodSelector } from '../components/ui/EmojiMoodSelector'
import { ProgressBar } from '../components/ui/ProgressBar'
import copy from '../i18n/pt-BR'
import { getChallengeById, getNextChallenge, TOTAL_CHALLENGES } from '../lib/challenges'
import { computeStreak } from '../lib/streak'
import { devExpireConexao, hasEverHadConexao, planTierOf, setPlanTier } from '../lib/planTier'
import { conexaoExpired, needsEssenciaRenewal } from '../lib/planAccess'
import { isCancelledButStillValid } from '../lib/dataRetention'
import {
  markUpsellAutoOpened,
  resetUpsellAutoOpen,
  shouldAutoOpenUpsell,
  shouldShowConexaoUpsell,
} from '../lib/upsellTrigger'
import { useAppState } from '../state/AppStateContext'

function isToday(isoDate: string): boolean {
  return isoDate.slice(0, 10) === new Date().toISOString().slice(0, 10)
}

export function DashboardScreen() {
  const {
    user,
    subscription,
    mood,
    setMood,
    navigate,
    plan,
    journalEntries,
    completedChallengeCount,
    justCompletedChallenge,
    startNextChallenge,
    devCompleteChallenge,
    devAdvanceOneDay,
    openExerciseOfTheDay,
  } = useAppState()

  const journaledToday = journalEntries.some((entry) => isToday(entry.createdAt))
  const streak = useMemo(() => computeStreak(journalEntries), [journalEntries])
  const hasConexao = planTierOf(user) === 'conexao'
  // Estados de plano (item: dois planos com vidas independentes).
  const needRenewEssencia = needsEssenciaRenewal(user, subscription)
  const isConexaoExpired = conexaoExpired(user)
  // Essência cancelado, porém ainda válido até o fim do período pago → mostra a
  // faixa "retomar" (o app segue funcionando, mas avisamos que foi cancelado).
  const essenciaCancelledValid = isCancelledButStillValid(subscription)
  // (apenas dev) força a exibição do botão para testar o gatilho sem ter que
  // envelhecer a conta. Não afeta produção (o controle só aparece em DEV).
  const [forceUpsell, setForceUpsell] = useState(false)
  // Quem tem o Conexão vê sempre o botão (é a função dele). Quem JÁ TEVE também
  // vê (como reassinatura). Quem nunca teve só vê após o gatilho de engajamento
  // (7 dias + evolução, ou 10 dias).
  const showPracticeButton =
    hasConexao || hasEverHadConexao(user) || forceUpsell || shouldShowConexaoUpsell(user, journalEntries)

  // Abertura automática da tela de upsell: 1ª vez quando o gatilho liga, depois
  // até 1x/semana em bom momento, no máximo 3 vezes (ver lib/upsellTrigger).
  useEffect(() => {
    if (hasConexao) return
    if (shouldAutoOpenUpsell(user, journalEntries, mood)) {
      markUpsellAutoOpened(user)
      navigate('connectionUpsell')
    }
    // Roda na entrada do dashboard; depende do usuário/registros/humor atuais.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Card de conclusão tem prioridade: ocupa a tela quando um desafio acabou.
  if (justCompletedChallenge) {
    const next = getNextChallenge(justCompletedChallenge.challengeId)
    // Concluiu o último desafio da trilha: o ciclo recomeça num "novo nível".
    const finishedWholeTrack = justCompletedChallenge.order >= TOTAL_CHALLENGES
    return (
      <div className="flex flex-1 flex-col">
        <Header title={`Parabéns, ${user?.name?.split(' ')[0] ?? 'você'}`} />
        <Card className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="animate-pop flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,#F5A524,#FB5436)] shadow-seal">
            <Trophy size={32} strokeWidth={2} className="text-white" />
          </div>
          <p className="mt-5 font-display text-[22px] font-semibold text-ink">
            {finishedWholeTrack ? copy.challenge.cycleCompleteTitle : copy.challenge.completeTitle}
          </p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink/65">
            {finishedWholeTrack ? copy.challenge.cycleCompleteBody : copy.challenge.completeBody(justCompletedChallenge.goal)}
          </p>

          <div className="mt-6 w-full rounded-2xl border border-grape/10 bg-grape/[0.04] p-4 text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-grape/55">
              {finishedWholeTrack ? copy.challenge.cycleNextLabel : copy.challenge.completeNextLabel}
            </p>
            <p className="mt-1 text-[15px] font-bold text-ink/85">{next.title}</p>
            <p className="mt-1 text-sm text-ink/60">{next.teaser}</p>
          </div>

          <div className="mt-6 w-full">
            <Button onClick={() => void startNextChallenge()}>
              {finishedWholeTrack ? copy.challenge.cycleStartCta : copy.challenge.completeStartCta}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const firstName = user?.name?.split(' ')[0] ?? 'você'
  const nextChallenge = plan ? getNextChallenge(plan.challengeId) : null
  const currentChallenge = plan ? getChallengeById(plan.challengeId) : null

  // Aviso de ofensiva: faltou 1–3 dias (salva) ou passou disso (zerou).
  const showGrace = streak.status === 'grace' && streak.daysSinceLast > 1
  const showReset = streak.status === 'reset'

  return (
    <div className="flex flex-1 flex-col">
      <Header title={`Olá, ${firstName}`} />

      {/* Essência não renovado, mas o app ainda roda graças ao Conexão (item 1+2):
          faixa avisando e levando à renovação do plano base. */}
      {needRenewEssencia && (
        <button
          type="button"
          onClick={() => navigate('subscription')}
          className="mb-4 flex w-full items-center justify-between rounded-[22px] px-6 py-5 text-left text-white shadow-aura transition-all hover:brightness-[1.05]"
          style={{ background: 'linear-gradient(120deg,#F5A524,#FB7A36)' }}
        >
          <span className="min-w-0">
            <span className="block text-[16px] font-bold">{copy.dashboard.renewEssenciaCta}</span>
            <span className="mt-0.5 block text-sm text-white/90">{copy.dashboard.renewEssenciaHint}</span>
          </span>
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
            <RotateCcw size={22} strokeWidth={2} />
          </span>
        </button>
      )}

      {/* Essência CANCELADO mas ainda dentro do período pago: avisa e convida a
          retomar. Os dados/acesso seguem até o período vencer. */}
      {!needRenewEssencia && essenciaCancelledValid && (
        <button
          type="button"
          onClick={() => navigate('subscription')}
          className="mb-4 flex w-full items-center justify-between rounded-[22px] px-6 py-5 text-left text-white shadow-aura transition-all hover:brightness-[1.05]"
          style={{ background: 'linear-gradient(120deg,#FB5436,#DB2777)' }}
        >
          <span className="min-w-0">
            <span className="block text-[16px] font-bold">{copy.dashboard.resumeCta}</span>
            <span className="mt-0.5 block text-sm text-white/85">
              {subscription?.endDate
                ? copy.dashboard.resumeHintWithDate(
                    new Date(subscription.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }),
                  )
                : copy.dashboard.resumeHint}
            </span>
          </span>
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
            <RotateCcw size={22} strokeWidth={2} />
          </span>
        </button>
      )}

      {(showGrace || showReset) && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {showReset ? copy.challenge.resetNotice : copy.challenge.graceWarning(streak.daysSinceLast, streak.count)}
        </div>
      )}

      <Card className="animate-rise" style={{ backgroundColor: 'var(--color-primary-soft)', borderColor: 'transparent' }}>
        <p className="text-[17px] font-bold leading-snug" style={{ color: 'var(--color-primary-strong)' }}>
          {copy.dashboard.welcome.heading(firstName)}
        </p>
        <div className="mt-2.5 space-y-2.5">
          {copy.dashboard.welcome.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-sm leading-relaxed text-ink/70">
              {paragraph}
            </p>
          ))}
        </div>
      </Card>

      <Card className="mt-4">
        <p className="text-[15px] font-semibold text-ink/75">{copy.dashboard.greeting(firstName)}</p>
        <div className="mt-5">
          <EmojiMoodSelector value={mood} onChange={setMood} />
        </div>
      </Card>

      <button
        type="button"
        onClick={() => navigate('journal')}
        className="aura-gradient mt-4 flex w-full items-center justify-between rounded-[22px] px-6 py-5 text-left text-white shadow-aura transition-all hover:brightness-[1.04]"
      >
        <span>
          <span className="block text-[16px] font-bold">{copy.dashboard.journalCta}</span>
          <span className="mt-0.5 block text-sm text-white/85">
            {journaledToday ? copy.challenge.inputDoneToday : copy.challenge.inputReminder}
          </span>
        </span>
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
          <BookHeart size={22} strokeWidth={2} />
        </span>
      </button>

      {/* Conexão: treino de conversa. Aparece só após o gatilho de engajamento
          (ou sempre, para quem já tem o plano). Quem tem entra no treino; quem
          não tem cai no upsell. Botão destacado, no gradiente da marca. */}
      {showPracticeButton && (
        <button
          type="button"
          // Conexão vigente → treino. Vencido (ou nunca teve) → upsell pra (re)assinar.
          onClick={() => navigate(hasConexao && !isConexaoExpired ? 'practice' : 'connectionUpsell')}
          className="mt-4 flex w-full items-center justify-between rounded-[22px] px-6 py-5 text-left text-white shadow-aura transition-all hover:brightness-[1.05]"
          style={{ background: 'linear-gradient(120deg,#10B981 0%,#6D28D9 52%,#FB5436 100%)' }}
        >
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="block text-[16px] font-bold">{copy.dashboard.practiceCta}</span>
              <span className="rounded-full bg-white/20 px-2 py-[2px] text-[10px] font-bold uppercase tracking-[0.1em] ring-1 ring-white/20">
                Conexão
              </span>
            </span>
            <span className="mt-0.5 block text-sm text-white/85">
              {isConexaoExpired ? copy.dashboard.practiceCtaExpired : copy.dashboard.practiceCtaHint}
            </span>
          </span>
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
            <Sparkles size={22} strokeWidth={2} />
          </span>
        </button>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => void openExerciseOfTheDay()}
          className="flex flex-col items-start gap-3 rounded-[22px] border border-grape/10 bg-white px-4 py-4 text-left shadow-card transition-all hover:border-grape/30"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D2F5EB] text-[#0B8466]">
            <Wind size={20} strokeWidth={2} />
          </span>
          <span className="text-sm font-bold text-ink/80">{copy.dashboard.exerciseCta}</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('aiCoach')}
          className="flex flex-col items-start gap-3 rounded-[22px] border border-grape/10 bg-white px-4 py-4 text-left shadow-card transition-all hover:border-grape/30"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F1E1FC] text-[#8226BE]">
            <MessageCircleHeart size={20} strokeWidth={2} />
          </span>
          <span className="text-sm font-bold text-ink/80">{copy.dashboard.aiCta}</span>
        </button>
      </div>

      {plan && currentChallenge && (
        <Card className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-grape/55">
                {copy.challenge.desafioLabel(plan.order, TOTAL_CHALLENGES)}
              </p>
              <p className="mt-0.5 text-[16px] font-bold text-ink/85">{plan.goal}</p>
            </div>
            {streak.count > 0 && (
              <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-[linear-gradient(120deg,#F5A524,#FB7A36)] px-3 py-1.5 text-xs font-extrabold text-white shadow-seal">
                <span aria-hidden>🔥</span>
                {copy.challenge.streakBadge(streak.count)}
              </span>
            )}
          </div>

          <div className="mt-4">
            <ProgressBar value={plan.currentDay - 1} max={plan.totalDays} label={copy.challenge.dayCounter(plan.currentDay, plan.totalDays)} />
          </div>

          {nextChallenge && (
            <div className="mt-4 flex items-start gap-2 border-t border-grape/10 pt-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-grape/50">{copy.challenge.nextLabel}:</span>
              <span className="text-xs text-ink/55">{nextChallenge.title}</span>
            </div>
          )}

          {completedChallengeCount > 0 && (
            <p className="mt-2 text-xs text-ink/45">{copy.challenge.completedCount(completedChallengeCount)}</p>
          )}

          {import.meta.env.DEV && (
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void devAdvanceOneDay()}
                className="text-xs font-medium text-slate-400 underline"
              >
                (demo) avançar 1 dia
              </button>
              <button
                type="button"
                onClick={() => void devCompleteChallenge()}
                className="text-xs font-medium text-slate-400 underline"
              >
                (demo) concluir desafio agora
              </button>
              <button
                type="button"
                onClick={() => navigate('connectionUpsell')}
                className="text-xs font-medium text-slate-400 underline"
              >
                (demo) ver upsell Conexão
              </button>
              <button
                type="button"
                onClick={() => navigate('practice')}
                className="text-xs font-medium text-slate-400 underline"
              >
                (demo) abrir treino de conversa
              </button>
              <button
                type="button"
                onClick={() => setForceUpsell((v) => !v)}
                className="text-xs font-medium text-slate-400 underline"
              >
                {forceUpsell ? '(demo) ocultar botão Conexão' : '(demo) forçar gatilho do upsell'}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetUpsellAutoOpen(user)
                  setPlanTier(user, 'essencia')
                  window.location.reload()
                }}
                className="text-xs font-medium text-slate-400 underline"
              >
                (demo) resetar upsell (voltar a Essência)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlanTier(user, 'conexao', 'annual')
                  window.location.reload()
                }}
                className="text-xs font-medium text-slate-400 underline"
              >
                (demo) virar Conexão
              </button>
              <button
                type="button"
                onClick={() => {
                  // Limpa a assinatura salva e volta à escolha de plano, para
                  // testar mensal/anual do zero (sai do estado 'loyalty').
                  try {
                    localStorage.removeItem('soulspace:subscription')
                  } catch {
                    // storage bloqueado: ignora
                  }
                  navigate('subscription')
                }}
                className="text-xs font-medium text-slate-400 underline"
              >
                (demo) escolher plano de novo (mensal/anual)
              </button>
              <button
                type="button"
                onClick={() => {
                  devExpireConexao(user)
                  window.location.reload()
                }}
                className="text-xs font-medium text-slate-400 underline"
              >
                (demo) vencer o Conexão
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
