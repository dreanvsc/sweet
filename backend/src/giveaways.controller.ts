import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { GiveawaysService } from './giveaways.service';

@Controller('giveaways')
export class GiveawaysController {
  constructor(private readonly giveawaysService: GiveawaysService) {}

  // Rota para ver os giveaways a decorrer (qualquer pessoa pode ver)
  @Get('ativos')
  async listarAtivos() {
    return await this.giveawaysService.listarAtivos();
  }

  // Rota para o jogador entrar
  @Post('entrar')
  async entrar(@Body() body: { userId: number; giveawayId: number }) {
    return await this.giveawaysService.entrarGiveaway(Number(body.userId), Number(body.giveawayId));
  }

  // Rota para o Admin criar um giveaway novo
  @Post('admin/criar')
  async criarGiveaway(@Body() body: any) {
    // Nota: Aqui podes depois adicionar uma verificação se quem pede é ADMIN
    return await this.giveawaysService.criarGiveaway(body);
  }

  // Rota para forçar o fim do giveaway (Para testarmos o sorteio manual)
  @Post('admin/finalizar/:id')
  async finalizarGiveaway(@Param('id') id: string) {
    return await this.giveawaysService.finalizarGiveaway(Number(id));
  }
}