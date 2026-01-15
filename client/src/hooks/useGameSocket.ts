import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketService } from '../services/socket';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { GameState, ActiveTopic, DeckType, ParticipantRole, CardValue, VotingHistoryItem } from '../types';

interface UseGameSocketOptions {
  roomSlug: string;
  onKicked?: () => void;
}

export function useGameSocket({ roomSlug, onKicked }: UseGameSocketOptions) {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const {
    gameState,
    isConnected,
    isJoining,
    selectedCard,
    setGameState,
    setConnected,
    setJoining,
    selectCard,
    setError,
    reset,
  } = useGameStore();

  const hasConnected = useRef(false);

  // Connect and join room
  useEffect(() => {
    if (!token || !roomSlug || hasConnected.current) return;

    const connectAndJoin = async () => {
      setJoining(true);
      setError(null);

      try {
        await socketService.connect(token);
        setConnected(true);

        const result = await socketService.joinRoom(roomSlug);
        console.log('Joined room:', result);
        hasConnected.current = true;
      } catch (error: any) {
        console.error('Failed to join room:', error);
        setError(error.message || 'Failed to join room');
        setConnected(false);
      } finally {
        setJoining(false);
      }
    };

    connectAndJoin();

    return () => {
      // Cleanup on unmount
      socketService.leaveRoom().catch(() => {});
      reset();
      hasConnected.current = false;
    };
  }, [token, roomSlug]);

  // Subscribe to socket events
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    unsubscribers.push(
      socketService.on<GameState>('room:state', (state) => {
        setGameState(state);
      })
    );

    unsubscribers.push(
      socketService.on('room:kicked', () => {
        setError('You have been removed from the room');
        onKicked?.();
        navigate('/');
      })
    );

    unsubscribers.push(
      socketService.on('disconnected', () => {
        setConnected(false);
      })
    );

    unsubscribers.push(
      socketService.on<{ message: string }>('error', (error) => {
        setError(error.message);
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [onKicked, navigate]);

  // Actions
  const castVote = useCallback(
    async (vote: CardValue) => {
      try {
        selectCard(vote);
        await socketService.castVote(vote);
      } catch (error: any) {
        setError(error.message);
        selectCard(null);
      }
    },
    [selectCard, setError]
  );

  const revealCards = useCallback(async () => {
    try {
      await socketService.revealCards();
    } catch (error: any) {
      setError(error.message);
    }
  }, [setError]);

  const resetRound = useCallback(async () => {
    try {
      selectCard(null);
      await socketService.resetRound();
    } catch (error: any) {
      setError(error.message);
    }
  }, [selectCard, setError]);

  const setTopic = useCallback(
    async (topic: ActiveTopic) => {
      try {
        await socketService.setTopic(topic);
      } catch (error: any) {
        setError(error.message);
      }
    },
    [setError]
  );

  const changeDeck = useCallback(
    async (deckType: DeckType) => {
      try {
        selectCard(null);
        await socketService.changeDeck(deckType);
      } catch (error: any) {
        setError(error.message);
      }
    },
    [selectCard, setError]
  );

  const updateRole = useCallback(
    async (targetUserId: string, newRole: ParticipantRole) => {
      try {
        await socketService.updateRole(targetUserId, newRole);
      } catch (error: any) {
        setError(error.message);
      }
    },
    [setError]
  );

  const kickParticipant = useCallback(
    async (targetUserId: string) => {
      try {
        await socketService.kickParticipant(targetUserId);
      } catch (error: any) {
        setError(error.message);
      }
    },
    [setError]
  );

  const getVotingHistory = useCallback(
    async (limit = 10): Promise<VotingHistoryItem[]> => {
      try {
        const result = await socketService.getVotingHistory(limit);
        return result.history;
      } catch (error: any) {
        setError(error.message);
        return [];
      }
    },
    [setError]
  );

  // Computed values
  const isModerator = user ? gameState?.participants.find(p => p.userId === user.id)?.role === 'MODERATOR' : false;
  const canVote = user
    ? gameState?.participants.find(p => p.userId === user.id)?.role !== 'OBSERVER' &&
      gameState?.phase === 'VOTING'
    : false;
  const hasVoted = user
    ? gameState?.participants.find(p => p.userId === user.id)?.hasVoted || false
    : false;

  const deck = gameState?.deckType === 'TSHIRT'
    ? ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕']
    : [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?', '☕'];

  return {
    // State
    gameState,
    isConnected,
    isJoining,
    selectedCard,
    deck,
    isModerator,
    canVote,
    hasVoted,

    // Actions
    castVote,
    revealCards,
    resetRound,
    setTopic,
    changeDeck,
    updateRole,
    kickParticipant,
    getVotingHistory,
  };
}
