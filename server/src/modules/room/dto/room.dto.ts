import { IsString, IsOptional, IsIn, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const DECK_TYPES = ['FIBONACCI', 'TSHIRT'] as const;
const PARTICIPANT_ROLES = ['MODERATOR', 'VOTER', 'OBSERVER'] as const;

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

  @ApiPropertyOptional({ enum: DECK_TYPES, default: 'FIBONACCI' })
  @IsOptional()
  @IsIn(DECK_TYPES)
  deckType?: string;
}

export class UpdateRoomDto {
  @ApiPropertyOptional({ example: 'Sprint 35 Planning' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ enum: DECK_TYPES })
  @IsOptional()
  @IsIn(DECK_TYPES)
  deckType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  activeTopic?: any;
}

export class JoinRoomDto {
  @ApiPropertyOptional({ enum: PARTICIPANT_ROLES, default: 'VOTER' })
  @IsOptional()
  @IsIn(PARTICIPANT_ROLES)
  role?: string;
}
