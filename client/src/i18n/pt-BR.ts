import { Translations } from './en-US';

export const ptBR: Translations = {
  // Common
  common: {
    loading: 'Carregando...',
    error: 'Erro',
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    create: 'Criar',
    join: 'Entrar',
    leave: 'Sair',
    back: 'Voltar',
    next: 'Avançar',
    submit: 'Enviar',
    close: 'Fechar',
    copy: 'Copiar',
    copied: 'Copiado!',
    or: 'ou',
  },

  // Navigation
  nav: {
    home: 'Início',
    profile: 'Perfil',
    logout: 'Sair',
    login: 'Entrar',
    register: 'Cadastrar',
  },

  // Auth
  auth: {
    login: 'Entrar',
    register: 'Cadastrar',
    email: 'E-mail',
    password: 'Senha',
    confirmPassword: 'Confirmar Senha',
    displayName: 'Nome de Exibição',
    forgotPassword: 'Esqueceu a senha?',
    noAccount: 'Não tem uma conta?',
    hasAccount: 'Já tem uma conta?',
    signInWith: 'Entrar com',
    signUpWith: 'Cadastrar com',
    orContinueWith: 'Ou continue com',
    signingIn: 'Entrando...',
    creatingAccount: 'Criando conta...',
    completingSignIn: 'Finalizando login...',
  },

  // Home Page
  home: {
    title: 'Planning Poker',
    subtitle: 'Crie ou entre em uma sala para começar a estimar com sua equipe',
    joinRoom: 'Entrar em uma Sala',
    enterRoomCode: 'Digite o código ou URL da sala...',
    yourRooms: 'Suas Salas',
    publicRooms: 'Salas Públicas',
    noRoomsYet: 'Nenhuma sala ainda',
    noRoomsDescription: 'Crie sua primeira sala para começar a planejar com sua equipe',
    createRoom: 'Criar Sala',
    noPublicRooms: 'Nenhuma sala pública',
    noPublicRoomsDescription: 'Seja o primeiro a criar uma sala pública para todos entrarem',
    participants: 'participantes',
    by: 'por',
  },

  // Create Room Page
  createRoom: {
    title: 'Criar Nova Sala',
    subtitle: 'Configure uma nova sala de planning poker para sua equipe',
    roomName: 'Nome da Sala',
    roomNamePlaceholder: 'ex: Planejamento Sprint 34',
    customSlug: 'URL Personalizada',
    customSlugPlaceholder: 'ex: sprint-34',
    optional: '(opcional)',
    deckType: 'Tipo de Baralho',
    fibonacci: 'Fibonacci',
    fibonacciValues: '0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89',
    tshirt: 'Tamanhos de Camiseta',
    tshirtValues: 'P, M, G, GG',
    tshirtSP: 'P=13, M=26, G=52, GG=104 SP',
    roomVisibility: 'Visibilidade da Sala',
    private: 'Privada',
    privateDescription: 'Acessível apenas pelo código da sala',
    public: 'Pública',
    publicDescription: 'Listada na página inicial para todos',
    creating: 'Criando...',
  },

  // Room Page
  room: {
    connecting: 'Conectando...',
    waitingToStart: 'Aguardando início',
    voting: 'Votação',
    revealed: 'Revelado',
    selectCard: 'Selecione uma carta para votar',
    youVoted: 'Você votou',
    waitingForOthers: 'Aguardando outros...',
    allVotesIn: 'Todos votaram!',
    shareRoom: 'Compartilhar Sala',
    copyLink: 'Copiar link',
    linkCopied: 'Link copiado!',
    leaveRoom: 'Sair da Sala',
    roomCode: 'Código da Sala',
  },

  // Moderator Controls
  moderator: {
    startVoting: 'Iniciar Votação',
    revealVotes: 'Revelar Votos',
    resetVoting: 'Reiniciar Votação',
    newRound: 'Nova Rodada',
    endSession: 'Encerrar Sessão',
  },

  // Topic Panel
  topic: {
    currentTopic: 'Tópico Atual',
    noTopic: 'Nenhum tópico definido',
    setTopic: 'Definir Tópico',
    topicTitle: 'Título do Tópico',
    topicDescription: 'Descrição',
    jiraIntegration: 'Integração com Jira',
    loadFromJira: 'Carregar do Jira',
    jiraKey: 'Chave da Issue do Jira',
    jiraKeyPlaceholder: 'ex: PROJ-123',
  },

  // Results Panel
  results: {
    title: 'Resultados',
    average: 'Média',
    rounded: 'Arredondado',
    consensus: 'Consenso!',
    noConsensus: 'Sem consenso',
    votes: 'votos',
    skipped: 'pularam',
    distribution: 'Distribuição',
  },

  // Participants
  participants: {
    title: 'Participantes',
    moderator: 'Moderador',
    voter: 'Votante',
    observer: 'Observador',
    voted: 'Votou',
    notVoted: 'Não votou',
    you: '(Você)',
  },

  // Profile Page
  profile: {
    title: 'Perfil',
    subtitle: 'Gerencie as configurações da sua conta',
    personalInfo: 'Informações Pessoais',
    updateProfile: 'Atualizar Perfil',
    updating: 'Atualizando...',
    changePassword: 'Alterar Senha',
    currentPassword: 'Senha Atual',
    newPassword: 'Nova Senha',
    confirmNewPassword: 'Confirmar Nova Senha',
    passwordChanged: 'Senha alterada com sucesso',
    dangerZone: 'Zona de Perigo',
    deleteAccount: 'Excluir Conta',
    deleteAccountWarning: 'Esta ação não pode ser desfeita.',
  },

  // Errors
  errors: {
    generic: 'Algo deu errado. Por favor, tente novamente.',
    networkError: 'Erro de rede. Verifique sua conexão.',
    unauthorized: 'Você não tem autorização para realizar esta ação.',
    notFound: 'O recurso solicitado não foi encontrado.',
    invalidCredentials: 'E-mail ou senha inválidos.',
    emailInUse: 'Este e-mail já está em uso.',
    weakPassword: 'A senha deve ter pelo menos 6 caracteres.',
    passwordMismatch: 'As senhas não coincidem.',
    roomNotFound: 'Sala não encontrada.',
    alreadyInRoom: 'Você já está nesta sala.',
  },

  // Language
  language: {
    title: 'Idioma',
    english: 'Inglês',
    portuguese: 'Português (Brasil)',
  },
};
