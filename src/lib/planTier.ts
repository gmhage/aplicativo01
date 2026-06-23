import type { User } from '../types'
import { readValue, writeValue } from '../services/localStorageDb'

// ─────────────────────────────────────────────────────────────────────────────
// Tier do plano (a "linha de produto" que a pessoa contratou), separado da
// FORMA de pagamento (monthly/annual/loyalty, em types.ts).
//
//   - 'essencia' = SoulSpace Essência (plano de entrada: o app de hoje)
//   - 'conexao'  = SoulSpace Conexão  (upgrade: treino de conversa com IA)
//
// Hoje o app ainda não persiste o tier (todo assinante é Essência). Quando o
// "Conexão" virar um plano pago de verdade, basta passar a gravar isso no User
// (ex.: um campo `planTier`) e ajustar `planTierOf()` para lê-lo. O resto do app
// (badge do header, telas) já consome este helper, então nada mais muda.
// ─────────────────────────────────────────────────────────────────────────────

export type PlanTier = 'essencia' | 'conexao'

export interface PlanTierInfo {
  tier: PlanTier
  /** Nome curto exibido no badge e nas telas (sem o prefixo "SoulSpace"). */
  label: string
  /** Slogan/assinatura do tier. */
  tagline: string
}

export const PLAN_TIERS: Record<PlanTier, PlanTierInfo> = {
  essencia: {
    tier: 'essencia',
    label: 'Essência',
    tagline: 'O cuidado começa em você.',
  },
  conexao: {
    tier: 'conexao',
    label: 'Conexão',
    tagline: 'Plenitude em cada conexão.',
  },
}

// Persistência do tier por usuário. Enquanto o Conexão não é um plano cobrado de
// verdade (com campo no backend), guardamos a escolha localmente. Quando virar
// produto pago, basta trocar estas funções por leitura/escrita no User/pagamento.
function tierKey(userId: string): string {
  return `planTier:${userId}`
}

// Como a pessoa paga o Conexão (protótipo: guardado localmente; com pagamento
// real, isto viria da assinatura). 'discount' = oferta de retenção (R$ 19,90×3).
export type ConexaoBilling = 'monthly' | 'annual' | 'discount'

export function setPlanTier(user: User | null, tier: PlanTier, billing?: ConexaoBilling): void {
  if (!user) return
  writeValue(tierKey(user.id), tier)
  // Marca que a pessoa JÁ teve Conexão alguma vez — usado para manter o atalho de
  // "Treinar conversa" na home (como reassinatura) mesmo após cancelar.
  if (tier === 'conexao') {
    writeValue(`hadConexao:${user.id}`, true)
    if (billing) {
      writeValue(`conexaoBilling:${user.id}`, billing)
      // Data de vencimento do Conexão = agora + duração do tipo escolhido.
      // (Protótipo: com pagamento real, isto viria da assinatura/gateway.)
      const months = billing === 'annual' ? 12 : billing === 'discount' ? 3 : 1
      const end = new Date()
      end.setMonth(end.getMonth() + months)
      writeValue(`conexaoEndDate:${user.id}`, end.toISOString())
      writeValue(`conexaoStatus:${user.id}`, 'active')
    }
  }
}

// Recupera o tipo de cobrança do Conexão escolhido (default: mensal).
export function conexaoBillingOf(user: User | null): ConexaoBilling {
  if (!user) return 'monthly'
  return readValue<ConexaoBilling>(`conexaoBilling:${user.id}`) ?? 'monthly'
}

// Data de vencimento do Conexão (ISO) ou null se nunca assinou.
export function conexaoEndDateOf(user: User | null): string | null {
  if (!user) return null
  return readValue<string>(`conexaoEndDate:${user.id}`)
}

// Marca o Conexão como cancelado (mantém a data de fim: vale até vencer).
export function setConexaoStatus(user: User | null, status: 'active' | 'cancelled'): void {
  if (!user) return
  writeValue(`conexaoStatus:${user.id}`, status)
}

export function conexaoStatusOf(user: User | null): 'active' | 'cancelled' | 'none' {
  if (!user) return 'none'
  return readValue<'active' | 'cancelled'>(`conexaoStatus:${user.id}`) ?? 'none'
}

// (apenas dev) força a data de fim do Conexão para o passado, simulando que ele
// venceu — para testar os fluxos de renovação sem esperar meses.
export function devExpireConexao(user: User | null): void {
  if (!user) return
  const past = new Date()
  past.setMonth(past.getMonth() - 1)
  writeValue(`conexaoEndDate:${user.id}`, past.toISOString())
}

// Já assinou o Conexão em algum momento? (mesmo que tenha cancelado depois)
export function hasEverHadConexao(user: User | null): boolean {
  if (!user) return false
  return readValue<boolean>(`hadConexao:${user.id}`) === true
}

// Deriva o tier a partir do usuário. Lê o tier salvo localmente; na ausência,
// assume "Essência" (o plano de entrada / referência).
export function planTierOf(user: User | null): PlanTier {
  if (!user) return 'essencia'
  return readValue<PlanTier>(tierKey(user.id)) ?? 'essencia'
}

export function planTierInfoOf(user: User | null): PlanTierInfo {
  return PLAN_TIERS[planTierOf(user)]
}
