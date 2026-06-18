import { moodThemes } from '../theme/moodTheme'
import type { LifeStage } from '../lib/lifeStage'
import type { MoodId } from '../types'
import { delay, readValue, writeValue } from './localStorageDb'
import type { AIReplyRequest, AIService, EvolutionSummaryPoint, PositiveReflectionRequest } from './types'

// Mock do OpenAI GPT-4. Sem chave real: as respostas vêm de bancos de
// variações por categoria (palavra-chave + nível de ansiedade), escolhidas
// sem repetir a última e tecidas com o nome, humor e diário da pessoa — o
// suficiente para validar o fluxo do produto sem custo de API. Troque por
// uma chamada real à Chat Completions API mantendo a mesma assinatura.
//
// ⚠️ REGRA OBRIGATÓRIA — GÊNERO NEUTRO ⚠️
// Toda fala da IA e todo resumo do gráfico aqui DEVEM ser neutros de gênero. O
// usuário pode ser homem, mulher ou não-binário, e nunca sabemos o gênero —
// tratar no gênero errado quebra a confiança. NÃO use adjetivos/particípios
// flexionados ao falar da pessoa: "cansado/a", "sozinho/a", "pronto/a",
// "bem-vindo/a", "você mesmo", "ele/ela". Prefira "você", "quem você é", "a
// sua própria companhia", "com disposição", "quem aparece aqui". Ao adicionar
// ou editar QUALQUER frase abaixo, releia procurando marcas de gênero.
export const AI_TIMEOUT_RATE = 0.12

const BREATHING_EXERCISE = 'Respiração 4-4-6 (30s)'

// `name`/`userName` aqui já chega como SÓ o primeiro nome (normalizado no
// AppState/telas) — mais íntimo que nome completo. Não reconstrua o sobrenome.
const MOOD_GREETING: Record<MoodId, (name: string) => string> = {
  sad: (name) => `Oi, ${name}. Vi que hoje o seu coração está mais pesado. Quer me contar o que está pegando?`,
  neutral: (name) => `Oi, ${name}! Como foi o seu dia até agora? Estou por aqui se quiser desabafar.`,
  happy: (name) => `Oi, ${name}! Que bom te ver bem hoje. O que rolou de bom?`,
  veryHappy: (name) => `${name}, seu dia parece ter sido ótimo! Conta mais, eu quero saber.`,
  excited: (name) => `${name}, essa energia toda! Adorei. O que está te deixando assim?`,
}

type ReplyContext = {
  userName: string
  mood: MoodId
  anxietyLevel: number
  journalSnippet: string
  challengeId: string | null
  lifeStage: LifeStage
}

type Reply = { text: string; exerciseSuggested: string | null }
type Variant = (ctx: ReplyContext) => Reply

// Guarda o último texto devolvido por categoria, só nesta sessão do navegador,
// para nunca repetir a mesma frase duas vezes em seguida.
const lastReplyByCategory = new Map<string, string>()

function pickVariant(category: string, variants: Variant[], ctx: ReplyContext): Reply {
  const last = lastReplyByCategory.get(category)
  const pool = variants.length > 1 ? variants.filter((v) => v(ctx).text !== last) : variants
  const chosen = pool[Math.floor(Math.random() * pool.length)] ?? variants[0]
  const reply = chosen(ctx)
  lastReplyByCategory.set(category, reply.text)
  return reply
}

const ANXIETY_VARIANTS: Variant[] = [
  () => ({
    text:
      'Faz sentido sentir isso. Vamos tentar uma coisa rápida: inspire por 4 segundos, segure por 4 e solte em 6. ' +
      'Repete três vezes, eu espero aqui. Como você se sente depois?',
    exerciseSuggested: BREATHING_EXERCISE,
  }),
  ({ userName }) => ({
    text: `${userName ? `${userName}, ` : ''}respira comigo um momento: inspira em 4 segundos, segura por 4, solta em 6. Faz isso três vezes e me conta o que mudou no corpo.`,
    exerciseSuggested: BREATHING_EXERCISE,
  }),
  ({ journalSnippet }) => ({
    text: `${journalSnippet ? `Pensando no que você escreveu ("${journalSnippet}"), ` : ''}talvez o corpo precise de uma pausa antes da cabeça. Inspire 4s, segure 4s, solte em 6s, três vezes. Combinado?`,
    exerciseSuggested: BREATHING_EXERCISE,
  }),
]

const CALM_VARIANTS: Variant[] = [
  () => ({
    text: 'Isso! Você conseguiu reduzir a ansiedade agora. Guarda esse exercício, ele funciona. Te encontro de novo no próximo dia do seu plano.',
    exerciseSuggested: null,
  }),
  ({ userName }) => ({
    text: `Que bom, ${userName || 'pessoa'}. Esse alívio que você sentiu agora é prova de que o exercício funciona pra você. Pode repetir sempre que precisar.`,
    exerciseSuggested: null,
  }),
  () => ({
    text: 'Adorei ouvir isso. Guarda esse momento: você notou a ansiedade subir e conseguiu baixar ela por conta própria. Isso é treino acontecendo.',
    exerciseSuggested: null,
  }),
]

const LONELY_VARIANTS: Variant[] = [
  () => ({
    text: 'Sentir solidão não significa que algo está errado com você. Na maioria das vezes é só sinal de que você quer se conectar de verdade. Quer registrar isso no diário de hoje também?',
    exerciseSuggested: null,
  }),
  ({ userName }) => ({
    text: `${userName ? `${userName}, ` : ''}esse vazio da solidão é pesado, eu sei. Mas ele também mostra o quanto você valoriza conexão de verdade, não só companhia qualquer. Quer me contar mais?`,
    exerciseSuggested: null,
  }),
  () => ({
    text: 'Solidão dói, mas não é defeito seu. É um sinal pra cuidar de você agora, não pra se cobrar. O que ajudaria nesse momento: conversar mais um pouco ou fazer um exercício rápido?',
    exerciseSuggested: null,
  }),
]

const SAD_VARIANTS: Variant[] = [
  ({ userName }) => ({
    text: `${userName ? `${userName}, ` : ''}sinto que hoje está mais pesado pra você. Não precisa resolver tudo agora, só quero entender o que está pegando.`,
    exerciseSuggested: null,
  }),
  () => ({
    text: 'Dias assim existem, e está tudo bem não estar bem. Quer me contar o que aconteceu, ou prefere um exercício rápido pra aliviar um pouco agora?',
    exerciseSuggested: BREATHING_EXERCISE,
  }),
]

const ADVICE_VARIANTS: Variant[] = [
  ({ journalSnippet }) => ({
    text: `${journalSnippet ? `Lembrando do que você escreveu hoje ("${journalSnippet}"), ` : ''}meu conselho é: dê o próximo passo pequeno, não o maior. O que seria um passo pequeno agora?`,
    exerciseSuggested: null,
  }),
  ({ mood }) => ({
    text: `Com o humor que você registrou hoje (${moodThemes[mood].label.toLowerCase()}), eu diria: confie mais no que você já sabe sobre si do que no medo do que pode dar errado. Quer falar sobre uma situação específica?`,
    exerciseSuggested: null,
  }),
  () => ({
    text: 'Meu melhor conselho: trate-se como trataria alguém que você ama nesse momento. O que você diria pra essa pessoa?',
    exerciseSuggested: null,
  }),
]

