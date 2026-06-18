# AUDITORIA — SoulSpace

## Fonte de verdade
Documento analisado: `docs/soulspace-planejamento.txt`

## O que está claro
- O produto é um app mobile-first para solteiros que querem se preparar emocionalmente para relacionamentos.
- Stack desejada para o MVP: React + TypeScript + Vite + Tailwind.
- Serviços estratégicos: Firebase, OpenAI, Stripe, SendGrid/OneSignal/Sentry. Todos serão mockados atrás de camadas de serviço trocáveis.
- O design deve seguir a referência Calm, com Inter, visual clean, verde suave, e cores que mudam conforme o humor.
- Copy deve ser PT-BR, amigável, próximo e centralizada em um arquivo único.

## Inconsistências e ambiguidades encontradas
1. **Conflito de escopo**
   - O doc lista 11 telas de produto.
   - O Game Plan define um MVP mais enxuto e corta várias features: gráficos, múltiplos planos, badges, comunidade, integrações de saúde e configurações avançadas.
   - Decisão: priorizar o Game Plan como a fonte de verdade do MVP.

2. **Documento parcialmente corrompido/truncado**
   - Há trechos com palavras incompletas e linhas truncadas (por exemplo, no PRD e no backend schema).
   - Isso impede confiar em detalhes granulares como listas completas de campos ou texto exato de mensagens.
   - Decisão: adotar os elementos claros e tratar os itens truncados como rascunho, sem implementar recursos apenas por fragmentos.

3. **Guia de telas vs MVP funcional**
   - O UserFlow e a lista de telas fazem sentido, mas o MVP descreve apenas as funcionalidades essenciais.
   - As 11 telas serão usadas como referência de navegação, porém o MVP deve se concentrar naquelas necessárias para 5 funcionalidades principais.

4. **8 entidades x 11 telas**
   - O backend schema lista 8 tabelas obrigatórias, mas algumas delas são mais robustas do que o MVP precisa.
   - Exemplo: `Badge` está no schema como comum; o Game Plan corta gamificação, mas a tabela pode existir como estrutura leve.
   - Decisão: manter todas as 8 entidades no modelo de dados, mas implementar a UI apenas para as obrigatórias do MVP.

5. **Autenticação e serviços de pagamento**
   - O doc exige Google + Apple login e Stripe, mas o ambiente atual não terá chaves reais.
   - Decisão: mockar serviços de autenticação e pagamento atrás de camadas abstratas, com interface que permite trocar por Firebase/Stripe reais depois.

## Lacunas de escopo importantes
- Não há definição completa de roteiros de erro para falhas de pagamento em mobile, mas há padrões de mensagens de falha.
- O documento menciona “notificações push” e “email”, mas no MVP apenas notificações básicas são necessárias.
- Não há definição exata de campos do usuário além dos básicos; `subscription_plan` e `subscription_status` aparecem no schema, mas o comportamento de renovação não está detalhado.
- O design system fala de cores por humor, mas não há um mapeamento completo de transições ou estados de borda.

## Decisões de MVP adotadas
### Funcionalidades que entram no MVP
1. **Diário Emocional**
   - Humor com 5 emojis, texto livre e salvar.
   - Sem histórico longo, sem gráficos avançados.
2. **IA Coach Básico**
   - Chat responsivo, resposta baseada no diário e sugestão de um exercício de respiração.
   - Sem múltiplos exercícios ou personalização avançada.
3. **Plano Guiado Básico**
   - Um único plano: "Reduzir ansiedade em 21 dias".
   - Progresso simples 1/21 e 1 exercício por dia.
4. **Pagamento Recorrente**
   - Mensal e anual simulados.
   - Stripe mockado em camada de serviço.
5. **Login básico**
   - Google + Apple mockados.
   - Salva dados em Firebase mockado.

### Telas MVP
- Welcome
- Auth
- Profile setup
- Goal selection
- Subscription / payment
- Dashboard / Home
- Journal
- AI Coach
- Exercise (simples)
- Settings (básico)

