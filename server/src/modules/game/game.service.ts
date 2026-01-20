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
  dealerId: string | null;
}

export interface ParticipantInfo {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  hasVoted: boolean;
  isOnline: boolean;
  isBrb: boolean;
  brbAt: Date | null;
}

export interface VoteInfo {
  userId: string;
  value: string | null; // Null if not revealed
}

export interface VotingHistoryItem {
  id: string;
  topic: ActiveTopic | null;
  finalResult: any;
  revealedAt: Date | null;
  voteCount: number;
}

@Injectable()
export class GameService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly votingService: VotingService,
  ) { }

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
        isBrb: (p as any).isBrb || false,
        brbAt: (p as any).brbAt || null,
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
      dealerId: (room as any).dealerId || null,
    };
  }

  async startNewRound(roomId: string, moderatorId: string, topic?: ActiveTopic) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.moderatorId !== moderatorId && (room as any).dealerId !== moderatorId) {
      throw new ForbiddenException('Only the moderator or dealer can start a new round');
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

  async castVote(roomId: string, userId: string, roundId: string, value: string) {
    // Verify participant is a voter
    const participant = await this.prisma.participant.findUnique({
      where: {
        userId_roomId: { userId, roomId },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You must join the room to vote');
    }

    if (participant.role === ParticipantRole.OBSERVER) {
      throw new ForbiddenException('Observers cannot vote');
    }

    if ((participant as any).isBrb) {
      throw new ForbiddenException('Cannot vote while in BRB mode');
    }

    // Verify round exists
    const round = await this.prisma.round.findUnique({
      where: { id: roundId },
    });

    if (!round) {
      throw new ForbiddenException('Round not found');
    }

    // Allow voting in both VOTING and REVEALED phases (for vote changes)
    if (round.phase !== GamePhase.VOTING && round.phase !== GamePhase.REVEALED) {
      throw new ForbiddenException('Cannot vote in this phase');
    }

    // Upsert vote
    return this.prisma.vote.upsert({
      where: {
        roundId_userId: { roundId, userId },
      },
      create: {
        roomId,
        userId,
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

    if (room.moderatorId !== moderatorId && (room as any).dealerId !== moderatorId) {
      throw new ForbiddenException('Only the moderator or dealer can reveal cards');
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

    if (room.moderatorId !== moderatorId && (room as any).dealerId !== moderatorId) {
      throw new ForbiddenException('Only the moderator or dealer can reset the round');
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

    if (room.moderatorId !== moderatorId && (room as any).dealerId !== moderatorId) {
      throw new ForbiddenException('Only the moderator or dealer can change the deck type');
    }

    return this.prisma.room.update({
      where: { id: roomId },
      data: { deckType },
    });
  }

  async setTopic(roomId: string, moderatorId: string, topic: ActiveTopic) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        rounds: {
          where: { phase: { not: GamePhase.REVEALED } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.moderatorId !== moderatorId && (room as any).dealerId !== moderatorId) {
      throw new ForbiddenException('Only the moderator or dealer can set the topic');
    }

    // Update room's active topic
    await this.prisma.room.update({
      where: { id: roomId },
      data: { activeTopic: JSON.stringify(topic) },
    });

    // Also update the current round's topic if there's an active round
    const currentRound = room.rounds[0];
    if (currentRound) {
      await this.prisma.round.update({
        where: { id: currentRound.id },
        data: { topic: JSON.stringify(topic) },
      });
    }

    return room;
  }

  async getVotingHistory(roomId: string, limit = 10): Promise<VotingHistoryItem[]> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Fetch revealed rounds with votes
    const rounds = await this.prisma.round.findMany({
      where: {
        roomId,
        phase: GamePhase.REVEALED,
        revealedAt: { not: null },
      },
      orderBy: { revealedAt: 'desc' },
      take: limit,
      include: {
        votes: true,
      },
    });

    return rounds.map((round) => {
      const voteValues = round.votes.map((v) => v.value);
      const finalResult = this.votingService.calculateResults(room.deckType, voteValues);

      return {
        id: round.id,
        topic: round.topic ? JSON.parse(round.topic) : null,
        finalResult,
        revealedAt: round.revealedAt,
        voteCount: round.votes.length,
      };
    });
  }

  async setBrbStatus(roomId: string, userId: string, isBrb: boolean) {
    const participant = await this.prisma.participant.findUnique({
      where: {
        userId_roomId: { userId, roomId },
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    return this.prisma.participant.update({
      where: {
        userId_roomId: { userId, roomId },
      },
      data: {
        isBrb,
        brbAt: isBrb ? new Date() : null,
      } as any, // Using 'any' until Prisma client is regenerated
    });
  }
}
