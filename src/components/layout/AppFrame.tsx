import type { CSSProperties, ReactNode } from 'react'
import { cssVarsForMood } from '../../theme/moodTheme'
import type { MoodId } from '../../types'
import { MoodBackdrop } from './MoodBackdrop'

interface AppFrameProps {
  mood: MoodId
  children: ReactNode
  banner?: ReactNode
}

// Canvas central "tipo celular" — o app é mobile-first, então em telas largas
// mantemos uma coluna estreita e legível em vez de esticar tudo até a borda.
export function AppFrame({ mood, children, banner }: AppFrameProps) {
  const vars = cssVarsForMood(mood) as unknown as CSSProperties

  return (
    <div style={vars} className="relative min-h-screen">
      <MoodBackdrop mood={mood} />
      <div className="mx-auto flex min-h-screen max-w-[460px] flex-col px-5 pb-10 pt-6 sm:px-6">
        {banner}
        {children}
      </div>
    </div>
  )
}
