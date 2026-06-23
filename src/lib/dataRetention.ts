import type { Subscription } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Retenção de dados após o fim da assinatura (item 4).
//
// REGRA: enquanto a assinatura cancelada ainda está dentro do período já pago, os
// dados são MANTIDOS (a pessoa pode retomar e continuar de onde parou). Quando o
// período pago vence sem renovação, os dados podem ser apagados — e a pessoa, se
// voltar, começa do zero.
//
// ⚠️ POR QUE NÃO APAGAMOS AQUI E AGORA: exclusão é irreversível e não pode
// depender do relógio do navegador (que a pessoa pode mudar) nem de o app estar
// aberto no dia certo. Em produção, isto roda no BACKEND, de forma confiável
// (um job agendado), idealmente com avisos por e-mail antes (LGPD). Estas funções
// deixam a regra pronta; a exclusão real liga quando houver backend.
//
// Ver também [[project_delete_vs_subscription]]: apagar dados ≠ cancelar cobrança.
// ─────────────────────────────────────────────────────────────────────────────

// Dias de carência depois do vencimento antes de apagar (margem de segurança).
export const RETENTION_GRACE_DAYS = 7

// A assinatura está cancelada porém ainda válida (dentro do período pago)?
export function isCancelledButStillValid(sub: Subscription | null, now: Date = new Date()): boolean {
  if (!sub || sub.status !== 'cancelled' || !sub.endDate) return false
  return new Date(sub.endDate).getTime() > now.getTime()
}

// O período pago já venceu sem renovação? (gatilho para a exclusão futura)
export function isExpiredUnrenewed(sub: Subscription | null, now: Date = new Date()): boolean {
  if (!sub || sub.status !== 'cancelled' || !sub.endDate) return false
  return new Date(sub.endDate).getTime() <= now.getTime()
}

// Já passou da carência pós-vencimento? (a partir daqui, apagar é elegível)
export function isEligibleForDeletion(sub: Subscription | null, now: Date = new Date()): boolean {
  if (!isExpiredUnrenewed(sub, now)) return false
  const end = new Date(sub!.endDate!).getTime()
  const graceMs = RETENTION_GRACE_DAYS * 86_400_000
  return now.getTime() >= end + graceMs
}

// Executa a exclusão definitiva dos dados quando elegível.
//
// HOJE: intencionalmente NÃO apaga (retorna false). Quando houver backend, este
// é o ponto único para disparar a exclusão real (ex.: chamar storageService
// .deleteAllData() de forma controlada e logada). Mantido aqui para a regra
// existir sem o risco de apagar dados por engano no protótipo.
export async function runRetentionDeletionIfDue(_sub: Subscription | null): Promise<boolean> {
  // TODO(backend): if (isEligibleForDeletion(_sub)) { await storageService.deleteAllData(); return true }
  return false
}
