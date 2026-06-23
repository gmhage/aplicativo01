import { writeValue, readValue } from '../services/localStorageDb'

// ─────────────────────────────────────────────────────────────────────────────
// Coleta do motivo de cancelamento.
//
// ⚠️ COMO ISSO CHEGA ATÉ VOCÊ (importante): hoje o app é local (sem backend), e
// o motivo é apenas GUARDADO no aparelho da pessoa — você ainda NÃO recebe. Este
// é o ponto único de envio: quando houver backend (Supabase) ou um webhook
// (ex.: Google Forms), basta implementar o fetch dentro de sendCancelFeedback()
// que todos os motivos passam a chegar até você, sem mexer nas telas.
//
//   Exemplo futuro (backend):
//     await fetch(`${BACKEND_URL}/cancel-feedback`, { method:'POST', body: JSON.stringify(payload) })
//   Exemplo rápido (Google Forms): POST no formResponse com os entry.<id>.
// ─────────────────────────────────────────────────────────────────────────────

export interface CancelFeedback {
  userId: string
  plan: 'essencia' | 'conexao'
  reasonId: string
  reasonText: string // texto do motivo (ou o que a pessoa digitou em "outros")
  createdAt: string
}

export async function sendCancelFeedback(feedback: CancelFeedback): Promise<void> {
  // Sempre guarda localmente (histórico no aparelho).
  const log = readValue<CancelFeedback[]>('cancelFeedbackLog') ?? []
  log.push(feedback)
  writeValue('cancelFeedbackLog', log)

  // TODO(backend): enviar para o servidor/planilha. Enquanto não houver destino,
  // não há para onde mandar — fica só local. Ver INTEGRACAO_IA.md / backend.
  // Exemplo:
  //   const url = import.meta.env.VITE_AI_BACKEND_URL
  //   if (url) await fetch(`${url}/cancel-feedback`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(feedback),
  //   }).catch(() => {})
}
