# Como ligar a IA real (Claude) no SoulSpace

Hoje o app usa um **simulador** de IA (banco local de respostas) — funciona, é
grátis e não chama nenhuma API. Quando você for vender e quiser **IA de verdade**,
tudo já está pré-montado: basta seguir os passos abaixo. Sem a configuração, nada
muda (continua o simulador, custo zero, nada quebra).

A IA real cobre **5 lugares** do app:

- **Reflexão do dia** (tela de Evolução, dias críticos)
- **Chat da IA Coach** (a conversa)
- **Resumo da evolução** (o textinho no topo da tela de Evolução)
- **Treino de conversa — atuação** (SoulSpace Conexão: a IA faz o papel do cenário)
- **Treino de conversa — feedback** (a IA analisa o treino e dá retorno no fim)

Em todos, se a IA falhar (rede/timeout/erro), o app **cai automaticamente no
simulador** — o usuário nunca fica sem resposta.

---

## A regra de ouro de segurança

A chave da Anthropic **nunca** pode ir pro front-end (navegador). Quem tem a chave
gasta o seu dinheiro. Por isso o desenho é:

```
App (navegador)  ──►  Função no Vercel  ──►  API da Claude
 só sabe a URL        guarda a CHAVE         cobra por uso
```

- O **front** só conhece `VITE_AI_BACKEND_URL` (o endereço da sua função — não é segredo).
- A **chave** (`ANTHROPIC_API_KEY`) fica só no servidor, nas Environment Variables do Vercel.

---

## Passo a passo (5 passos)

### 1. Criar conta e chave na Anthropic
- Acesse **console.anthropic.com**, crie a conta.
- Em **Billing**, adicione um crédito (ex.: US$ 5) e, se quiser, defina um
  **limite de gasto mensal** (recomendado, evita susto).
- Em **API Keys**, gere uma chave (começa com `sk-ant-...`). **Copie e guarde.**

### 2. Instalar o SDK da Anthropic
No projeto:
```
npm i @anthropic-ai/sdk
```
(Isso adiciona a dependência usada pela função `api/ai.ts`.)

### 3. Guardar a chave no Vercel (servidor)
No painel do Vercel → seu projeto → **Settings → Environment Variables**:
- **Name:** `ANTHROPIC_API_KEY`
- **Value:** `sk-ant-...` (a chave do passo 1)
- **Environments:** marque Production (e Preview, se quiser testar em branches).
- Salve.

### 4. Apontar o front para a função
Crie o arquivo `.env` (copie de `.env.example`) e preencha:
```
VITE_AI_BACKEND_URL=https://SEU-APP.vercel.app/api/ai
```
Troque `SEU-APP.vercel.app` pelo domínio do seu projeto no Vercel
(ex.: `soulspace-chi.vercel.app`). O `.env` **não** vai pro Git.

> Para a variável valer na nuvem também, adicione `VITE_AI_BACKEND_URL` igualmente
> nas Environment Variables do Vercel (Production). Variáveis `VITE_*` são
> embutidas no build do front — não são segredo, podem ficar lá.

### 5. Ligar o serviço real (trocar 1 linha)
Em `src/services/index.ts`, troque:
```ts
export const aiService: AIService = mockAIService
```
por:
```ts
import { claudeAIService } from './claudeAIService'
export const aiService: AIService = claudeAIService
```

Faça commit e `git push`. O Vercel rebuilda e a IA real entra no ar.

---

## Como testar se ligou
- Abra a **IA Coach** e mande uma mensagem qualquer: a resposta deve variar de
  verdade (não mais frases fixas).
- Veja o **resumo da evolução** e uma **reflexão do dia**.
- No **SoulSpace Conexão → Treinar conversa**, escolha um cenário: a IA deve
  atuar no papel (conduzir o date de verdade), e o **feedback** ao final deve
  comentar a conversa que aconteceu (não mais um texto fixo).
- Se algo falhar, o app volta pro simulador sozinho — então confira os **logs da
  função** no Vercel (aba *Logs* / *Functions*) para ver o erro real.

## Custo (ordem de grandeza)
- Modelo: **Claude Haiku 4.5** (o mais barato e rápido) — definido em `api/ai.ts`.
- As respostas são curtas, então o custo por interação é uma fração de centavo de
  dólar. Para um app começando, fica em centavos a poucos dólares por mês.
- O bloco de instrução (`system`) é fixo e usa **cache de prompt** → a parte
  repetida fica bem mais barata.
- **Antes de ligar**, peça uma estimativa atualizada com base na tabela de preços
  vigente e no seu volume esperado de usuários.

## Desligar / reverter
Para voltar ao simulador a qualquer momento, faça o inverso do passo 5 (ou apague
a `VITE_AI_BACKEND_URL`). Sem a URL, o `claudeAIService` se comporta como o mock.
