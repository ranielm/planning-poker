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

@ApiTags('rooms')
@Controller('rooms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new poker room' })
  @ApiResponse({ status: 201, description: 'Room created successfully' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRoomDto,
  ) {
    return this.roomService.create(userId, dto);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get room by slug' })
  @ApiResponse({ status: 200, description: 'Room found' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.roomService.findBySlug(slug);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update room settings' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.roomService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.roomService.delete(id, userId);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a room' })
  async join(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: JoinRoomDto,
  ) {
    return this.roomService.joinRoom(id, userId, dto.role);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave a room' })
  async leave(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.roomService.leaveRoom(id, userId);
  }

  @Get(':id/participants')
  @ApiOperation({ summary: 'Get room participants' })
  async getParticipants(@Param('id') id: string) {
    return this.roomService.getParticipants(id);
  }
}
