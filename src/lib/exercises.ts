// Catálogo único de exercícios leves e tranquilos, compartilhado entre o botão
// "Exercício do dia" (tela Início) e a IA Coach. São propositalmente fáceis e
// de baixo impacto: o objetivo é só movimentar o corpo / acalmar a respiração e
// somar bem-estar aos poucos, sem saber a condição física de quem está usando.

export type ExerciseKind = 'breathing' | 'physical'

export interface Exercise {
  id: string
  kind: ExerciseKind
  title: string
  // Para respiração: passos do ciclo + duração sugerida (segundos) para o timer.
  steps?: string[]
  durationSeconds?: number
  // Para exercício físico: instrução curta em uma frase.
  instruction?: string
}

// Frases de atenção (rodízio) para nunca deixar a pessoa exagerar.
export const SAFETY_NOTES = [
  'Vá com calma e respeite o seu limite: a ideia é se sentir melhor, não se cansar.',
  'Nada de exagerar. Se sentir qualquer desconforto, pare. O objetivo é só se movimentar um pouco hoje.',
  'Faça no seu tempo e sem forçar. Pouco e leve, com frequência, já traz bastante bem-estar.',
  'Sem pressa e sem competição. Um passo de cada vez já é o suficiente por hoje.',
]

export const exercises: Exercise[] = [
  // --- Respiração (com timer) ---
  {
    id: 'breath-446',
    kind: 'breathing',
    title: 'Respiração 4-4-6',
    steps: ['Inspire pelo nariz por 4 segundos', 'Segure o ar por 4 segundos', 'Solte pela boca em 6 segundos'],
    durationSeconds: 30,
  },
  {
    id: 'breath-box',
    kind: 'breathing',
    title: 'Respiração quadrada',
    steps: ['Inspire por 4 segundos', 'Segure por 4 segundos', 'Expire por 4 segundos', 'Fique sem ar por 4 segundos'],
    durationSeconds: 32,
  },
  {
    id: 'breath-belly',
    kind: 'breathing',
    title: 'Respiração na barriga',
    steps: ['Ponha uma mão na barriga', 'Inspire fundo e sinta a barriga subir', 'Solte devagar e sinta ela descer'],
    durationSeconds: 30,
  },
  {
    id: 'breath-sigh',
    kind: 'breathing',
    title: 'Suspiro de alívio',
    steps: ['Faça duas inspiradas rápidas pelo nariz', 'Solte tudo pela boca num suspiro longo', 'Repita com calma'],
    durationSeconds: 24,
  },
  {
    id: 'breath-478',
    kind: 'breathing',
    title: 'Respiração 4-7-8',
    steps: ['Inspire pelo nariz por 4 segundos', 'Segure por 7 segundos', 'Solte pela boca por 8 segundos'],
    durationSeconds: 38,
  },
  {
    id: 'breath-count',
    kind: 'breathing',
    title: 'Respiração contada',
    steps: ['Inspire devagar contando até 5', 'Expire devagar contando até 5', 'Mantenha o mesmo ritmo'],
    durationSeconds: 30,
  },

  // --- Movimento físico leve ---
  { id: 'walk-light', kind: 'physical', title: 'Caminhada leve', instruction: 'Caminhe de 10 a 15 minutos em ritmo de passeio. Pode ser no quarteirão ou dentro de casa.' },
  { id: 'bike-easy', kind: 'physical', title: 'Pedalada tranquila', instruction: 'Pedale numa bicicleta ou bike de academia por uns 10 minutos, num ritmo leve, só para o corpo entrar em movimento.' },
  { id: 'treadmill-walk', kind: 'physical', title: 'Esteira em ritmo de caminhada', instruction: 'Ande na esteira por uns 10 minutos, devagar, simulando uma caminhada tranquila.' },
  { id: 'stretch-full', kind: 'physical', title: 'Alongamento em casa', instruction: 'Estique os braços para cima, gire os ombros devagar e incline o pescoço de um lado para o outro, sem forçar.' },
  { id: 'squat-slow', kind: 'physical', title: 'Agachamento devagar', instruction: 'Faça uns 10 agachamentos bem lentos, usando uma cadeira de apoio se quiser. O foco é o movimento, não a quantidade.' },
  { id: 'stairs', kind: 'physical', title: 'Subir e descer escada', instruction: 'Suba e desça um lance de escada algumas vezes, sem pressa. Movimenta o corpo e clareia a cabeça.' },
  { id: 'dance', kind: 'physical', title: 'Dançar uma música', instruction: 'Coloque uma música que você gosta e se mexa do seu jeito por uns 5 minutos. Dançar também é exercício.' },
  { id: 'neck-roll', kind: 'physical', title: 'Soltar o pescoço e os ombros', instruction: 'Gire os ombros para trás 10 vezes e incline a cabeça devagar para cada lado. Ótimo para tirar a tensão.' },
  { id: 'calf-raise', kind: 'physical', title: 'Ficar na ponta dos pés', instruction: 'Em pé, suba na ponta dos pés e desça devagar, umas 15 vezes. Apoie-se numa parede se precisar.' },
  { id: 'march-place', kind: 'physical', title: 'Marchar parado', instruction: 'Marche no mesmo lugar por 2 a 3 minutos, levantando os joelhos com calma. Vale assistindo TV.' },
  { id: 'arm-circles', kind: 'physical', title: 'Círculos com os braços', instruction: 'Estenda os braços e faça círculos pequenos por 30 segundos para frente e 30 para trás.' },
  { id: 'wall-pushup', kind: 'physical', title: 'Flexão na parede', instruction: 'De frente para a parede, apoie as mãos e faça umas 10 flexões leves. Bem mais tranquilo que no chão.' },
  { id: 'sit-stand', kind: 'physical', title: 'Levantar e sentar da cadeira', instruction: 'Sente e levante de uma cadeira umas 10 vezes, devagar, sem usar as mãos se conseguir.' },
  { id: 'side-stretch', kind: 'physical', title: 'Alongamento lateral', instruction: 'Em pé, levante um braço e incline o tronco para o lado oposto. Segure alguns segundos e troque.' },
  { id: 'ankle-roll', kind: 'physical', title: 'Girar os tornozelos', instruction: 'Sentado, gire cada tornozelo devagar nos dois sentidos, umas 10 vezes. Bom para a circulação.' },
  { id: 'short-walk-outside', kind: 'physical', title: 'Voltinha ao ar livre', instruction: 'Saia para uma volta curta lá fora e repare no que está ao seu redor. Movimento e ar fresco juntos.' },
  { id: 'gentle-twist', kind: 'physical', title: 'Torção suave do tronco', instruction: 'Sentado ou em pé, gire o tronco devagar para um lado e para o outro, umas 10 vezes. Sem forçar.' },
  { id: 'hamstring-stretch', kind: 'physical', title: 'Alongar a parte de trás das pernas', instruction: 'Sentado, estenda uma perna e tente alcançar o pé sem dor. Segure alguns segundos e troque.' },
  { id: 'shoulder-shrug', kind: 'physical', title: 'Encolher os ombros', instruction: 'Suba os ombros em direção às orelhas, segure 3 segundos e solte. Repita umas 10 vezes.' },
  { id: 'water-walk', kind: 'physical', title: 'Caminhada do copo d\'água', instruction: 'Levante, beba um copo d\'água e dê uma volta pela casa antes de voltar. Hidratar e mexer o corpo de uma vez.' },
  { id: 'tai-slow', kind: 'physical', title: 'Movimentos lentos com os braços', instruction: 'Mexa os braços lentamente no ar, como câmera lenta, por 1 a 2 minutos. Acalma e movimenta ao mesmo tempo.' },
  { id: 'knee-lift', kind: 'physical', title: 'Levantar os joelhos sentado', instruction: 'Sentado, levante um joelho de cada vez devagar, alternando, umas 20 vezes no total.' },
]

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id)
}

function pickSafetyNote(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) hash = (hash + seed.charCodeAt(i)) % SAFETY_NOTES.length
  return SAFETY_NOTES[hash]
}

// Formata um exercício como mensagem de chat da IA Coach (texto + nota de
// atenção), usado quando a pessoa pede um exercício na conversa.
export function formatExerciseForChat(exercise: Exercise, userName: string): string {
  const intro = userName ? `${userName}, ` : ''
  const body =
    exercise.kind === 'breathing'
      ? `que tal a "${exercise.title}"? ${exercise.steps?.join('. ')}. Repita no seu ritmo.`
      : `${exercise.instruction}`
  return `${intro}${body}\n\n${pickSafetyNote(exercise.id)}`
}
