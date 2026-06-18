// Deriva a "persona" de bem-estar a partir do estado civil informado. A IA Coach
// usa isso para dar um tom diferente conforme o momento de vida da pessoa:
// - single:     solteiro(a) -> autoestima, se valorizar, se cuidar
// - committed:  comprometido(a) -> fortalecer o casal, usar o app a dois
// - overcoming: divorciado(a)/viúvo(a) -> superação otimista + autoestima
export type LifeStage = 'single' | 'committed' | 'overcoming'

export function lifeStageFromStatus(status: string | null | undefined): LifeStage {
  const lower = (status ?? '').toLowerCase()
  if (/comprometid|cas|namor|relacion|junt/.test(lower)) return 'committed'
  if (/divorci|vi[úu]v|separ|luto/.test(lower)) return 'overcoming'
  return 'single'
}
