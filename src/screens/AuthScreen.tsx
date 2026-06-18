import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { TextField } from '../components/ui/TextField'
import copy from '../i18n/pt-BR'
import { useAppState } from '../state/AppStateContext'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AuthScreen() {
  const { continueWithGoogle, continueWithApple, continueWithEmail } = useAppState()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [loading, setLoading] = useState<'google' | 'apple' | 'email' | null>(null)

  const handleGoogle = async () => {
    setLoading('google')
    await continueWithGoogle()
    setLoading(null)
  }

  const handleApple = async () => {
    setLoading('apple')
    await continueWithApple()
    setLoading(null)
  }

  const handleEmail = async () => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError(copy.auth.emailInvalid)
      return
    }
    setEmailError(null)
    setLoading('email')
    await continueWithEmail(email.trim())
    setLoading(null)
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      <h1 className="font-display text-[28px] font-semibold leading-tight text-ink">{copy.auth.title}</h1>
      <p className="mt-2 text-[15px] text-ink/55">{copy.auth.subtitle}</p>

      <div className="mt-8 space-y-3">
        <Button variant="secondary" loading={loading === 'google'} onClick={handleGoogle}>
          {copy.auth.google}
        </Button>
        <Button variant="secondary" loading={loading === 'apple'} onClick={handleApple}>
          {copy.auth.apple}
        </Button>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs font-semibold text-ink/40">
        <span className="h-px flex-1 bg-grape/15" />
        {copy.auth.emailLabel}
        <span className="h-px flex-1 bg-grape/15" />
      </div>

      <div className="space-y-3">
        <TextField
          label={copy.auth.emailFieldLabel}
          type="email"
          placeholder={copy.auth.emailPlaceholder}
          value={email}
          error={emailError ?? undefined}
          onChange={(e) => {
            setEmail(e.target.value)
            if (emailError) setEmailError(null)
          }}
        />
        <Button loading={loading === 'email'} onClick={handleEmail}>
          {copy.auth.emailButton}
        </Button>
      </div>
    </div>
  )
}