const GENERIC_VARIANTS: Variant[] = [
  () => ({
    text: 'Entendi. Estou aqui com você. Se quiser, me conta mais um pouco, ou podemos fazer um exercício rápido para acalmar o corpo agora.',
    exerciseSuggested: null,
  }),
  ({ userName }) => ({
    text: `Estou ouvindo, ${userName || 'você'}. Pode continuar contando, ou se preferir eu te guio num exercício de respiração agora.`,
    exerciseSuggested: null,
  }),
  ({ journalSnippet }) => ({
    text: `${journalSnippet ? `Voltando ao que você escreveu hoje: "${journalSnippet}". ` : ''}Quer desenvolver mais esse ponto, ou prefere que eu sugira algo prático agora?`,
    exerciseSuggested: null,
  }),
]

// Respostas focadas no desafio atual. Sempre em tom positivo e prático, ligadas
// ao tema que a pessoa está trabalhando agora, para a conversa fazer sentido com
// o desafio vigente. Mantém a assinatura de Variant (pode usar o nome da pessoa).
const CHALLENGE_REPLIES: Record<string, Variant[]> = {
  loneliness: [
    ({ userName }) => ({ text: `${userName ? `${userName}, ` : ''}a sua própria companhia pode ser boa, e isso se aprende. Que tal escolher uma coisa pequena para fazer só por prazer hoje, sem cobrança?`, exerciseSuggested: null }),
    () => ({ text: 'Solidão não é um sinal de que algo está errado em você. Hoje, tente trocar o "estou só" por um "estou comigo". Quer me contar como foi seu dia?', exerciseSuggested: null }),
  ],
  'social-anxiety': [
    () => ({ text: 'Conversar com gente nova fica mais leve com pequenos passos. Que tal, hoje, só um "bom dia" para alguém? Já conta como vitória. Como você se sente com essa ideia?', exerciseSuggested: null }),
    ({ userName }) => ({ text: `${userName ? `${userName}, ` : ''}o nervosismo antes de falar com alguém é normal e passa. Se quiser, a gente faz uma respiração rápida antes do seu próximo contato social.`, exerciseSuggested: BREATHING_EXERCISE }),
  ],
  'self-love': [
    () => ({ text: 'Amar-se primeiro começa no jeito como você fala consigo. Repare hoje numa cobrança sua e tente trocá-la por algo mais gentil. O que você diria a quem você ama?', exerciseSuggested: null }),
    ({ userName }) => ({ text: `Você merece o mesmo carinho que oferece aos outros, ${userName || 'sabia'}? Me conta uma coisa boa que você fez hoje, por menor que pareça.`, exerciseSuggested: null }),
  ],
  'emotional-intelligence': [
    () => ({ text: 'Nomear o que você sente já é metade do caminho. Em vez de "tô mal", tente achar a palavra certa: é medo, cansaço, frustração? Qual encaixa melhor agora?', exerciseSuggested: null }),
    () => ({ text: 'Toda emoção traz um recado. Antes de reagir hoje, tente perguntar: o que isso que eu sinto está querendo me dizer? Quer pensar nisso comigo?', exerciseSuggested: null }),
  ],
  'self-knowledge': [
    () => ({ text: 'Perceber os seus padrões é um superpoder silencioso. Tem alguma situação que se repete na sua vida afetiva? Falar dela aqui ajuda a enxergar melhor.', exerciseSuggested: null }),
    () => ({ text: 'Repetir escolhas parecidas é humano, e dá para mudar quando a gente percebe o ciclo. O que costuma se repetir para você?', exerciseSuggested: null }),
  ],
  'letting-go': [
    () => ({ text: 'Soltar o passado não é esquecer, é deixar de carregar o peso. Tem algo que ainda ocupa espaço em você? Colocar em palavras já alivia um pouco.', exerciseSuggested: null }),
    ({ userName }) => ({ text: `${userName ? `${userName}, ` : ''}fazer as pazes com versões antigas suas é um presente que você se dá. O que você gostaria de finalmente deixar para trás?`, exerciseSuggested: null }),
  ],
  'self-care': [
    () => ({ text: 'Autocuidado é hábito, não luxo. Qual gesto pequeno você consegue fazer hoje por você: um copo d\'água, um alongamento, cinco minutos de silêncio?', exerciseSuggested: null }),
    () => ({ text: 'Cuidar de você todo dia, mesmo num gesto mínimo, muda como você se sente. O que faria seu corpo agradecer hoje?', exerciseSuggested: null }),
  ],
  boundaries: [
    () => ({ text: 'Dizer não é proteger o seu sim. Teve algum momento hoje em que você quis recusar algo? Pensar em como colocar esse limite já é praticar.', exerciseSuggested: null }),
    ({ userName }) => ({ text: `Colocar limites não te faz egoísta, ${userName || 'viu'}. Onde, na sua vida, um limite saudável faria bem agora?`, exerciseSuggested: null }),
  ],
  communication: [
    () => ({ text: 'Falar o que você quer evita muito mal-entendido. Tem algo que você anda esperando que adivinhem? Que tal ensaiar aqui como você diria?', exerciseSuggested: null }),
    () => ({ text: 'Pedir o que você precisa é um ato de coragem e de respeito por você. O que você gostaria de comunicar a alguém hoje?', exerciseSuggested: null }),
  ],
  'active-listening': [
    () => ({ text: 'Ouvir de verdade é um presente raro. Na próxima conversa, tente escutar para entender, não para responder. Como costuma ser para você ouvir os outros?', exerciseSuggested: null }),
    () => ({ text: 'Prestar atenção plena em quem fala aproxima as pessoas. Quer treinar isso hoje numa conversa e me contar como foi?', exerciseSuggested: null }),
  ],
  vulnerability: [
    () => ({ text: 'Mostrar quem você é, sem armadura, é o que cria laços de verdade. Tem algo seu que você costuma esconder? Aqui é um lugar seguro para começar.', exerciseSuggested: null }),
    ({ userName }) => ({ text: `${userName ? `${userName}, ` : ''}deixar alguém te conhecer de verdade dá frio na barriga, e vale a pena. O que você gostaria de se permitir mostrar?`, exerciseSuggested: null }),
  ],
  confidence: [
    () => ({ text: 'Confiança se constrói com pequenas provas que você dá a você. Qual decisão sua, recente, mostrou que você sabe se cuidar?', exerciseSuggested: null }),
    () => ({ text: 'Você sabe mais do que pensa sobre o que é bom para você. Que escolha, hoje, daria para fazer confiando um pouco mais em si?', exerciseSuggested: null }),
  ],
  'self-worth': [
    () => ({ text: 'Reconhecer o seu valor é o que define o que você aceita numa relação. O que, para você, é inegociável quando se trata de receber bom tratamento?', exerciseSuggested: null }),
    ({ userName }) => ({ text: `Você merece relações que somam, ${userName || 'sabia'}. O que faz você sentir que tem valor de verdade?`, exerciseSuggested: null }),
  ],
  presence: [
    () => ({ text: 'Viver o presente tira o peso do que ainda nem aconteceu. Pare um instante: o que está ao seu redor agora que é bom e você não tinha notado?', exerciseSuggested: null }),
    () => ({ text: 'A cabeça adora correr para o futuro. Que tal, hoje, fazer uma coisa com atenção total, sem pressa? Quer me contar qual?', exerciseSuggested: null }),
  ],
  gratitude: [
    () => ({ text: 'Treinar o olhar para o que dá certo muda o seu dia. Me conta três coisas boas de hoje, mesmo as pequenas?', exerciseSuggested: null }),
    () => ({ text: 'Gratidão não é ignorar o que dói, é lembrar do que também está bom. O que, hoje, valeu a pena?', exerciseSuggested: null }),
  ],
  'open-heart': [
    () => ({ text: 'Abrir-se para o novo é deixar uma fresta para coisas boas entrarem. Tem alguma chance que você anda evitando por receio? Falar dela ajuda.', exerciseSuggested: null }),
    ({ userName }) => ({ text: `${userName ? `${userName}, ` : ''}confiar de novo é um processo, e você pode ir no seu tempo. O que ajudaria você a baixar um pouco a guarda?`, exerciseSuggested: null }),
  ],
  'first-dates': [
    () => ({ text: 'Encontro bom é aquele em que você consegue ser quem você é. Antes do próximo, lembre: isso não é uma prova, é só conhecer alguém. Como se sente com isso?', exerciseSuggested: null }),
    () => ({ text: 'A ansiedade antes de um encontro é normal. Que tal combinar com você de só curtir a conversa, sem cobrar um resultado? Quer fazer uma respiração antes?', exerciseSuggested: BREATHING_EXERCISE }),
  ],
  conflict: [
    () => ({ text: 'Conflito não é o fim de uma relação, é parte dela. A ideia é brigar pelo entendimento, não contra a pessoa. Tem algum desentendimento te incomodando agora?', exerciseSuggested: null }),
    () => ({ text: 'Discordar sem se perder é uma habilidade e tanto. Antes de responder no calor, que tal respirar e pensar no que você realmente quer dizer?', exerciseSuggested: BREATHING_EXERCISE }),
  ],
  trust: [
    () => ({ text: 'Confiar de novo depois de se machucar é corajoso. Você pode dar uma chance ao novo sem carregar o peso do antigo. O que confiança significa para você hoje?', exerciseSuggested: null }),
    ({ userName }) => ({ text: `${userName ? `${userName}, ` : ''}nem todo mundo é como quem te feriu. Que passo pequeno de confiança você se sentiria à vontade para dar?`, exerciseSuggested: null }),
  ],
  interdependence: [
    () => ({ text: 'Dá para estar junto sem deixar de ser você. O que é importante manter como seu, mesmo dentro de uma relação? Pensar nisso protege a sua identidade.', exerciseSuggested: null }),
    () => ({ text: 'Relação saudável é dois inteiros, não duas metades. O que faz você se sentir quem você é, independente de quem está do seu lado?', exerciseSuggested: null }),
  ],
  intimacy: [
    () => ({ text: 'Intimidade de verdade é se deixar conhecer aos poucos. Que tal compartilhar com alguém algo um pouco mais seu esta semana? Como se sente com isso?', exerciseSuggested: null }),
    () => ({ text: 'Chegar perto de alguém de um jeito que faz bem leva tempo e confiança. O que aproximação significa para você?', exerciseSuggested: null }),
  ],
  'healthy-love': [
    () => ({ text: 'Você já reuniu muita coisa nessa jornada. Amor saudável é colocar tudo isso em prática: respeito, comunicação, espaço para os dois. O que você quer levar adiante?', exerciseSuggested: null }),
    ({ userName }) => ({ text: `${userName ? `${userName}, ` : ''}olha o quanto você evoluiu até aqui. Que tipo de amor você sente vontade de construir agora?`, exerciseSuggested: null }),
  ],
}

