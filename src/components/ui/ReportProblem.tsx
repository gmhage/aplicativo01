import { useState } from 'react'
import { AlertCircle, Mail } from 'lucide-react'
import copy from '../../i18n/pt-BR'
import { ActionSheet } from './ActionSheet'
import { Button } from './Button'
import { TextAreaField } from './TextField'

// Versão do app, mostrada nos dados técnicos do reporte. Mantenha em sincronia
// com a "version" do package.json quando subir uma nova versão.
const APP_VERSION = '0.1.0'

interface ReportProblemProps {
  // Nome amigável da tela onde o usuário está (vai nos dados técnicos).
  currentScreenLabel: string
  // 'card' = bloco completo (tela de Ajustes); 'footer' = link discreto.
  variant: 'card' | 'footer'
}

// Monta o corpo do e-mail: a mensagem do usuário + um rodapé técnico que ajuda
// o suporte a investigar (tela, versão, navegador). Tudo em texto simples.
function buildEmailBody(message: string, screenLabel: string): string {
  const device = typeof navigator !== 'undefined' ? navigator.userAgent : '—'
  return [
    message.trim(),
    '',
    '—',
    copy.report.techHeading,
    `${copy.report.techScreen}: ${screenLabel}`,
    `${copy.report.techVersion}: ${APP_VERSION}`,
    `${copy.report.techDevice}: ${device}`,
  ].join('\n')
}

export function ReportProblem({ currentScreenLabel, variant }: ReportProblemProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSend = () => {
    if (!message.trim()) {
      setError(copy.report.emptyError)
      return
    }
    setError(null)
    const subject = encodeURIComponent(copy.report.emailSubject)
    const body = encodeURIComponent(buildEmailBody(message, currentScreenLabel))
    // Abre o app de e-mail do usuário já preenchido para o suporte. O envio
    // final é confirmado por ele, no próprio app de e-mail.
    window.location.href = `mailto:${copy.settings.helpEmail}?subject=${subject}&body=${body}`
    setOpen(false)
    setMessage('')
  }

  const openSheet = () => {
    setError(null)
    setOpen(true)
  }

  return (
    <>
      {variant === 'card' ? (
        <div className="rounded-[22px] border border-grape/10 bg-white p-6 shadow-card">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-grape/[0.08] text-grape">
              <AlertCircle size={20} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-ink/85">{copy.settings.reportTitle}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/60">{copy.settings.reportBody}</p>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="secondary" onClick={openSheet}>
              {copy.settings.reportCta}
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openSheet}
          className="mx-auto mt-6 flex items-center gap-1.5 text-xs font-semibold text-ink/40 transition-colors hover:text-grape"
        >
          <AlertCircle size={13} strokeWidth={2} />
          {copy.report.footerCta}
        </button>
      )}

      <ActionSheet
        open={open}
        title={copy.report.sheetTitle}
        onClose={() => setOpen(false)}
        closeLabel={copy.report.closeLabel}
      >
        <p className="text-sm leading-relaxed text-ink/65">{copy.report.lead}</p>
        <div className="mt-4">
          <TextAreaField
            label={copy.report.fieldLabel}
            placeholder={copy.report.placeholder}
            rows={5}
            value={message}
            error={error ?? undefined}
            onChange={(e) => {
              setMessage(e.target.value)
              if (error) setError(null)
            }}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink/45">{copy.report.handoffNote}</p>
        <div className="mt-4 space-y-2">
          <Button icon={<Mail size={18} strokeWidth={2} />} onClick={handleSend}>
            {copy.report.sendCta}
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {copy.report.cancelCta}
          </Button>
        </div>
      </ActionSheet>
    </>
  )
}

// Mapeia a View atual para um nome legível, usado nos dados técnicos do reporte.
export const SCREEN_LABELS: Record<string, string> = {
  dashboard: 'Início',
  journal: 'Meu diário',
  aiCoach: 'Espaço de Conversa',
  evolution: 'Evolução',
  settings: 'Ajustes',
  exercise: 'Exercício',
}
