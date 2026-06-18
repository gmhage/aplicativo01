import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, WifiOff, AlertTriangle, X } from 'lucide-react'
import type { SyncBannerState } from '../../types'

const STYLES: Record<SyncBannerState['kind'], { bg: string; text: string; icon: typeof Info }> = {
  info: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon: WifiOff },
  success: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', icon: CheckCircle2 },
  error: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: AlertTriangle },
  warning: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon: AlertTriangle },
}

interface BannerProps {
  banner: SyncBannerState | null
  onDismiss?: () => void
}

export function Banner({ banner, onDismiss }: BannerProps) {
  return (
    <AnimatePresence>
      {banner && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className={`mb-4 flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm ${STYLES[banner.kind].bg} ${STYLES[banner.kind].text}`}
          role="status"
        >
          {(() => {
            const Icon = STYLES[banner.kind].icon
            return <Icon size={18} strokeWidth={1.6} className="mt-0.5 flex-shrink-0" />
          })()}
          <span className="flex-1">{banner.text}</span>
          {onDismiss && (
            <button type="button" onClick={onDismiss} aria-label="Fechar aviso" className="flex-shrink-0 opacity-60 hover:opacity-100">
              <X size={16} strokeWidth={1.6} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
