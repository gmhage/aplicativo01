import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface BaseProps {
  label: string
  error?: string
  hint?: string
}

const fieldClass = (error?: string) =>
  `mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink/35 transition-colors focus:border-grape ${
    error ? 'border-red-400' : 'border-grape/15'
  }`

type TextFieldProps = BaseProps & InputHTMLAttributes<HTMLInputElement>

export function TextField({ label, error, hint, id, ...rest }: TextFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <label htmlFor={fieldId} className="block">
      <span className="text-sm font-semibold text-ink/75">{label}</span>
      <input id={fieldId} className={fieldClass(error)} aria-invalid={Boolean(error)} {...rest} />
      {error && <span className="mt-1.5 block text-sm font-medium text-red-600">{error}</span>}
      {!error && hint && <span className="mt-1.5 block text-sm text-ink/50">{hint}</span>}
    </label>
  )
}

type TextAreaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>

export function TextAreaField({ label, error, hint, id, ...rest }: TextAreaProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <label htmlFor={fieldId} className="block">
      <span className="text-sm font-semibold text-ink/75">{label}</span>
      <textarea id={fieldId} className={fieldClass(error)} aria-invalid={Boolean(error)} {...rest} />
      {error && <span className="mt-1.5 block text-sm font-medium text-red-600">{error}</span>}
      {!error && hint && <span className="mt-1.5 block text-sm text-ink/50">{hint}</span>}
    </label>
  )
}
