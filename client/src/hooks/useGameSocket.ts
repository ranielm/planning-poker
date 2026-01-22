import { useEffect, useCallback, useRef, useState } from 'react';
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

  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const hasConnected = useRef(false);
  const onKickedRef = useRef(onKicked);
  const navigateRef = useRef(navigate);
  const roomSlugRef = useRef(roomSlug);
  const tokenRef = useRef(token);

  // Keep refs updated
  useEffect(() => {
    onKickedRef.current = onKicked;
    navigateRef.current = navigate;
    roomSlugRef.current = roomSlug;
    tokenRef.current = token;
  }, [onKicked, navigate, roomSlug, token]);

  // Connect and join room
  useEffect(() => {
    if (!token || !roomSlug) return;

    const connectAndJoin = async () => {
      // Skip if already connected to this room
      if (hasConnected.current && socketService.isConnected() && socketService.getCurrentRoom() === roomSlug) {
        return;
      }

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
      socketService.leaveRoom().catch(() => { });
      reset();
      hasConnected.current = false;
    };
  }, [token, roomSlug]);

  // Handle page visibility changes (tab switching)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, checking connection...');

        // Small delay to let the browser fully wake up
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!socketService.isConnected() && tokenRef.current && roomSlugRef.current) {
          console.log('Connection lost, attempting to reconnect...');
          setIsReconnecting(true);

          try {
            const success = await socketService.forceReconnect();
            if (success) {
              console.log('Reconnected successfully');
              setConnected(true);
              setIsReconnecting(false);
              setReconnectAttempt(0);
            }
          } catch (error) {
            console.error('Reconnection failed:', error);
            setIsReconnecting(false);
          }
        } else if (socketService.isConnected()) {
          // Already connected, but let's ensure we have fresh state
          const currentRoom = socketService.getCurrentRoom();
          if (currentRoom && currentRoom === roomSlugRef.current) {
            // Request fresh state by rejoining (server will send room:state)
            try {
              await socketService.joinRoom(roomSlugRef.current);
            } catch (error) {
              console.log('State refresh failed, connection may be stale');
            }
          }
        }
      }
    };

    // Handle online/offline events
    const handleOnline = async () => {
      console.log('Browser came online, checking connection...');
      if (!socketService.isConnected() && tokenRef.current) {
        setIsReconnecting(true);
        try {
          const success = await socketService.forceReconnect();
          if (success) {
            setConnected(true);
          }
        } catch (error) {
          console.error('Reconnection on online failed:', error);
        } finally {
          setIsReconnecting(false);
        }
      }
    };

    const handleOffline = () => {
      console.log('Browser went offline');
      setConnected(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setConnected]);

  // Subscribe to socket events (runs once on mount)
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    unsubscribers.push(
      socketService.on<GameState>('room:state', (state) => {
        setGameState(state);
        setIsReconnecting(false);
        setReconnectAttempt(0);
      })
    );

    unsubscribers.push(
      socketService.on('room:kicked', () => {
        setError('You have been removed from the room');
        onKickedRef.current?.();
        navigateRef.current('/');
      })
    );

    unsubscribers.push(
      socketService.on('disconnected', () => {
        setConnected(false);
      })
    );

    unsubscribers.push(
      socketService.on('connected', () => {
        setConnected(true);
        setIsReconnecting(false);
      })
    );

    unsubscribers.push(
      socketService.on('reconnected', () => {
        setConnected(true);
        setIsReconnecting(false);
        setReconnectAttempt(0);
      })
    );

    unsubscribers.push(
      socketService.on<{ attempt: number; max: number }>('reconnecting', ({ attempt, max }) => {
        setIsReconnecting(true);
        setReconnectAttempt(attempt);
        console.log(`Reconnecting... attempt ${attempt}/${max}`);
      })
    );

    unsubscribers.push(
      socketService.on('reconnect_failed', () => {
        setIsReconnecting(false);
        setError('Connection lost. Please refresh the page.');
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const setBrb = useCallback(
    async (isBrb: boolean) => {
      try {
        await socketService.setBrb(isBrb);
      } catch (error: any) {
        setError(error.message);
      }
    },
    [setError]
  );

  const assignDealer = useCallback(
    async (targetUserId: string) => {
      try {
        await socketService.assignDealer(targetUserId);
      } catch (error: any) {
        setError(error.message);
      }
    },
    [setError]
  );

  const toggleRole = useCallback(
    async (saveAsDefault: boolean = false) => {
      try {
        const result = await socketService.toggleRole(saveAsDefault);
        return result.newRole;
      } catch (error: any) {
        setError(error.message);
        return null;
      }
    },
    [setError]
  );

  // Computed values
  const participant = user && gameState ? gameState.participants.find(p => p.userId === user.id) : null;
  const isModerator = participant?.role === 'MODERATOR' || false;
  const isObserver = participant?.role === 'OBSERVER' || false;
  const isDealer = (participant?.userId && gameState?.dealerId === participant.userId) || false;
  const isBrb = participant?.isBrb || false;
  const canVote = (participant?.role && participant.role !== 'OBSERVER' && !isDealer && !isBrb && (gameState?.phase === 'VOTING' || gameState?.phase === 'REVEALED')) || false;
  const hasVoted = participant?.hasVoted || false;
  const myRole = participant?.role || 'VOTER';

  const deck = gameState?.deckType === 'TSHIRT'
    ? ['S', 'M', 'L', 'XL', '?', '☕']
    : [1, 2, 3, 5, 8, 13, '?', '☕'];

  return {
    // State
    gameState,
    isConnected,
    isJoining,
    isReconnecting,
    reconnectAttempt,
    selectedCard,
    deck,
    isModerator,
    isObserver,
    isDealer,
    isBrb,
    canVote,
    hasVoted,
    myRole,

    // Actions
    castVote,
    revealCards,
    resetRound,
    setTopic,
    changeDeck,
    updateRole,
    kickParticipant,
    getVotingHistory,
    setBrb,
    assignDealer,
    toggleRole,
  };
}
