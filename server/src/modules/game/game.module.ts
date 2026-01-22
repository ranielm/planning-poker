import { Module, forwardRef } from '@nestjs/common';
import { GameService } from './game.service';
import { VotingService } from './voting.service';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [forwardRef(() => RoomModule)],
  providers: [GameService, VotingService],
  exports: [GameService, VotingService],
})
export class GameModule {}
