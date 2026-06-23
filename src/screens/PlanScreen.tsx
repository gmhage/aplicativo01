import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { Card, SelectableCard } from '../components/ui/Card'
import copy from '../i18n/pt-BR'
import { computeStreak } from '../lib/streak'
import { conexaoBillingOf, planTierOf, setConexaoStatus, setPlanTier, type ConexaoBilling } from '../lib/planTier'
import { isConexaoActive, isEssenciaActive } from '../lib/planAccess'
import { sendCancelFeedback } from '../lib/cancelFeedback'
import { useAppState } from '../state/AppStateContext'

type Step =
  | 'details'
  | 'essenciaDetails' // tela de detalhes do Essência (abre ao tocar no card)
  | 'conexaoDetails' // tela de detalhes do Conexão (abre ao tocar no card)
  | 'loyalty'
  | 'loyaltyDone'
  | 'cancelQuiz' // motivo do cancelamento (vem antes da retenção)
  | 'cancelReflect'
  | 'cancelOffer'
  | 'cancelFinal'
  | 'cancelDone'
  // Fluxo do SoulSpace Conexão:
  | 'conexaoUpgradeDone'
  | 'cancelConexaoReflect'
  | 'cancelConexaoOffer'
  | 'cancelConexaoFinal'
  | 'cancelConexaoDone'

// Qual cancelamento o quiz está precedendo (Essência inteiro ou só o Conexão).
type CancelTarget = 'essencia' | 'conexao'

interface PlanScreenProps {
  onClose: () => void
}

function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function Wrapper({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <Header title={title} />
      {children}
    </div>
  )
}

