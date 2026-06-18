import markWhite from '../../assets/soulspace-mark-white.png'

interface HeaderProps {
  title: string
}

// Elemento de assinatura — a "Aura": cada header é um painel em gradiente
// diagonal (135°) tingido pelo humor atual, com o título em Fraunces branco. O
// conteúdo da tela emerge de baixo dele. A aura desliza lentamente (animate-aura)
// e congela sob prefers-reduced-motion.
//
// No canto superior direito vive o símbolo da marca em branco translúcido —
// presença constante do SoulSpace, leve o bastante para não disputar com o
// título nem com o humor da aura.
export function Header({ title }: HeaderProps) {
  return (
    <header className="aura-gradient animate-aura relative mb-6 overflow-hidden rounded-[26px] px-6 pb-7 pt-5 shadow-aura">
      {/* scrim suave para garantir contraste do texto branco em qualquer aura */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(115deg, rgba(15,10,30,0.20) 0%, transparent 55%)' }}
      />
      <img
        src={markWhite}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute -right-3 -top-3 h-[88px] w-[88px] select-none opacity-[0.16]"
      />
      <div className="relative min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/90">SoulSpace</p>
        <h1 className="mt-1.5 font-display text-[28px] font-semibold leading-[1.1] tracking-[-0.01em] text-white">
          {title}
        </h1>
      </div>
    </header>
  )
}
