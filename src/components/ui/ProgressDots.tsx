interface ProgressDotsProps {
  total: number
  current: number
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current}>
      {Array.from({ length: total }, (_, index) => {
        const active = index < current
        return (
          <span
            key={index}
            className="h-2 rounded-full transition-all"
            style={{
              width: active ? 22 : 8,
              backgroundColor: active ? '#6D28D9' : 'rgba(109,40,217,0.18)',
            }}
          />
        )
      })}
    </div>
  )
}
