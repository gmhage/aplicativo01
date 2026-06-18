import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { ProgressDots } from '../components/ui/ProgressDots'
import { SelectField } from '../components/ui/SelectField'
import { TextAreaField, TextField } from '../components/ui/TextField'
import copy from '../i18n/pt-BR'
import { useAppState } from '../state/AppStateContext'

const AGE_OPTIONS = Array.from({ length: 63 }, (_, index) => 18 + index)

export function ProfileSetupScreen() {
  const { saveProfile } = useAppState()
  const [name, setName] = useState('')
  const [age, setAge] = useState('28')
  const [status, setStatus] = useState(copy.profile.statusOptions[0])
  const [reason, setReason] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) {
      setNameError(copy.profile.nameError)
      return
    }
    setNameError(null)
    setLoading(true)
    await saveProfile({ name: name.trim(), age: Number(age), status })
    setLoading(false)
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6">
        <ProgressDots total={3} current={1} />
      </div>
      <h1 className="font-display text-[27px] font-semibold leading-tight text-ink">{copy.profile.title}</h1>
      <p className="mt-2 text-[15px] text-ink/55">{copy.profile.subtitle}</p>

      <div className="mt-8 space-y-5">
        <TextField
          label={copy.profile.nameLabel}
          placeholder={copy.profile.namePlaceholder}
          hint={copy.profile.nameHint}
          value={name}
          error={nameError ?? undefined}
          onChange={(e) => {
            setName(e.target.value)
            if (nameError) setNameError(null)
          }}
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label={copy.profile.ageLabel}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            options={AGE_OPTIONS.map((value) => ({ value: String(value), label: String(value) }))}
          />
          <SelectField
            label={copy.profile.statusLabel}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={copy.profile.statusOptions.map((value) => ({ value, label: value }))}
          />
        </div>
        <TextAreaField
          label={copy.profile.reasonLabel}
          placeholder={copy.profile.reasonPlaceholder}
          hint={copy.profile.reasonHint}
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      <div className="mt-8">
        <Button loading={loading} onClick={handleSubmit}>
          {copy.profile.continueButton}
        </Button>
      </div>
    </div>
  )
}
