import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import copy from '../i18n/pt-BR'
import { computeStreak } from '../lib/streak'
import { useAppState } from '../state/AppStateContext'

type Step = 'details' | 'loyalty' | 'loyaltyDone' | 'cancelReflect' | 'cancelOffer' | 'cancelFinal' | 'cancelDone'

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
  const { subscription, journalEntries, upgradeToLoyalty, cancelSubscription } = useAppState()
  const [step, setStep] = useState<Step>('details')
  const [loading, setLoading] = useState(false)

  const streak = useMemo(() => computeStreak(journalEntries), [journalEntries])
  const isLoyalty = subscription?.planType === 'loyalty'

  const planLabel =
    subscription?.planType === 'monthly'
      ? copy.plan.currentLabelMonthly
      : subscription?.planType === 'annual'
        ? copy.plan.currentLabelAnnual
        : copy.plan.currentLabelLoyalty

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

  // --- Oferta de fidelização (upsell) ---
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

  // --- Cancelamento: passo 1, reflexão sobre o que perde ---
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

  // --- Cancelamento: passo 2, última oferta de fidelização ---
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

  // --- Cancelamento: passo 3, confirmação final (cancela de verdade) ---
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

  // --- Tela inicial: detalhes do plano ---
  return (
    <Wrapper title={copy.plan.detailsTitle}>
      <Card>
        <p className="text-[15px] font-semibold text-slate-800">{planLabel}</p>
        <div className="mt-3 space-y-1 text-sm text-slate-500">
          <p>
            {copy.plan.startedAtLabel}: <span className="text-slate-700">{formatDate(subscription?.startDate)}</span>
          </p>
          <p>
            {copy.plan.renewsLabel}: <span className="text-slate-700">{formatDate(subscription?.endDate)}</span>
          </p>
        </div>
      </Card>

      <div className="mt-4 space-y-2">
        {!isLoyalty && (
          <Button icon={<ShieldCheck size={18} strokeWidth={1.7} />} onClick={() => setStep('loyalty')}>
            {copy.plan.loyaltyCta}
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>
          {copy.plan.backCta}
        </Button>
        {subscription?.status === 'active' && (
          <button type="button" onClick={() => setStep('cancelReflect')} className="w-full py-2 text-sm font-medium text-slate-400">
            {copy.plan.cancelLink}
          </button>
        )}
      </div>
    </Wrapper>
  )
}
