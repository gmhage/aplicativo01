# SoulSpace — MVP

Protótipo web mobile-first do SoulSpace: diário emocional, IA Coach e um plano
guiado de 21 dias para reduzir ansiedade social. A especificação completa está
em [`docs/soulspace-planejamento.txt`](docs/soulspace-planejamento.txt); as
lacunas, conflitos de escopo e decisões de corte estão documentadas em
[`AUDITORIA.md`](AUDITORIA.md) — leia esse arquivo primeiro se quiser entender
por que o MVP tem o formato que tem.

## Stack e por que essa escolha

O documento de requisitos deixou a stack em aberto ("Ainda não sei — quero
sugestão"). Optei por:

- **React + TypeScript + Vite + Tailwind** — protótipo web mobile-first, mais
  rápido de validar produto do que já partir para React Native, e o código de
  UI (componentes, tema, cópia) migra com baixo atrito depois.
- **Context API** em vez de Redux/Zustand — o estado é todo local a uma sessão
  de usuário só, sem necessidade de uma lib de estado dedicada.
- **framer-motion** — as microinterações (respiro ambiente, transição de
  humor, press states) são o diferencial visual pedido no Design System;
  fazer isso só com CSS ficaria mais frágil.
- **lucide-react** — ícones line art finos (1–2px), como pede o Design System.

## O que é real x o que é mockado

Nada de chaves reais. Firebase, OpenAI e Stripe ficam atrás de camadas de
serviço com interface própria em [`src/services/types.ts`](src/services/types.ts),
então trocar o mock pela integração real não exige tocar em telas nem no
estado da aplicação — só troca a instância criada em
[`src/services/index.ts`](src/services/index.ts).

| Serviço | Hoje (mock) | Onde fica o contrato |
|---|---|---|
| Auth (Google/Apple/e-mail) | `mockAuthService.ts` — login instantâneo, sessão salva em `localStorage` | `AuthService` |
| Banco de dados (8 entidades) | `mockStorageService.ts` — cada coleção é uma chave de `localStorage` | `StorageService` |
| IA Coach | `mockAIService.ts` — respostas pré-escritas por contexto (humor, palavras-chave), ~12% de chance de "timeout" simulado | `AIService` |
| Pagamento | `mockPaymentService.ts` — valida formato de cartão; qualquer número terminado em `0000` é recusado, como um cartão de teste | `PaymentService` |
| Erros / crash | `crashTracker.ts` — escuta `window.onerror`/`unhandledrejection` e simula o que o Sentry faria | — |

Os dados (usuário, diário, plano, chat, assinatura) persistem em
`localStorage` do navegador — feche a aba e eles continuam lá; limpe os dados
do site e tudo reseta.

## Como rodar

Requer Node.js 18+ (testado com Node 24) e npm.

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Para testar o fluxo de pagamento, qualquer
cartão de 16 dígitos que **não** termine em `0000` é aprovado (ex.:
`4242 4242 4242 4242`, validade `12/30`, CVV `123`).

```bash
npm run build    # tsc + build de produção em dist/
npm run preview  # serve o build de produção localmente
```

`npm run build` foi executado durante o desenvolvimento e passa sem erros de
tipo. A verificação visual no navegador não pôde ser concluída neste ambiente
porque o disco ficou sem espaço para baixar o Chromium do Playwright — o fluxo
foi validado por leitura de código e pelo build, não por screenshot real;
vale um teste manual rápido (`npm run dev` + abrir no navegador) antes de
considerar o protótipo pronto para mostrar a alguém.

## Estrutura do projeto

```
src/
  types.ts              8 entidades do Backend Schema
  i18n/pt-BR.ts          copy centralizada (passou pela skill humanizer)
  theme/moodTheme.ts      paleta por humor + CSS vars
  services/               camada trocável (auth, storage, IA, pagamento)
  state/AppStateContext.tsx  estado global, persistência, banners de erro
  components/ui/          Button, Card, TextField, Banner, ProgressBar, etc.
  components/layout/      Header, BottomNav, AppFrame, MoodBackdrop
  screens/                as 10 telas do MVP
```

## Decisões de produto

Resumidas no `AUDITORIA.md`. As principais:

- MVP = Game Plan, não as 11 telas originais. A tela de Gráficos/Evolução
  ficou fora; as outras 10 entraram.
- As 8 entidades do schema existem todas no modelo de dados; `Badge` tem
  estrutura mas nenhuma tela própria — aparece como um selo discreto no
  Dashboard quando o usuário bate 3/7/14/21 dias de sequência.
- O diferencial visual (cor que muda com o humor) é o elemento de assinatura
  do design: um "respiro" ambiente atrás do conteúdo que troca de cor em
  crossfade suave quando o humor muda.
- Tratamento de erro segue o doc: nada se perde quando a internet cai (banner
  + fallback local), a IA tenta de novo automaticamente antes de admitir que
  está fora do ar, e o pagamento mostra a causa específica da recusa.

## Próximos passos para integrar serviços reais

1. **Firebase** — criar projeto, ativar Auth (Google + Apple) e Firestore.
   Implementar `FirebaseAuthService` e `FirestoreStorageService` seguindo as
   interfaces de `services/types.ts`; migrar as 8 coleções de `localStorage`
   para o schema do Firestore (os nomes de campo em `types.ts` já seguem o
   Backend Schema do doc).
2. **OpenAI** — implementar `OpenAIService.reply()` chamando a Chat
   Completions API com o histórico do usuário como contexto; mover a chamada
   para uma function/edge function em vez do client, para não expor a chave.
3. **Stripe** — trocar `mockPaymentService` por Stripe Elements + webhook de
   confirmação de assinatura; o `PaymentService.charge()` já espera os mesmos
   dados de cartão que o Stripe.js usaria.
4. **Notificações, e-mail, Sentry** — citados no TRD mas fora do MVP; ao
   adicionar, plugar como serviços adicionais seguindo o mesmo padrão de
   interface trocável.

## Próximos passos para migrar para React Native

A separação atual ajuda bastante nessa migração:

- `services/`, `state/`, `i18n/`, `theme/` e `types.ts` são puro
  TypeScript sem dependência de DOM — migram quase sem alteração.
- `components/ui/` precisa ser reescrito com componentes nativos
  (`View`/`Text`/`Pressable` em vez de `div`/`button`), mas a API de cada
  componente (props, variantes) pode ser mantida igual.
- A navegação por estado (`view` no `AppStateContext`) mapeia direto para uma
  stack do React Navigation — cada `case` do `switch` em `App.tsx` se torna
  uma rota.
- O tema por humor (CSS custom properties) precisa virar um contexto de
  estilo nativo (ex.: `ThemeProvider` próprio passando os hex direto via
  `style`), já que React Native não tem CSS variables.
- `localStorage` troca por `AsyncStorage` ou `MMKV` — a camada `services/`
  já isola esse detalhe, então é a única troca necessária para manter a
  persistência funcionando.
