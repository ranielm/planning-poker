import { Module, forwardRef } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { AuthModule } from '../modules/auth/auth.module';
import { GameModule } from '../modules/game/game.module';
import { RoomModule } from '../modules/room/room.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => GameModule),
    forwardRef(() => RoomModule),
  ],
  providers: [GameGateway],
  exports: [GameGateway],
})
export class GatewayModule {}