### Dados e modelo
Manter as 8 entidades do backend schema:
- `User`
- `JournalEntry`
- `AIChatMessage`
- `Plan`
- `PlanExercise`
- `Insight`
- `Badge` (estrutura leve, pode ficar sem UI complexa)
- `Subscription`

### O que fica fora do MVP
- Gráficos avançados de evolução
- Múltiplos planos de coaching
- Badges como experiência completa
- Comunidade de usuários ou chat entre pessoas
- Integração com Health Kit / Google Fit
- Notificações push avançadas
- Configurações avançadas de personalização
- Analytics internos de uso
- Trial grátis e promoções complexas

## Suposições técnicas
- O MVP será construído como app web mobile-first com React + TypeScript + Vite + Tailwind.
- Backend e integrações são mockados por camadas de serviço:
  - Auth: mock Google / Apple / email
  - Storage: mock Firebase local e em memória
  - IA: mock OpenAI com respostas condicionais simples
  - Pagamento: mock Stripe com fluxo de sucesso/erro
- A copy será centralizada em um arquivo `src/i18n/pt-BR.ts` ou similar.
- O design usará paleta Calm e variações de cor por humor.

## Riscos identificados
- O documento apresenta impressões fortes, mas ainda contém muitos trechos truncados e inconsistentes.
- A dependência de IA e pagamento real exige camadas de abstração desde o início.
- O MVP precisa ser enxuto para não virar um clone de app completo antes do primeiro lançamento.

## Próximos passos
1. Criar o esqueleto do projeto React + Vite + Tailwind.
2. Definir a modelagem de dados das 8 entidades e serviços de persistência mock.
3. Criar o layout do fluxo de onboarding e dashboard conforme o Game Plan.
4. Centralizar copy PT-BR e aplicar `humanizer` na interface.

---

### Resumo curto
O MVP será guiado pelo Game Plan: foco em diário emocional, IA Coach básico, plano de 21 dias, pagamento mockado e login mockado. A lista de 11 telas serve como referência de navegação, mas não justifica adicionar recursos cortados no MVP. Usei as 8 entidades do schema como modelo de dados, mesmo que algumas (Badge) fiquem com UI leve ou opcional nesta primeira versão.

---

## Decisões técnicas adicionais (tomadas durante a implementação)

1. **Tela de Gráficos/Evolução — cortada no MVP inicial, reintroduzida depois a pedido**
   - O doc lista 11 telas, mas o Game Plan corta explicitamente "Gráficos de Evolução" das funcionalidades. O MVP inicial entregou as outras 10 telas.
   - **Atualização:** a pedido do cliente, a tela foi reintroduzida (a 11ª tela), agora mais rica do que o doc descrevia. Ver a seção "Feature de Evolução" no fim deste arquivo.

2. **Navegação como máquina de estados em memória, não rotas de URL**
   - Não há requisito de deep-link nem compartilhamento de URL por tela.
   - Decisão: usar um `view` controlado em contexto React (sem `react-router`), reduzindo dependências. Ao migrar para React Native, isso mapeia diretamente para uma stack de navegação (React Navigation).

3. **Persistência local simulando o comportamento "offline-first" descrito no tratamento de erros**
   - O doc exige: nunca perder dado do usuário, salvar localmente quando a rede cai, sincronizar quando voltar.
   - Decisão: todo o estado (usuário, diário, chat, plano, assinatura) é persistido em `localStorage` a cada mutação, simulando o Firebase. Um hook de status de conexão (`navigator.onLine` + eventos) dispara o banner amarelo/verde de sincronização.

4. **Falhas simuladas para validar o tratamento de erros**
   - IA Coach: ~12% de chance de "timeout" simulado por chamada, com até 3 retries automáticos antes de oferecer contato com suporte (e-mail fictício), conforme a tabela de erros do doc.
   - Pagamento: cartão de teste `4000 0000 0000 0000` (ou qualquer número terminado em `0000`) é tratado como recusado, para demonstrar o fluxo de erro do Stripe mockado sem exigir chaves reais.
   - Login social: erro simulado é raro (~5%) e oferece fallback para e-mail.

