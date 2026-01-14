import { IsString, IsOptional, IsEnum, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeckType, ParticipantRole } from '@prisma/client';

export class CreateRoomDto {
  @ApiProperty({ example: 'Sprint 34 Planning' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'sprint-34' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  @MinLength(3)
  @MaxLength(50)
  slug?: string;

  @ApiPropertyOptional({ enum: DeckType, default: DeckType.FIBONACCI })
  @IsOptional()
  @IsEnum(DeckType)
  deckType?: DeckType;
}

export class UpdateRoomDto {
  @ApiPropertyOptional({ example: 'Sprint 35 Planning' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ enum: DeckType })
  @IsOptional()
  @IsEnum(DeckType)
  deckType?: DeckType;

  @ApiPropertyOptional()
  @IsOptional()
  activeTopic?: any;
}

export class JoinRoomDto {
  @ApiPropertyOptional({ enum: ParticipantRole, default: ParticipantRole.VOTER })
  @IsOptional()
  @IsEnum(ParticipantRole)
  role?: ParticipantRole;
}
