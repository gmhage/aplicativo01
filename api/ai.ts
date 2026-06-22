// ─────────────────────────────────────────────────────────────────────────────
// Backend de IA do SoulSpace — Vercel Function (uma só, com 3 rotas).
//
// Rotas (POST):
//   /api/ai/reflection          → reflexão do dia (3 parágrafos)
//   /api/ai/chat                → resposta da IA Coach (texto da conversa)
//   /api/ai/evolution-summary   → resumo curto da evolução (1–2 linhas)
//
// ⚠️ SEGURANÇA (regra de ouro do postmortem fitgym.site)
//   A ANTHROPIC_API_KEY fica SÓ aqui, no servidor (Environment Variable do
//   Vercel). NUNCA no front-end, NUNCA numa var VITE_*. O navegador só conhece
//   a URL desta função (VITE_AI_BACKEND_URL = https://SEU-APP.vercel.app/api/ai).
//
// ⚠️ GÊNERO NEUTRO — regra obrigatória do projeto.
//   Todo texto gerado deve ser neutro de gênero (o usuário pode ser de qualquer
//   gênero e nunca sabemos). Os prompts abaixo instruem isso explicitamente.
//
// CUSTO
//   Modelo: claude-haiku-4-5 (barato e rápido). O bloco `system` é fixo e marcado
//   com cache_control → a parte repetida fica ~90% mais barata. Só os dados do
//   dia variam entre chamadas.
//
// COMO ATIVAR (resumo — ver INTEGRACAO_IA.md):
//   1) npm i @anthropic-ai/sdk
//   2) No Vercel: Settings → Environment Variables → ANTHROPIC_API_KEY = sk-ant-...
//   3) No .env do front: VITE_AI_BACKEND_URL = https://SEU-APP.vercel.app/api/ai
//   4) Em src/services/index.ts trocar mockAIService por claudeAIService.
// ─────────────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic() // lê ANTHROPIC_API_KEY do ambiente do servidor

const MODEL = 'claude-haiku-4-5'

// Trava de gênero neutro reaproveitada em todos os prompts.
const GENDER_RULE =
  'REGRA OBRIGATÓRIA — linguagem 100% neutra de gênero: o usuário pode ser ' +
  'homem, mulher ou não-binário, e você NUNCA sabe o gênero. Jamais use ' +
  'adjetivos/particípios flexionados ao se referir à pessoa ("cansado/a", ' +
  '"sozinho/a", "pronto/a", "bem-vindo/a", "você mesmo"), nem "ele/ela". Use ' +
  'construções neutras ("você", "quem você é", "a sua própria companhia", "com ' +
  'disposição"). Tratar alguém no gênero errado quebra a confiança.'

const SYSTEM_REFLECTION =
  `Você é o coach do SoulSpace, um app de autoestima e saúde emocional. Escreva ` +
  `uma reflexão para UM dia do histórico, com EXATAMENTE 3 parágrafos de 3 a 4 ` +
  `linhas cada:\n` +
  `¶1 leia o estado emocional do dia (humor + ansiedade);\n` +
  `¶2 reenquadre com gentileza, conforme esse estado;\n` +
  `¶3 SEMPRE positivo: incentive evoluir independentemente de o dia ter sido bom ` +
  `ou ruim, e reforce com persuasão o uso diário do SoulSpace.\n` +
  `${GENDER_RULE}\n` +
  `Tom acolhedor, leve e motivador. Responda APENAS em JSON: ` +
  `{"paragraphs": ["...","...","..."]}.`

const SYSTEM_CHAT =
  `Você é a IA Coach do SoulSpace, um app de autoestima e saúde emocional. ` +
  `Converse de forma acolhedora, breve e prática (no máximo 4 linhas). Acolha a ` +
  `emoção da pessoa antes de orientar. Faça no máximo uma pergunta por resposta. ` +
  `NÃO invente exercícios físicos nem prometa funcionalidades; o app cuida disso ` +
  `em separado. Se a pessoa demonstrar ansiedade, pode sugerir respirar fundo, ` +
  `mas sem prescrever nada clínico.\n` +
  `${GENDER_RULE}\n` +
  `Responda APENAS em JSON: {"text": "sua resposta"}.`

