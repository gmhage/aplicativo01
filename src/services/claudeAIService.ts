import { moodThemes } from '../theme/moodTheme'
import { mockAIService } from './mockAIService'
import type {
  AIReplyRequest,
  AIService,
  EvolutionSummaryPoint,
  PositiveReflectionRequest,
} from './types'
import type { MoodId } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// ClaudeService — adaptador de IA real (Claude Haiku 4.5) com fallback local.
//
// COMO FUNCIONA
//   Este serviço é um "envelope" sobre o mockAIService. Ele tenta gerar a
//   reflexão do dia chamando a IA real; se a IA não estiver configurada ou
//   falhar, ele cai automaticamente no banco local de variações (mockAIService).
//   Os demais métodos (saudação, resposta do chat, resumo da evolução) continuam
//   vindo do mock — só a positiveReflection ganha IA real.
//
// SEGURANÇA (regra de ouro do postmortem fitgym.site)
//   A CHAVE DA API NUNCA FICA NO FRONT-END. Qualquer coisa no navegador é
//   visível para o usuário. O fluxo correto é:
//
//       App (front) ──► seu backend ──► API da Anthropic
//                     guarda a chave   Claude Haiku 4.5
//
//   O front só conhece a URL do seu backend (uma Edge Function / serverless).
//   O backend guarda a ANTHROPIC_API_KEY, monta o prompt, chama a API e devolve
//   os 3 parágrafos. Assim a chave fica protegida e você controla custo/abuso.
//
// CUSTO ZERO ATÉ VOCÊ ATIVAR
//   Enquanto a env var VITE_AI_BACKEND_URL não estiver definida, este serviço
//   se comporta EXATAMENTE como o mock (nenhuma chamada de rede, nenhum custo).
//   Para ativar: suba o backend (ver bloco BACKEND no fim do arquivo), defina a
//   VITE_AI_BACKEND_URL no .env e troque a instância em services/index.ts.
// ─────────────────────────────────────────────────────────────────────────────

// Endpoint do SEU backend (não da Anthropic). Vazio = IA desligada = usa o mock.
const BACKEND_URL = (import.meta.env.VITE_AI_BACKEND_URL as string | undefined)?.trim() ?? ''

// Tempo máximo de espera pela IA antes de cair no banco local (resiliência).
const REQUEST_TIMEOUT_MS = 12_000

function moodLabel(mood: MoodId): string {
  return moodThemes[mood].label
}

// Monta o "briefing" que o backend usa para instruir o Claude. Mantemos a mesma
// intenção do banco local: 3 parágrafos, último sempre positivo e persuasivo
// sobre o uso diário do app, linguagem neutra de gênero.
function buildReflectionPayload(request: PositiveReflectionRequest) {
  return {
    userName: request.userName || '',
    mood: request.mood,
    moodLabel: moodLabel(request.mood),
    anxietyLevel: request.anxietyLevel,
    goal: request.goal,
    journalText: request.journalText || '',
  }
}

