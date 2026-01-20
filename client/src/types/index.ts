// Re-export shared types and add client-specific types

export type DeckType = 'FIBONACCI' | 'TSHIRT';
export type ParticipantRole = 'MODERATOR' | 'VOTER' | 'OBSERVER';
export type GamePhase = 'WAITING' | 'VOTING' | 'REVEALED';

export const FIBONACCI_DECK = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?', '☕'] as const;
export const TSHIRT_DECK = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕'] as const;

export type CardValue = string | number;

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

export interface ActiveTopic {
  title: string;
  description?: string;
  jiraKey?: string;
  jiraUrl?: string;
}

export interface Participant {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: ParticipantRole;
  hasVoted: boolean;
  isOnline: boolean;
  isBrb?: boolean;
}

export interface VoteInfo {
  userId: string;
  value: string | null;
}

export interface GameState {
  roomId: string;
  roomName: string;
  phase: GamePhase;
  deckType: DeckType;
  activeTopic: ActiveTopic | null;
  participants: Participant[];
  votes: VoteInfo[];
  currentRoundId: string | null;
  results: VotingResult | null;
  dealerId: string | null;
}

export interface FibonacciResult {
  type: 'fibonacci';
  average: number;
  roundedAverage: number;
  votes: number[];
  distribution: Record<number, number>;
  isConsensus: boolean;
  consensusValue?: number;
  totalVotes: number;
  skippedVotes: number;
}

export interface TShirtResult {
  type: 'tshirt';
  mode: string;
  modeCount: number;
  distribution: Record<string, number>;
  isConsensus: boolean;
  consensusValue?: string;
  totalVotes: number;
  skippedVotes: number;
}

export type VotingResult = FibonacciResult | TShirtResult;

export interface JiraIssue {
  key: string;
  summary: string;
  description?: string;
  url: string;
  status?: string;
  issueType?: string;
}

export interface Room {
  id: string;
  name: string;
  slug: string;
  deckType: DeckType;
  moderatorId: string;
  dealerId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface VotingHistoryItem {
  id: string;
  topic: ActiveTopic | null;
  finalResult: VotingResult;
  revealedAt: string;
  voteCount: number;
}
