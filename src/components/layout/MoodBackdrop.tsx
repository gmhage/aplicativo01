import { moodThemes } from '../../theme/moodTheme'
import type { MoodId } from '../../types'

interface MoodBackdropProps {
  mood: MoodId
}

// Atmosfera de fundo do SoulSpace: o corpo fica calmo (base lilás clara), e a
// energia mora nos headers. Aqui ficam só dois "respiros" muito suaves — um na
// cor da marca, outro tingido pelo humor — pulsando devagar como uma respiração.
// Sob prefers-reduced-motion, o pulso congela (regra global no index.css).
export function MoodBackdrop({ mood }: MoodBackdropProps) {
  const theme = moodThemes[mood]

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-mist">
      <div
        className="animate-breathe absolute -right-28 -top-32 h-80 w-80 rounded-full blur-3xl"
        style={{ backgroundColor: theme.auraTo, opacity: 0.16 }}
      />
      <div
        className="animate-breathe absolute -left-24 top-1/3 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: '#6D28D9', opacity: 0.12, animationDelay: '1.6s' }}
      />
      <div
        className="animate-breathe absolute -bottom-28 right-1/4 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: theme.auraFrom, opacity: 0.12, animationDelay: '0.8s' }}
      />
    </div>
  )
}
