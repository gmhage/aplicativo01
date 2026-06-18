import type { SelectHTMLAttributes } from 'react'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: Array<{ value: string; label: string }>
  error?: string
}

export function SelectField({ label, options, error, id, ...rest }: SelectFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <label htmlFor={fieldId} className="block">
      <span className="text-sm font-semibold text-ink/75">{label}</span>
      <select
        id={fieldId}
        className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-[15px] text-ink transition-colors focus:border-grape ${
          error ? 'border-red-400' : 'border-grape/15'
        }`}
        aria-invalid={Boolean(error)}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="mt-1.5 block text-sm font-medium text-red-600">{error}</span>}
    </label>
  )
}
