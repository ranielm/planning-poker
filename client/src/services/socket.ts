import { io, Socket } from 'socket.io-client';
import { GameState, ActiveTopic, DeckType, ParticipantRole, VotingHistoryItem } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

type EventCallback<T = unknown> = (data: T) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(`${SOCKET_URL}/game`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.emit('disconnected', { reason });
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
        this.emit('error', error);
      });

      // Game events
      this.socket.on('room:state', (data: GameState) => {
        this.emit('room:state', data);
      });

      this.socket.on('room:participantJoined', (data) => {
        this.emit('room:participantJoined', data);
      });

      this.socket.on('room:participantLeft', (data) => {
        this.emit('room:participantLeft', data);
      });

      this.socket.on('room:participantUpdated', (data) => {
        this.emit('room:participantUpdated', data);
      });

      this.socket.on('room:kicked', (data) => {
        this.emit('room:kicked', data);
      });

      this.socket.on('game:voteCast', (data) => {
        this.emit('game:voteCast', data);
      });

      this.socket.on('game:cardsRevealed', (data) => {
        this.emit('game:cardsRevealed', data);
      });

      this.socket.on('game:roundReset', (data) => {
        this.emit('game:roundReset', data);
      });

      this.socket.on('game:topicChanged', (data) => {
        this.emit('game:topicChanged', data);
      });

      this.socket.on('game:deckChanged', (data) => {
        this.emit('game:deckChanged', data);
      });

      this.socket.on('game:brbStatusChanged', (data) => {
        this.emit('game:brbStatusChanged', data);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Room actions
  joinRoom(roomSlug: string, role?: ParticipantRole): Promise<{ success: boolean; roomId: string }> {
    return this.emitWithAck('room:join', { roomSlug, role });
  }

  leaveRoom(): Promise<{ success: boolean }> {
    return this.emitWithAck('room:leave', {});
  }

  // Game actions
  castVote(vote: string | number): Promise<{ success: boolean }> {
    return this.emitWithAck('game:vote', { vote: String(vote) });
  }

  revealCards(): Promise<{ success: boolean; results: unknown }> {
    return this.emitWithAck('game:reveal', {});
  }

  resetRound(): Promise<{ success: boolean }> {
    return this.emitWithAck('game:reset', {});
  }

  setTopic(topic: ActiveTopic): Promise<{ success: boolean }> {
    return this.emitWithAck('game:setTopic', { topic });
  }

  changeDeck(deckType: DeckType): Promise<{ success: boolean }> {
    return this.emitWithAck('game:changeDeck', { deckType });
  }

  updateRole(targetUserId: string, newRole: ParticipantRole): Promise<{ success: boolean }> {
    return this.emitWithAck('room:updateRole', { targetUserId, newRole });
  }

  kickParticipant(targetUserId: string): Promise<{ success: boolean }> {
    return this.emitWithAck('room:kick', { targetUserId });
  }

  getVotingHistory(limit = 10): Promise<{ success: boolean; history: VotingHistoryItem[] }> {
    return this.emitWithAck('game:getHistory', { limit });
  }

  setBrb(isBrb: boolean): Promise<{ success: boolean }> {
    return this.emitWithAck('game:setBrb', { isBrb });
  }

  assignDealer(targetUserId: string): Promise<{ success: boolean }> {
    return this.emitWithAck('room:assignDealer', { targetUserId });
  }

  toggleRole(saveAsDefault: boolean = false): Promise<{ success: boolean; newRole: string }> {
    return this.emitWithAck('room:toggleRole', { saveAsDefault });
  }

  // Event handling
  on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback as EventCallback);
    };
  }

  off(event: string, callback?: EventCallback): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }
  }

  private emit(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }

  private emitWithAck<T>(event: string, data: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit(event, data, (response: T | { error: string }) => {
        if (response && typeof response === 'object' && 'error' in response) {
          reject(new Error(response.error));
        } else {
          resolve(response as T);
        }
      });
    });
  }
}

export const socketService = new SocketService();
