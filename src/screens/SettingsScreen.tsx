import { useEffect, useState } from 'react'
import { ChevronRight, Lock } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { ActionSheet } from '../components/ui/ActionSheet'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SelectField } from '../components/ui/SelectField'
import { TextField } from '../components/ui/TextField'
import { ReportProblem, SCREEN_LABELS } from '../components/ui/ReportProblem'
import copy from '../i18n/pt-BR'
import { notificationService } from '../services'
import type { EmailPreview } from '../services'
import { useAppState } from '../state/AppStateContext'
import { PlanScreen } from './PlanScreen'

export function SettingsScreen() {
  const { navigate, user, subscription, updateRelationshipStatus, updateEmail, signOut, deleteAccount } = useAppState()
  const [showPlan, setShowPlan] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(true)
  const [emailPreview, setEmailPreview] = useState<EmailPreview | null>(null)
  const [editingStatus, setEditingStatus] = useState(false)
  const [statusDraft, setStatusDraft] = useState('')
  const [statusSaved, setStatusSaved] = useState(false)
  const [editingEmail, setEditingEmail] = useState(false)
  const [emailDraft, setEmailDraft] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [emailSaved, setEmailSaved] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const enabled = await notificationService.isEnabled()
      if (alive) setNotifEnabled(enabled)
      if (user) {
        const preview = await notificationService.getDailyReminderPreview(user)
        if (alive) setEmailPreview(preview)
      }
    })()
    return () => {
      alive = false
    }
  }, [user])

  const toggleNotifications = async (next: boolean) => {
    setNotifEnabled(next)
    await notificationService.setEnabled(next)
  }

  const startEditingStatus = () => {
    setStatusDraft(user?.status ?? copy.profile.statusOptions[0])
    setStatusSaved(false)
    setEditingStatus(true)
  }

  const saveStatus = async () => {
    await updateRelationshipStatus(statusDraft)
    setEditingStatus(false)
    setStatusSaved(true)
    if (user) {
      const preview = await notificationService.getDailyReminderPreview({ ...user, status: statusDraft })
      setEmailPreview(preview)
    }
  }

  const startEditingEmail = () => {
    setEmailDraft(user?.email ?? '')
    setEmailError(false)
    setEmailSaved(false)
    setEditingEmail(true)
  }

  const saveEmail = async () => {
    const value = emailDraft.trim()
    // Validação simples: algo@algo.algo. Evita salvar e-mail claramente quebrado.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError(true)
      return
    }
    setEmailError(false)
    setSavingEmail(true)
    await updateEmail(value)
    setSavingEmail(false)
    setEditingEmail(false)
    setEmailSaved(true)
    if (user) {
      const preview = await notificationService.getDailyReminderPreview({ ...user, email: value })
      setEmailPreview(preview)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    await deleteAccount()
    // deleteAccount apaga o conteúdo e leva ao dashboard; esta tela é
    // desmontada, então não precisamos limpar os estados locais aqui.
  }

  // O plano (e todo o fluxo de fidelização/cancelamento) vive numa subtela.
  if (showPlan) {
    return <PlanScreen onClose={() => setShowPlan(false)} />
  }

  const planLabel =
    subscription?.planType === 'monthly'
      ? copy.settings.monthly
      : subscription?.planType === 'annual'
        ? copy.settings.annual
        : copy.settings.loyalty

  return (
    <div className="flex flex-1 flex-col">
      <Header title={copy.settings.title} />

      <div className="space-y-3">
        <Button variant="secondary" onClick={() => navigate('dashboard')}>
          {copy.settings.backToApp}
        </Button>

        <Card>
          <p className="text-sm font-semibold text-slate-500">{copy.settings.profileLabel}</p>
          <p className="mt-1 text-[15px] text-slate-800">{user?.name}</p>
          <p className="mt-1 text-xs text-slate-400">{copy.settings.nameLockHint}</p>

          {!editingEmail ? (
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-500">{copy.settings.emailLabel}</p>
                <p className="mt-1 truncate text-[15px] text-slate-800">{user?.email}</p>
                {emailSaved && <p className="mt-1 text-xs text-emerald-600">{copy.settings.emailSaved}</p>}
              </div>
              <button
                type="button"
                onClick={startEditingEmail}
                className="ml-3 flex-shrink-0 text-sm font-semibold"
                style={{ color: 'var(--color-primary)' }}
              >
                {copy.settings.emailEditCta}
              </button>
            </div>
          ) : (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <TextField
                label={copy.settings.emailLabel}
                type="email"
                inputMode="email"
                autoComplete="email"
                value={emailDraft}
                onChange={(e) => {
                  setEmailDraft(e.target.value)
                  if (emailError) setEmailError(false)
                }}
                error={emailError ? copy.settings.emailInvalid : undefined}
                hint={copy.settings.emailHint}
              />
              <div className="mt-3 flex gap-2">
                <Button fullWidth={false} className="flex-1" loading={savingEmail} onClick={() => void saveEmail()}>
                  {copy.settings.emailSaveCta}
                </Button>
                <Button variant="ghost" fullWidth={false} className="flex-1" disabled={savingEmail} onClick={() => setEditingEmail(false)}>
                  {copy.settings.emailCancelCta}
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card>
          {!editingStatus ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">{copy.settings.relationshipLabel}</p>
                <p className="mt-1 text-[15px] text-slate-800">{user?.status || '—'}</p>
                {statusSaved && <p className="mt-1 text-xs text-emerald-600">{copy.settings.relationshipSaved}</p>}
              </div>
              <button
                type="button"
                onClick={startEditingStatus}
                className="flex-shrink-0 text-sm font-semibold"
                style={{ color: 'var(--color-primary)' }}
              >
                {copy.settings.relationshipEditCta}
              </button>
            </div>
          ) : (
            <div>
              <SelectField
                label={copy.settings.relationshipLabel}
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value)}
                options={copy.profile.statusOptions.map((value) => ({ value, label: value }))}
              />
              <div className="mt-3 flex gap-2">
                <Button fullWidth={false} className="flex-1" onClick={() => void saveStatus()}>
                  {copy.settings.relationshipSaveCta}
                </Button>
                <Button variant="ghost" fullWidth={false} className="flex-1" onClick={() => setEditingStatus(false)}>
                  {copy.settings.relationshipCancelCta}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Plano: agora só abre a subtela. O cancelamento mora lá dentro. */}
        <button
          type="button"
          onClick={() => setShowPlan(true)}
          className="flex w-full items-center justify-between rounded-[20px] border border-slate-200/70 bg-white/90 p-6 text-left"
        >
          <div>
            <p className="text-sm font-semibold text-slate-500">{copy.settings.currentPlanLabel}</p>
            <p className="mt-1 text-[15px] text-slate-800">
              {subscription?.status === 'active' ? planLabel : copy.settings.noActivePlan}
            </p>
          </div>
          <ChevronRight size={20} strokeWidth={1.6} className="flex-shrink-0 text-slate-400" />
        </button>

        <Card>
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span>
              <span className="block text-sm font-semibold text-slate-700">{copy.notifications.toggleLabel}</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                {notifEnabled ? copy.notifications.toggleOn : copy.notifications.toggleOff}
              </span>
            </span>
            <input
              type="checkbox"
              checked={notifEnabled}
              onChange={(e) => void toggleNotifications(e.target.checked)}
              className="h-5 w-5 flex-shrink-0 rounded"
            />
          </label>

          {notifEnabled && emailPreview && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.notifications.previewTitle}</p>
              <p className="mt-1 text-xs text-slate-500">{copy.notifications.previewIntro}</p>
              <div className="mt-3 space-y-1.5 rounded-xl bg-white p-3 text-sm">
                <p className="text-slate-500">
                  <span className="font-medium text-slate-700">{copy.notifications.previewToLabel}:</span> {emailPreview.to}
                </p>
                <p className="text-slate-500">
                  <span className="font-medium text-slate-700">{copy.notifications.previewSubjectLabel}:</span> {emailPreview.subject}
                </p>
                <p className="mt-2 leading-relaxed text-slate-700">{emailPreview.body}</p>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <p className="text-sm font-semibold text-slate-500">{copy.settings.helpContact}</p>
          <p className="mt-1 text-[15px] text-slate-800">{copy.settings.helpEmail}</p>
        </Card>

        <ReportProblem variant="card" currentScreenLabel={SCREEN_LABELS.settings} />

        <Card>
          <div className="flex items-center gap-2">
            <Lock size={16} strokeWidth={2} style={{ color: 'var(--color-primary)' }} />
            <p className="text-sm font-semibold text-slate-700">{copy.settings.privacyTitle}</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{copy.settings.privacyBody}</p>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-slate-500">{copy.settings.about}</p>
          <p className="mt-1 text-sm text-slate-500">{copy.settings.aboutBody}</p>
        </Card>

        <Button variant="danger" onClick={signOut}>
          {copy.settings.logout}
        </Button>

        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full py-2 text-center text-sm font-semibold text-red-500/80 hover:text-red-600"
        >
          {copy.settings.deleteAccountCta}
        </button>
      </div>

      <ActionSheet
        open={showDeleteConfirm}
        title={copy.settings.deleteConfirmTitle}
        onClose={() => !deleting && setShowDeleteConfirm(false)}
        closeLabel={copy.settings.deleteCancelButton}
      >
        <div className="space-y-4">
          <p className="text-[15px] leading-relaxed text-slate-600">{copy.settings.deleteConfirmBody}</p>
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
            {copy.settings.deleteConfirmSubscriptionWarning}
          </p>
          <div className="space-y-2">
            <Button variant="danger" loading={deleting} onClick={() => void confirmDelete()}>
              {deleting ? copy.settings.deleting : copy.settings.deleteConfirmButton}
            </Button>
            <Button variant="ghost" disabled={deleting} onClick={() => setShowDeleteConfirm(false)}>
              {copy.settings.deleteCancelButton}
            </Button>
          </div>
        </div>
      </ActionSheet>
    </div>
  )
}