5. **`index.html` corrigido**
   - O arquivo encontrado na raiz era um demo estático isolado (hero de identidade visual), sem `<div id="root">` nem `<script>` para `src/main.tsx` — não inicializava o app React.
   - Decisão: reescrito como entry point real do Vite, mantendo metadados em PT-BR e a fonte Inter.

6. **Login por e-mail mantido, na prática, como exceção ao corte do Game Plan**
   - O Game Plan corta explicitamente "login e-mail" do MVP ("Login Básico: Google + Apple... Não tem: login e-mail"). Mas a própria tabela de Tratamento de Erros do doc descreve cenários de "Email não encontrado" e "Senha incorreta", e a tela de Auth do UserFlow lista as 3 opções (Google, Apple, e-mail).
   - Decisão: mantive a opção de e-mail na tela de Auth, sem campo de senha (já que nada é validado contra um backend real — os três métodos são igualmente mockados com sucesso instantâneo). Isso dá um caminho de login testável sem depender de popups de OAuth simulados, sem violar o espírito do corte (nenhuma feature de recuperação de senha ou 2FA foi adicionada).

7. **Campo "Por que quer o SoulSpace?" capturado na UI, mas não persistido**
   - O UserFlow e a tela de Perfil pedem esse campo de texto livre, mas ele não existe em nenhuma das 8 entidades do Backend Schema.
   - Decisão: o campo continua na tela (fidelidade ao fluxo), mas não é salvo em nenhuma coleção — não há onde guardá-lo sem inventar uma estrutura de dados fora do schema aprovado.

---

## Feature de Evolução (adicionada após o MVP, a pedido do cliente)

A 11ª tela (Gráficos/Evolução), antes cortada, foi construída com escopo ampliado em relação ao que o doc esboçava:

- **Gráfico de duas escalas**: SVG próprio (sem lib de chart), eixo X = dias, eixo Y esquerdo = humor (1–5, com emoji), eixo Y direito = nível de ansiedade (1–10). Duas linhas traçadas entre os dias.
- **Dias críticos**: um dia é destacado como crítico quando o humor é um dos dois piores (triste ou neutro) **e/ou** a ansiedade é ≥ 5. Cada dia crítico vira um botão de alerta.
- **Painel de ação ("cuidar disso agora")**: ao tocar num dia crítico, abre uma folha com (a) uma reflexão curta gerada pela IA a partir do que a pessoa escreveu naquele dia, detectando o tema (solidão, ansiedade, relacionamento, autoestima); e (b) sugestão de exercício — respiração guiada (leva à tela de exercício existente) e, **só se a pessoa não registrou atividade física naquele dia**, caminhada ou bicicleta de 30 min moderados.
- **Registro de atividade física**: novo campo `activityDone` no `JournalEntry` (checkbox na tela de diário). Decisão de modelagem: guardar isso no próprio diário em vez de criar uma 9ª entidade, mantendo as 8 do schema. É a única extensão ao schema original, e fica dentro da entidade que já representa "o dia da pessoa".
- **Tendência**: um indicador simples compara a primeira metade da série com a segunda (humor subindo / ansiedade caindo) para dar uma leitura de progresso, conectando ao objetivo escolhido no início.

### Limites assumidos
- A "reflexão da IA" continua mockada (sem chave OpenAI). É gerada por bancos de texto por tema, escolhidos pelo conteúdo do diário daquele dia. O contrato `AIService.positiveReflection()` já está pronto para a troca pela API real.
- As sugestões de exercício físico são deliberadamente conservadoras (caminhada/bike moderadas, respiração), como pedido, para não recomendar esforço que possa ser inadequado a quem está num dia ruim. O app não é prescrição médica e não coleta dados de saúde.
- Há um botão "Preencher dados de exemplo (demo)" que só aparece no estado vazio e **somente em modo de desenvolvimento** (`import.meta.env.DEV`), para popular dias passados e permitir ver o gráfico sem registrar uma semana à mão. Ele não vai para o build de produção.