// Obs.: o pedido de exercício físico é tratado antes, no AppState, que sorteia
// do catálogo compartilhado (lib/exercises.ts) com regra de não repetição. Aqui
// a IA cuida só do acolhimento emocional e das respostas por tema do desafio.

// Mensagens de bem-estar por momento de vida (persona). Tom positivo e
// profissional, no espírito de cada estado. Numa integração futura com a OpenAI,
// estas servem de referência de tom (o lifeStage entra como contexto do prompt).
const LIFE_STAGE_REPLIES: Record<LifeStage, Variant[]> = {
  single: [
    ({ userName }) => ({ text: `${userName ? `${userName}, ` : ''}quanto mais você se valoriza, mais leve fica a sua vida. Hoje, faça uma coisa só pra você: um cuidado, um descanso, um prazer pequeno. Você merece.`, exerciseSuggested: null }),
    () => ({ text: 'Estar bem consigo é o que mais atrai gente boa para perto. Quando você se curte de verdade, isso transparece. Que tal cuidar do seu corpo hoje, com um exercício leve e uma refeição que te faça bem?', exerciseSuggested: null }),
    () => ({ text: 'Se amar não é vaidade, é base. A pessoa certa chega quando a sua vida já está cheia, e não para te completar. Como você pode caprichar na sua própria companhia hoje?', exerciseSuggested: null }),
    ({ userName }) => ({ text: `${userName ? `${userName}, ` : ''}você fica mais interessante quando vive a sua própria vida com gosto. Movimente o corpo, coma bem, faça o que te alegra. O brilho vem de dentro.`, exerciseSuggested: null }),
  ],
  committed: [
    ({ userName }) => ({ text: `${userName ? `${userName}, ` : ''}relação boa se cultiva todo dia, no respeito e nas pequenas atenções. Que tal convidar a pessoa pra fazer um exercício de respiração com você agora? A dois rende mais.`, exerciseSuggested: BREATHING_EXERCISE }),
    () => ({ text: 'Casal que cuida da saúde emocional junto cresce junto. Vocês podem registrar o humor cada um e conversar sobre isso sem julgamento. Como está a sintonia de vocês hoje?', exerciseSuggested: null }),
    () => ({ text: 'O respeito mútuo é o chão de tudo. Hoje, experimente reconhecer em voz alta uma coisa boa na sua pessoa. Pequenos gestos sustentam grandes relações.', exerciseSuggested: null }),
    ({ userName }) => ({ text: `${userName ? `${userName}, ` : ''}que tal fazerem os desafios do app a dois? Acompanhar o humor e a ansiedade um do outro aproxima e ajuda a relação a melhorar um pouquinho a cada dia.`, exerciseSuggested: null }),
  ],
  overcoming: [
    ({ userName }) => ({ text: `${userName ? `${userName}, ` : ''}o que passou, bom ou ruim, fica no lugar dele. O que importa agora é para onde você olha, e você está olhando para frente. Um passo de cada vez, hoje conta.`, exerciseSuggested: null }),
    () => ({ text: 'Recomeçar é de gente corajosa, e você está aqui fazendo isso. Cuide de você como cuidaria de quem ama: corpo em movimento, comida que nutre, descanso. Você vai vencer essa.', exerciseSuggested: null }),
    () => ({ text: 'Toda dor que você atravessou também te deu força. Agora é tempo de se reconstruir e se valorizar. O melhor da sua história ainda está sendo escrito.', exerciseSuggested: null }),
    ({ userName }) => ({ text: `${userName ? `${userName}, ` : ''}seja gentil com o seu tempo de cura, e seja otimista: a vida tem muito a oferecer daqui pra frente. Hoje, faça algo que te lembre que você segue em movimento e com vida.`, exerciseSuggested: null }),
  ],
}

