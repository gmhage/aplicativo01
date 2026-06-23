import { BookHeart, House, LineChart, MessageCircleHeart, Settings } from 'lucide-react'
import type { View } from '../../state/AppStateContext'

interface BottomNavProps {
  active: View
  onNavigate: (view: View) => void
  // Primeiro nome do usuário, para personalizar o rótulo de "Evolução".
  firstName?: string
}

// A espinha da marca é constante: a aba ativa ganha uma pílula violeta, sem
// depender do humor. Isso ancora a identidade enquanto as auras trocam de cor.
export function BottomNav({ active, onNavigate, firstName }: BottomNavProps) {
  // "Evolução de João" quando há nome; senão só "Evolução".
  const evolutionLabel = firstName ? `Evolução de ${firstName}` : 'Evolução'
  const items: Array<{ view: View; label: string; icon: typeof House }> = [
    { view: 'dashboard', label: 'Início', icon: House },
    { view: 'journal', label: 'Meu diário', icon: BookHeart },
    { view: 'aiCoach', label: 'Conversar & Evoluir', icon: MessageCircleHeart },
    { view: 'evolution', label: evolutionLabel, icon: LineChart },
    { view: 'settings', label: 'Ajustes', icon: Settings },
  ]

  return (
    <nav className="sticky bottom-0 z-20 mt-6 -mx-5 flex items-center justify-between border-t border-grape/10 bg-white/85 px-3 py-2.5 backdrop-blur-lg sm:-mx-6">
      {items.map(({ view, label, icon: Icon }) => {
        const isActive = active === view
        return (
          <button
            key={view}
            type="button"
            onClick={() => onNavigate(view)}
            className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-[10px] font-bold leading-tight transition-colors"
            style={{ color: isActive ? '#6D28D9' : '#A99FC4' }}
            aria-current={isActive}
            aria-label={label}
            title={label}
          >
            <span
              className="flex h-9 w-12 items-center justify-center rounded-full transition-all"
              style={{ backgroundColor: isActive ? 'rgba(109,40,217,0.12)' : 'transparent' }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
            </span>
            <span className="line-clamp-2 w-full px-0.5 text-center">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
