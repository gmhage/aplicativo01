/// <reference types="vite/client" />

interface ImportMetaEnv {
  // URL do SEU backend de IA (Edge Function). Vazio/ausente = IA desligada,
  // o app usa o banco local de variações (custo zero). A chave da Anthropic
  // NUNCA vai aqui — ela fica só no servidor. Ver src/services/claudeAIService.ts.
  readonly VITE_AI_BACKEND_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