function replyToKeywords(ctx: ReplyContext, message: string): Reply {
  const lower = message.toLowerCase()

  // Emoções agudas têm prioridade: a IA acolhe antes de "puxar" para o tema.
  if (/ansio|nervos|p[âa]nico|medo|aflit/.test(lower)) {
    return pickVariant('anxiety', ANXIETY_VARIANTS, ctx)
  }
  if (/calma|melhor|consegui|tranquil|aliviad/.test(lower)) {
    return pickVariant('calm', CALM_VARIANTS, ctx)
  }
  if (/triste|chatead|desanimad|sem[ \-]?vontade/.test(lower)) {
    return pickVariant('sad', SAD_VARIANTS, ctx)
  }
  if (ctx.anxietyLevel >= 7) {
    return pickVariant('anxiety', ANXIETY_VARIANTS, ctx)
  }
  if (/respira[çc]|respirar/.test(lower)) {
    return pickVariant('anxiety', ANXIETY_VARIANTS, ctx)
  }

  // Caso a mensagem mencione solidão e o desafio NÃO seja o de solidão, ainda
  // acolhe o tema da solidão (é uma dor forte que merece resposta direta).
  if (/s[óo]zinh|solid[ãa]o|ningu[ée]m/.test(lower) && ctx.challengeId !== 'loneliness') {
    return pickVariant('lonely', LONELY_VARIANTS, ctx)
  }

  // Pedido explícito ligado a bem-estar/autoestima/superação/casal: responde
  // com o tom da persona do momento de vida.
  if (/autoestima|me amar|me valorizar|me curtir|superar|recome[çc]ar|casal|relacionamento|meu par|minha pessoa/.test(lower)) {
    return pickVariant(`life:${ctx.lifeStage}`, LIFE_STAGE_REPLIES[ctx.lifeStage], ctx)
  }
  if (/conselho|o que eu fa[çc]o|o que fazer|me ajuda/.test(lower)) {
    return pickVariant('advice', ADVICE_VARIANTS, ctx)
  }

  // Sem emoção aguda: alterna entre o tema do desafio vigente e a mensagem de
  // bem-estar da persona, para a conversa ter as duas dimensões sem repetir.
  const hasChallenge = Boolean(ctx.challengeId && CHALLENGE_REPLIES[ctx.challengeId])
  if (hasChallenge && Math.random() < 0.5) {
    return pickVariant(`challenge:${ctx.challengeId}`, CHALLENGE_REPLIES[ctx.challengeId!], ctx)
  }
  if (LIFE_STAGE_REPLIES[ctx.lifeStage]) {
    return pickVariant(`life:${ctx.lifeStage}`, LIFE_STAGE_REPLIES[ctx.lifeStage], ctx)
  }
  return pickVariant('generic', GENERIC_VARIANTS, ctx)
}

// --- Reflexão por dia do histórico (tela de Evolução) -------------------------
// Antes a reflexão se baseava só no TEXTO do diário; com textos genéricos, todo
// dia caía na mesma mensagem. Agora analisa o HUMOR + a ANSIEDADE daquele dia e
// monta 3 parágrafos (3–4 linhas cada):
//   ¶1 — ancora no estado emocional real do dia (humor + ansiedade);
//   ¶2 — reenquadra com gentileza, conforme esse estado;
//   ¶3 — SEMPRE positivo: convida a evoluir (favorável ou não) e reforça com
//        persuasão o uso diário do SoulSpace.
// Os bancos têm várias variações por faixa, então dias diferentes (e cliques
// repetidos) trazem textos diferentes.

// Faixa de humor: baixo (triste/neutro) | médio (bem) | alto (muito bem/energia).
type MoodBand = 'low' | 'mid' | 'high'
// Faixa de ansiedade: calma (1–3) | moderada (4–6) | alta (7–10).
type AnxBand = 'calm' | 'medium' | 'high'

function moodBand(mood: MoodId): MoodBand {
  if (mood === 'sad' || mood === 'neutral') return 'low'
  if (mood === 'happy') return 'mid'
  return 'high'
}

function anxBand(level: number): AnxBand {
  if (level <= 3) return 'calm'
  if (level <= 6) return 'medium'
  return 'high'
}