const SYSTEM_EVOLUTION =
  `Você é o coach do SoulSpace. A partir da série de humor e ansiedade ao longo ` +
  `dos dias, escreva um resumo CURTO (1 a 2 linhas) interpretando a tendência de ` +
  `forma divertida, inspiradora e motivadora, e convidando ao uso diário. Pode ` +
  `usar 1 emoji.\n` +
  `${GENDER_RULE}\n` +
  `Responda APENAS em JSON: {"text": "seu resumo"}.`

// Extrai o texto do bloco de resposta e faz JSON.parse com proteção.
function parseJson<T>(raw: string): T {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('no_json')
  return JSON.parse(raw.slice(start, end + 1)) as T
}

async function callClaude(system: string, userContent: string, maxTokens: number): Promise<string> {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: userContent }],
  })
  const block = msg.content.find((b) => b.type === 'text')
  return block && block.type === 'text' ? block.text : '{}'
}

// ── Handlers por rota ────────────────────────────────────────────────────────

async function handleReflection(d: any) {
  const userContent =
    `Nome: ${d.userName || '(sem nome)'}\n` +
    `Humor do dia: ${d.moodLabel} (${d.mood})\n` +
    `Ansiedade: ${d.anxietyLevel}/10\n` +
    `Objetivo: ${d.goal ?? '(não definido)'}\n` +
    `Diário do dia: ${d.journalText || '(sem texto)'}`
  const raw = await callClaude(SYSTEM_REFLECTION, userContent, 600)
  const parsed = parseJson<{ paragraphs: string[] }>(raw)
  if (!Array.isArray(parsed.paragraphs) || parsed.paragraphs.length === 0) {
    throw new Error('invalid_shape')
  }
  return { paragraphs: parsed.paragraphs }
}

async function handleChat(d: any) {
  // Histórico recente (últimas mensagens) para a conversa ter contexto.
  const history: string = Array.isArray(d.history)
    ? d.history
        .slice(-6)
        .map((m: any) => `${m.messageFrom === 'ai' ? 'Coach' : 'Pessoa'}: ${m.text}`)
        .join('\n')
    : ''
  const userContent =
    `Nome: ${d.userName || '(sem nome)'}\n` +
    `Humor de hoje: ${d.mood}\n` +
    `Ansiedade: ${d.anxietyLevel}/10\n` +
    `Desafio atual: ${d.challengeId ?? '(nenhum)'}\n` +
    `Momento de vida: ${d.lifeStage}\n` +
    `Diário de hoje: ${d.journalText || '(sem texto)'}\n` +
    (history ? `\nConversa até agora:\n${history}\n` : '') +
    `\nMensagem da pessoa agora: ${d.userMessage}`
  const raw = await callClaude(SYSTEM_CHAT, userContent, 300)
  const parsed = parseJson<{ text: string }>(raw)
  if (typeof parsed.text !== 'string' || !parsed.text.trim()) throw new Error('invalid_shape')
  // O exercício é decidido pelo código do app (não pela IA): sempre null aqui.
  return { text: parsed.text, exerciseSuggested: null }
}

async function handleEvolutionSummary(d: any) {
  const points: any[] = Array.isArray(d.points) ? d.points : []
  const series = points
    .map((p) => `${p.date}: humor ${p.moodScore}/5, ansiedade ${p.anxietyLevel}/10`)
    .join('\n')
  const userContent = `Série de dias:\n${series || '(sem dados suficientes)'}`
  const raw = await callClaude(SYSTEM_EVOLUTION, userContent, 200)
  const parsed = parseJson<{ text: string }>(raw)
  if (typeof parsed.text !== 'string' || !parsed.text.trim()) throw new Error('invalid_shape')
  return { text: parsed.text }
}

// ── Roteador da Vercel Function ──────────────────────────────────────────────
// Uma função, três rotas. A rota vem no fim do caminho: /api/ai/<rota>.

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }
  // Identifica a sub-rota (.../reflection | .../chat | .../evolution-summary).
  const url: string = req.url || ''
  const route = url.split('?')[0].split('/').filter(Boolean).pop()

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {}
    let result: unknown
    if (route === 'reflection') result = await handleReflection(body)
    else if (route === 'chat') result = await handleChat(body)
    else if (route === 'evolution-summary') result = await handleEvolutionSummary(body)
    else {
      res.status(404).json({ error: 'unknown_route' })
      return
    }
    res.status(200).json(result)
  } catch (error) {
    // O front tem fallback para o banco local; aqui só sinalizamos a falha.
    console.error('[api/ai] erro:', error)
    res.status(502).json({ error: 'ai_failed' })
  }
}