async function fetchReflectionFromBackend(
  request: PositiveReflectionRequest,
): Promise<{ paragraphs: string[] }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(`${BACKEND_URL}/reflection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildReflectionPayload(request)),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`backend_status_${response.status}`)
    const data = (await response.json()) as { paragraphs?: unknown }
    // Validação defensiva: só aceitamos um array de strings não vazio.
    if (
      Array.isArray(data.paragraphs) &&
      data.paragraphs.length > 0 &&
      data.paragraphs.every((p) => typeof p === 'string' && p.trim().length > 0)
    ) {
      return { paragraphs: data.paragraphs as string[] }
    }
    throw new Error('backend_invalid_shape')
  } finally {
    clearTimeout(timeout)
  }
}

class ClaudeAIService implements AIService {
  // Estes três delegam ao mock — não precisam de IA real por enquanto.
  greetingForMood(userName: string, mood: MoodId, anxietyLevel: number): string {
    return mockAIService.greetingForMood(userName, mood, anxietyLevel)
  }

  reply(request: AIReplyRequest): ReturnType<AIService['reply']> {
    return mockAIService.reply(request)
  }

  evolutionSummary(points: EvolutionSummaryPoint[]): ReturnType<AIService['evolutionSummary']> {
    return mockAIService.evolutionSummary(points)
  }

  // A reflexão do dia: tenta a IA real; se desligada ou com erro, usa o mock.
  async positiveReflection(request: PositiveReflectionRequest): Promise<{ paragraphs: string[] }> {
    // IA desligada (sem backend configurado) → banco local, custo zero.
    if (!BACKEND_URL) {
      return mockAIService.positiveReflection(request)
    }
    try {
      return await fetchReflectionFromBackend(request)
    } catch (error) {
      // Qualquer falha (rede, timeout, resposta inválida) cai no banco local.
      // Assim o usuário nunca fica sem reflexão, mesmo se a IA estiver fora.
      if (import.meta.env.DEV) {
        console.warn('[ClaudeService] IA indisponível, usando banco local:', error)
      }
      return mockAIService.positiveReflection(request)
    }
  }
}

export const claudeAIService = new ClaudeAIService()

// ─────────────────────────────────────────────────────────────────────────────
// COMO ATIVAR (quando você decidir plugar a IA de verdade)
//
// 1) Suba um backend com UMA rota POST /reflection. Exemplo de Edge Function
//    (Supabase / Vercel / Netlify Functions). A chave fica SÓ aqui, no servidor.
//    Modelo: claude-haiku-4-5 (rápido, acolhedor e barato para texto curto).
//    Cache de prompt: o bloco de instrução (system) é fixo e marcado com
//    cache_control → ~90% mais barato na parte repetida; só os dados do dia variam.
//
//    // server/reflection.ts  (Deno/Node — adapte ao seu provedor)
//    import Anthropic from '@anthropic-ai/sdk'
//    const client = new Anthropic() // lê ANTHROPIC_API_KEY do ambiente do servidor
//
//    const SYSTEM = `Você é o coach do SoulSpace, um app de autoestima e saúde
//    emocional para pessoas solteiras. Escreva uma reflexão para UM dia do
//    histórico, com EXATAMENTE 3 parágrafos de 3 a 4 linhas cada:
//    ¶1 leia o estado emocional do dia (humor + ansiedade);
//    ¶2 reenquadre com gentileza, conforme esse estado;
//    ¶3 SEMPRE positivo: incentive evoluir independentemente de o dia ter sido
//       bom ou ruim, e reforce com persuasão o uso diário do SoulSpace.
//    REGRA OBRIGATÓRIA — linguagem 100% neutra de gênero: o usuário pode ser
//    homem, mulher ou não-binário, e você NUNCA sabe o gênero. Jamais use
//    adjetivos/particípios flexionados ao se referir à pessoa ("cansado/a",
//    "sozinho/a", "pronto/a", "bem-vindo/a", "você mesmo"), nem "ele/ela". Use
//    construções neutras ("você", "quem você é", "a sua própria companhia",
//    "com disposição"). Tratar alguém no gênero errado quebra a confiança.
//    Tom acolhedor, leve e motivador. Responda em JSON: {"paragraphs": ["...","...","..."]}.`
//
//    export async function handler(req) {
//      const d = await req.json() // { userName, mood, moodLabel, anxietyLevel, goal, journalText }
//      const msg = await client.messages.create({
//        model: 'claude-haiku-4-5',
//        max_tokens: 600,
//        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
//        messages: [{
//          role: 'user',
//          content:
//            `Nome: ${d.userName || '(sem nome)'}\n` +
//            `Humor do dia: ${d.moodLabel} (${d.mood})\n` +
//            `Ansiedade: ${d.anxietyLevel}/10\n` +
//            `Objetivo: ${d.goal ?? '(não definido)'}\n` +
//            `Diário do dia: ${d.journalText || '(sem texto)'}`,
//        }],
//      })
//      const text = msg.content.find((b) => b.type === 'text')?.text ?? '{}'
//      // devolve { paragraphs: [...] } — faça JSON.parse com try/catch no servidor
//      return new Response(text, { headers: { 'Content-Type': 'application/json' } })
//    }
//
//    Dica: para garantir o formato, prefira output_config.format (JSON Schema)
//    em vez de pedir JSON no texto — ver skill claude-api (Structured Outputs).
//
// 2) Defina a URL do backend no .env do projeto (NÃO a chave da Anthropic!):
//       VITE_AI_BACKEND_URL=https://seu-backend.exemplo.com/api
//
// 3) Troque a instância em src/services/index.ts:
//       import { claudeAIService } from './claudeAIService'
//       export const aiService: AIService = claudeAIService
//
//    Pronto. Sem a env var, nada muda (mock, custo zero). Com ela, a reflexão
//    do dia passa a vir do Claude Haiku 4.5, com fallback automático para o
//    banco local se a IA falhar.
// ─────────────────────────────────────────────────────────────────────────────