export function PlanScreen({ onClose }: PlanScreenProps) {
  const { subscription, journalEntries, user, navigate, upgradeToLoyalty, cancelSubscription } = useAppState()
  const [step, setStep] = useState<Step>('details')
  const [loading, setLoading] = useState(false)
  // Tipo do Conexão escolhido NA TELA de upgrade (mensal/anual). Distinto do
  // conexaoBilling (o que a pessoa já contratou, lido do storage).
  const [conexaoBillingChoice, setConexaoBillingChoice] = useState<'monthly' | 'annual'>('annual')
  // Quiz de cancelamento: alvo (o que será cancelado), motivo escolhido e texto.
  const [cancelTarget, setCancelTarget] = useState<CancelTarget>('essencia')
  const [reasonId, setReasonId] = useState<string | null>(null)
  const [otherText, setOtherText] = useState('')
  const [reasonWarning, setReasonWarning] = useState(false)

  const c = copy.plan.connection
  const streak = useMemo(() => computeStreak(journalEntries), [journalEntries])
  const isLoyalty = subscription?.planType === 'loyalty'
  const hasConexao = planTierOf(user) === 'conexao'
  const conexaoBilling = conexaoBillingOf(user)
  // (dev) força os planos como "inativo" para testar o estado "Assinar".
  const [devForceInactive, setDevForceInactive] = useState(false)
  // Estado de cada plano: ativo mostra "Ativo"; inativo mostra "Assinar".
  const essenciaIsActive = !devForceInactive && isEssenciaActive(subscription)
  const conexaoIsActive = !devForceInactive && isConexaoActive(user)

  // Formata um valor (number) em reais.
  const brl = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

  // Linha de preço do Essência, conforme o tipo que a pessoa paga.
  const essenciaPriceLine =
    subscription?.planType === 'annual'
      ? c.priceAnnual(brl(subscription.price))
      : subscription?.planType === 'loyalty'
        ? c.priceDiscount(brl((subscription.price ?? 239.9) / 12))
        : c.priceMonthly(brl(subscription?.price ?? 39.9))

  // Linha de preço do Conexão, conforme o tipo escolhido no upgrade.
  const CONEXAO_PRICES: Record<ConexaoBilling, string> = {
    monthly: c.priceMonthly('R$ 29,90'),
    annual: c.priceAnnual('R$ 199,90'),
    discount: c.priceDiscount('R$ 19,90'),
  }
  const conexaoPriceLine = CONEXAO_PRICES[conexaoBilling]

  const handleUpgrade = async () => {
    setLoading(true)
    await upgradeToLoyalty()
    setLoading(false)
    setStep('loyaltyDone')
  }

  const handleCancel = async () => {
    setLoading(true)
    await cancelSubscription()
    setLoading(false)
    setStep('cancelDone')
  }

  // Ativa o Conexão (protótipo: grava o tier; com pagamento real, passa pelo
  // checkout do add-on antes disto).
  const activateConexao = () => {
    setLoading(true)
    setPlanTier(user, 'conexao', conexaoBillingChoice)
    setLoading(false)
    setStep('conexaoUpgradeDone')
  }

  // Abre o quiz de motivo, guardando qual cancelamento ele precede.
  const openCancelQuiz = (target: CancelTarget) => {
    setCancelTarget(target)
    setReasonId(null)
    setOtherText('')
    setReasonWarning(false)
    setStep('cancelQuiz')
  }

  // Avança do quiz para o fluxo de retenção, registrando o motivo. Só prossegue
  // se houver um motivo escolhido (ou texto em "outro").
  const submitCancelQuiz = () => {
    const isOther = reasonId === 'other'
    const hasReason = reasonId !== null && (!isOther || otherText.trim().length > 0)
    if (!hasReason) {
      setReasonWarning(true)
      return
    }
    const reason = copy.plan.cancelQuiz.reasons.find((r) => r.id === reasonId)
    void sendCancelFeedback({
      userId: user?.id ?? '',
      plan: cancelTarget,
      reasonId: reasonId!,
      reasonText: isOther ? otherText.trim() : reason?.label ?? '',
      createdAt: new Date().toISOString(),
    })
    // Segue para a retenção do alvo correto.
    setStep(cancelTarget === 'conexao' ? 'cancelConexaoReflect' : 'cancelReflect')
  }

  // Aceita a oferta de retenção do Conexão: aplica o preço com desconto e mantém
  // o plano ativo (protótipo: regrava o tier como 'conexao' com billing 'discount').
  const acceptConexaoDiscount = () => {
    setPlanTier(user, 'conexao', 'discount')
    setConexaoStatus(user, 'active')
    setStep('details')
  }

  // Cancela só o Conexão, mantendo o Essência. Marca como 'cancelled' mas o
  // Conexão continua VÁLIDO até a data de fim (acesso preservado até vencer).
  const cancelConexao = () => {
    setLoading(true)
    setConexaoStatus(user, 'cancelled')
    setLoading(false)
    setStep('cancelConexaoDone')
  }

  // --- Oferta de fidelização do Essência (já existente) ---
  if (step === 'loyalty') {
    return (
      <Wrapper title={copy.plan.loyaltyTitle}>
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
              <ShieldCheck size={22} strokeWidth={1.6} style={{ color: 'var(--color-primary-strong)' }} />
            </span>
            <p className="text-[15px] font-medium text-slate-700">{copy.plan.loyaltyLead}</p>
          </div>

          <ul className="mt-5 space-y-2.5">
            {copy.plan.loyaltyBenefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5 text-sm text-slate-600">
                <CheckCircle2 size={18} strokeWidth={1.6} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                {benefit}
              </li>
            ))}
          </ul>

          <p className="mt-5 rounded-2xl px-4 py-3 text-center text-[15px] font-semibold" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary-strong)' }}>
            {copy.plan.loyaltyPriceLine}
          </p>
        </Card>

        <div className="mt-4 space-y-2">
          <Button loading={loading} onClick={() => void handleUpgrade()}>
            {loading ? copy.plan.loyaltyConfirmLoading : copy.plan.loyaltyConfirmCta}
          </Button>
          <Button variant="ghost" onClick={() => setStep('details')}>
            {copy.plan.loyaltyMaybeLater}
          </Button>
        </div>
      </Wrapper>
    )
  }

  if (step === 'loyaltyDone') {
    return (
      <Wrapper title={copy.plan.loyaltySuccessTitle}>
        <Card className="flex flex-col items-center py-10 text-center">
          <Sparkles size={28} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">{copy.plan.loyaltySuccessBody}</p>
        </Card>
        <div className="mt-4">
          <Button onClick={onClose}>{copy.plan.backCta}</Button>
        </div>
      </Wrapper>
    )
  }

  // --- Conexão ativado com sucesso ---
  if (step === 'conexaoUpgradeDone') {
    return (
      <Wrapper title={c.upgradeDoneTitle}>
        <Card className="flex flex-col items-center py-10 text-center">
          <Sparkles size={28} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">{c.upgradeDoneBody}</p>
        </Card>
        <div className="mt-4 space-y-2">
          <Button onClick={() => navigate('practice')}>{c.upgradeDoneCta}</Button>
          <Button variant="secondary" onClick={onClose}>
            {copy.plan.backCta}
          </Button>
        </div>
      </Wrapper>
    )
  }

  // --- Detalhes do Essência (abre ao tocar no card do plano base) ---
  if (step === 'essenciaDetails') {
    return (
      <Wrapper title={c.essenciaDetailsTitle}>
        <Card>
          <p className="text-[15px] font-medium italic text-slate-500">{c.essenciaDetailsTagline}</p>

          <p className="mt-4 rounded-2xl px-4 py-3 text-center text-[15px] font-semibold" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary-strong)' }}>
            {c.essenciaPlanLine}: {essenciaPriceLine}
          </p>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">{c.essenciaIncludesLabel}</p>
          <ul className="mt-2 space-y-2">
            {c.essenciaIncludes.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                <CheckCircle2 size={17} strokeWidth={1.7} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <div className="mt-4 space-y-2">
          <Button onClick={() => navigate('journal')}>{c.essenciaJournalCta}</Button>
          <Button variant="secondary" onClick={() => setStep('details')}>
            {c.detailsBackCta}
          </Button>
          {/* Único caminho para o cancelamento do Essência: botão ghost discreto. */}
          <button type="button" onClick={() => openCancelQuiz('essencia')} className="w-full py-2 text-sm font-medium text-slate-400">
            {c.detailsCancelCta}
          </button>
        </div>
      </Wrapper>
    )
  }

  // --- Detalhes do Conexão (abre ao tocar no card do plano) ---
  if (step === 'conexaoDetails') {
    return (
      <Wrapper title={c.detailsTitle}>
        <Card>
          <p className="text-[15px] font-medium italic text-slate-500">{c.detailsTagline}</p>

          <p className="mt-4 rounded-2xl px-4 py-3 text-center text-[15px] font-semibold" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary-strong)' }}>
            {c.detailsPlanLine}: {conexaoPriceLine}
          </p>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">{c.detailsIncludesLabel}</p>
          <ul className="mt-2 space-y-2">
            {c.detailsIncludes.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                <CheckCircle2 size={17} strokeWidth={1.7} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <div className="mt-4 space-y-2">
          <Button onClick={() => navigate('practice')}>{c.detailsTrainCta}</Button>
          <Button variant="secondary" onClick={() => setStep('details')}>
            {c.detailsBackCta}
          </Button>
          {/* Único caminho para o cancelamento do Conexão: botão ghost discreto. */}
          <button type="button" onClick={() => openCancelQuiz('conexao')} className="w-full py-2 text-sm font-medium text-slate-400">
            {c.detailsCancelCta}
          </button>
        </div>
      </Wrapper>
    )
  }

  // --- Quiz de motivo do cancelamento (precede a retenção) ---
  if (step === 'cancelQuiz') {
    const q = copy.plan.cancelQuiz
    return (
      <Wrapper title={q.title}>
        <Card>
          <p className="text-sm text-slate-600">{q.intro}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">{q.reasonsLabel}</p>
          <div className="mt-2 space-y-2">
            {q.reasons.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setReasonId(r.id)
                  setReasonWarning(false)
                }}
                className={`w-full rounded-2xl border p-3.5 text-left transition-all ${
                  reasonId === r.id ? 'border-2 border-grape bg-grape/[0.06]' : 'border-grape/15 bg-white hover:border-grape/30'
                }`}
              >
                <span className="block text-sm font-semibold text-slate-800">{r.label}</span>
                {reasonId === r.id && <span className="mt-1 block text-xs leading-snug text-grape/80">{r.nudge}</span>}
              </button>
            ))}

            {/* Outro motivo (texto livre) */}
            <button
              type="button"
              onClick={() => {
                setReasonId('other')
                setReasonWarning(false)
              }}
              className={`w-full rounded-2xl border p-3.5 text-left transition-all ${
                reasonId === 'other' ? 'border-2 border-grape bg-grape/[0.06]' : 'border-grape/15 bg-white hover:border-grape/30'
              }`}
            >
              <span className="block text-sm font-semibold text-slate-800">{q.otherLabel}</span>
            </button>
            {reasonId === 'other' && (
              <textarea
                value={otherText}
                onChange={(e) => {
                  setOtherText(e.target.value)
                  setReasonWarning(false)
                }}
                placeholder={q.otherPlaceholder}
                rows={3}
                className="w-full rounded-2xl border border-grape/15 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink/35 focus:border-grape"
              />
            )}
          </div>

          {reasonWarning && <p className="mt-3 text-sm font-medium text-red-600">{q.needReasonWarning}</p>}
        </Card>

        <div className="mt-4 space-y-2">
          <Button onClick={() => setStep('details')}>{q.stayCta}</Button>
          <button type="button" onClick={submitCancelQuiz} className="w-full py-2 text-sm font-medium text-slate-400">
            {q.continueCta}
          </button>
        </div>
      </Wrapper>
    )
  }

  // --- Cancelamento do Essência: passo 1 (já existente) ---
  if (step === 'cancelReflect') {
    return (
      <Wrapper title={copy.plan.cancelReflectTitle}>
        <Card>
          <p className="text-sm text-slate-600">{copy.plan.cancelReflectIntro}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.plan.cancelReflectLossLabel}</p>
          <ul className="mt-2 space-y-2">
            {copy.plan.cancelReflectLosses.map((loss) => (
              <li key={loss} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-300" />
                {loss}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">{copy.plan.cancelReflectArgument}</p>
        </Card>

        <div className="mt-4 space-y-2">
          <Button onClick={onClose}>{copy.plan.cancelReflectStayCta}</Button>
          <button type="button" onClick={() => setStep('cancelOffer')} className="w-full py-2 text-sm font-medium text-slate-400">
            {copy.plan.cancelReflectContinueCta}
          </button>
        </div>
      </Wrapper>
    )
  }

  // --- Cancelamento do Essência: passo 2 (já existente) ---
  if (step === 'cancelOffer') {
    return (
      <Wrapper title={copy.plan.cancelOfferTitle}>
        <Card>
          <p className="text-sm leading-relaxed text-slate-600">{copy.plan.cancelOfferBody}</p>
          <p className="mt-4 rounded-2xl px-4 py-3 text-center text-[15px] font-semibold" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary-strong)' }}>
            {copy.plan.loyaltyPriceLine}
          </p>
        </Card>

        <div className="mt-4 space-y-2">
          <Button loading={loading} onClick={() => void handleUpgrade()}>
            {loading ? copy.plan.loyaltyConfirmLoading : copy.plan.cancelOfferAcceptCta}
          </Button>
          <button type="button" onClick={onClose} disabled={loading} className="w-full py-2 text-sm font-medium" style={{ color: 'var(--color-primary-strong)' }}>
            {copy.plan.cancelOfferStayCta}
          </button>
          <button type="button" onClick={() => setStep('cancelFinal')} disabled={loading} className="w-full py-2 text-sm font-medium text-slate-400">
            {copy.plan.cancelOfferDeclineCta}
          </button>
        </div>
      </Wrapper>
    )
  }

  // --- Cancelamento do Essência: passo 3 (já existente) ---
  if (step === 'cancelFinal') {
    return (
      <Wrapper title={copy.plan.cancelFinalTitle}>
        <Card>
          <p className="text-sm leading-relaxed text-slate-600">{copy.plan.cancelFinalBody}</p>
        </Card>
        <div className="mt-4 space-y-2">
          <Button onClick={onClose}>{copy.plan.cancelFinalKeepCta}</Button>
          <Button variant="danger" loading={loading} onClick={() => void handleCancel()}>
            {copy.plan.cancelFinalConfirmCta}
          </Button>
        </div>
      </Wrapper>
    )
  }

  if (step === 'cancelDone') {
    return (
      <Wrapper title={copy.plan.cancelledTitle}>
        <Card>
          <p className="text-sm leading-relaxed text-slate-600">{copy.plan.cancelledBody}</p>
        </Card>
        <div className="mt-4">
          <Button onClick={onClose}>{copy.plan.cancelledBackCta}</Button>
        </div>
      </Wrapper>
    )
  }

  // --- Cancelamento do CONEXÃO: passo 1 (o que perde) ---
  if (step === 'cancelConexaoReflect') {
    return (
      <Wrapper title={c.cancelConexaoReflectTitle}>
        <Card>
          <p className="text-sm text-slate-600">{c.cancelConexaoReflectIntro}</p>
          <ul className="mt-3 space-y-2">
            {c.cancelConexaoLosses.map((loss) => (
              <li key={loss} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-300" />
                {loss}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">{c.cancelConexaoArgument}</p>
        </Card>
        <div className="mt-4 space-y-2">
          <Button onClick={() => setStep('details')}>{c.cancelConexaoStayCta}</Button>
          <button type="button" onClick={() => setStep('cancelConexaoOffer')} className="w-full py-2 text-sm font-medium text-slate-400">
            {c.cancelConexaoContinueCta}
          </button>
        </div>
      </Wrapper>
    )
  }

  // --- Cancelamento do CONEXÃO: passo 2 (oferta de desconto) ---
  if (step === 'cancelConexaoOffer') {
    return (
      <Wrapper title={c.cancelConexaoOfferTitle}>
        <Card>
          <p className="text-sm leading-relaxed text-slate-600">{c.cancelConexaoOfferBody}</p>
          <p className="mt-4 rounded-2xl px-4 py-3 text-center text-[15px] font-semibold" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary-strong)' }}>
            {c.cancelConexaoOfferPriceLine}
          </p>
        </Card>
        <div className="mt-4 space-y-2">
          <Button onClick={acceptConexaoDiscount}>{c.cancelConexaoOfferAcceptCta}</Button>
          <button type="button" onClick={() => setStep('details')} className="w-full py-2 text-sm font-medium" style={{ color: 'var(--color-primary-strong)' }}>
            {c.cancelConexaoOfferStayCta}
          </button>
          <button type="button" onClick={() => setStep('cancelConexaoFinal')} className="w-full py-2 text-sm font-medium text-slate-400">
            {c.cancelConexaoOfferDeclineCta}
          </button>
        </div>
      </Wrapper>
    )
  }

  // --- Cancelamento do CONEXÃO: passo 3 (confirmação) ---
  if (step === 'cancelConexaoFinal') {
    return (
      <Wrapper title={c.cancelConexaoFinalTitle}>
        <Card>
          <p className="text-sm leading-relaxed text-slate-600">{c.cancelConexaoFinalBody}</p>
        </Card>
        <div className="mt-4 space-y-2">
          <Button onClick={() => setStep('details')}>{c.cancelConexaoFinalKeepCta}</Button>
          <Button variant="danger" loading={loading} onClick={cancelConexao}>
            {c.cancelConexaoFinalConfirmCta}
          </Button>
        </div>
      </Wrapper>
    )
  }

  if (step === 'cancelConexaoDone') {
    return (
      <Wrapper title={c.cancelConexaoDoneTitle}>
        <Card>
          <p className="text-sm leading-relaxed text-slate-600">{c.cancelConexaoDoneBody}</p>
        </Card>
        <div className="mt-4">
          <Button onClick={onClose}>{c.cancelConexaoDoneCta}</Button>
        </div>
      </Wrapper>
    )
  }

  // --- Tela inicial: detalhes do plano ---
  return (
    <Wrapper title={copy.plan.detailsTitle}>
      {/* Plano base (Essência) — card clicável que leva aos detalhes. Badge mostra
          "Ativo" ou "Assinar" conforme o estado. */}
      <button
        type="button"
        onClick={() => setStep('essenciaDetails')}
        className="w-full rounded-[22px] border border-grape/10 bg-white p-6 text-left shadow-card transition-all hover:border-grape/30"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{c.currentPlanPrefix}</p>
          <PlanBadge active={essenciaIsActive} />
        </div>
        <p className="mt-0.5 text-[16px] font-bold text-slate-800">
          {c.essenciaName} · {essenciaPriceLine}
        </p>
        <div className="mt-3 space-y-1 text-sm text-slate-500">
          <p>
            {copy.plan.startedAtLabel}: <span className="text-slate-700">{formatDate(subscription?.startDate)}</span>
          </p>
          <p>
            {copy.plan.renewsLabel}: <span className="text-slate-700">{formatDate(subscription?.endDate)}</span>
          </p>
        </div>
        <p className="mt-3 text-xs font-medium" style={{ color: 'var(--color-primary-strong)' }}>
          {c.tapForDetails} →
        </p>
      </button>

      {/* Conexão: card clicável (se tem) → leva aos DETALHES; ou upgrade (se não) */}
      {hasConexao ? (
        <button
          type="button"
          onClick={() => setStep('conexaoDetails')}
          className="mt-4 w-full rounded-[22px] border border-grape/10 bg-white p-6 text-left shadow-card transition-all hover:border-grape/30"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{c.currentPlanPrefix}</p>
            <PlanBadge active={conexaoIsActive} />
          </div>
          <p className="mt-0.5 text-[16px] font-bold text-slate-800">
            {c.conexaoName} · {conexaoPriceLine}
          </p>
          <p className="mt-1 text-sm text-slate-500">{c.conexaoTagline}</p>
          <p className="mt-3 text-xs font-medium" style={{ color: 'var(--color-primary-strong)' }}>
            {c.tapForDetails} →
          </p>
        </button>
      ) : (
        <Card className="mt-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} strokeWidth={1.8} style={{ color: 'var(--color-primary)' }} />
            <p className="text-[15px] font-bold text-slate-800">{c.upgradeTitle}</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.upgradeLead}</p>

          <ul className="mt-4 space-y-2">
            {c.upgradeBenefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5 text-sm text-slate-600">
                <CheckCircle2 size={17} strokeWidth={1.7} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                {benefit}
              </li>
            ))}
          </ul>

          {/* Escolha mensal/anual */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <SelectableCard selected={conexaoBillingChoice === 'monthly'} onClick={() => setConexaoBillingChoice('monthly')}>
              <p className="font-semibold text-slate-800">{c.upgradeMonthlyLabel}</p>
              <p className="mt-1 text-sm text-slate-500">{c.upgradeMonthlyPrice}</p>
            </SelectableCard>
            <SelectableCard selected={conexaoBillingChoice === 'annual'} onClick={() => setConexaoBillingChoice('annual')}>
              <p className="font-semibold text-slate-800">{c.upgradeAnnualLabel}</p>
              <p className="mt-1 text-sm text-slate-500">{c.upgradeAnnualPrice}</p>
              <span className="mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary-strong)' }}>
                {c.upgradeAnnualBadge}
              </span>
              <p className="mt-1 text-xs text-slate-400">{c.upgradeAnnualSub}</p>
            </SelectableCard>
          </div>

          <div className="mt-5">
            <Button loading={loading} onClick={activateConexao}>
              {loading ? c.upgradeCtaLoading : c.upgradeCta}
            </Button>
            <p className="mt-3 text-center text-xs leading-relaxed text-slate-400">{c.upgradeReassurance}</p>
          </div>
        </Card>
      )}

      {/* Ações do plano base. O cancelamento NÃO fica mais aqui: ele mora dentro
          dos detalhes de cada plano (botão ghost "Cancelar plano"). */}
      <div className="mt-4 space-y-2">
        {!isLoyalty && (
          <Button variant="secondary" icon={<ShieldCheck size={18} strokeWidth={1.7} />} onClick={() => setStep('loyalty')}>
            {copy.plan.loyaltyCta}
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>
          {copy.plan.backCta}
        </Button>
        {import.meta.env.DEV && (
          <button
            type="button"
            onClick={() => setDevForceInactive((v) => !v)}
            className="w-full py-2 text-xs font-medium text-slate-400 underline"
          >
            {devForceInactive ? '(demo) planos ATIVOS' : '(demo) simular planos inativos (Assinar)'}
          </button>
        )}
      </div>
    </Wrapper>
  )
}

// Badge de estado do plano: "Ativo" (verde da marca) ou "Assinar" (âmbar, chama
// para a ação). Componente local, reaproveitado pelos dois cards.
function PlanBadge({ active }: { active: boolean }) {
  const c = copy.plan.connection
  if (active) {
    return (
      <span
        className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
        style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary-strong)' }}
      >
        {c.conexaoActiveBadge}
      </span>
    )
  }
  return (
    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-700">
      {c.subscribeBadge}
    </span>
  )
}
