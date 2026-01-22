import { io, Socket } from 'socket.io-client';
import { GameState, ActiveTopic, DeckType, ParticipantRole, VotingHistoryItem } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

type EventCallback<T = unknown> = (data: T) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private currentToken: string | null = null;
  private currentRoom: string | null = null;
  private isReconnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.currentToken = token;

      if (this.socket?.connected) {
        resolve();
        return;
      }

      // Clean up existing socket if any
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
      }

      this.socket = io(`${SOCKET_URL}/game`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.reconnectAttempts = 0;
        this.isReconnecting = false;
        this.emit('connected', {});
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        if (!this.isReconnecting) {
          reject(error);
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.emit('disconnected', { reason });

        // Auto-reconnect for certain disconnect reasons
        if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'ping timeout') {
          this.handleReconnect();
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        this.emit('reconnected', { attemptNumber });

        // Rejoin room if we were in one
        if (this.currentRoom) {
          this.rejoinRoom();
        }
      });

      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('Reconnection attempt:', attemptNumber);
        this.reconnectAttempts = attemptNumber;
        this.emit('reconnecting', { attempt: attemptNumber, max: this.maxReconnectAttempts });
      });

      this.socket.on('reconnect_failed', () => {
        console.error('Reconnection failed after max attempts');
        this.emit('reconnect_failed', {});
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

  private handleReconnect(): void {
    if (this.isReconnecting || !this.currentToken) return;

    this.isReconnecting = true;
    console.log('Attempting to reconnect...');

    // Socket.io will handle automatic reconnection
    // We just need to ensure we rejoin the room after reconnect
  }

  private async rejoinRoom(): Promise<void> {
    if (!this.currentRoom) return;

    try {
      console.log('Rejoining room:', this.currentRoom);
      const result = await this.joinRoom(this.currentRoom);
      console.log('Rejoined room successfully:', result);
    } catch (error) {
      console.error('Failed to rejoin room:', error);
      this.emit('error', { message: 'Failed to rejoin room after reconnection' });
    }
  }

  // Force reconnect (useful when tab becomes visible again)
  async forceReconnect(): Promise<boolean> {
    if (!this.currentToken) return false;

    console.log('Force reconnect requested');

    // If already connected, just rejoin the room
    if (this.socket?.connected) {
      if (this.currentRoom) {
        await this.rejoinRoom();
      }
      return true;
    }

    // Otherwise, reconnect
    try {
      await this.connect(this.currentToken);
      if (this.currentRoom) {
        await this.rejoinRoom();
      }
      return true;
    } catch (error) {
      console.error('Force reconnect failed:', error);
      return false;
    }
  }

  // Check connection health
  checkConnection(): boolean {
    return this.socket?.connected || false;
  }

  getCurrentRoom(): string | null {
    return this.currentRoom;
  }

  disconnect(): void {
    this.currentRoom = null;
    this.currentToken = null;
    this.isReconnecting = false;
    this.reconnectAttempts = 0;

    if (this.socket) {
      this.socket.removeAllListeners();
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
    this.currentRoom = roomSlug;
    return this.emitWithAck('room:join', { roomSlug, role });
  }

  leaveRoom(): Promise<{ success: boolean }> {
    this.currentRoom = null;
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
