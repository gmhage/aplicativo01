// Ponto único de montagem dos serviços. Para integrar Firebase/OpenAI/Stripe de
// verdade, crie firebaseAuthService.ts / openAIService.ts / stripePaymentService.ts
// implementando os contratos de services/types.ts e troque as instâncias abaixo —
// nenhuma tela ou hook precisa mudar.
import { mockAuthService } from './mockAuthService'
import { mockStorageService } from './mockStorageService'
import { mockAIService } from './mockAIService'
import { mockPaymentService } from './mockPaymentService'
import { mockNotificationService } from './mockNotificationService'
import type { AuthService, StorageService, AIService, PaymentService, NotificationService } from './types'

export const authService: AuthService = mockAuthService
export const storageService: StorageService = mockStorageService
// IA: hoje usa o banco local (mock), custo zero. Para plugar o Claude Haiku 4.5
// (via backend seguro, com fallback automático para o mock), troque por:
//   import { claudeAIService } from './claudeAIService'
//   export const aiService: AIService = claudeAIService
// Sem a env var VITE_AI_BACKEND_URL configurada, o claudeAIService se comporta
// igual ao mock — então a troca é segura mesmo antes de existir backend.
export const aiService: AIService = mockAIService
export const paymentService: PaymentService = mockPaymentService
export const notificationService: NotificationService = mockNotificationService

export * from './types'
export { calculateStreakDays } from './mockStorageService'
