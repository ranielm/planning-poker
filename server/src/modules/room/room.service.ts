import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import { nanoid } from 'nanoid';
import { DeckType, ParticipantRole } from '@prisma/client';

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateRoomDto) {
    const slug = dto.slug || this.generateSlug(dto.name);

    const room = await this.prisma.room.create({
      data: {
        name: dto.name,
        slug,
        deckType: dto.deckType || DeckType.FIBONACCI,
        moderatorId: userId,
        participants: {
          create: {
            userId,
            role: ParticipantRole.MODERATOR,
          },
        },
      },
      include: {
        moderator: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, displayName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    return room;
  }

  async findBySlug(slug: string) {
    const room = await this.prisma.room.findUnique({
      where: { slug },
      include: {
        moderator: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, displayName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async findById(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        moderator: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, displayName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async update(roomId: string, userId: string, dto: UpdateRoomDto) {
    const room = await this.findById(roomId);

    if (room.moderatorId !== userId) {
      throw new ForbiddenException('Only the moderator can update the room');
    }

    return this.prisma.room.update({
      where: { id: roomId },
      data: dto,
    });
  }

  async delete(roomId: string, userId: string) {
    const room = await this.findById(roomId);

    if (room.moderatorId !== userId) {
      throw new ForbiddenException('Only the moderator can delete the room');
    }

    await this.prisma.room.delete({
      where: { id: roomId },
    });

    return { success: true };
  }

  async joinRoom(roomId: string, oderId: string, role: ParticipantRole = ParticipantRole.VOTER) {
    const existingParticipant = await this.prisma.participant.findUnique({
      where: {
        userId_roomId: {
          userId: oderId,
          roomId,
        },
      },
    });

    if (existingParticipant) {
      return existingParticipant;
    }

    return this.prisma.participant.create({
      data: {
        userId: oderId,
        roomId,
        role,
      },
    });
  }

  async leaveRoom(roomId: string, userId: string) {
    await this.prisma.participant.delete({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    }).catch(() => null);

    return { success: true };
  }

  async updateParticipantRole(roomId: string, moderatorId: string, targetUserId: string, newRole: ParticipantRole) {
    const room = await this.findById(roomId);

    if (room.moderatorId !== moderatorId) {
      throw new ForbiddenException('Only the moderator can change roles');
    }

    return this.prisma.participant.update({
      where: {
        userId_roomId: {
          userId: targetUserId,
          roomId,
        },
      },
      data: { role: newRole },
    });
  }

  async addSocketToParticipant(roomId: string, userId: string, socketId: string) {
    const participant = await this.prisma.participant.findUnique({
      where: {
        userId_roomId: { userId, roomId },
      },
    });

    if (!participant) {
      return null;
    }

    const socketIds = participant.socketIds.includes(socketId)
      ? participant.socketIds
      : [...participant.socketIds, socketId];

    return this.prisma.participant.update({
      where: { id: participant.id },
      data: { socketIds },
    });
  }

  async removeSocketFromParticipant(roomId: string, oderId: string, socketId: string) {
    const participant = await this.prisma.participant.findUnique({
      where: {
        userId_roomId: { userId: oderId, roomId },
      },
    });

    if (!participant) {
      return null;
    }

    const socketIds = participant.socketIds.filter(id => id !== socketId);

    return this.prisma.participant.update({
      where: { id: participant.id },
      data: { socketIds },
    });
  }

  async getParticipants(roomId: string) {
    return this.prisma.participant.findMany({
      where: { roomId },
      include: {
        user: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
      },
    });
  }

  private generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);

    return `${baseSlug}-${nanoid(6)}`;
  }
}
