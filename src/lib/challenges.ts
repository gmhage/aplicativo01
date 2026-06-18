import type { GoalId } from '../types'

// Trilha de 22 desafios que soma exatamente 365 dias (1 ano de uso contínuo).
// A duração cresce ao longo da jornada: começa curta (7 dias) para dar uma
// vitória rápida e ir aumentando o compromisso conforme o hábito se firma.
// Cada desafio tem sua própria duração em `days`.
export interface Challenge {
  id: string
  order: number
  title: string
  focus: string
  days: number
  // Frase curta mostrada como "próximo desafio" no card de conclusão.
  teaser: string
}

export const challenges: Challenge[] = [
  {
    id: 'loneliness',
    order: 1,
    title: 'Superar a solidão',
    focus: 'Sentir-se bem na própria companhia, sem que a solidão dite o seu dia.',
    days: 7,
    teaser: 'Transformar o tempo só em tempo a seu favor.',
  },
  {
    id: 'social-anxiety',
    order: 2,
    title: 'Reduzir a ansiedade social',
    focus: 'Encarar conversas e encontros com menos nó na garganta.',
    days: 10,
    teaser: 'Ficar mais à vontade perto de gente nova.',
  },
  {
    id: 'self-love',
    order: 3,
    title: 'Amar-se primeiro',
    focus: 'Tratar-se com o mesmo carinho que você daria a quem ama.',
    days: 10,
    teaser: 'Construir uma autoestima que não depende dos outros.',
  },
  {
    id: 'emotional-intelligence',
    order: 4,
    title: 'Inteligência emocional',
    focus: 'Entender e nomear o que você sente antes de reagir.',
    days: 11,
    teaser: 'Reconhecer suas emoções no momento em que elas chegam.',
  },
  {
    id: 'self-knowledge',
    order: 5,
    title: 'Conhecer os seus padrões',
    focus: 'Perceber os gatilhos e ciclos que se repetem na sua vida afetiva.',
    days: 12,
    teaser: 'Enxergar o que te faz repetir as mesmas escolhas.',
  },
  {
    id: 'letting-go',
    order: 6,
    title: 'Soltar o que já passou',
    focus: 'Fazer as pazes com relações e versões antigas de você.',
    days: 13,
    teaser: 'Deixar o passado no lugar dele, com leveza.',
  },
  {
    id: 'self-care',
    order: 7,
    title: 'Cuidar de você todo dia',
    focus: 'Criar pequenos rituais diários de autocuidado.',
    days: 14,
    teaser: 'Fazer do cuidado consigo um hábito, não um luxo.',
  },
  {
    id: 'boundaries',
    order: 8,
    title: 'Aprender a dizer não',
    focus: 'Colocar limites saudáveis sem culpa.',
    days: 15,
    teaser: 'Proteger sua energia e seu tempo sem se sentir mal.',
  },
  {
    id: 'communication',
    order: 9,
    title: 'Comunicar o que você quer',
    focus: 'Pedir, combinar e expressar desejos de forma clara.',
    days: 16,
    teaser: 'Falar o que você precisa, sem esperar que adivinhem.',
  },
  {
    id: 'active-listening',
    order: 10,
    title: 'Ouvir de verdade',
    focus: 'Prestar atenção plena em quem fala com você.',
    days: 16,
    teaser: 'Escutar para entender, não só para responder.',
  },
  {
    id: 'vulnerability',
    order: 11,
    title: 'Mostrar quem você é',
    focus: 'Baixar a armadura e se permitir ser visto.',
    days: 17,
    teaser: 'Deixar alguém te conhecer de verdade.',
  },
  {
    id: 'confidence',
    order: 12,
    title: 'Construir confiança',
    focus: 'Confiar nas suas escolhas e no seu valor.',
    days: 18,
    teaser: 'Andar pelo mundo com mais segurança em quem você é.',
  },
  {
    id: 'self-worth',
    order: 13,
    title: 'Reconhecer o seu valor',
    focus: 'Saber o que você merece numa relação.',
    days: 19,
    teaser: 'Não aceitar menos do que faz bem para você.',
  },
  {
    id: 'presence',
    order: 14,
    title: 'Viver o presente',
    focus: 'Reduzir a ruminação e aproveitar o agora.',
    days: 20,
    teaser: 'Tirar a cabeça do futuro e curtir o que é hoje.',
  },
  {
    id: 'gratitude',
    order: 15,
    title: 'Praticar a gratidão',
    focus: 'Enxergar o que já é bom na sua vida.',
    days: 20,
    teaser: 'Treinar o olhar para o que está dando certo.',
  },
  {
    id: 'open-heart',
    order: 16,
    title: 'Abrir-se para o novo',
    focus: 'Baixar a guarda para deixar pessoas boas entrarem.',
    days: 21,
    teaser: 'Permitir-se confiar de novo, no seu tempo.',
  },
  {
    id: 'first-dates',
    order: 17,
    title: 'Encontros sem ansiedade',
    focus: 'Viver os primeiros encontros com mais leveza.',
    days: 21,
    teaser: 'Chegar num encontro sendo quem você é.',
  },
  {
    id: 'conflict',
    order: 18,
    title: 'Lidar com conflitos',
    focus: 'Discordar e resolver desentendimentos sem se perder.',
    days: 21,
    teaser: 'Brigar pela relação, não contra a pessoa.',
  },
  {
    id: 'trust',
    order: 19,
    title: 'Confiar de novo',
    focus: 'Reconstruir a capacidade de confiar em alguém.',
    days: 21,
    teaser: 'Dar uma chance ao novo sem o peso do antigo.',
  },
  {
    id: 'interdependence',
    order: 20,
    title: 'Estar junto sem se perder',
    focus: 'Manter sua identidade dentro de uma relação.',
    days: 21,
    teaser: 'Ser um casal sem deixar de ser você.',
  },
  {
    id: 'intimacy',
    order: 21,
    title: 'Construir intimidade',
    focus: 'Criar proximidade emocional verdadeira.',
    days: 21,
    teaser: 'Chegar perto de alguém de um jeito que faz bem.',
  },
  {
    id: 'healthy-love',
    order: 22,
    title: 'Construir um amor saudável',
    focus: 'Reunir tudo o que você aprendeu num amor que faz bem.',
    days: 21,
    teaser: 'Recomeçar a jornada com tudo o que você evoluiu.',
  },
]

// Soma das durações deve ser 365 (validado nos testes do catálogo).
export const TOTAL_TRACK_DAYS = challenges.reduce((sum, c) => sum + c.days, 0)

// O objetivo escolhido no onboarding define por qual desafio a trilha começa.
const GOAL_TO_FIRST_CHALLENGE: Record<GoalId, string> = {
  lonely: 'loneliness',
  anxiety: 'social-anxiety',
  selfLove: 'self-love',
  emotionalIntelligence: 'emotional-intelligence',
}

export function firstChallengeIdForGoal(goal: GoalId): string {
  return GOAL_TO_FIRST_CHALLENGE[goal] ?? challenges[0].id
}

export function getChallengeById(id: string): Challenge | undefined {
  return challenges.find((c) => c.id === id)
}

// Próximo desafio na ordem; volta ao começo da trilha depois do último (o ciclo
// anual recomeça, mantendo o hábito vivo).
export function getNextChallenge(currentId: string): Challenge {
  const current = getChallengeById(currentId)
  if (!current) return challenges[0]
  const next = challenges.find((c) => c.order === current.order + 1)
  return next ?? challenges[0]
}

export const TOTAL_CHALLENGES = challenges.length
