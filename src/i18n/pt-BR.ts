// Copy centralizada do SoulSpace. Todo texto visível ao usuário deve vir
// daqui — facilita revisão de tom (humanizer) e futura tradução.
//
// ⚠️ REGRA OBRIGATÓRIA — GÊNERO NEUTRO ⚠️
// Todo texto aqui deve ser neutro de gênero. O usuário pode ser homem, mulher
// ou não-binário, e nunca sabemos o gênero — tratar no gênero errado quebra a
// confiança. NÃO use formas flexionadas como "bem-vindo/a", "cansado/a",
// "sozinho/a", "você mesmo", "ele/ela", nem a muleta "(a)". Prefira "você",
// "quem você é", "pode ficar em paz", "a sua própria companhia".
import type { GoalId, MoodId } from '../types'

const copy = {
  appName: 'SoulSpace',

  welcome: {
    title: 'Prepare sua alma para o relacionamento que você quer',
    subtitle: 'Diário emocional, um espaço de conversa e um plano guiado para reduzir a ansiedade, um dia por vez.',
    cta: 'Começar agora',
  },

  auth: {
    title: 'Crie sua conta',
    subtitle: 'Leva menos de um minuto.',
    google: 'Continuar com Google',
    apple: 'Continuar com Apple',
    emailLabel: 'Ou continue com e-mail',
    emailFieldLabel: 'E-mail',
    emailPlaceholder: 'seuemail@exemplo.com',
    emailButton: 'Continuar com e-mail',
    socialError: 'Não conseguimos conectar agora. Tente de novo ou use seu e-mail.',
    emailInvalid: 'Digite um e-mail válido, tipo nome@exemplo.com.',
  },

  profile: {
    title: 'Vamos te conhecer melhor',
    subtitle: 'Só o essencial. Isso ajusta o seu plano.',
    nameLabel: 'Como podemos te chamar?',
    namePlaceholder: 'Seu nome ou apelido',
    nameHint: 'Capricha aqui! 😄 Pode ser nome ou apelido, do jeitinho que você gosta de ser chamado(a). Só um detalhe: depois ele não muda, então é o seu cantinho pra sempre. 🔒',
    nameError: 'Conta seu nome pra gente saber como te chamar.',
    ageLabel: 'Sua idade',
    ageError: 'Idade mínima de 18 anos.',
    statusLabel: 'Eu estou…',
    statusOptions: ['Solteiro(a)', 'Comprometido(a)', 'Divorciado(a)', 'Viúvo(a)'],
    reasonLabel: 'Vamos te ajudar numa evolução incrível! 🚀',
    reasonPlaceholder: 'Ex.: Quero encontrar alguém de verdade, mas a ansiedade trava na hora de conhecer gente nova.',
    reasonHint: 'Nos diga, de um jeito simples, o que mais te incomoda agora — é a partir daí que a gente começa a trabalhar junto. Ah, e pode ficar em paz: tudo aqui é só seu e totalmente confidencial. 🤫💚',
    continueButton: 'Continuar',
  },

  goal: {
    title: 'Qual é o seu objetivo principal?',
    subtitle: 'Escolha o que pesa mais agora. É a partir daqui que a gente monta o seu plano. 💚',
    options: [
      { id: 'lonely' as GoalId, emoji: '💔', label: 'Superar a solidão' },
      { id: 'anxiety' as GoalId, emoji: '😰', label: 'Reduzir a ansiedade social' },
      { id: 'selfLove' as GoalId, emoji: '💪', label: 'Amar-me primeiro' },
      { id: 'emotionalIntelligence' as GoalId, emoji: '🧠', label: 'Inteligência emocional para relacionamentos' },
    ],
    continueButton: 'Começar meu plano',
    error: 'Escolha uma opção para continuar.',
  },

  subscription: {
    title: 'Escolha seu plano',
    subtitlePrefix: 'Plano recomendado para você:',
    // Nome e benefícios do plano de entrada (Essência), para ficar claro o que
    // a pessoa está contratando antes de colocar o cartão.
    planName: 'SoulSpace Essência',
    planTagline: 'O cuidado começa em você.',
    includesLabel: 'O que você leva',
    includes: [
      'Um lugar só seu pra colocar pra fora, sem ninguém julgando',
      'Alguém pra conversar quando o peito aperta, a qualquer hora',
      'Um caminho pronto, um passo por dia: é só seguir',
      'Veja com os próprios olhos o quanto você muda',
    ],
    includesClosing: 'E tudo começa hoje: o dia em que a sua vida afetiva vira de chave.',
    monthlyLabel: 'Mensal',
    monthlyPrice: 'R$ 39,90/mês',
    annualLabel: 'Anual',
    annualPrice: 'R$ 299,90/ano',
    annualBadge: '7 meses grátis',
    annualSub: 'equivale a R$ 24,99/mês',
    cardNumberLabel: 'Número do cartão',
    cardNumberPlaceholder: '0000 0000 0000 0000',
    cardExpiryLabel: 'Validade',
    cardExpiryPlaceholder: 'MM/AA',
    cardCvvLabel: 'CVV',
    cardCvvPlaceholder: '123',
    saveCardLabel: 'Salvar cartão para renovação automática',
    payButton: 'Começar a minha transformação',
    payButtonLoading: 'Preparando tudo para você…',
    securityNote: 'Ambiente seguro e privado. Seus dados são só seus.',
    successTitle: 'Boas-vindas ao SoulSpace! 🎉',
    successSubtitle: 'Pagamento confirmado. Seu plano já está pronto para o primeiro dia.',
    declineTitle: 'Pagamento recusado',
    tryAnotherCard: 'Tentar com outro cartão',
    errors: {
      invalid_number: 'Número do cartão inválido. Verifique os 16 dígitos.',
      invalid_expiry: 'Validade inválida ou cartão expirado. Use o formato MM/AA.',
      invalid_cvv: 'CVV inválido. Use os 3 dígitos no verso do cartão.',
      card_declined: 'Pagamento recusado. Verifique o saldo do cartão ou tente outro.',
      network_error: 'Não conseguimos processar agora. Confira sua internet e tente de novo.',
    },
  },

  dashboard: {
    welcome: {
      heading: (name: string) => `${name ? `${name}, ` : ''}que bom ter você aqui.`,
      paragraphs: [
        'O SoulSpace não é igual pra todo mundo: ele é seu, único, feito sob medida pra sua evolução. Porque ninguém é igual a você — e cuidar de quem você é leva uma vida inteira. Aqui você nunca está só. É um passo por dia rumo a uma evolução que você nem imagina que vem por aí.',
        'Cada registro no diário, cada conversa no seu espaço de conversa — exclusivamente personalizada pro seu momento — cada exercício e reflexão constroem um caminho só seu. É esse cuidado que prepara o terreno pra relações mais saudáveis e uma fase mais leve e feliz. Confie no processo, confie na gente. Vamos juntos, hoje.',
        'E não largue isso por nada: de tudo que você abre no celular, este é o app que de fato muda a sua vida. Você é único — e sua evolução também é. Quem fica, colhe: daqui a alguns meses vai olhar pra trás e agradecer por ter continuado. 💚',
      ],
    },
    greeting: (name: string) => `Olá, ${name}! Como está seu coração hoje?`,
    journalCta: 'Diário emocional de hoje',
    journalCtaHint: 'Leva menos de um minuto',
    journalDoneToday: 'Diário de hoje já está registrado ✓',
    planLabel: (goal: string) => `Seu plano: ${goal}`,
    streakLabel: (days: number) => `${days} dias seguidos`,
    exerciseCta: 'Exercício do dia',
    aiCta: 'Conversar & Evoluir',
    progressLabel: 'Progresso',
    practiceCta: 'Treinar conversa',
    practiceCtaHint: 'Simule um date e ganhe confiança, sem medo',
    practiceCtaExpired: 'Seu Conexão venceu — toque para renovar e voltar a treinar',
    // Faixa de retomada (aparece após cancelar, enquanto o período pago não vence)
    resumeCta: 'Retomar a assinatura do meu plano',
    resumeHint: 'Seus dados e sua evolução ainda estão aqui. Volte de onde parou.',
    // Faixa de renovação do Essência (venceu, mas o Conexão segura o app de pé)
    renewEssenciaCta: 'Seu plano não foi renovado ainda — toque para renovar',
    renewEssenciaHint: 'Seu Conexão segue ativo. Renove o Essência para não perder nada.',
    resumeHintWithDate: (date: string) =>
      `Seus dados ficam guardados até ${date}. Retome até lá e continue de onde parou.`,
  },

  // Treino de conversa do SoulSpace Conexão (menu de cenários → conversa → feedback).
  practice: {
    title: 'Treinar conversa',
    intro: 'Escolha uma situação para praticar. É um ensaio seguro: erre aqui à vontade, que lá fora você chega com mais confiança.',
    menuLabel: 'Situações para praticar',
    startCta: 'Começar treino',
    chatInputPlaceholder: 'Escreva como você responderia…',
    chatSendLabel: 'Enviar',
    endTrainingCta: 'Encerrar e ver feedback',
    endTrainingNoFeedbackCta: 'Encerrar sem feedback',
    backToMenuCta: 'Escolher outra situação',
    feedbackTitle: 'Como foi o seu treino',
    feedbackLoading: 'Preparando o seu feedback…',
    feedbackIntro: 'Olha só o que dá pra perceber desse ensaio:',
    feedbackClose: 'Voltar ao início',
    feedbackAgain: 'Treinar de novo',
    // Feedback simples usado quando a IA está desligada (sem custo). Com a IA
    // ligada, o feedback vem personalizado da conversa.
    feedbackOfflineMessage:
      'Você teve coragem de praticar, e isso já é o passo mais difícil. Cada ensaio desses deixa a conversa real um pouco mais leve. Continue treinando — a confiança se constrói repetição por repetição.',
  },

  challenge: {
    desafioLabel: (order: number, total: number) => `Desafio ${order} de ${total}`,
    dayCounter: (current: number, total: number) => `Dia ${current} de ${total}`,
    streakBadge: (days: number) => `🔥 ${days} dias de ofensiva`,
    nextLabel: 'Depois deste vem',
    inputReminder: 'Registre seu diário hoje para somar mais um dia.',
    inputDoneToday: 'Dia de hoje somado ✓ Volte amanhã para manter a ofensiva.',
    // Aviso de falta na ofensiva (até 3 dias salva, depois zera)
    graceWarning: (missed: number, streak: number) =>
      `Você ficou ${missed} ${missed === 1 ? 'dia' : 'dias'} sem registrar. Sua ofensiva de ${streak} ${streak === 1 ? 'dia' : 'dias'} ainda está de pé. Volte hoje para não perder ela.`,
    resetNotice: 'Sua ofensiva voltou ao zero. Sem culpa: hoje conta como o dia 1, e a gente segue daqui.',
    completeTitle: 'Desafio concluído! 🎉',
    completeBody: (goal: string) => `Você concluiu o desafio "${goal}". Cada dia que você apareceu por aqui foi por você, e isso merece ser reconhecido.`,
    completeNextLabel: 'Seu próximo desafio',
    completeStartCta: 'Começar o próximo desafio',
    completedCount: (count: number) => `${count} ${count === 1 ? 'desafio concluído' : 'desafios concluídos'}`,
    // Quando a pessoa conclui o ÚLTIMO desafio da trilha e o ciclo recomeça.
    cycleCompleteTitle: 'Você completou o ano inteiro! 🏆',
    cycleCompleteBody:
      'Você passou por todos os desafios da jornada. Isso é raro, e diz muito sobre o quanto você se dedicou a si. A partir daqui, dá para recomeçar a trilha num nível mais alto da sua evolução, levando tudo o que você aprendeu.',
    cycleNextLabel: 'Recomeçar em um novo nível',
    cycleStartCta: 'Refazer os desafios em um nível mais alto',
  },

  notifications: {
    previewTitle: 'Seu lembrete diário',
    previewIntro: 'Todo dia, às 8h, a gente te manda um e-mail assim para você não perder a ofensiva:',
    previewSubjectLabel: 'Assunto',
    previewToLabel: 'Para',
    sentBadge: 'enviado (simulação)',
    // O assunto e o corpo mudam conforme o momento de vida da pessoa (persona):
    // single (solteiro), committed (comprometido), overcoming (divorciado/viúvo).
    subject: {
      single: 'Cinco minutos por você hoje 💚',
      committed: 'Cinco minutos por você (e por vocês) hoje 💚',
      overcoming: 'Mais um passo seu, rumo ao que vem 💚',
    } as Record<'single' | 'committed' | 'overcoming', string>,
    body: {
      single: (name: string) =>
        `Oi, ${name}! Quando você se cuida e se valoriza, isso transparece e atrai gente boa para perto. Reserve cinco minutos para o seu diário hoje. Sua ofensiva agradece, e você também.`,
      committed: (name: string) =>
        `Oi, ${name}! Cuidar de você também cuida da sua relação. Que tal cinco minutos no diário hoje, e quem sabe chamar a sua pessoa para fazer junto? A dois a evolução rende mais.`,
      overcoming: (name: string) =>
        `Oi, ${name}! O passado fica no lugar dele, e o seu olhar segue para frente. Cinco minutos no diário hoje são mais um passo da sua superação. Você está no caminho, e vai vencer.`,
    } as Record<'single' | 'committed' | 'overcoming', (name: string) => string>,
    toggleLabel: 'Lembrete diário por e-mail',
    toggleOn: 'Você vai receber um lembrete todo dia de manhã.',
    toggleOff: 'Os lembretes diários estão desligados.',
  },

  journal: {
    title: 'O que você sente hoje?',
    placeholder: 'Ex.: Estou com ansiedade porque hoje vou encontrar uma pessoa nova e não sei se vou falar bem.',
    fieldLabel: 'Seu registro',
    anxietyLabel: 'Nível de ansiedade agora',
    anxietyCalm: 'calmo',
    anxietyIntense: 'intenso',
    activityLabel: 'Me mexi hoje (caminhada, bike ou outro exercício)',
    saveButton: 'Salvar',
    savedSynced: 'Diário salvo! A IA já vai olhar os seus padrões.',
    savedOffline: 'Salvo no seu celular. Vamos enviar assim que a internet voltar.',
    emptyError: 'Escreva algumas palavras antes de salvar. Pode ser só uma frase.',
    tooLongError: 'Esse texto está grande demais. Use até 10.000 caracteres.',
    historyTitle: 'Diários anteriores',
    historyEmpty: 'Seus registros vão aparecer aqui.',
    privacyNote: 'Espaço seguro: o que você escreve fica protegido e só você tem acesso.',
  },

  aiCoach: {
    title: 'Seu espaço de conversa',
    inputPlaceholder: 'Escreva sua mensagem…',
    sendButton: 'Enviar',
    quickReplies: ['Sugira um exercício físico', 'Estou com ansiedade', 'Quero um conselho'],
    timeoutMessage: 'A resposta está demorando um pouco. Tentando de novo…',
    unavailableMessage: 'O espaço de conversa está indisponível agora. Tente de novo em alguns minutos.',
    supportFallback: (email: string) => `Não conseguimos responder depois de algumas tentativas. Fale com a gente: ${email}`,
    offlineMessage: 'O espaço de conversa precisa de internet para responder. Volte quando a conexão estiver de novo.',
  },

  exercise: {
    title: 'Exercício do dia',
    breathingFooter: 'Repita o ciclo no seu ritmo, sem pressa.',
    physicalLabel: 'Sugestão de hoje',
    anotherButton: 'Quero outra sugestão',
    laterButton: 'Farei depois',
    completeButton: 'Completei ✓',
    completedTitle: 'Muito bem!',
    completedSubtitle: 'Que bom que você tirou esse tempo para você. Te espero amanhã.',
  },

  evolution: {
    title: 'Sua evolução',
    subtitle: 'Como seu humor e sua ansiedade andaram, dia a dia.',
    emptyTitle: 'Ainda não há o que mostrar',
    emptyBody: 'Registre seu diário por alguns dias e seu gráfico de evolução aparece aqui.',
    emptyCta: 'Fazer meu diário de hoje',
    chartHint: 'Arraste o gráfico para o lado para ver outros dias. Toque num ponto para reler aquele dia.',
    summaryHeading: 'Resumo da sua evolução nos últimos dias',
    summaryLoading: 'Lendo o seu gráfico…',
    // Painel de ação (reflexão + exercício) que abre ao clicar num dia crítico
    actionTitle: 'Um momento para você',
    reflectionLoading: 'Lendo o seu dia…',
    reflectionHeading: 'Um pensamento sobre isso',
    exerciseHeading: 'E que tal se mexer um pouco?',
    exerciseIntroNoActivity: 'Você não registrou atividade nesse dia. Um movimento leve ajuda o corpo a soltar a tensão — que tal o exercício do dia?',
    exerciseIntroWithActivity: 'Você já se mexeu nesse dia, ótimo! Se quiser somar, o exercício do dia te espera.',
    exerciseIntroTodayDone: 'Você já fez sua atividade física hoje, que tal mais um pouco? Mas sem forçar, tá? Se preferir, pode manter o que já fez hoje.',
    markActivityCta: 'Marcar que me mexi',
    activityLogged: 'Boa! Anotei sua atividade nesse dia.',
    closeAction: 'Fechar',
  },

  settings: {
    title: 'Configurações',
    backToApp: 'Voltar ao app',
    profileLabel: 'Perfil',
    emailLabel: 'Seu e-mail',
    emailEditCta: 'Mudar',
    emailSaveCta: 'Salvar e-mail',
    emailCancelCta: 'Cancelar',
    emailHint: 'Capricha no melhor e-mail seu! 😄 É por ele que vão chegar dicas valiosas e os recados sobre a sua assinatura. Nada de spam chato, prometido.',
    emailInvalid: 'Hmm, esse e-mail parece incompleto. Dá uma conferida e tenta de novo? 🙂',
    emailSaved: 'E-mail atualizado! As boas-novas já têm para onde ir. ✅',
    nameLockHint: 'Esse é o seu nome aqui dentro, pessoal e só seu. Por isso ele fica guardadinho e não muda. 🔒',
    relationshipLabel: 'Seu momento agora',
    relationshipEditCta: 'Mudar',
    relationshipSaveCta: 'Salvar',
    relationshipCancelCta: 'Cancelar',
    relationshipSaved: 'Tudo certo! Atualizamos o seu momento.',
    editProfile: 'Editar perfil',
    currentPlanLabel: 'Plano atual',
    noActivePlan: 'Sem assinatura ativa',
    myCurrentPlan: 'Meu plano atual',
    monthly: 'Mensal · R$ 39,90/mês',
    annual: 'Anual · R$ 299,90/ano',
    loyalty: 'Fidelidade · 12 meses garantidos',
    openPlanCta: 'Ver meu plano',
    helpContact: 'Ajuda e contato',
    helpEmail: 'suporte@soulspace.app',
    reportTitle: 'Encontrou um problema?',
    reportBody: 'Algo travou ou não funcionou como esperado? Conta pra gente — a sua mensagem ajuda o SoulSpace a melhorar.',
    reportCta: 'Reportar um erro',
    about: 'Sobre o SoulSpace',
    aboutBody: 'Versão de demonstração: os dados ficam só neste navegador.',
    logout: 'Sair',

    // Privacidade (seção acolhedora) + apagar dados.
    privacyTitle: 'Sua privacidade vem primeiro',
    privacyBody:
      'O SoulSpace foi feito pra ser um lugar seguro. Seu diário, seus humores e suas conversas no seu espaço de conversa são protegidos e tratados com sigilo — ninguém da nossa equipe lê o que é seu. Você está no controle: pode apagar seus dados quando quiser.',
    deleteAccountCta: 'Apagar meus dados',
    deleteConfirmTitle: 'Apagar seus dados?',
    deleteConfirmBody:
      'Isso apaga seu diário, suas conversas e todo o seu progresso de forma definitiva. Não dá pra desfazer. Sua conta continua ativa e você pode recomeçar do zero quando quiser.',
    deleteConfirmSubscriptionWarning:
      'Atenção: isso NÃO cancela sua assinatura. A cobrança continua ativa. Para cancelar o plano, vá em Plano atual.',
    deleteConfirmButton: 'Sim, apagar meus dados',
    deleteCancelButton: 'Cancelar',
    deleting: 'Apagando seus dados…',
    deleteDone: 'Seus dados foram apagados. Você está recomeçando do zero. 💚',
  },

  // Painel "Reportar um erro" (abre via Ajustes e via atalho no rodapé).
  report: {
    sheetTitle: 'Reportar um erro',
    lead: 'O que aconteceu? Descreva com as suas palavras — quanto mais detalhes, melhor a gente consegue ajudar.',
    fieldLabel: 'Sua mensagem',
    placeholder: 'Ex.: O gráfico de evolução não abriu quando toquei num dia.',
    emptyError: 'Escreva o que aconteceu antes de enviar. Pode ser bem simples.',
    sendCta: 'Enviar para o suporte',
    cancelCta: 'Cancelar',
    closeLabel: 'Fechar',
    emailSubject: 'Reporte de erro — SoulSpace',
    // Rótulo do atalho discreto acima da barra de navegação.
    footerCta: 'Algo não funcionou? Avise a gente',
    // Cabeçalho do bloco de dados técnicos anexado automaticamente ao e-mail.
    techHeading: 'Dados técnicos (nos ajudam a investigar)',
    techScreen: 'Tela',
    techVersion: 'Versão do app',
    techDevice: 'Dispositivo',
    // Aviso de que o app de e-mail vai abrir para o envio final.
    handoffNote: 'Vamos abrir o seu app de e-mail com tudo preenchido. É só tocar em enviar por lá.',
  },

  // Sub-fluxo do plano (detalhes -> fidelização / cancelamento truncado).
  plan: {
    detailsTitle: 'Seu plano',
    startedAtLabel: 'Você começou em',
    renewsLabel: 'Sua assinatura vai até',
    currentLabelMonthly: 'Plano mensal · R$ 39,90/mês',
    currentLabelAnnual: 'Plano anual · R$ 299,90/ano',
    currentLabelLoyalty: 'Plano fidelidade · 12 meses garantidos',
    streakReminder: (days: number) =>
      days > 0
        ? `Você está há ${days} ${days === 1 ? 'dia' : 'dias'} cuidando de você por aqui. Seria uma pena interromper agora.`
        : 'Cada dia que você aparece aqui te deixa um passo mais perto de quem você quer ser.',
    loyaltyCta: 'Quero garantir 12 meses',
    backCta: 'Voltar',
    cancelLink: 'Preciso cancelar minha assinatura',

    // ── Quiz de motivo do cancelamento (antes dos fluxos de retenção) ────────
    cancelQuiz: {
      title: 'Antes de ir, o que aconteceu?',
      intro: 'Sua resposta ajuda a gente a cuidar melhor de você e de quem está nessa jornada. Leva 10 segundos.',
      reasonsLabel: 'O motivo principal foi…',
      reasons: [
        { id: 'price', label: 'Achei caro', nudge: 'Antes de ir por preço: temos uma oferta pra caber no seu bolso na próxima tela.' },
        { id: 'time', label: 'Não estou usando o quanto queria', nudge: 'Cinco minutos por dia já mudam o jogo. A constância é o nosso forte — e a sua.' },
        { id: 'noresult', label: 'Não senti resultado ainda', nudge: 'Resultado emocional leva tempo. Sua evolução pode estar mais perto do que parece.' },
        { id: 'fixed', label: 'Já resolvi o que precisava', nudge: 'Que vitória! E lembre: manter o que você conquistou também é cuidado contínuo.' },
      ],
      otherLabel: 'Outro motivo',
      otherPlaceholder: 'Conta pra gente o que rolou…',
      needReasonWarning: 'Escolha um motivo (ou escreva em "Outro motivo") para continuar.',
      stayCta: 'Pensando bem, não vou cancelar — quero evoluir um dia de cada vez',
      continueCta: 'Continuar com o cancelamento',
    },

    // ── SoulSpace Conexão (upsell) na tela de plano ──────────────────────────
    connection: {
      // Cabeçalho de seção
      sectionLabel: 'Seu plano',
      essenciaLabel: 'SoulSpace Essência',
      essenciaTagline: 'Diário, espaço de conversa, plano guiado e evolução',
      conexaoLabel: 'SoulSpace Conexão',
      conexaoTagline: 'Treino de conversa com IA, simulador de encontro e feedback',
      conexaoActiveBadge: 'Ativo',
      // Quando o plano NÃO está ativo, o card mostra "Assinar" no lugar do badge.
      subscribeBadge: 'Assinar',

      // Rótulo "Plano atual: <nome> — <preço>"
      currentPlanPrefix: 'Plano atual',
      essenciaName: 'Essência',
      conexaoName: 'Conexão (upgrade)',
      // Linha de preço por tipo de cobrança
      priceMonthly: (v: string) => `${v}/mês`,
      priceAnnual: (v: string) => `${v}/ano`,
      priceDiscount: (v: string) => `${v}/mês (oferta especial)`,
      tapForDetails: 'Toque para ver detalhes',

      // Tela de DETALHES do Essência (abre ao tocar no card do Essência)
      essenciaDetailsTitle: 'SoulSpace Essência',
      essenciaDetailsTagline: 'O cuidado começa em você.',
      essenciaIncludesLabel: 'O seu Essência inclui',
      essenciaIncludes: [
        'Um lugar só seu pra colocar pra fora, sem ninguém julgando',
        'Alguém pra conversar quando o peito aperta, a qualquer hora',
        'Um caminho pronto, um passo por dia: é só seguir',
        'Veja com os próprios olhos o quanto você muda',
      ],
      essenciaPlanLine: 'Cobrança do Essência',
      essenciaJournalCta: 'Diário emocional de hoje',

      // Tela de DETALHES do Conexão (abre ao tocar no card)
      detailsTitle: 'SoulSpace Conexão',
      detailsTagline: 'Plenitude em cada conexão.',
      detailsIncludesLabel: 'O seu Conexão inclui',
      detailsIncludes: [
        'Simulador de encontro para treinar sem medo',
        'Feedback que mostra o que foi bem e o que melhorar',
        'Cenários difíceis: dizer não, se abrir, lidar com sumiço',
        'Espaço de conversa sem limite, a qualquer hora',
      ],
      detailsPlanLine: 'Cobrança do Conexão',
      detailsTrainCta: 'Abrir o treino de conversa',
      detailsBackCta: 'Voltar',
      detailsCancelCta: 'Cancelar plano',

      // Card de UPGRADE (aparece para quem ainda é só Essência)
      upgradeTitle: 'Desbloqueie o SoulSpace Conexão',
      upgradeLead: 'Você já está cuidando de você. Que tal treinar a conversa de verdade e chegar com confiança no que importa?',
      upgradeBenefits: [
        'Simulador de encontro: pratique um date sem medo de errar',
        'Feedback que mostra o que foi bem e o que melhorar',
        'Cenários difíceis: dizer não, se abrir, lidar com um sumiço',
        'Espaço de conversa sem limite, a qualquer hora',
      ],
      upgradeMonthlyLabel: 'Mensal',
      upgradeMonthlyPrice: '+ R$ 29,90/mês',
      upgradeAnnualLabel: 'Anual',
      upgradeAnnualPrice: 'R$ 199,90/ano',
      upgradeAnnualBadge: 'Economize ~44%',
      upgradeAnnualSub: 'equivale a R$ 16,66/mês',
      upgradeCta: 'Quero o Conexão',
      upgradeCtaLoading: 'Ativando…',
      upgradeReassurance: 'Você mantém tudo do Essência. O Conexão só soma. Cancele quando quiser.',
      upgradeDoneTitle: 'Bem-vindo ao Conexão! 🎉',
      upgradeDoneBody: 'Seu treino de conversa está liberado. Sempre que quiser, é só abrir “Treinar conversa” na tela inicial.',
      upgradeDoneCta: 'Começar a treinar',

      // Rótulo do plano atual quando é Conexão
      currentConexaoMonthly: 'SoulSpace Conexão · mensal',
      currentConexaoAnnual: 'SoulSpace Conexão · anual',

      // Link para gerenciar/cancelar só o Conexão
      manageConexaoLink: 'Gerenciar o meu Conexão',

      // Cancelamento do Conexão — passo 1: o que perde
      cancelConexaoReflectTitle: 'Antes de soltar o Conexão',
      cancelConexaoReflectIntro: 'Você pode cancelar só o Conexão e seguir no Essência. Mas dá uma olhada no que deixa de ter:',
      cancelConexaoLosses: [
        'O simulador de encontro para treinar sem medo',
        'O feedback que te mostra como evoluir na conversa',
        'Os cenários difíceis (dizer não, se abrir, lidar com sumiço)',
        'O espaço de conversa sem limite, sempre que precisar',
      ],
      cancelConexaoArgument:
        'A parte mais difícil — começar — você já fez. É justo na hora de praticar que a confiança aparece. Que tal seguir mais um pouco antes de soltar?',
      cancelConexaoStayCta: 'Pensando bem, vou manter',
      cancelConexaoContinueCta: 'Quero cancelar o Conexão mesmo assim',

      // Cancelamento do Conexão — passo 2: oferta de desconto
      cancelConexaoOfferTitle: 'Que tal continuar por menos?',
      cancelConexaoOfferBody:
        'Antes de cancelar, leve o Conexão por R$ 19,90/mês nos próximos 3 meses. É a sua chance de praticar mais um pouco, com um preço especial só pra você, agora.',
      cancelConexaoOfferPriceLine: 'R$ 19,90/mês por 3 meses · depois volta ao normal',
      cancelConexaoOfferAcceptCta: 'Aceitar e continuar treinando',
      cancelConexaoOfferStayCta: 'Vou manter como está',
      cancelConexaoOfferDeclineCta: 'Não, cancelar o Conexão',

      // Cancelamento do Conexão — passo 3: confirmação
      cancelConexaoFinalTitle: 'Cancelar o Conexão',
      cancelConexaoFinalBody:
        'Você continua com o SoulSpace Essência normalmente, com tudo que já usa. Só o treino de conversa do Conexão será desativado ao fim do período já pago. Confirmar?',
      cancelConexaoFinalConfirmCta: 'Sim, cancelar só o Conexão',
      cancelConexaoFinalKeepCta: 'Não, manter o Conexão',
      cancelConexaoDoneTitle: 'Conexão cancelado',
      cancelConexaoDoneBody: 'Você segue no Essência, tranquilo. Quando quiser treinar a conversa de novo, o Conexão estará aqui te esperando.',
      cancelConexaoDoneCta: 'Voltar',
    },

    // Tela de oferta de fidelização (upsell)
    loyaltyTitle: 'Garanta o seu próximo ano 💚',
    loyaltyLead: 'Sua evolução não precisa ter prazo de validade.',
    loyaltyBenefits: [
      '12 meses de acesso completo, sem se preocupar com renovação',
      'Sai por R$ 19,99 por mês: metade do valor do plano mensal',
      'Sua ofensiva, seus desafios e seu histórico seguem com você',
      'Um único pagamento de R$ 239,90 e pronto, o ano é seu',
    ],
    loyaltyPriceLine: 'R$ 239,90 à vista · equivale a R$ 19,99/mês',
    loyaltyConfirmCta: 'Garantir meus 12 meses',
    loyaltyConfirmLoading: 'Confirmando…',
    loyaltyMaybeLater: 'Agora não, voltar',
    loyaltySuccessTitle: 'Pronto, seu ano está garantido! 🎉',
    loyaltySuccessBody: 'Agora é seguir no seu ritmo, um dia de cada vez. A gente caminha junto.',

    // Cancelamento truncado: passo 1 (reflexão sobre o que perde)
    cancelReflectTitle: 'Antes de ir, um minuto com você',
    cancelReflectIntro: 'Cancelar é simples, e você pode fazer isso. Só queremos que seja uma escolha consciente.',
    cancelReflectLossLabel: 'O que para se você sair agora',
    cancelReflectLosses: [
      'Sua ofensiva e a sequência de dias que você construiu',
      'O desafio atual e os próximos da sua jornada de um ano',
      'O espaço de conversa que já conhece o seu momento e fala com você',
      'O seu histórico de humor e a sua evolução até aqui',
    ],
    cancelReflectArgument:
      'A gente entende que não é sobre o valor. É sobre o que cinco minutos por dia constroem ao longo do tempo. Cancelar hoje não muda nada de imediato. Mas seguir mais um pouco pode deixar as próximas semanas um tanto mais leves, e os próximos meses bem melhores. O que você quer pra você começa nos pequenos passos de agora.',
    cancelReflectStayCta: 'Pensando bem, vou ficar',
    cancelReflectContinueCta: 'Quero continuar o cancelamento',

    // Cancelamento truncado: passo 2 (última oferta)
    cancelOfferTitle: 'Que tal continuar a um preço menor?',
    cancelOfferBody:
      'Antes de cancelar de vez, você pode garantir 12 meses por R$ 239,90 (R$ 19,99/mês) e seguir evoluindo sem pressa. É a nossa melhor oferta, e ela está aqui só para você, agora.',
    cancelOfferAcceptCta: 'Aceitar e garantir 12 meses',
    cancelOfferStayCta: 'Vou permanecer como está e seguir minha evolução',
    cancelOfferDeclineCta: 'Não, seguir com o cancelamento',

    // Cancelamento truncado: passo 3 (confirmação final)
    cancelFinalTitle: 'Confirmar cancelamento',
    cancelFinalBody:
      'Você continua com acesso completo até o fim do período já pago. Depois disso, sua assinatura não será renovada. Tem certeza de que quer cancelar?',
    cancelFinalConfirmCta: 'Sim, cancelar mesmo assim',
    cancelFinalKeepCta: 'Não, manter minha assinatura',
    cancelledTitle: 'Sua assinatura foi cancelada',
    cancelledBody: 'Você ainda tem acesso até o fim do período pago. A porta fica aberta: quando quiser voltar, a gente continua de onde você parou.',
    cancelledBackCta: 'Voltar ao app',
  },

  // Upsell do SoulSpace Conexão (treino de conversa com IA). Copy persuasiva,
  // 100% neutra de gênero. Ataca a dor #1: medo de rejeição / paralisia no
  // contato real — o que o Essência conforta, o Conexão treina.
  connectionUpsell: {
    eyebrow: 'Novo · SoulSpace Conexão',
    title: 'Pratique o relacionamento que você quer',
    lead: 'Você está cuidando de você e, seguindo o método do SoulSpace, já vem evoluindo. Que tal dar o próximo passo: treinar a conversa de verdade, sem medo de errar?',
    painLine: 'Sabe aquele frio na barriga antes de um date, o branco na hora de puxar assunto, o medo do não? A gente treina isso junto, num lugar seguro.',
    featuresLabel: 'O que você desbloqueia',
    features: [
      {
        title: 'Simulador de encontro',
        body: 'Converse com o SoulSpace como se fosse um date real: puxar assunto, primeiro encontro, marcar de sair. Erre aqui, acerte lá fora.',
      },
      {
        title: 'Feedback que orienta',
        body: 'Depois de cada treino, o SoulSpace mostra o que foi bem e o que dá para melhorar, sem julgamento. Autocrítica vira evolução.',
      },
      {
        title: 'Cenários difíceis',
        body: 'Ensaie dizer não, expor um sentimento, lidar com um sumiço. As conversas que assustam ficam mais leves com prática.',
      },
      {
        title: 'Espaço de conversa sem limite',
        body: 'Converse o quanto precisar, a qualquer hora. Quem está evoluindo todo dia merece companhia ilimitada.',
      },
    ],
    humanNote: 'Cada conversa aqui nasce de conhecimento real sobre comportamento humano e relações — para te acolher de um jeito gente, não robótico.',
    priceLine: 'Por apenas R$ 29,90/mês a mais',
    priceSubline: 'Muito menos que uma sessão de terapia, com a diferença que aqui você usa a qualquer horário, em qualquer dia.',
    ctaPrimary: 'Quero o Conexão',
    ctaSecondary: 'Agora não, seguir no Essência',
    reassurance: 'Você mantém tudo do Essência. O Conexão só soma. Cancele quando quiser.',
  },

  moodOptions: [
    { id: 'sad' as MoodId, label: 'Triste' },
    { id: 'neutral' as MoodId, label: 'Neutro' },
    { id: 'happy' as MoodId, label: 'Bem' },
    { id: 'veryHappy' as MoodId, label: 'Muito bem' },
    { id: 'excited' as MoodId, label: 'Com energia' },
  ],

  banners: {
    offline: 'Você está sem internet. Seus dados ficam salvos no celular e enviamos quando a conexão voltar.',
    backOnline: 'Internet de volta! Seus dados foram sincronizados.',
    appRestored: 'Sentimos uma falha rápida, mas já corrigimos. Você voltou de onde parou.',
  },
}

export default copy
