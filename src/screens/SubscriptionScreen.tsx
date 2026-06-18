import { useState } from 'react'
import { Lock } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { SelectableCard } from '../components/ui/Card'
import { ProgressDots } from '../components/ui/ProgressDots'
import { TextField } from '../components/ui/TextField'
import copy from '../i18n/pt-BR'
import { PaymentError } from '../services'
import { useAppState } from '../state/AppStateContext'
import type { SubscriptionPlanType } from '../types'

export function SubscriptionScreen() {
  const { subscribe, plan } = useAppState()
  const [planType, setPlanType] = useState<SubscriptionPlanType>('annual')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [saveCard, setSaveCard] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setFieldErrors({})
    setLoading(true)
    try {
      await subscribe(planType, { number: cardNumber, expiry, cvv })
    } catch (error) {
      if (error instanceof PaymentError) {
        const message = copy.subscription.errors[error.code] ?? copy.subscription.errors.network_error
        if (error.code === 'invalid_number') setFieldErrors({ number: message })
        else if (error.code === 'invalid_expiry') setFieldErrors({ expiry: message })
        else if (error.code === 'invalid_cvv') setFieldErrors({ cvv: message })
        else setFieldErrors({ general: message })
      } else {
        setFieldErrors({ general: copy.subscription.errors.network_error })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6">
        <ProgressDots total={3} current={3} />
      </div>
      <h1 className="font-display text-[27px] font-semibold leading-tight text-ink">{copy.subscription.title}</h1>
      {plan && (
        <p className="mt-2 text-[15px] text-ink/55">
          {copy.subscription.subtitlePrefix} {plan.goal}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <SelectableCard selected={planType === 'monthly'} onClick={() => setPlanType('monthly')}>
          <p className="font-semibold text-slate-800">{copy.subscription.monthlyLabel}</p>
          <p className="mt-1 text-sm text-slate-500">{copy.subscription.monthlyPrice}</p>
        </SelectableCard>
        <SelectableCard selected={planType === 'annual'} onClick={() => setPlanType('annual')}>
          <p className="font-semibold text-slate-800">{copy.subscription.annualLabel}</p>
          <p className="mt-1 text-sm text-slate-500">{copy.subscription.annualPrice}</p>
          <span
            className="mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary-strong)' }}
          >
            {copy.subscription.annualBadge}
          </span>
        </SelectableCard>
      </div>

      <div className="mt-6 space-y-4">
        <TextField
          label={copy.subscription.cardNumberLabel}
          placeholder={copy.subscription.cardNumberPlaceholder}
          inputMode="numeric"
          value={cardNumber}
          error={fieldErrors.number}
          onChange={(e) => setCardNumber(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label={copy.subscription.cardExpiryLabel}
            placeholder={copy.subscription.cardExpiryPlaceholder}
            value={expiry}
            error={fieldErrors.expiry}
            onChange={(e) => setExpiry(e.target.value)}
          />
          <TextField
            label={copy.subscription.cardCvvLabel}
            placeholder={copy.subscription.cardCvvPlaceholder}
            inputMode="numeric"
            value={cvv}
            error={fieldErrors.cvv}
            onChange={(e) => setCvv(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} className="h-4 w-4 rounded" />
          {copy.subscription.saveCardLabel}
        </label>
        {fieldErrors.general && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{fieldErrors.general}</p>
        )}
      </div>

      <div className="mt-8">
        <Button loading={loading} onClick={handleSubmit}>
          {loading ? copy.subscription.payButtonLoading : copy.subscription.payButton}
        </Button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink/45">
          <Lock size={13} strokeWidth={2} className="flex-shrink-0" />
          {copy.subscription.securityNote}
        </p>
      </div>
    </div>
  )
}