// ¶1 — leitura do estado do dia, por combinação de humor × ansiedade.
const REFLECTION_OPENING: Record<MoodBand, Record<AnxBand, string[]>> = {
  low: {
    calm: [
      'Olhei o seu registro desse dia: o humor estava mais pra baixo, mas a ansiedade ficou tranquila. É um daqueles dias quietos, meio sem cor, e tudo bem ter dias assim.',
      'Nesse dia o astral andou cabisbaixo, ainda que sem agitação por dentro. Parece que foi um dia de marcha lenta, e reconhecer isso já é um cuidado com você.',
      'Esse dia teve um tom mais melancólico, mas com a mente em paz. Nem todo dia precisa brilhar, e a serenidade que você manteve já diz muito sobre você.',
      'Pelo seu registro, foi um dia de ânimo baixo e calmaria por dentro. Um céu nublado sem tempestade, daqueles que pedem só um pouco de aconchego.',
    ],
    medium: [
      'Vi que esse foi um dia mais pesado: o humor baixo e uma ansiedade rondando no meio do caminho. Carregar os dois ao mesmo tempo cansa, e você ainda assim apareceu aqui.',
      'Esse dia pediu mais de você: o ânimo lá embaixo e uma inquietação morna por dentro. Não foi leve, e registrar isso mostra coragem.',
      'No seu registro desse dia, o astral estava abatido e a cabeça um pouco agitada. É um peso duplo, e você seguiu mesmo assim, o que tem muito mérito.',
      'Esse dia veio cinzento, com o humor baixo e uma ansiedade que não dava trégua total. Reconhecer um dia assim, em vez de empurrar pra debaixo do tapete, já é evoluir.',
    ],
    high: [
      'Esse foi um dia difícil de verdade: humor baixo e a ansiedade bem alta, os dois puxando junto. Dias assim machucam, e mesmo assim você esteve presente aqui.',
      'Pelo seu registro, esse dia bateu forte: pouco ânimo e muita ansiedade ao mesmo tempo. É muita coisa para um dia só, e você atravessou.',
      'Esse dia foi uma tempestade: o humor no chão e a ansiedade no teto. Você não escolheu sentir isso, e ainda assim chegou até o fim do dia. Isso é resistência.',
      'Vi um dia de peso real no seu registro: tristeza e ansiedade alta de mãos dadas. Dias assim testam qualquer um, e o simples fato de você estar aqui revisitando ele mostra força.',
    ],
  },
  mid: {
    calm: [
      'Nesse dia você esteve num lugar bom: humor positivo e a ansiedade baixinha. Um dia equilibrado, desses que vale guardar na memória como referência.',
      'Vi um dia sereno no seu registro: com disposição boa e a mente calma. Esse tipo de dia mostra do que você é capaz quando as peças se encaixam.',
      'Esse dia teve um equilíbrio gostoso: ânimo bom e tranquilidade por dentro. É o tipo de dia que vale entender, porque ele guarda a sua receita de bem-estar.',
      'No seu registro, esse foi um dia leve e estável: nem eufórico, nem pesado, só num bom lugar. Essa serenidade é uma conquista, não um acaso.',
    ],
    medium: [
      'Esse dia teve um bom humor, mesmo com uma ansiedade média aparecendo aqui e ali. Você seguiu de pé com aquele frio na barriga, e isso tem valor.',
      'No seu registro desse dia, o ânimo estava bom, ainda que a cabeça desse umas voltas. Conviver com isso sem se derrubar é um sinal de força.',
      'Esse dia misturou um astral positivo com uma inquietação no meio do caminho. Manter o bom humor mesmo com a mente agitada é um equilíbrio e tanto.',
      'Vi um dia de luz e sombra no seu registro: disposição boa e uma ansiedade morna por trás. Você não deixou o friozinho apagar o seu dia, e isso conta muito.',
    ],
    high: [
      'Esse dia foi curioso: o humor se manteve bom apesar de uma ansiedade alta batendo. Conseguir sorrir mesmo com a mente acelerada não é pouca coisa.',
      'Vi um contraste nesse dia: você estava bem por fora, mas a ansiedade pesava por dentro. Segurar as duas coisas ao mesmo tempo merece reconhecimento.',
      'Esse dia teve uma força interessante: ânimo positivo enfrentando uma ansiedade alta de frente. Sustentar o bom humor sob pressão é um sinal de quanto você cresceu.',
      'No seu registro, esse dia foi de coragem: você se manteve bem mesmo com a mente a mil. Isso não é fingir que está tudo certo, é resiliência de verdade.',
    ],
  },
  high: {
    calm: [
      'Que dia bonito o seu nesse registro: humor lá em cima e a ansiedade quase muda. Esse é o seu melhor estado, e ver isso acontecer é uma alegria.',
      'Nesse dia você brilhou: muita disposição e a mente em paz. Guarde a sensação desse dia, ela é prova do que você consegue alcançar.',
      'Esse dia foi quase um presente: alto-astral e tranquilidade juntos. Esse é o terreno onde você floresce, e ele mostra o quanto a sua evolução já rendeu.',
      'No seu registro, esse dia foi pura leveza: feliz e em paz ao mesmo tempo. Memorize esse estado, porque ele é a sua melhor versão em ação.',
    ],
    medium: [
      'Esse dia teve um astral ótimo, com só uma pontinha de ansiedade no meio. Você viveu um dia animado sem deixar a inquietação tomar conta, e isso é maturidade emocional.',
      'Vi muita energia no seu registro desse dia, com uma ansiedade leve por trás. Curtir o alto-astral mesmo com um friozinho na barriga é um baita progresso.',
      'Esse dia foi vibrante, com só uma sombra de ansiedade no fundo. Você aproveitou o que tinha de bom sem se prender ao que incomodava, e isso é sabedoria.',
      'No seu registro, esse dia veio cheio de ânimo, apesar de uma inquietação discreta. Saber viver o lado bom sem ignorar o resto é um equilíbrio raro.',
    ],
    high: [
      'Esse dia foi intenso no melhor e no desafiador: muita energia e também muita ansiedade. Foi um dia vibrante e agitado, e você surfou essa onda toda.',
      'No seu registro, esse dia veio a mil: humor altíssimo e ansiedade no mesmo nível. Energia em estado puro, e você esteve no meio dela, viva e presente.',
      'Esse dia foi um furacão de emoções: euforia e ansiedade lado a lado, tudo no máximo. Viver dias assim com intensidade também faz parte de quem você é.',
      'Pelo seu registro, esse dia ferveu: muita alegria e muita agitação ao mesmo tempo. Foi um dia de extremos, e você o viveu por inteiro, sem se omitir.',
    ],
  },
}

// ¶2 — reenquadre gentil, conforme a faixa de ansiedade (o que mais pesa no momento).
const REFLECTION_MIDDLE: Record<AnxBand, string[]> = {
  calm: [
    'Quando a mente está calma assim, é o momento ideal para plantar bons hábitos. A paz que você sentiu nesse dia não foi sorte: foi você criando espaço dentro de si, e isso se aprende e se repete.',
    'Dias serenos também ensinam. Repare no que tornou esse dia mais leve, porque entender a sua própria receita de calma é uma das ferramentas mais poderosas que você pode ter.',
    'Essa tranquilidade é um terreno fértil. É nos dias calmos que a gente fortalece as raízes que vão segurar a gente nos dias de vento. Você está construindo isso sem nem perceber.',
    'A serenidade desse dia tem um valor silencioso: ela é a base de tudo. Quanto mais você reconhece e cultiva esses momentos, mais eles se tornam o seu normal, e não a exceção.',
  ],
  medium: [
    'Uma ansiedade no meio do caminho é normal e faz parte de ser humano. O segredo não é eliminá-la, e sim aprender a conviver sem deixar que ela dite o seu dia, e você já está treinando exatamente isso.',
    'Esse friozinho por dentro não é um defeito seu, é só o corpo pedindo atenção. Cada vez que você o reconhece em vez de fugir, ele perde um pouco da força. É assim que a calma se constrói.',
    'Uma inquietação morna assim é só a vida acontecendo, com seus altos e baixos. Você não precisa estar 100% sereno o tempo todo; precisa só aprender a não brigar com cada onda, e isso vem com a prática.',
    'Ter um pouco de ansiedade e seguir em frente mesmo assim é um treino e tanto. Cada dia desses é uma repetição que fortalece a sua capacidade de se equilibrar. Você está ficando mais forte nisso.',
  ],
  high: [
    'A ansiedade alta sobe como uma onda, mas, se você não briga com ela, ela sempre baixa. Você já passou por dias assim antes e continua aqui, inteiro. Isso é a prova viva de que você é mais forte do que ela.',
    'O que você sentiu nesse dia era real, e também era passageiro. A mente acelera, conta histórias assustadoras sobre o futuro, mas o agora quase sempre é mais seguro do que ela diz. Respirar fundo já é começar a vencer.',
    'Ansiedade alta engana: ela faz parecer que o perigo é agora, quando quase sempre é só um pensamento. Você sobreviveu a 100% dos seus piores dias até hoje. Esse número não mente, e ele fala a seu favor.',
    'Quando a ansiedade aperta forte, lembre que ela é uma visitante, não uma moradora. Ela chega intensa, fica um tempo e vai embora. O seu trabalho não é expulsá-la na marra, é só esperar a maré virar, e ela sempre vira.',
  ],
}