---

## Trilha de desafios e fidelização (adicionada após o MVP, a pedido do cliente)

O MVP tinha um único plano de 21 dias que terminava num beco sem saída (nada acontecia no dia 21). A pedido do cliente, isso virou uma trilha de retenção pensada para ~1 ano de uso.

### Trilha de 22 desafios somando 365 dias (1 ano)
- Catálogo fixo em `lib/challenges.ts` com **22 desafios** em sequência, cada um com **duração própria** (`days`) que **cresce ao longo da jornada**: o 1º dura 7 dias, o 2º dura 10, e do 3º em diante varia entre 11 e 21 de forma não-decrescente. A soma das durações é **exatamente 365 dias**.
- Racional da progressão (decisão de produto, a pedido do cliente): começar curto dá uma vitória rápida (menos abandono no início); aumentar aos poucos sobe o compromisso conforme o hábito se firma; fechar 365 amarra a meta de fidelização de 1 ano.
- Os 4 primeiros desafios são os objetivos do onboarding (solidão, ansiedade social, autoestima, inteligência emocional), então o objetivo escolhido define por qual a trilha **começa**. Os 18 seguintes aprofundam a jornada até "construir um amor saudável". Ao concluir o 22º, a trilha recomeça do início (ciclo anual).
- A duração de cada desafio é um campo único por item, então mudar a curva no futuro é trivial. Migração automática ajusta planos salvos no formato antigo (duração fixa de 21) para a duração do desafio correspondente.

#### Tabela da trilha (ordem · desafio · dias)
| # | Desafio | Dias |
|---|---|---|
| 1 | Superar a solidão | 7 |
| 2 | Reduzir a ansiedade social | 10 |
| 3 | Amar-se primeiro | 10 |
| 4 | Inteligência emocional | 11 |
| 5 | Conhecer os seus padrões | 12 |
| 6 | Soltar o que já passou | 13 |
| 7 | Cuidar de você todo dia | 14 |
| 8 | Aprender a dizer não | 15 |
| 9 | Comunicar o que você quer | 16 |
| 10 | Ouvir de verdade | 16 |
| 11 | Mostrar quem você é | 17 |
| 12 | Construir confiança | 18 |
| 13 | Reconhecer o seu valor | 19 |
| 14 | Viver o presente | 20 |
| 15 | Praticar a gratidão | 20 |
| 16 | Abrir-se para o novo | 21 |
| 17 | Encontros sem ansiedade | 21 |
| 18 | Lidar com conflitos | 21 |
| 19 | Confiar de novo | 21 |
| 20 | Estar junto sem se perder | 21 |
| 21 | Construir intimidade | 21 |
| 22 | Construir um amor saudável | 21 |
| | **Total** | **365** |
- **Mudança de regra de negócio importante:** o progresso do desafio agora vem do **registro do diário** ("input diário"), não mais de completar o exercício de respiração. Cada primeiro registro do dia avança um dia no desafio. O exercício de respiração virou prática opcional (não afeta o progresso). Isso alinha o produto com a ideia de "ofensiva" pedida pelo cliente.
- Modelagem: a entidade `Plan` do schema passou a ter `challengeId` e `order` (posição na trilha). Cada desafio concluído fica salvo como um `Plan` com `status: 'completed'`; o ativo é o único com `status: 'active'`. Migração automática para planos salvos no formato antigo (sem `challengeId`).

### Ofensiva (streak) com tolerância
- Lógica em `lib/streak.ts`. Regra acordada com o cliente: registrar hoje ou ontem mantém a ofensiva; até **3 dias** seguidos sem registrar, a ofensiva é **perdoada** (continua valendo) e o Dashboard mostra um aviso âmbar de falta; passou de 3 dias, a ofensiva **zera** e o aviso muda de tom (sem culpabilizar).
- Coexiste com o `calculateStreakDays` antigo (streak estrito, usado só para o número de "dias seguidos" em alguns selos). O `computeStreak` novo é o que governa a ofensiva e os avisos.

