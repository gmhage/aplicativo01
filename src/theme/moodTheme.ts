import type { MoodId } from '../types'

// Identidade do SoulSpace: o sistema é mood-reativo, mas a ENERGIA mora nas
// auras (headers em gradiente diagonal). O corpo do app fica calmo sobre uma
// base lilás. Aqui cada humor define:
//  - aura{From,To}: o par do gradiente 135° do header (vivo, saturado);
//  - primary / primaryStrong: o acento daquele humor (usado com parcimônia);
//  - soft: preenchimento suave para tiles e selos;
//  - bar: a cor da "trilha emocional" no histórico do diário.
export interface MoodTheme {
  id: MoodId
  emoji: string
  label: string
  auraFrom: string
  auraTo: string
  primary: string
  primaryStrong: string
  soft: string
  bar: string
}

export const moodThemes: Record<MoodId, MoodTheme> = {
  sad: {
    id: 'sad',
    emoji: '😢',
    label: 'Triste',
    auraFrom: '#3B82F6',
    auraTo: '#6366F1',
    primary: '#4F6CF0',
    primaryStrong: '#3B52D4',
    soft: '#E4E9FE',
    bar: '#5B7CFA',
  },
  neutral: {
    id: 'neutral',
    emoji: '😐',
    label: 'Neutro',
    auraFrom: '#10B981',
    auraTo: '#14B8A6',
    primary: '#0EA47E',
    primaryStrong: '#0B8466',
    soft: '#D2F5EB',
    bar: '#12B58C',
  },
  happy: {
    id: 'happy',
    emoji: '😊',
    label: 'Bem',
    auraFrom: '#EA8204',
    auraTo: '#F43F76',
    primary: '#F4733E',
    primaryStrong: '#D9542A',
    soft: '#FDE6D8',
    bar: '#F88A4D',
  },
  veryHappy: {
    id: 'veryHappy',
    emoji: '😄',
    label: 'Muito bem',
    auraFrom: '#8B5CF6',
    auraTo: '#D946EF',
    primary: '#A23BE0',
    primaryStrong: '#8226BE',
    soft: '#F1E1FC',
    bar: '#B14BE8',
  },
  excited: {
    id: 'excited',
    emoji: '🤩',
    label: 'Com energia',
    auraFrom: '#FB5436',
    auraTo: '#F5A524',
    primary: '#F2603A',
    primaryStrong: '#D2461F',
    soft: '#FEE0CF',
    bar: '#FB6A3E',
  },
}

export const moodOrder: MoodId[] = ['sad', 'neutral', 'happy', 'veryHappy', 'excited']

// Variáveis aplicadas no AppFrame: a aura e o acento seguem o humor; a espinha
// da marca (violeta) é constante e vive direto no CSS/Tailwind.
export function cssVarsForMood(mood: MoodId): Record<string, string> {
  const theme = moodThemes[mood]
  return {
    '--aura-from': theme.auraFrom,
    '--aura-to': theme.auraTo,
    '--color-primary': theme.primary,
    '--color-primary-strong': theme.primaryStrong,
    '--color-primary-soft': theme.soft,
    '--color-bar': theme.bar,
  }
}
