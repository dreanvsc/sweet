import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { GiveawaysService } from './giveaways.service';

@Controller('giveaways')
export class GiveawaysController {
  constructor(private readonly giveawaysService: GiveawaysService) {}

  @Get('ativos')
  async listarAtivos() {
    return await this.giveawaysService.listarAtivos();
  }

  @Post('entrar')
  async entrar(@Body() body: { userId: number; giveawayId: number }) {
    return await this.giveawaysService.entrarGiveaway(Number(body.userId), Number(body.giveawayId));
  }

  @Post('admin/criar')
  async criarGiveaway(@Body() body: any) {
    return await this.giveawaysService.criarGiveaway(body);
  }

  @Post('admin/finalizar/:id')
  async finalizarGiveaway(@Param('id') id: string) {
    return await this.giveawaysService.finalizarGiveaway(Number(id));
  }

  @Get(':id/participantes')
  async getParticipantes(@Param('id') id: string) {
    const giveawayId = parseInt(id);
    return await this.giveawaysService.getParticipantes(giveawayId);
  }
}