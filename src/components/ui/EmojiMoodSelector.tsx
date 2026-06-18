import { motion } from 'framer-motion'
import { moodOrder, moodThemes } from '../../theme/moodTheme'
import type { MoodId } from '../../types'

interface EmojiMoodSelectorProps {
  value: MoodId
  onChange: (mood: MoodId) => void
}

// O ativo é maior, levantado e cercado por um anel na cor do humor; os inativos
// ficam discretos e levemente dessaturados, para o foco recair no escolhido.
export function EmojiMoodSelector({ value, onChange }: EmojiMoodSelectorProps) {
  return (
    <div className="flex items-end justify-between gap-1" role="radiogroup" aria-label="Como está seu coração hoje?">
      {moodOrder.map((moodId) => {
        const theme = moodThemes[moodId]
        const active = value === moodId
        return (
          <motion.button
            key={moodId}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={theme.label}
            onClick={() => onChange(moodId)}
            whileTap={{ scale: 0.9 }}
            animate={active ? { y: -6, scale: 1 } : { y: 0, scale: 0.86 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            className="flex flex-1 flex-col items-center gap-1.5"
          >
            <span
              className="flex items-center justify-center rounded-full transition-all"
              style={{
                width: active ? 60 : 48,
                height: active ? 60 : 48,
                fontSize: active ? 30 : 24,
                background: active ? theme.soft : 'transparent',
                boxShadow: active ? `0 0 0 3px #fff, 0 0 0 6px ${theme.primary}` : 'none',
                filter: active ? 'none' : 'grayscale(0.35) opacity(0.7)',
              }}
            >
              {theme.emoji}
            </span>
            {active && (
              <span className="text-[11px] font-bold" style={{ color: theme.primaryStrong }}>
                {theme.label}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
