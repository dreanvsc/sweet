import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
// 🔥 Importa os teus guardiões do sistema
import { UsersService } from './users.service';
import { CaixasService } from './caixas.service';
import { UpgraderService } from './upgrader.service';
import { AdminService } from './admin.service';
import { FeedGateway } from './feed.gateway';
import { SteamStrategy, SessionSerializer } from './steam.strategy';
import { BattlesGateway } from './battles.gateway';
import { CoinflipGateway } from './coinflip.gateway';
import { ChatGateway } from './chat.gateway';
import { ScheduleModule } from '@nestjs/schedule';

// 🔥 OS NOVOS FICHEIROS DOS GIVEAWAYS:
import { GiveawaysController } from './giveaways.controller';
import { GiveawaysService } from './giveaways.service';

// 💰 O NOVO WEBHOOK DO STRIPE (MÁQUINA DE AFILIADOS):
import { StripeWebhookController } from './stripe.controller';

@Module({
  imports: [
    // 🔥 MÓDULOS: O Relógio do Servidor
    ScheduleModule.forRoot(),
  ],
  controllers: [
    AppController,
    GiveawaysController,
    // 🔥 O WEBHOOK FICA AQUI A ESCUTAR O BANCO:
    StripeWebhookController 
  ],
  providers: [
    // 🔥 SERVIÇOS E GATEWAYS
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
    ChatGateway,
    GiveawaysService
  ],
})
export class AppModule {}