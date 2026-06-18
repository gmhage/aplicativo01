import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import lockup from '../assets/soulspace-lockup.png'
import copy from '../i18n/pt-BR'
import { useAppState } from '../state/AppStateContext'

export function WelcomeScreen() {
  const { navigate } = useAppState()

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <motion.img
        src={lockup}
        alt="SoulSpace — o relacionamento que você quer começa em você."
        className="mb-9 w-[228px] max-w-[72vw] select-none"
        draggable={false}
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      />

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.4 }}
        className="font-display text-[28px] font-semibold leading-[1.18] tracking-[-0.01em] text-ink"
      >
        {copy.welcome.title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, duration: 0.4 }}
        className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink/55"
      >
        {copy.welcome.subtitle}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34, duration: 0.4 }}
        className="mt-10 w-full"
      >
        <Button onClick={() => navigate('auth')}>{copy.welcome.cta}</Button>
      </motion.div>
    </div>
  )
}