### Conclusão de desafio
- Quando o último dia de um desafio é registrado, ele é marcado como concluído e o Dashboard abre uma tela de parabéns que **anuncia o próximo tópico** e oferece "começar o próximo desafio" (botão único; não há mais opção de adiar). O texto de conclusão **não cita a quantidade de dias** do desafio, justamente porque cada desafio tem duração diferente.
- **Fim do ciclo anual:** ao concluir o 22º (último) desafio, a tela muda de tom: em vez de anunciar o desafio 1 como "novo", ela parabeniza por ter completado o ano inteiro e convida a **"refazer os desafios em um nível mais alto da sua evolução"**. É uma alavanca de retenção pensada para incentivar a renovação da assinatura por mais um ano.
- Botões dev no card do desafio (só em `import.meta.env.DEV`): "(demo) avançar 1 dia" para ver a barra de progresso e a ofensiva mexerem, e "(demo) concluir desafio agora" para pular direto à tela de conclusão sem registrar todos os dias.

### IA Coach contextual ao desafio atual
- A IA Coach agora recebe o `challengeId` do desafio vigente (campo novo em `AIReplyRequest`). Quando a mensagem da pessoa **não** indica uma emoção aguda (ansiedade/pânico/tristeza, que têm prioridade de acolhimento), a resposta é puxada de um banco focado no **tema do desafio atual** (`CHALLENGE_REPLIES` em `mockAIService.ts`), sempre em tom positivo e prático. Assim a conversa faz sentido com o que a pessoa está trabalhando: no desafio "Aprender a dizer não", a IA fala de limites; em "Ouvir de verdade", fala de escuta; e assim por diante.
- A saudação de abertura da IA Coach também menciona o desafio atual ("A gente está no desafio X, e estou aqui pra te ajudar com isso").
- **Sugestão de exercício físico:** o botão rápido "Sugira um exercício físico" (e mensagens com palavras como caminhada, alongamento, pedalar etc.) traz um exercício leve do catálogo compartilhado (ver abaixo), sempre com uma **frase de atenção** lembrando de não exagerar e respeitar o limite. O objetivo declarado é só movimentar o corpo e somar bem-estar aos poucos, não prescrever treino, reforçando o disclaimer de que o app não é prescrição médica.

### Catálogo de exercícios compartilhado, com anti-repetição
- `lib/exercises.ts` reúne **31 exercícios** leves e tranquilos (6 de respiração com timer + 25 de movimento físico de baixo impacto). É a fonte única usada tanto pelo botão "Exercício do dia" (tela Início) quanto pela IA Coach.
- **Botão "Exercício do dia":** a cada clique, sorteia um exercício diferente. A tela ficou dinâmica: respiração roda com o timer animado; exercício físico mostra a instrução. Há um botão "Quero outra sugestão" para sortear de novo na hora.
- **Regra de não repetição** (`storageService.pickExercise(userId, channel)`): não repete um exercício mostrado nos **últimos 7 dias**; e, no **mesmo dia**, não repete entre os canais (o que apareceu no "Exercício do dia" não reaparece na IA Coach naquele dia, e vice-versa). Se a semana esgotar o catálogo, a regra da semana é relaxada, mantendo só "diferente do que já apareceu hoje". O histórico de mostrados fica em `localStorage` (coleção `shownExercises`, podada para ~30 dias).
- Toda sugestão (em ambos os canais) carrega uma das frases de atenção (`SAFETY_NOTES`).
- Continua mockado: cada desafio tem 2 variações de fala (sem repetir a última). Na troca pela OpenAI real, o `challengeId` (e o título do desafio) entram como contexto/sistema do prompt, então o comportamento se mantém.

