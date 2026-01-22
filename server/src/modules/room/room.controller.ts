import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateRoomDto, UpdateRoomDto, JoinRoomDto } from './dto/room.dto';
import { GameGateway } from '../../gateway/game.gateway';

@ApiTags('rooms')
@Controller('rooms')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly gameGateway: GameGateway,
  ) {}

  @Get('public')
  @ApiOperation({ summary: 'Get all public rooms' })
  @ApiResponse({ status: 200, description: 'List of public rooms' })
  async findPublicRooms() {
    return this.roomService.findPublicRooms();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new poker room' })
  @ApiResponse({ status: 201, description: 'Room created successfully' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRoomDto,
  ) {
    const room = await this.roomService.create(userId, dto);

    // Notify all clients about new public room
    if (room.isPublic) {
      this.gameGateway.server.emit('publicRoom:created', {
        id: room.id,
        name: room.name,
        slug: room.slug,
        deckType: room.deckType,
        createdAt: room.createdAt,
        moderator: room.moderator,
        _count: { participants: room.participants.length },
      });
    }

    return room;
  }

  @Get(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get room by slug' })
  @ApiResponse({ status: 200, description: 'Room found' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.roomService.findBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update room settings' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.roomService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a room' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    console.log('[DELETE ROOM] Controller received request:', { roomId: id, userId });

    try {
      // Get room info before deleting to check if it was public
      console.log('[DELETE ROOM] Fetching room info...');
      const room = await this.roomService.findById(id);
      console.log('[DELETE ROOM] Room found:', {
        roomId: room.id,
        roomName: room.name,
        moderatorId: room.moderatorId,
        isPublic: room.isPublic
      });

      const wasPublic = room.isPublic;

      console.log('[DELETE ROOM] Calling roomService.delete...');
      const result = await this.roomService.delete(id, userId);
      console.log('[DELETE ROOM] Delete result:', result);

      // Notify all clients about deleted public room
      if (wasPublic) {
        console.log('[DELETE ROOM] Emitting publicRoom:deleted event');
        this.gameGateway.server.emit('publicRoom:deleted', { roomId: id });
      }

      console.log('[DELETE ROOM] Success, returning result');
      return result;
    } catch (error) {
      console.error('[DELETE ROOM] Error:', error);
      console.error('[DELETE ROOM] Error message:', error.message);
      console.error('[DELETE ROOM] Error stack:', error.stack);
      throw error;
    }
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a room' })
  async join(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: JoinRoomDto,
  ) {
    return this.roomService.joinRoom(id, userId, dto.role);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave a room' })
  async leave(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.roomService.leaveRoom(id, userId);
  }

  @Get(':id/participants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get room participants' })
  async getParticipants(@Param('id') id: string) {
    return this.roomService.getParticipants(id);
  }
}
