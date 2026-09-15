import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { SteamBotService } from './steam-bot.service';
import { verificarToken } from './steam.strategy';

@Controller('deposito-skins')
export class DepositController {
  constructor(private steamBotService: SteamBotService) {}

  /**
   * GET /api/deposito-skins/info
   * Devolve o SteamID do bot para o frontend construir
   * o link de "adicionar como amigo" / iniciar trade.
   */
  @Get('info')
  getInfo(@Req() req: any) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.replace('Bearer ', '');
    const dados = token ? verificarToken(token) : null;

    if (!dados) {
      throw new UnauthorizedException('Sessão inválida.');
    }

    const botSteamId = this.steamBotService.getBotSteamId();

    if (!botSteamId) {
      return {
        online: false,
        msg: 'O bot de depósitos está offline neste momento. Tenta novamente daqui a pouco.',
      };
    }

    return {
      online: true,
      botSteamId,
      profileUrl: `https://steamcommunity.com/profiles/${botSteamId}`,
      instrucoes:
        'Adiciona o bot como amigo na Steam e envia-lhe uma troca com as skins que queres depositar. O saldo é creditado automaticamente assim que a troca for confirmada.',
    };
  }
}