// ¶3 — SEMPRE positivo: evoluir independentemente do estado + persuasão de uso diário.
const REFLECTION_CLOSING = [
  'E olha: cada dia que você registra aqui é um tijolo na pessoa que você está construindo. Não largue isso por nada. O SoulSpace está com você todo dia, e é essa constância que vai transformar, pouco a pouco, a forma como você se enxerga e enxerga a vida.',
  'Independente de como foi esse dia, ele te aproximou de quem você quer ser. Volte amanhã, e depois, e no outro: é o uso diário do SoulSpace que muda tudo. A sua evolução acontece nos pequenos passos, e nós vamos estar aqui em cada um deles.',
  'Seja qual for o humor, a sua evolução não para, e a melhor parte é que você tem companhia nessa caminhada. Faça do SoulSpace um hábito diário: é essa presença constante que vai, dia após dia, aperfeiçoar o jeito como você se vê e como vive. Conte com a gente, sempre.',
  'Dias bons e dias difíceis, todos contam na sua jornada. O segredo de quem transforma a própria vida é não desistir do processo: apareça aqui todo dia, nem que seja por um minuto. O SoulSpace existe para te ajudar a evoluir, e essa evolução muda a sua vida inteira.',
  'A verdade é simples: quem aparece todo dia é quem colhe a transformação. Você já começou, e isso é o mais difícil. Não solte a mão do SoulSpace agora, porque é exatamente essa rotina que vai reescrever, dia após dia, a relação que você tem consigo.',
  'Pense daqui a alguns meses, olhando para trás e vendo o quanto evoluiu. Esse futuro se constrói num clique por dia, aqui. Continue voltando: o SoulSpace é a sua academia emocional, e cada visita te deixa mais forte, mais leve e mais firme.',
  'O seu eu de amanhã agradece cada dia que você passa por aqui hoje. Não existe evolução sem constância, e a constância é justamente o nosso forte. Faça do SoulSpace parte da sua rotina e veja, com o tempo, a sua vida inteira mudar de qualidade.',
]

// Escolhe um item evitando repetir a última escolha daquele "slot" (nesta sessão
// do navegador). Garante que cliques seguidos não tragam o mesmo texto.
const lastPickBySlot = new Map<string, string>()
function pickFresh(slot: string, items: string[]): string {
  const last = lastPickBySlot.get(slot)
  const pool = items.length > 1 ? items.filter((item) => item !== last) : items
  const chosen = pool[Math.floor(Math.random() * pool.length)]
  lastPickBySlot.set(slot, chosen)
  return chosen
}

// --- Resumo da evolução (tela de Evolução) ------------------------------------
// Analisa de fato a série (não é texto aleatório): compara dias úteis x fim de
// semana, mede a tendência do humor e da ansiedade e classifica numa categoria.
// Cada categoria tem VÁRIAS variações de texto; uma regra de não-repetição
// garante que a mesma mensagem não volte dentro de 3 dias, mesmo que o padrão
// de humor/ansiedade se repita — para o resumo nunca soar travado ou mecânico.
// Todas as frases são neutras de gênero (sem "ele/ela", "cansado/a" etc.).

type SummaryCategory =
  | 'fewData'
  | 'weekendWorseBoth'
  | 'weekendAnxWorse'
  | 'weekendMoodWorse'
  | 'weekendBest'
  | 'weekdayAnxWorse'
  | 'weekendMoodBetter'
  | 'trendImproving'
  | 'trendImprovingSoft'
  | 'trendDip'
  | 'stable'

