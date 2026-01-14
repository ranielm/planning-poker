import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from '../auth/dto/auth.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    return user;
  }

  async getUserRooms(userId: string) {
    return this.prisma.room.findMany({
      where: {
        OR: [
          { moderatorId: userId },
          { participants: { some: { userId } } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
  }
}