### Lembretes diários por e-mail
- `NotificationService` mockado (`mockNotificationService.ts`), trocável por SendGrid depois. Sem servidor real, ele monta o e-mail do dia e o app mostra uma **prévia** nas Configurações, além de um toggle liga/desliga.
- **A mensagem se adapta ao momento de vida:** `lib/lifeStage.ts` deriva, do estado civil, uma de três personas (single / committed / overcoming). Cada uma tem assunto e corpo de e-mail próprios (ver "Personas de bem-estar" abaixo).

### Personas de bem-estar (IA Coach + e-mails)
- `lib/lifeStage.ts` mapeia o estado civil para três personas: **single** (solteiro), **committed** (comprometido), **overcoming** (divorciado/viúvo). Divorciado e viúvo compartilham a persona de superação, como pedido.
- **IA Coach:** além de acolher emoções agudas e falar do desafio vigente, agora a IA traz mensagens de bem-estar no tom da persona (`LIFE_STAGE_REPLIES` em `mockAIService.ts`), alternando com o tema do desafio para a conversa ter as duas dimensões. Single: autoestima, se valorizar, cuidar do corpo/alimentação, "quando você está bem consigo, atrai gente boa". Committed: respeito mútuo, fortalecer o casal, usar o app a dois (exercícios e monitoramento de mood juntos), evolução contínua da relação. Overcoming: mesma base do single + superação otimista ("o passado fica no lugar dele", "olhar para frente", "você vai vencer").
- **E-mails:** assunto e corpo do lembrete diário também variam pela persona (`copy.notifications.subject/body`).
- Continua mockado; numa integração futura com a OpenAI, o `lifeStage` entra como contexto/sistema do prompt, então o comportamento se mantém.
- **Estado civil editável nas Configurações:** as Configurações mostram o estado civil informado no onboarding ("Seu momento agora") e permitem trocá-lo a qualquer momento (a vida muda ao longo do uso). Ao salvar, a prévia do e-mail é regerada na hora, refletindo o novo tom. A edição usa uma action própria (`updateRelationshipStatus`) que atualiza sem tirar a pessoa da tela de Configurações.

---

## Retenção: upsell de fidelização e cancelamento truncado (a pedido do cliente)

O cancelamento antes era um clique direto. Foi reformulado para um fluxo de retenção que tenta, com honestidade, manter ou fidelizar o assinante — mas o cancelamento continua possível e funcional (requisito ético/legal: nada de impedir o cancelamento).

- **Plano de fidelização (`loyalty`):** novo tipo de assinatura de 12 meses em pagamento único por R$ 239,90 (R$ 19,99/mês), uma oferta de retenção mais barata que o anual normal. No serviço (`PaymentService.upgradeToLoyalty`), o upgrade é em 1 clique reusando o cartão salvo.
- **Sub-fluxo na tela "Plano atual"** (componente `PlanScreen.tsx`, aberto a partir de Ajustes → card de plano): mostra a data de início, a data de fim do período e um lembrete da ofensiva. Dali saem dois caminhos: o botão de destaque "Quero garantir 12 meses" (upsell) e um link discreto "Preciso cancelar minha assinatura".
- **Cancelamento em 3 passos (truncado, mas possível):** (1) reflexão sobre o que a pessoa perde ao sair (ofensiva, desafios, IA Coach que já a conhece, histórico) + o argumento "não é sobre o valor, é sobre o que o pouco de cada dia constrói"; (2) uma última oferta de fidelização com preço reduzido; (3) confirmação final, onde o botão que cancela de verdade fica menos destacado que o "manter assinatura". Em cada passo, a saída fácil é "ficar"; o caminho de cancelar exige passar pelos três. Ao confirmar, mantém-se o acesso até o fim do período já pago.
- Tudo persuasivo, sem dark pattern que impeça o cancelamento. Copy centralizada em `copy.plan` e revisada para não soar manipuladora nem culpabilizadora.
- Limite assumido: o agendamento real (cron + envio às 8h) é responsabilidade do backend na integração futura; aqui só existe a montagem da mensagem e a prévia.