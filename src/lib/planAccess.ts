import type { Subscription, User } from '../types'
import { conexaoEndDateOf, conexaoStatusOf, planTierOf } from './planTier'

// ─────────────────────────────────────────────────────────────────────────────
// Acesso ao app considerando OS DOIS planos com vidas independentes:
//   - Essência (plano base) — vem da `subscription` (status + endDate).
//   - Conexão (upgrade)     — vem do tier + data de fim própria (planTier.ts).
//
// REGRA CENTRAL (item do produto): o app funciona enquanto QUALQUER um dos dois
// estiver vigente. Ex.: se o Essência vence e não é renovado, mas o Conexão
// ainda está dentro do prazo pago, o app segue 100% funcional até o Conexão
// vencer. Só perde acesso quando AMBOS estão fora.
// ─────────────────────────────────────────────────────────────────────────────

// Essência está vigente? (ativo, ou cancelado mas ainda no período pago)
export function isEssenciaActive(sub: Subscription | null, now: Date = new Date()): boolean {
  if (!sub) return false
  if (sub.status === 'active') return true
  // cancelado mas ainda dentro do período pago conta como vigente
  if (sub.status === 'cancelled' && sub.endDate) {
    return new Date(sub.endDate).getTime() > now.getTime()
  }
  return false
}

// Conexão está vigente? (assinou e ainda dentro do prazo pago, mesmo cancelado)
export function isConexaoActive(user: User | null, now: Date = new Date()): boolean {
  if (!user) return false
  // Status explícito de cancelado: vale até a data de fim.
  if (conexaoStatusOf(user) === 'cancelled') {
    const end = conexaoEndDateOf(user)
    return end ? new Date(end).getTime() > now.getTime() : false
  }
  // Tem o tier Conexão e não está cancelado → ativo. (Tolerante a dados sem
  // endDate registrado, ex.: assinaturas criadas antes desse campo existir.)
  if (planTierOf(user) === 'conexao') {
    const end = conexaoEndDateOf(user)
    return end ? new Date(end).getTime() > now.getTime() : true
  }
  return false
}

// O app deve liberar todas as funções? Sim se Essência OU Conexão vigente.
export function hasAppAccess(user: User | null, sub: Subscription | null, now: Date = new Date()): boolean {
  return isEssenciaActive(sub, now) || isConexaoActive(user, now)
}

// O Essência precisa de renovação? (venceu/não-renovado, mas o app ainda roda
// porque o Conexão segura). É o gatilho do botão "renovar Essência" na home.
export function needsEssenciaRenewal(user: User | null, sub: Subscription | null, now: Date = new Date()): boolean {
  // Não está vigente o Essência…
  if (isEssenciaActive(sub, now)) return false
  // …mas o app ainda tem acesso (graças ao Conexão) → convém renovar o Essência.
  return isConexaoActive(user, now)
}

// O Conexão venceu? (a pessoa teve, e o prazo acabou) → o botão "Treinar
// conversa" deve levar ao upsell para RENOVAR.
export function conexaoExpired(user: User | null, now: Date = new Date()): boolean {
  if (!user) return false
  if (conexaoStatusOf(user) === 'none') return false
  const end = conexaoEndDateOf(user)
  if (!end) return false
  return new Date(end).getTime() <= now.getTime()
}

// Tem acesso ao treino de conversa AGORA? (Conexão vigente)
export function canUsePractice(user: User | null, now: Date = new Date()): boolean {
  return isConexaoActive(user, now) || planTierOf(user) === 'conexao'
}
