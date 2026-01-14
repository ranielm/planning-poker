import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VotingService } from './voting.service';

// String constants for SQLite compatibility
const GamePhase = { WAITING: 'WAITING', VOTING: 'VOTING', REVEALED: 'REVEALED' } as const;
const ParticipantRole = { MODERATOR: 'MODERATOR', VOTER: 'VOTER', OBSERVER: 'OBSERVER' } as const;

export interface ActiveTopic {
  title: string;
  description?: string;
  jiraKey?: string;
  jiraUrl?: string;
}

export interface GameStateResponse {
  roomId: string;
  roomName: string;
  phase: string;
  deckType: string;
  activeTopic: ActiveTopic | null;
  participants: ParticipantInfo[];
  votes: VoteInfo[];
  currentRoundId: string | null;
  results: any | null;
}

export interface ParticipantInfo {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  hasVoted: boolean;
  isOnline: boolean;
}

export interface VoteInfo {
  userId: string;
  value: string | null; // Null if not revealed
}

@Injectable()
export class GameService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly votingService: VotingService,
  ) {}

  async getGameState(roomId: string): Promise<GameStateResponse> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, displayName: true, avatarUrl: true },
            },
          },
        },
        rounds: {
          where: { phase: { not: GamePhase.WAITING } },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            votes: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const currentRound = room.rounds[0];
    const phase = currentRound?.phase || GamePhase.WAITING;
    const isRevealed = phase === GamePhase.REVEALED;

    const participants: ParticipantInfo[] = room.participants.map((p) => {
      const socketIds: string[] = JSON.parse(p.socketIds || '[]');
      return {
        userId: p.user.id,
        displayName: p.user.displayName,
        avatarUrl: p.user.avatarUrl,
        role: p.role,
        hasVoted: currentRound?.votes.some((v) => v.userId === p.userId) || false,
        isOnline: socketIds.length > 0,
      };
    });

    const votes: VoteInfo[] = currentRound?.votes.map((v) => ({
      userId: v.userId,
      value: isRevealed ? v.value : null,
    })) || [];

    let results = null;
    if (isRevealed && currentRound) {
      const voteValues = currentRound.votes.map((v) => v.value);
      results = this.votingService.calculateResults(room.deckType, voteValues);
    }

    return {
      roomId: room.id,
      roomName: room.name,
      phase,
      deckType: room.deckType,
      activeTopic: room.activeTopic ? JSON.parse(room.activeTopic) : null,
      participants,
      votes,
      currentRoundId: currentRound?.id || null,
      results,
    };
  }

  async startNewRound(roomId: string, moderatorId: string, topic?: ActiveTopic) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.moderatorId !== moderatorId) {
      throw new ForbiddenException('Only the moderator can start a new round');
    }

    // End any active rounds
    await this.prisma.round.updateMany({
      where: {
        roomId,
        phase: { not: GamePhase.REVEALED },
      },
      data: { phase: GamePhase.REVEALED },
    });

    // Create new round
    const round = await this.prisma.round.create({
      data: {
        roomId,
        topic: topic ? JSON.stringify(topic) : null,
        phase: GamePhase.VOTING,
      },
    });

    // Update room's active topic
    if (topic) {
      await this.prisma.room.update({
        where: { id: roomId },
        data: { activeTopic: JSON.stringify(topic) },
      });
    }

    return round;
  }

  async castVote(roomId: string, oderId: string, roundId: string, value: string) {
    // Verify participant is a voter
    const participant = await this.prisma.participant.findUnique({
      where: {
        userId_roomId: { userId: oderId, roomId },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You must join the room to vote');
    }

    if (participant.role === ParticipantRole.OBSERVER) {
      throw new ForbiddenException('Observers cannot vote');
    }

    // Verify round is in voting phase
    const round = await this.prisma.round.findUnique({
      where: { id: roundId },
    });

    if (!round || round.phase !== GamePhase.VOTING) {
      throw new ForbiddenException('Cannot vote in this round');
    }

    // Upsert vote
    return this.prisma.vote.upsert({
      where: {
        roundId_userId: { roundId, userId: oderId },
      },
      create: {
        roomId,
        userId: oderId,
        roundId,
        value,
      },
      update: {
        value,
      },
    });
  }

  async revealCards(roomId: string, moderatorId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        rounds: {
          where: { phase: GamePhase.VOTING },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { votes: true },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.moderatorId !== moderatorId) {
      throw new ForbiddenException('Only the moderator can reveal cards');
    }

    const currentRound = room.rounds[0];
    if (!currentRound) {
      throw new ForbiddenException('No active voting round');
    }

    // Update round phase
    const updatedRound = await this.prisma.round.update({
      where: { id: currentRound.id },
      data: {
        phase: GamePhase.REVEALED,
        revealedAt: new Date(),
      },
      include: { votes: true },
    });

    // Calculate results
    const voteValues = updatedRound.votes.map((v) => v.value);
    const results = this.votingService.calculateResults(room.deckType, voteValues);

    return {
      round: updatedRound,
      results,
    };
  }

  async resetRound(roomId: string, moderatorId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.moderatorId !== moderatorId) {
      throw new ForbiddenException('Only the moderator can reset the round');
    }

    // Create a new voting round with the same topic
    const currentTopic = room.activeTopic ? JSON.parse(room.activeTopic) : undefined;
    return this.startNewRound(roomId, moderatorId, currentTopic);
  }

  async changeDeckType(roomId: string, moderatorId: string, deckType: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.moderatorId !== moderatorId) {
      throw new ForbiddenException('Only the moderator can change the deck type');
    }

    return this.prisma.room.update({
      where: { id: roomId },
      data: { deckType },
    });
  }

  async setTopic(roomId: string, moderatorId: string, topic: ActiveTopic) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.moderatorId !== moderatorId) {
      throw new ForbiddenException('Only the moderator can set the topic');
    }

    return this.prisma.room.update({
      where: { id: roomId },
      data: { activeTopic: JSON.stringify(topic) },
    });
  }
}
