import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoomModule } from './modules/room/room.module';
import { GameModule } from './modules/game/game.module';
import { JiraModule } from './modules/jira/jira.module';
import { HealthModule } from './modules/health/health.module';
import { GameGateway } from './gateway/game.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    RoomModule,
    GameModule,
    JiraModule,
    HealthModule,
  ],
  providers: [GameGateway],
})
export class AppModule {}
