import type { Subscription, SubscriptionPlanType } from '../types'
import { delay, generateId, readValue, writeValue } from './localStorageDb'
import { PaymentError } from './types'
import type { CardDetails, PaymentResult, PaymentService } from './types'

// Mock do Stripe. Sem chave real: valida formato dos campos (como o Stripe.js
// faria no client) e usa um número de cartão de teste para simular recusa,
// igual ao fluxo de "test cards" do Stripe de verdade.
const PRICES: Record<SubscriptionPlanType, number> = {
  monthly: 39.9,
  annual: 299.9,
  loyalty: 239.9,
}

const DECLINE_SUFFIX = '0000'

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function isExpiryValid(expiry: string): boolean {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(expiry.trim())
  if (!match) return false
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > 12) return false
  const expiryDate = new Date(year, month, 0, 23, 59, 59)
  return expiryDate.getTime() >= Date.now()
}

class MockPaymentService implements PaymentService {
  async charge(userId: string, planType: SubscriptionPlanType, card: CardDetails): Promise<PaymentResult> {
    const digits = onlyDigits(card.number)
    if (digits.length !== 16) {
      throw new PaymentError('invalid_number', 'Número do cartão inválido. Verifique os 16 dígitos.')
    }
    if (!isExpiryValid(card.expiry)) {
      throw new PaymentError('invalid_expiry', 'Validade inválida ou cartão expirado. Use o formato MM/AA.')
    }
    if (!/^\d{3,4}$/.test(card.cvv.trim())) {
      throw new PaymentError('invalid_cvv', 'CVV inválido. Use os 3 dígitos no verso do cartão.')
    }

    await delay(1100)

    if (digits.endsWith(DECLINE_SUFFIX)) {
      throw new PaymentError('card_declined', 'Pagamento recusado. Verifique o saldo ou tente outro cartão.')
    }

    const now = new Date()
    const end = new Date(now)
    if (planType === 'monthly') end.setMonth(end.getMonth() + 1)
    else end.setFullYear(end.getFullYear() + 1)

    const subscription: Subscription = {
      id: generateId('sub'),
      userId,
      planType,
      price: PRICES[planType],
      startDate: now.toISOString(),
      endDate: end.toISOString(),
      status: 'active',
      stripeSubscriptionId: generateId('sub_stripe'),
    }
    writeValue('subscription', subscription)
    return { subscription }
  }

  async upgradeToLoyalty(userId: string): Promise<PaymentResult> {
    await delay(900)
    const now = new Date()
    const end = new Date(now)
    end.setFullYear(end.getFullYear() + 1)
    const subscription: Subscription = {
      id: generateId('sub'),
      userId,
      planType: 'loyalty',
      price: PRICES.loyalty,
      startDate: now.toISOString(),
      endDate: end.toISOString(),
      status: 'active',
      stripeSubscriptionId: generateId('sub_stripe'),
    }
    writeValue('subscription', subscription)
    return { subscription }
  }

  async getSubscription(userId: string): Promise<Subscription | null> {
    await delay(150)
    const sub = readValue<Subscription>('subscription')
    return sub && sub.userId === userId ? sub : null
  }

  async cancel(userId: string): Promise<Subscription | null> {
    await delay(500)
    const sub = readValue<Subscription>('subscription')
    if (!sub || sub.userId !== userId) return null
    const updated: Subscription = { ...sub, status: 'cancelled' }
    writeValue('subscription', updated)
    return updated
  }
}

export const mockPaymentService = new MockPaymentService()
