interface ProgressBarProps {
  value: number
  max: number
  label?: string
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percent = Math.min(100, Math.round((value / max) * 100))
  return (
    <div>
      {label && (
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-ink/60">{label}</span>
          <span className="tabular font-bold text-ink/80">
            {value}/{max}
          </span>
        </div>
      )}
      <div className="h-3 w-full overflow-hidden rounded-full bg-ink/[0.07]">
        <div
          className="h-3 rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${percent}%`,
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-strong))',
          }}
        />
      </div>
    </div>
  )
}
