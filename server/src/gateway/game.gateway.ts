import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../modules/auth/auth.service';
import { GameService, ActiveTopic } from '../modules/game/game.service';
import { RoomService } from '../modules/room/room.service';
import { VotingService } from '../modules/game/voting.service';
// String constants for SQLite compatibility
type DeckType = 'FIBONACCI' | 'TSHIRT';
type ParticipantRole = 'MODERATOR' | 'VOTER' | 'OBSERVER';

interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      sub: string;
      email: string;
      displayName: string;
    };
    roomId?: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameGateway.name);

  // Track socket -> room mapping for cleanup
  private socketRooms = new Map<string, string>();

  constructor(
    private readonly authService: AuthService,
    private readonly gameService: GameService,
    private readonly roomService: RoomService,
    private readonly votingService: VotingService,
    private readonly configService: ConfigService,
  ) { }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = this.authService.verifyToken(token);
      client.data.user = payload;

      this.logger.log(
        `Client ${client.id} connected (User: ${payload.displayName})`,
      );
    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const roomId = this.socketRooms.get(client.id);
    const userId = client.data?.user?.sub;

    if (roomId && userId) {
      // Remove socket from participant
      await this.roomService.removeSocketFromParticipant(
        roomId,
        userId,
        client.id,
      );

      // Notify room of participant status change
      const gameState = await this.gameService.getGameState(roomId);
      this.server.to(roomId).emit('room:state', gameState);
    }

    this.socketRooms.delete(client.id);
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('room:join')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomSlug: string; role?: ParticipantRole },
  ) {
    const userId = client.data.user.sub;

    try {
      // Get room by slug
      const room = await this.roomService.findBySlug(data.roomSlug);

      // Determine role: explicit > user preference > default VOTER
      let role = data.role;
      if (!role) {
        // Check if user already exists in room (preserve existing role)
        const existingParticipant = room.participants.find(p => p.userId === userId);
        if (existingParticipant) {
          role = existingParticipant.role as ParticipantRole;
        } else {
          // New participant - use their default preference
          role = await this.roomService.getUserDefaultRole(userId) as ParticipantRole;
        }
      }

      // Join the room in database
      await this.roomService.joinRoom(
        room.id,
        userId,
        role,
      );

      // Add socket to participant's socket list (multi-device support)
      await this.roomService.addSocketToParticipant(room.id, userId, client.id);

      // Join Socket.io room
      client.join(room.id);
      client.data.roomId = room.id;
      this.socketRooms.set(client.id, room.id);

      // Get and broadcast updated game state
      const gameState = await this.gameService.getGameState(room.id);

      // Send state to joining client
      client.emit('room:state', gameState);

      // Notify others
      client.to(room.id).emit('room:participantJoined', {
        userId,
        displayName: client.data.user.displayName,
      });

      this.logger.log(
        `User ${client.data.user.displayName} joined room ${room.slug}`,
      );

      return { success: true, roomId: room.id };
    } catch (error: any) {
      this.logger.error(`Failed to join room: ${error.message}`);
      throw new WsException(error.message || 'Failed to join room');
    }
  }

  @SubscribeMessage('room:leave')
  async handleLeaveRoom(@ConnectedSocket() client: AuthenticatedSocket) {
    const roomId = client.data.roomId;
    const userId = client.data.user.sub;

    if (!roomId) {
      return { success: false, error: 'Not in a room' };
    }

    try {
      // Remove socket from participant
      await this.roomService.removeSocketFromParticipant(
        roomId,
        userId,
        client.id,
      );

      // Leave Socket.io room
      client.leave(roomId);
      this.socketRooms.delete(client.id);
      client.data.roomId = undefined;

      // Notify room
      const gameState = await this.gameService.getGameState(roomId);
      this.server.to(roomId).emit('room:state', gameState);

      client.to(roomId).emit('room:participantLeft', {
        userId,
        displayName: client.data.user.displayName,
      });

      return { success: true };
    } catch (error: any) {
      throw new WsException(error.message || 'Failed to leave room');
    }
  }

  @SubscribeMessage('game:vote')
  async handleVote(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { vote: string },
  ) {
    const roomId = client.data.roomId;
    const userId = client.data.user.sub;

    if (!roomId) {
      throw new WsException('Not in a room');
    }

    try {
      // Get current game state to find active round
      const gameState = await this.gameService.getGameState(roomId);

      if (!gameState.currentRoundId) {
        throw new WsException('No active round');
      }

      // Cast vote
      await this.gameService.castVote(
        roomId,
        userId,
        gameState.currentRoundId,
        data.vote,
      );

      // Notify room that someone voted (don't reveal the vote)
      this.server.to(roomId).emit('game:voteCast', {
        userId,
        displayName: client.data.user.displayName,
      });

      // Send updated state
      const updatedState = await this.gameService.getGameState(roomId);
      this.server.to(roomId).emit('room:state', updatedState);

      return { success: true };
    } catch (error: any) {
      throw new WsException(error.message || 'Failed to cast vote');
    }
  }

  @SubscribeMessage('game:reveal')
  async handleReveal(@ConnectedSocket() client: AuthenticatedSocket) {
    const roomId = client.data.roomId;
    const userId = client.data.user.sub;

    if (!roomId) {
      throw new WsException('Not in a room');
    }

    try {
      const result = await this.gameService.revealCards(roomId, userId);

      // Broadcast reveal with results
      const gameState = await this.gameService.getGameState(roomId);
      this.server.to(roomId).emit('game:cardsRevealed', {
        results: result.results,
      });
      this.server.to(roomId).emit('room:state', gameState);

      return { success: true, results: result.results };
    } catch (error: any) {
      throw new WsException(error.message || 'Failed to reveal cards');
    }
  }

  @SubscribeMessage('game:reset')
  async handleReset(@ConnectedSocket() client: AuthenticatedSocket) {
    const roomId = client.data.roomId;
    const userId = client.data.user.sub;

    if (!roomId) {
      throw new WsException('Not in a room');
    }

    try {
      await this.gameService.resetRound(roomId, userId);

      // Broadcast reset
      const gameState = await this.gameService.getGameState(roomId);
      this.server.to(roomId).emit('game:roundReset', {});
      this.server.to(roomId).emit('room:state', gameState);

      return { success: true };
    } catch (error: any) {
      throw new WsException(error.message || 'Failed to reset round');
    }
  }

  @SubscribeMessage('game:setTopic')
  async handleSetTopic(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { topic: ActiveTopic },
  ) {
    const roomId = client.data.roomId;
    const userId = client.data.user.sub;

    if (!roomId) {
      throw new WsException('Not in a room');
    }

    try {
      // Start a new round with the topic
      await this.gameService.startNewRound(roomId, userId, data.topic);

      // Broadcast topic change
      const gameState = await this.gameService.getGameState(roomId);
      this.server.to(roomId).emit('game:topicChanged', { topic: data.topic });
      this.server.to(roomId).emit('room:state', gameState);

      return { success: true };
    } catch (error: any) {
      throw new WsException(error.message || 'Failed to set topic');
    }
  }

  @SubscribeMessage('game:changeDeck')
  async handleChangeDeck(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { deckType: DeckType },
  ) {
    const roomId = client.data.roomId;
    const userId = client.data.user.sub;

    if (!roomId) {
      throw new WsException('Not in a room');
    }

    try {
      await this.gameService.changeDeckType(roomId, userId, data.deckType);

      // Broadcast deck change
      const gameState = await this.gameService.getGameState(roomId);
      this.server.to(roomId).emit('game:deckChanged', {
        deckType: data.deckType,
      });
      this.server.to(roomId).emit('room:state', gameState);

      return { success: true };
    } catch (error: any) {
      throw new WsException(error.message || 'Failed to change deck');
    }
  }

  @SubscribeMessage('room:updateRole')
  async handleUpdateRole(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { targetUserId: string; newRole: ParticipantRole },
  ) {
    const roomId = client.data.roomId;
    const userId = client.data.user.sub;

    if (!roomId) {
      throw new WsException('Not in a room');
    }

    try {
      await this.roomService.updateParticipantRole(
        roomId,
        userId,
        data.targetUserId,
        data.newRole,
      );

      // Broadcast update
      const gameState = await this.gameService.getGameState(roomId);
      this.server.to(roomId).emit('room:participantUpdated', {
        userId: data.targetUserId,
        role: data.newRole,
      });
      this.server.to(roomId).emit('room:state', gameState);

      return { success: true };
    } catch (error: any) {
      throw new WsException(error.message || 'Failed to update role');
    }
  }

  @SubscribeMessage('room:kick')
  async handleKick(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { targetUserId: string },
  ) {
    const roomId = client.data.roomId;
    const userId = client.data.user.sub;

    if (!roomId) {
      throw new WsException('Not in a room');
    }

    try {
      // Verify moderator
      const room = await this.roomService.findById(roomId);
      if (room.moderatorId !== userId) {
        throw new WsException('Only the moderator can kick participants');
      }

      // Remove participant
      await this.roomService.leaveRoom(roomId, data.targetUserId);

      // Notify the kicked user
      // Find their sockets and disconnect them from the room
      const sockets = await this.server.in(roomId).fetchSockets();
      for (const socket of sockets) {
        if ((socket as any).data?.user?.sub === data.targetUserId) {
          socket.emit('room:kicked', {
            message: 'You have been removed from the room',
          });
          socket.leave(roomId);
        }
      }

      // Broadcast update
      const gameState = await this.gameService.getGameState(roomId);
      this.server.to(roomId).emit('room:state', gameState);

      return { success: true };
    } catch (error: any) {
      throw new WsException(error.message || 'Failed to kick participant');
    }
  }

  @SubscribeMessage('game:setBrb')
  async handleSetBrb(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { isBrb: boolean },
  ) {
    const roomId = client.data.roomId;
    const userId = client.data.user.sub;

    if (!roomId) {
      throw new WsException('Not in a room');
    }

    try {
      await this.gameService.setBrbStatus(roomId, userId, data.isBrb);

      // Broadcast BRB status change
      const gameState = await this.gameService.getGameState(roomId);
      this.server.to(roomId).emit('game:brbStatusChanged', {
        userId,
        isBrb: data.isBrb,
      });
      this.server.to(roomId).emit('room:state', gameState);

      return { success: true };
    } catch (error: any) {
      throw new WsException(error.message || 'Failed to set BRB status');
    }
  }

  @SubscribeMessage('game:getHistory')
  async handleGetHistory(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { limit?: number },
  ) {
    const roomId = client.data.roomId;

    if (!roomId) {
      throw new WsException('Not in a room');
    }

    try {
      const history = await this.gameService.getVotingHistory(
        roomId,
        data?.limit || 10,
      );

      return { success: true, history };
    } catch (error: any) {
      throw new WsException(error.message || 'Failed to get voting history');
    }
  }

  @SubscribeMessage('room:assignDealer')
  async handleAssignDealer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { targetUserId: string },
  ) {
    const roomId = client.data.roomId;
    const userId = client.data.user.sub;

    if (!roomId) {
      throw new WsException('Not in a room');
    }

    try {
      await this.roomService.assignDealer(roomId, userId, data.targetUserId);

      // Broadcast update
      const gameState = await this.gameService.getGameState(roomId);
      this.server.to(roomId).emit('room:state', gameState);

      return { success: true };
    } catch (error: any) {
      throw new WsException(error.message || 'Failed to assign dealer');
    }
  }

  @SubscribeMessage('room:toggleRole')
  async handleToggleRole(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { saveAsDefault?: boolean },
  ) {
    const roomId = client.data.roomId;
    const userId = client.data.user.sub;

    if (!roomId) {
      throw new WsException('Not in a room');
    }

    try {
      const updated = await this.roomService.toggleOwnRole(
        roomId,
        userId,
        data?.saveAsDefault || false,
      );

      // Broadcast update
      const gameState = await this.gameService.getGameState(roomId);
      this.server.to(roomId).emit('room:participantUpdated', {
        userId,
        role: updated.role,
      });
      this.server.to(roomId).emit('room:state', gameState);

      return { success: true, newRole: updated.role };
    } catch (error: any) {
      throw new WsException(error.message || 'Failed to toggle role');
    }
  }
}
