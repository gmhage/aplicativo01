import copy from '../i18n/pt-BR'
import { lifeStageFromStatus } from '../lib/lifeStage'
import type { User } from '../types'
import { delay, readValue, writeValue } from './localStorageDb'
import type { EmailPreview, NotificationService } from './types'

// Mock de SendGrid/OneSignal. Sem servidor real: o "envio" do lembrete diário só
// monta o e-mail (assunto + corpo ajustados ao momento de vida da pessoa) e
// guarda como prévia para o app mostrar. Troque por SendGrid mantendo a interface.
const PREF_KEY = 'notificationsEnabled'

function buildDailyEmail(user: User): EmailPreview {
  const firstName = user.name.split(' ')[0] || 'você'
  const stage = lifeStageFromStatus(user.status)
  return {
    to: user.email,
    subject: copy.notifications.subject[stage],
    body: copy.notifications.body[stage](firstName),
    sentAt: new Date().toISOString(),
  }
}

class MockNotificationService implements NotificationService {
  async isEnabled(): Promise<boolean> {
    await delay(80)
    const stored = readValue<boolean>(PREF_KEY)
    return stored ?? true
  }

  async setEnabled(enabled: boolean): Promise<void> {
    await delay(120)
    writeValue(PREF_KEY, enabled)
  }

  // Em produção isto seria agendado no servidor (cron + SendGrid). Aqui só
  // devolvemos a prévia do que seria enviado hoje, para exibir no app.
  async getDailyReminderPreview(user: User): Promise<EmailPreview> {
    await delay(150)
    return buildDailyEmail(user)
  }
}

export const mockNotificationService = new MockNotificationService()