// Banco de variações por categoria (4 cada). Mesmo tom divertido e inspirador,
// mesma intenção, palavras diferentes — é daqui que vem a não-repetição.
const SUMMARY_BANK: Record<SummaryCategory, string[]> = {
  fewData: [
    'Sua jornada está só começando, e já dá gosto de ver! 🌱 Continue registrando: em poucos dias seu gráfico vira um mapa do que te levanta e do que pesa.',
    'Primeiros passos dados! 👣 Cada registro que você faz vira uma pista. Daqui a pouco dá pra enxergar com clareza o que te faz bem.',
    'Está plantando as sementes da sua evolução. 🌿 Mais alguns dias de diário e a gente começa a ver padrões bem interessantes aqui.',
    'Começo de história sempre tem aquele friozinho gostoso. ✨ Siga registrando: em breve seu gráfico vai ter muito a te contar.',
  ],
  weekendWorseBoth: [
    'Curioso: a semana te mantém firme, mas o fim de semana mexe com você. 🧭 Que tal preencher sábado e domingo com algo que te faça bem? Pequenos planos viram grandes âncoras.',
    'Sua semana flui, mas o fim de semana pesa um pouco mais nos dois lados. 🌗 Vale combinar com você um programa gostoso pro sábado, mesmo que simples. Faz diferença!',
    'Notei que o fim de semana costuma te desafiar mais que a correria da semana. 🗺️ Dar um "plano" pros dias livres, do seu jeito, costuma virar o jogo.',
    'Dias úteis no controle, fim de semana pedindo atenção. 🤍 Que tal encher sábado e domingo de coisas que te fazem bem? Você merece esse cuidado.',
  ],
  weekendAnxWorse: [
    'Reparei que a ansiedade dá as caras mais no fim de semana do que na correria da semana. 🌬️ Vale criar um ritual leve pra esses dias: um passeio, um hobby, um respiro só seu.',
    'O fim de semana parece soltar mais a ansiedade do que os dias cheios. 🍃 Um pequeno ritual de descompressão no sábado pode ser seu melhor aliado.',
    'Interessante: com menos rotina, a ansiedade encontra brecha no fim de semana. 🧘 Que tal planejar algo leve e prazeroso pra ocupar esse espaço com calma?',
    'A correria da semana até te ancora, mas o fim de semana mexe com a ansiedade. 🌊 Criar um respiro planejado pra esses dias costuma acalmar bastante.',
  ],
  weekendMoodWorse: [
    'Sua semana segura as pontas, mas o fim de semana pede um carinho extra. 🌼 Planeje algo pequeno e gostoso pro sábado: até um café diferente já muda o astral.',
    'O humor dá uma esfriada no fim de semana, e isso tem solução. ☕ Um plano simples e prazeroso pros dias livres costuma reacender o brilho.',
    'Reparei que o fim de semana abaixa um pouco o seu astral. 🌻 Que tal reservar um programa que te anime, mesmo que mínimo? Pequenos gestos, grande efeito.',
    'Durante a semana você flui, no fim de semana o humor pede atenção. 💛 Dar um propósito gostoso pro sábado e domingo já levanta bastante.',
  ],
  weekendBest: [
    'Olha o padrão aí: a semana puxa a ansiedade pra cima, mas o fim de semana traz seu melhor astral! ✨ Que tal roubar um pouquinho daquela leveza do sábado pra rotina?',
    'Fim de semana é o seu auge: humor lá em cima e ansiedade lá embaixo! 🌟 Descobrir o que te faz tão bem nesses dias é ouro pra levar pra semana.',
    'Dá pra ver que você floresce no fim de semana. 🌸 A missão agora é trazer um pedacinho dessa energia pros dias mais corridos.',
    'Seu fim de semana é praticamente um spa emocional: leve e feliz! 🧖 Repare na receita desses dias e aplique em doses na semana.',
  ],
  weekdayAnxWorse: [
    'A semana anda testando seu equilíbrio, mas você está de pé! 💪 Descubra o que torna o fim de semana mais leve e leve essa receita secreta pros dias corridos.',
    'Os dias úteis apertam mais a ansiedade, e ainda assim você segue firme. 🔧 Trazer um respiro dos dias calmos pra rotina pode aliviar bastante.',
    'A correria da semana cobra seu preço na ansiedade, percebeu? ⚙️ Que tal plantar pequenos momentos de pausa no meio dos dias cheios?',
    'Semana intensa, ansiedade mais alta, e você aguentando o tranco. 🌱 Pequenas pausas planejadas nos dias úteis fazem mais efeito do que parece.',
  ],
  weekendMoodBetter: [
    'Seu humor brilha mais no fim de semana, e isso é uma pista valiosa! 🌟 Repare no que te faz tão bem nesses dias e traga uma dose pro meio da semana.',
    'O astral sobe quando chega o fim de semana, e tem ouro nessa informação. ☀️ O que te alegra no sábado pode virar combustível pros dias úteis.',
    'Reparei que você fica mais leve no fim de semana. 🎈 Entender o porquê é o primeiro passo pra espalhar esse astral pela semana toda.',
    'Fim de semana é quando seu humor decola! 🚁 Que tal mapear o que te faz tão bem e levar um pedacinho pra rotina?',
  ],
  trendImproving: [
    'Que evolução linda de ver: o humor subindo e a ansiedade cedendo, dia após dia! 🚀 Seja lá o que você tem feito, está funcionando. Siga firme nessa toada.',
    'Olha você voando: humor em alta e ansiedade em queda! 📈 Esse progresso é mérito seu. Continue com o que tem dado certo.',
    'O gráfico está contando uma bela história: você melhor a cada dia. 🌅 O que você anda fazendo merece um troféu. Mantenha o ritmo!',
    'Humor pra cima, ansiedade pra baixo: combinação de quem está no caminho certo! 🎯 Você está construindo algo bom aqui, dá pra sentir.',
  ],
  trendImprovingSoft: [
    'O vento já está virando a seu favor: dá pra sentir o humor melhorando e a ansiedade afrouxando. 🌤️ Repare no que tem ajudado e capriche mais um pouco nisso.',
    'Tem uma melhora discreta e real acontecendo por aqui. 🍀 Pequenos avanços somam muito. Continue regando o que está dando certo.',
    'Devagar e sempre: seu humor e sua calma vêm ganhando terreno. 🐢 Esse progresso silencioso é dos mais sólidos. Siga assim.',
    'Dá pra notar a maré começando a virar pro seu lado. 🌅 Observe o que tem feito bem e dobre a aposta nisso, sem pressa.',
  ],
  trendDip: [
    'Os últimos dias vieram mais nublados, e tudo bem: até os melhores enfrentam tempestades. ⛅ Lembre do que costuma te acalmar e reserve um cantinho do dia pra isso.',
    'Uma fase mais cinzenta apareceu, e ela também passa. 🌧️ Seja gentil consigo e volte ao que costuma te trazer paz. Você já superou outras.',
    'Dias mais pesados batem à porta de vez em quando, e não definem você. 🌫️ Um gesto pequeno de autocuidado hoje já é um bom recomeço.',
    'O céu andou fechando um pouco por aqui, e está tudo bem sentir isso. 🌦️ Resgate o que te acalma e dê esse presente a você hoje.',
  ],
  stable: [
    'Por aqui a maré está calma e estável, e estabilidade também é vitória! ⚓ Repare nos seus dias mais leves: entender o que faz bem é seu maior superpoder.',
    'Tudo num platô tranquilo, e isso tem seu valor: constância é base. 🧱 Observe seus melhores dias pra descobrir o que te sustenta.',
    'Seu humor e sua ansiedade vêm caminhando lado a lado, equilibrados. ⚖️ Manter o barco firme já é um baita feito. Siga atento ao que te faz bem.',
    'Águas calmas por enquanto, e calmaria também é progresso. 🛶 Use esse momento pra notar o que, nos dias bons, faz toda a diferença.',
  ],
}

function avg(nums: number[]): number {
  return nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : 0
}

// 0 = domingo, 6 = sábado. Usamos UTC para casar com o "YYYY-MM-DD" salvo.
function isWeekend(isoDate: string): boolean {
  const day = new Date(`${isoDate}T12:00:00Z`).getUTCDay()
  return day === 0 || day === 6
}

// Decide a categoria do resumo a partir da série (a lógica de antes, agora
// devolvendo só a "etiqueta"; o texto vem do banco com a regra de não-repetição).
//
// Em vez de uma cascata rígida (que sempre caía no mesmo ramo e grudava num
// tema só, tipo "fim de semana"), agora montamos uma LISTA de categorias
// candidatas ORDENADA por relevância. Cada candidata ganha uma "força"; a de
// maior força vem primeiro. Quando há mais de um ângulo relevante (ex.: o
// gráfico melhorou E há um padrão semanal), os dois entram na lista e a regra
// de não-repetição escolhe o primeiro ainda "fresco" — fazendo o resumo
// alternar de ângulo ao longo dos dias, sem soar repetitivo.
//
// Limiares mais altos para o padrão semanal: só vira assunto quando a diferença
// é de fato marcante (humor >= 0.8; ansiedade >= 1.5). Diferenças pequenas não
// roubam o protagonismo da tendência geral.
function classifyEvolution(points: EvolutionSummaryPoint[]): SummaryCategory[] {
  if (points.length < 3) return ['fewData']

  const ordered = [...points].sort((a, b) => a.date.localeCompare(b.date))
  const weekend = ordered.filter((p) => isWeekend(p.date))
  const weekday = ordered.filter((p) => !isWeekend(p.date))

  const mid = Math.floor(ordered.length / 2)
  const moodFirst = avg(ordered.slice(0, mid).map((p) => p.moodScore))
  const moodSecond = avg(ordered.slice(mid).map((p) => p.moodScore))
  const anxFirst = avg(ordered.slice(0, mid).map((p) => p.anxietyLevel))
  const anxSecond = avg(ordered.slice(mid).map((p) => p.anxietyLevel))

  const moodDelta = moodSecond - moodFirst // + = humor melhorou
  const anxDelta = anxFirst - anxSecond // + = ansiedade caiu (melhorou)

  // Cada candidata é {categoria, força}. Força maior = mais relevante/primeiro.
  const candidates: Array<{ category: SummaryCategory; strength: number }> = []

  // --- Tendência geral (a "história principal" do gráfico) ---
  const moodUp = moodDelta >= 0.4
  const moodDown = moodDelta <= -0.4
  const anxDown = anxDelta >= 1
  const anxUp = anxDelta <= -1
  // Força da tendência: soma das magnitudes, normalizada para ~0..3.
  const trendStrength = Math.abs(moodDelta) * 1.2 + Math.abs(anxDelta) * 0.5

  if (moodUp && anxDown) candidates.push({ category: 'trendImproving', strength: trendStrength + 1 })
  else if (moodUp || anxDown) candidates.push({ category: 'trendImprovingSoft', strength: trendStrength + 0.6 })
  else if (moodDown || anxUp) candidates.push({ category: 'trendDip', strength: trendStrength + 0.8 })

  // --- Padrão semana x fim de semana (ângulo complementar) ---
  if (weekend.length >= 1 && weekday.length >= 2) {
    const moodWeekend = avg(weekend.map((p) => p.moodScore))
    const moodWeekday = avg(weekday.map((p) => p.moodScore))
    const anxWeekend = avg(weekend.map((p) => p.anxietyLevel))
    const anxWeekday = avg(weekday.map((p) => p.anxietyLevel))

    const moodWkndDelta = moodWeekend - moodWeekday // + = humor melhor no FDS
    const anxWkndDelta = anxWeekday - anxWeekend // + = ansiedade pior na semana

    const moodBetterOnWeekend = moodWkndDelta >= 0.8
    const moodWorseOnWeekend = moodWkndDelta <= -0.8
    const anxWorseOnWeekday = anxWkndDelta >= 1.5
    const anxWorseOnWeekend = anxWkndDelta <= -1.5
    const weeklyStrength = Math.abs(moodWkndDelta) + Math.abs(anxWkndDelta) * 0.5

    if (moodWorseOnWeekend && anxWorseOnWeekend) candidates.push({ category: 'weekendWorseBoth', strength: weeklyStrength })
    else if (anxWorseOnWeekend) candidates.push({ category: 'weekendAnxWorse', strength: weeklyStrength })
    else if (moodWorseOnWeekend) candidates.push({ category: 'weekendMoodWorse', strength: weeklyStrength })
    else if (moodBetterOnWeekend && anxWorseOnWeekday) candidates.push({ category: 'weekendBest', strength: weeklyStrength })
    else if (anxWorseOnWeekday) candidates.push({ category: 'weekdayAnxWorse', strength: weeklyStrength })
    else if (moodBetterOnWeekend) candidates.push({ category: 'weekendMoodBetter', strength: weeklyStrength })
  }

  // Sem nada marcante: maré estável.
  if (candidates.length === 0) candidates.push({ category: 'stable', strength: 0 })

  // Ordena por força (desc) e devolve só as etiquetas, na ordem de prioridade.
  return candidates.sort((a, b) => b.strength - a.strength).map((c) => c.category)
}

