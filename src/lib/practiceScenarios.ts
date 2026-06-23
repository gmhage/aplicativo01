// ─────────────────────────────────────────────────────────────────────────────
// Cenários de treino de conversa do SoulSpace Conexão.
//
// Cada cenário vira um "papel" que o SoulSpace assume na conversa guiada: a
// pessoa pratica aquela situação num lugar seguro, erra à vontade e, ao final,
// recebe um feedback. O campo `aiRole` é o briefing que entra no contexto da IA
// (quando ligada); com a IA desligada, a conversa cai no banco local (mock).
//
// Linguagem 100% neutra de gênero (ver feedback do projeto): nada de "ele/ela",
// nem adjetivos flexionados ao falar da pessoa.
// ─────────────────────────────────────────────────────────────────────────────

export interface PracticeScenario {
  id: string
  /** Emoji que ilustra o cenário no menu. */
  emoji: string
  /** Título curto exibido no card. */
  title: string
  /** Frase de apoio no card: a dor/contexto daquela situação. */
  subtitle: string
  /** Como o SoulSpace deve se portar na conversa (briefing da IA). */
  aiRole: string
  /** Primeira fala do SoulSpace ao abrir a conversa do cenário. */
  opening: string
}

export const PRACTICE_SCENARIOS: PracticeScenario[] = [
  {
    id: 'first-date',
    emoji: '☕',
    title: 'Primeiro encontro',
    subtitle: 'Ensaie aquele primeiro date sem o frio na barriga de valer.',
    aiRole:
      'Faça o papel de alguém num primeiro encontro com a pessoa, de forma gentil e realista. Puxe conversa, demonstre interesse, e ajude a pessoa a se soltar. Ao longo do treino, faça perguntas leves como num date de verdade.',
    opening: 'Oi! Que bom finalmente te encontrar pessoalmente. Me conta: como foi o seu dia até aqui?',
  },
  {
    id: 'break-ice',
    emoji: '💬',
    title: 'Puxar assunto',
    subtitle: 'Treine começar uma conversa com alguém que te interessa.',
    aiRole:
      'Faça o papel de alguém que a pessoa quer conhecer melhor (num app, numa festa, no trabalho). Responda de forma simpática e dê ganchos para a conversa fluir, sem facilitar demais — o objetivo é a pessoa treinar a iniciativa.',
    opening: 'Oi! Acho que a gente ainda não se falou direito. O que te trouxe aqui hoje?',
  },
  {
    id: 'ask-out',
    emoji: '📅',
    title: 'Marcar de sair',
    subtitle: 'Pratique o convite — aquele momento de coragem de chamar pra sair.',
    aiRole:
      'Faça o papel de alguém com quem a pessoa já conversa e gosta. Conduza a conversa até o ponto natural de marcar algo, e responda de forma calorosa quando a pessoa fizer o convite, reforçando que arriscar valeu a pena.',
    opening: 'Adoro conversar com você, viu? A gente conversa há um tempo já… como anda a sua semana?',
  },
  {
    id: 'ghosting',
    emoji: '🌫️',
    title: 'Lidar com um sumiço',
    subtitle: 'Aprenda a processar um ghosting sem que ele abale o seu valor.',
    aiRole:
      'Aqui você NÃO faz o papel de um par romântico. Faça o papel do coach acolhedor do SoulSpace, ajudando a pessoa a falar sobre um sumiço/ghosting que viveu, a separar o ocorrido do próprio valor, e a seguir em frente com gentileza.',
    opening: 'Sumiço dói, e não é frescura sua sentir isso. Me conta o que aconteceu — estou aqui pra te ouvir.',
  },
  {
    id: 'say-no',
    emoji: '🛡️',
    title: 'Dizer não / pôr limite',
    subtitle: 'Ensaie recusar algo e defender o seu espaço sem culpa.',
    aiRole:
      'Faça o papel de alguém que faz um pedido ou insiste em algo que a pessoa quer recusar. Seja realista (insista um pouco, com educação) para a pessoa treinar manter o limite com firmeza e gentileza. Ao final, reconheça quando ela conseguir.',
    opening: 'Ei, queria te pedir uma coisa… será que você consegue dar um jeito de me ajudar nesse fim de semana?',
  },
  {
    id: 'open-up',
    emoji: '💗',
    title: 'Expor um sentimento',
    subtitle: 'Treine se abrir e falar o que sente, mesmo dando frio na barriga.',
    aiRole:
      'Faça o papel de alguém próximo e seguro, que recebe bem a abertura da pessoa. Crie um espaço acolhedor para a pessoa praticar expressar um sentimento ou algo vulnerável, e responda com empatia, mostrando que se abrir aproxima.',
    opening: 'Pode falar comigo abertamente, tá? Esse é um espaço seguro. Tem algo que você anda querendo colocar pra fora?',
  },
]

// Reforço de neutralidade aplicado a TODOS os papéis: o par e a pessoa não têm
// gênero conhecido. Concatenado a cada aiRole para o backend instruir a IA. (O
// backend também tem essa regra no system, isto é redundância proposital.)
const NEUTRAL_RULE =
  ' Atue de forma totalmente neutra de gênero: não revele nem sugira ser homem ou ' +
  'mulher, não presuma o gênero da pessoa, e evite adjetivos/particípios ' +
  'flexionados. O treino precisa servir a pessoas de qualquer gênero e orientação.'

for (const scenario of PRACTICE_SCENARIOS) {
  scenario.aiRole += NEUTRAL_RULE
}

export function getScenarioById(id: string): PracticeScenario | undefined {
  return PRACTICE_SCENARIOS.find((s) => s.id === id)
}
