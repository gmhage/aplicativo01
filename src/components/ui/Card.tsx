import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <div className={`rounded-[22px] border border-grape/10 bg-white p-6 shadow-card ${className}`} {...rest}>
      {children}
    </div>
  )
}

interface SelectableCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  children: ReactNode
}

export function SelectableCard({ selected, children, className = '', ...rest }: SelectableCardProps) {
  return (
    <button
      type="button"
      className={`w-full rounded-[22px] border p-5 text-left transition-all ${
        selected
          ? 'border-2 border-grape bg-grape/[0.06] shadow-card'
          : 'border-grape/10 bg-white shadow-card hover:border-grape/30'
      } ${className}`}
      aria-pressed={selected}
      {...rest}
    >
      {children}
    </button>
  )
}
