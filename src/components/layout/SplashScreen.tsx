import { motion, useReducedMotion } from 'framer-motion'
import lockup from '../../assets/soulspace-lockup.png'

// Abertura de marca. Substitui o spinner genérico do bootstrap por uma
// sequência orquestrada: a aura respira atrás, o lockup (símbolo + SoulSpace +
// slogan) sobe em cena, e uma "trilha" — eco do caminho verde do próprio
// símbolo — corre como barra de carregamento sob o slogan.
//
// Sob prefers-reduced-motion tudo aparece estático, sem respiração nem corrida.
export function SplashScreen() {
  const reduce = useReducedMotion()

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-mist px-8">
      {/* Aura difusa atrás do logo — energia da marca, sem competir com ele. */}
      <motion.div
        aria-hidden
        className="aura-gradient pointer-events-none absolute h-[340px] w-[340px] rounded-full blur-[90px]"
        style={{ opacity: 0.22 }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={reduce ? { opacity: 0.18 } : { scale: [0.9, 1.05, 0.9], opacity: 0.22 }}
        transition={reduce ? { duration: 0.4 } : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.img
        src={lockup}
        alt="SoulSpace — o relacionamento que você quer começa em você."
        className="relative w-[260px] max-w-[78vw] select-none"
        draggable={false}
        initial={{ opacity: 0, scale: 0.94, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={
          reduce
            ? { duration: 0.2 }
            : { type: 'spring', stiffness: 220, damping: 22, delay: 0.1 }
        }
      />

      {/* Trilha de carregamento — preenche da esquerda à direita uma vez,
          ecoando o caminho verde→coral do símbolo. */}
      <div className="relative mt-10 h-[3px] w-[140px] overflow-hidden rounded-full bg-grape/10">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #10B981 0%, #6D28D9 55%, #FB5436 100%)',
          }}
          initial={{ width: reduce ? '100%' : '0%' }}
          animate={{ width: '100%' }}
          transition={reduce ? { duration: 0 } : { duration: 1.6, ease: 'easeInOut' }}
        />
      </div>
    </div>
  )
}
