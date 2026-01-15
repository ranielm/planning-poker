export const enUS = {
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    join: 'Join',
    leave: 'Leave',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    close: 'Close',
    copy: 'Copy',
    copied: 'Copied!',
    or: 'or',
  },

  // Navigation
  nav: {
    home: 'Home',
    profile: 'Profile',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
  },

  // Auth
  auth: {
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    displayName: 'Display Name',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    signInWith: 'Sign in with',
    signUpWith: 'Sign up with',
    orContinueWith: 'Or continue with',
    signingIn: 'Signing in...',
    creatingAccount: 'Creating account...',
    completingSignIn: 'Completing sign in...',
  },

  // Home Page
  home: {
    title: 'Planning Poker',
    subtitle: 'Create or join a room to start estimating with your team',
    joinRoom: 'Join a Room',
    enterRoomCode: 'Enter room code or URL...',
    yourRooms: 'Your Rooms',
    publicRooms: 'Public Rooms',
    noRoomsYet: 'No rooms yet',
    noRoomsDescription: 'Create your first room to start planning with your team',
    createRoom: 'Create Room',
    noPublicRooms: 'No public rooms',
    noPublicRoomsDescription: 'Be the first to create a public room for everyone to join',
    participants: 'participants',
    by: 'by',
  },

  // Create Room Page
  createRoom: {
    title: 'Create New Room',
    subtitle: 'Set up a new planning poker room for your team',
    roomName: 'Room Name',
    roomNamePlaceholder: 'e.g., Sprint 34 Planning',
    customSlug: 'Custom URL Slug',
    customSlugPlaceholder: 'e.g., sprint-34',
    optional: '(optional)',
    deckType: 'Deck Type',
    fibonacci: 'Fibonacci',
    fibonacciValues: '0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89',
    tshirt: 'T-Shirt Sizes',
    tshirtValues: 'S, M, L, XL',
    tshirtSP: 'S=13, M=26, L=52, XL=104 SP',
    roomVisibility: 'Room Visibility',
    private: 'Private',
    privateDescription: 'Only accessible via room code',
    public: 'Public',
    publicDescription: 'Listed on homepage for everyone',
    creating: 'Creating...',
  },

  // Room Page
  room: {
    connecting: 'Connecting...',
    waitingToStart: 'Waiting to start',
    voting: 'Voting',
    revealed: 'Revealed',
    selectCard: 'Select a card to vote',
    youVoted: 'You voted',
    waitingForOthers: 'Waiting for others...',
    allVotesIn: 'All votes in!',
    shareRoom: 'Share Room',
    copyLink: 'Copy link',
    linkCopied: 'Link copied!',
    leaveRoom: 'Leave Room',
    roomCode: 'Room Code',
  },

  // Moderator Controls
  moderator: {
    startVoting: 'Start Voting',
    revealVotes: 'Reveal Votes',
    resetVoting: 'Reset Voting',
    newRound: 'New Round',
    endSession: 'End Session',
  },

  // Topic Panel
  topic: {
    currentTopic: 'Current Topic',
    noTopic: 'No topic set',
    setTopic: 'Set Topic',
    topicTitle: 'Topic Title',
    topicDescription: 'Description',
    jiraIntegration: 'Jira Integration',
    loadFromJira: 'Load from Jira',
    jiraKey: 'Jira Issue Key',
    jiraKeyPlaceholder: 'e.g., PROJ-123',
    waitingForModerator: 'Waiting for moderator to set a topic...',
  },

  // Voting History
  history: {
    title: 'Voting History',
    noHistory: 'No voting history yet',
    votes: 'votes',
    untitledRound: 'Untitled round',
  },

  // Results Panel
  results: {
    title: 'Results',
    average: 'Average',
    rounded: 'Rounded',
    consensus: 'Consensus!',
    noConsensus: 'No consensus',
    votes: 'votes',
    skipped: 'skipped',
    distribution: 'Distribution',
  },

  // Participants
  participants: {
    title: 'Participants',
    moderator: 'Moderator',
    voter: 'Voter',
    observer: 'Observer',
    voted: 'Voted',
    notVoted: 'Not voted',
    you: '(You)',
  },

  // Profile Page
  profile: {
    title: 'Profile',
    subtitle: 'Manage your account settings',
    personalInfo: 'Personal Information',
    updateProfile: 'Update Profile',
    updating: 'Updating...',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    passwordChanged: 'Password changed successfully',
    dangerZone: 'Danger Zone',
    deleteAccount: 'Delete Account',
    deleteAccountWarning: 'This action cannot be undone.',
  },

  // Errors
  errors: {
    generic: 'Something went wrong. Please try again.',
    networkError: 'Network error. Please check your connection.',
    unauthorized: 'You are not authorized to perform this action.',
    notFound: 'The requested resource was not found.',
    invalidCredentials: 'Invalid email or password.',
    emailInUse: 'This email is already in use.',
    weakPassword: 'Password must be at least 6 characters.',
    passwordMismatch: 'Passwords do not match.',
    roomNotFound: 'Room not found.',
    alreadyInRoom: 'You are already in this room.',
  },

  // Language
  language: {
    title: 'Language',
    english: 'English',
    portuguese: 'Portuguese (Brazil)',
  },
};

export type Translations = typeof enUS;
