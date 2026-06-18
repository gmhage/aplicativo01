import { motion } from 'framer-motion'
import type { MouseEventHandler, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps {
  variant?: Variant
  fullWidth?: boolean
  icon?: ReactNode
  loading?: boolean
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
  children?: ReactNode
  'aria-label'?: string
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-[18px] px-5 py-3.5 text-[15px] font-bold tracking-[-0.01em] transition-all disabled:cursor-not-allowed disabled:opacity-50'

export function Button({
  variant = 'primary',
  fullWidth = true,
  icon,
  loading,
  className = '',
  type = 'button',
  disabled,
  onClick,
  children,
  ...rest
}: ButtonProps) {
  // CTA primário = único gradiente vivo por tela (coral → magenta).
  const variantClass: Record<Variant, string> = {
    primary:
      'text-white shadow-[0_12px_28px_-10px_rgba(219,39,119,0.6)] bg-[linear-gradient(120deg,#FB5436_0%,#DB2777_100%)] hover:brightness-[1.04] hover:shadow-[0_16px_34px_-10px_rgba(219,39,119,0.7)]',
    secondary: 'border-2 border-grape/15 bg-white text-grape hover:border-grape/35',
    ghost: 'text-grape hover:bg-grape/[0.07]',
    danger: 'border-2 border-red-200 text-red-600 hover:bg-red-50',
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.12 }}
      type={type}
      className={`${base} ${variantClass[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        icon
      )}
      {children}
    </motion.button>
  )
}