// Memória da não-repetição: guarda, por mensagem mostrada, a data (YYYY-MM-DD).
// Mensagens vistas nos últimos 3 dias ficam "queimadas" e não voltam.
type SummaryShown = { text: string; date: string }
const SUMMARY_MEMORY_KEY = 'evolutionSummaryShown'
const NO_REPEAT_DAYS = 3

function daysBetween(aIso: string, bIso: string): number {
  const a = new Date(`${aIso}T12:00:00Z`).getTime()
  const b = new Date(`${bIso}T12:00:00Z`).getTime()
  return Math.round(Math.abs(a - b) / 86_400_000)
}

// Recebe as categorias candidatas EM ORDEM DE PRIORIDADE e escolhe uma frase
// evitando o que apareceu nos últimos 3 dias. Percorre as candidatas na ordem:
// usa a primeira que tenha mensagem fresca. Assim, se a categoria mais forte já
// foi usada recentemente, ele troca de ângulo (ex.: tendência → padrão semanal)
// em vez de repetir. Só recicla quando TODAS as candidatas estão queimadas.
function pickFreshFromBank(categories: SummaryCategory[]): string {
  const today = new Date().toISOString().slice(0, 10)

  const log = (readValue<SummaryShown[]>(SUMMARY_MEMORY_KEY) ?? []).filter(
    (entry) => daysBetween(entry.date, today) <= 30, // mantém o log enxuto
  )

  const recentTexts = new Set(
    log.filter((entry) => daysBetween(entry.date, today) < NO_REPEAT_DAYS).map((entry) => entry.text),
  )

  // 1ª passada: a primeira categoria (mais relevante) com alguma frase fresca.
  let pool: string[] = []
  for (const category of categories) {
    const fresh = SUMMARY_BANK[category].filter((text) => !recentTexts.has(text))
    if (fresh.length > 0) {
      pool = fresh
      break
    }
  }

  // Tudo queimado: recicla a frase mais "fria" entre todas as candidatas.
  if (pool.length === 0) {
    const lastSeen = (text: string): string => {
      const dates = log.filter((entry) => entry.text === text).map((entry) => entry.date).sort()
      return dates.length ? dates[dates.length - 1] : '0000-00-00'
    }
    const all = categories.flatMap((category) => SUMMARY_BANK[category])
    pool = [...all].sort((a, b) => lastSeen(a).localeCompare(lastSeen(b))).slice(0, 1)
  }

  const chosen = pool[Math.floor(Math.random() * pool.length)]

  // Registra a escolha de hoje (substitui o registro anterior do mesmo texto).
  const updatedLog = log.filter((entry) => entry.text !== chosen)
  updatedLog.push({ text: chosen, date: today })
  writeValue(SUMMARY_MEMORY_KEY, updatedLog)

  return chosen
}

function buildEvolutionSummary(points: EvolutionSummaryPoint[]): string {
  return pickFreshFromBank(classifyEvolution(points))
}

class MockAIService implements AIService {
  greetingForMood(userName: string, mood: MoodId, _anxietyLevel: number): string {
    return MOOD_GREETING[mood](userName || 'você')
  }

  async positiveReflection(request: PositiveReflectionRequest): Promise<{ paragraphs: string[] }> {
    await delay(700 + Math.random() * 500)
    // Analisa o estado emocional REAL daquele dia (humor + ansiedade) e monta
    // 3 parágrafos, com o último sempre positivo e persuasivo sobre o uso diário.
    const mBand = moodBand(request.mood)
    const aBand = anxBand(request.anxietyLevel)

    const paragraphs = [
      pickFresh(`open:${mBand}:${aBand}`, REFLECTION_OPENING[mBand][aBand]),
      pickFresh(`mid:${aBand}`, REFLECTION_MIDDLE[aBand]),
      pickFresh('close', REFLECTION_CLOSING),
    ]
    return { paragraphs }
  }

  async evolutionSummary(points: EvolutionSummaryPoint[]): Promise<{ text: string }> {
    await delay(600 + Math.random() * 400)
    return { text: buildEvolutionSummary(points) }
  }

  async reply(request: AIReplyRequest): Promise<Reply> {
    await delay(900 + Math.random() * 600)
    if (Math.random() < AI_TIMEOUT_RATE) {
      throw new Error('ai_timeout')
    }
    const trimmedJournal = request.journalText.trim()
    const ctx: ReplyContext = {
      userName: request.userName,
      mood: request.mood,
      anxietyLevel: request.anxietyLevel,
      journalSnippet: trimmedJournal.length > 60 ? `${trimmedJournal.slice(0, 60)}…` : trimmedJournal,
      challengeId: request.challengeId,
      lifeStage: request.lifeStage,
    }
    return replyToKeywords(ctx, request.userMessage)
  }
}

export const mockAIService = new MockAIService()
