import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
// 🔥 Importa os teus novos guardiões do sistema
import { UsersService } from './users.service';
import { CaixasService } from './caixas.service';
import { UpgraderService } from './upgrader.service';
import { AdminService } from './admin.service';
import { FeedGateway } from './feed.gateway';
import { SteamStrategy, SessionSerializer } from './steam.strategy';
import { BattlesGateway } from './battles.gateway';
import { CoinflipGateway } from './coinflip.gateway';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    PrismaService, 
    UsersService, 
    CaixasService, 
    UpgraderService, 
    AdminService,
    FeedGateway,
    SteamStrategy,
    SessionSerializer,
    BattlesGateway,
    CoinflipGateway,
    ChatGateway
  ],
})
export class AppModule {}