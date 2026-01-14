import { create } from 'zustand';
import { GameState, CardValue } from '../types';

interface GameStore {
  // State
  gameState: GameState | null;
  isConnected: boolean;
  isJoining: boolean;
  selectedCard: CardValue | null;
  error: string | null;

  // Actions
  setGameState: (state: GameState) => void;
  setConnected: (connected: boolean) => void;
  setJoining: (joining: boolean) => void;
  selectCard: (card: CardValue | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Derived getters
  isModerator: (userId: string) => boolean;
  canVote: (userId: string) => boolean;
  hasVoted: (userId: string) => boolean;
  getParticipantVote: (userId: string) => string | null;
  getDeck: () => (string | number)[];
}

const FIBONACCI_DECK = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?', '☕'];
const TSHIRT_DECK = ['S', 'M', 'L', 'XL', '?', '☕']; // S=13, M=26, L=52, XL=104 SP

// T-Shirt to Story Points mapping
export const TSHIRT_TO_SP: Record<string, number> = {
  'S': 13,
  'M': 26,
  'L': 52,
  'XL': 104,
};

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  isConnected: false,
  isJoining: false,
  selectedCard: null,
  error: null,

  setGameState: (state) => set({ gameState: state }),
  setConnected: (connected) => set({ isConnected: connected }),
  setJoining: (joining) => set({ isJoining: joining }),
  selectCard: (card) => set({ selectedCard: card }),
  setError: (error) => set({ error }),

  reset: () =>
    set({
      gameState: null,
      isConnected: false,
      isJoining: false,
      selectedCard: null,
      error: null,
    }),

  isModerator: (userId: string) => {
    const { gameState } = get();
    if (!gameState) return false;
    const participant = gameState.participants.find((p) => p.userId === userId);
    return participant?.role === 'MODERATOR';
  },

  canVote: (userId: string) => {
    const { gameState } = get();
    if (!gameState) return false;
    const participant = gameState.participants.find((p) => p.userId === userId);
    return participant?.role !== 'OBSERVER' && gameState.phase === 'VOTING';
  },

  hasVoted: (userId: string) => {
    const { gameState } = get();
    if (!gameState) return false;
    const participant = gameState.participants.find((p) => p.userId === userId);
    return participant?.hasVoted || false;
  },

  getParticipantVote: (userId: string) => {
    const { gameState } = get();
    if (!gameState || gameState.phase !== 'REVEALED') return null;
    const vote = gameState.votes.find((v) => v.userId === userId);
    return vote?.value || null;
  },

  getDeck: () => {
    const { gameState } = get();
    if (!gameState) return FIBONACCI_DECK;
    return gameState.deckType === 'FIBONACCI' ? FIBONACCI_DECK : TSHIRT_DECK;
  },
}));
