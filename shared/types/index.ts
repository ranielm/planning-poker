// ============================================
// Planning Poker - Shared Types
// ============================================

// Deck Types
export type DeckType = 'fibonacci' | 'tshirt';

export const FIBONACCI_DECK = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?', '☕'] as const;
export const TSHIRT_DECK = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕'] as const;

export type FibonacciCard = (typeof FIBONACCI_DECK)[number];
export type TShirtCard = (typeof TSHIRT_DECK)[number];
export type CardValue = FibonacciCard | TShirtCard;

// User & Auth Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  displayName: string;
  avatarUrl?: string;
}

export type AuthProvider = 'email' | 'github' | 'google';

// Room Types
export type ParticipantRole = 'moderator' | 'voter' | 'observer';

export interface Participant {
  id: string;
  oderId: string;
  odisplayName: string;
  avatarUrl?: string;
  role: ParticipantRole;
  hasVoted: boolean;
  vote?: CardValue;
  isOnline: boolean;
  socketIds: string[]; // Multi-device support
}

export interface Room {
  id: string;
  name: string;
  slug: string;
  deckType: DeckType;
  moderatorId: string;
  createdAt: Date;
  isActive: boolean;
}

// Game State Types
export type GamePhase = 'waiting' | 'voting' | 'revealed';

export interface ActiveTopic {
  title: string;
  description?: string;
  jiraKey?: string;
  jiraUrl?: string;
}

export interface GameState {
  roomId: string;
  phase: GamePhase;
  deckType: DeckType;
  activeTopic?: ActiveTopic;
  participants: Map<string, Participant> | Record<string, Participant>;
  votes: Map<string, CardValue> | Record<string, CardValue>;
  revealedAt?: Date;
}

// Voting Results Types
export interface FibonacciResult {
  type: 'fibonacci';
  average: number;
  votes: number[];
  distribution: Record<number, number>;
  isConsensus: boolean;
  consensusValue?: number;
}

export interface TShirtResult {
  type: 'tshirt';
  mode: string;
  modeCount: number;
  distribution: Record<string, number>;
  isConsensus: boolean;
  consensusValue?: string;
}

export type VotingResult = FibonacciResult | TShirtResult;

// Jira Types
export interface JiraIssue {
  key: string;
  summary: string;
  description?: string;
  url: string;
  status?: string;
  issueType?: string;
}

// Socket Events
export namespace SocketEvents {
  // Client -> Server
  export const JOIN_ROOM = 'room:join';
  export const LEAVE_ROOM = 'room:leave';
  export const CAST_VOTE = 'game:vote';
  export const REVEAL_CARDS = 'game:reveal';
  export const RESET_ROUND = 'game:reset';
  export const SET_TOPIC = 'game:setTopic';
  export const CHANGE_DECK = 'game:changeDeck';
  export const UPDATE_ROLE = 'room:updateRole';
  export const KICK_PARTICIPANT = 'room:kick';

  // Server -> Client
  export const ROOM_STATE = 'room:state';
  export const PARTICIPANT_JOINED = 'room:participantJoined';
  export const PARTICIPANT_LEFT = 'room:participantLeft';
  export const PARTICIPANT_UPDATED = 'room:participantUpdated';
  export const VOTE_CAST = 'game:voteCast';
  export const CARDS_REVEALED = 'game:cardsRevealed';
  export const ROUND_RESET = 'game:roundReset';
  export const TOPIC_CHANGED = 'game:topicChanged';
  export const DECK_CHANGED = 'game:deckChanged';
  export const ERROR = 'error';
}

// Socket Payloads
export interface JoinRoomPayload {
  roomSlug: string;
  role: ParticipantRole;
}

export interface CastVotePayload {
  roomId: string;
  vote: CardValue;
}

export interface SetTopicPayload {
  roomId: string;
  topic: ActiveTopic;
}

export interface ChangeDeckPayload {
  roomId: string;
  deckType: DeckType;
}

export interface UpdateRolePayload {
  roomId: string;
  targetUserId: string;
  newRole: ParticipantRole;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
