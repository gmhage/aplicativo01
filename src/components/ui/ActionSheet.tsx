import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface ActionSheetProps {
  open: boolean
  title: string
  onClose: () => void
  closeLabel: string
  children: ReactNode
}

// Folha que sobe de baixo (bottom sheet), usada no painel "cuidar disso agora".
export function ActionSheet({ open, title, onClose, closeLabel, children }: ActionSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 backdrop-blur-md"
            style={{ backgroundColor: 'rgba(20, 14, 38, 0.55)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85vh] max-w-[460px] overflow-y-auto rounded-t-[30px] px-5 pb-8 pt-5"
            style={{ backgroundColor: '#FFFFFF', boxShadow: '0 -24px 60px -12px rgba(20, 14, 38, 0.45)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-grape/20" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[20px] font-semibold text-ink">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={closeLabel}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink/40 hover:bg-grape/10"
              >
                <X size={18} strokeWidth={1.6} />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
