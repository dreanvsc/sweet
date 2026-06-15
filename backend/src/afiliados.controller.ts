import { Controller, Get, Post, Body, Param, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('afiliados')
export class AfiliadosController {
  constructor(private prisma: PrismaService) {}

  @Get('stats/:userId')
  async getStats(@Param('userId') userId: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: Number(userId) },
      include: { codigosParceiro: true }
    });

    if (!user) throw new BadRequestException('Utilizador não encontrado.');

    // Verifica se ele tem um código próprio
    const codigo = user.codigosParceiro?.[0];

    if (!codigo) {
      throw new BadRequestException('Ainda não tens nenhum código atribuído.');
    }

    // Retorna os dados exatos que o nosso frontend pediu
    return {
      codigo: codigo.codigo,
      usos: codigo.usos,
      volumeGerado: codigo.volumeGerado || 0,
      ganhosAcumulados: codigo.ganhosAcumulados,
      comissao: codigo.comissao,
      saldoDisponivel: codigo.ganhosAcumulados // Por agora mostramos o total acumulado
    };
  }

  @Post('transferir')
  async transferirSaldo(@Body() body: { userId: number }) {
    // 💡 Nota de Tubarão: No nosso Webhook do Stripe, nós já injetámos o dinheiro 
    // DIRETAMENTE no saldo principal do Streamer por cada venda para ser 100% automático.
    // Portanto, este botão serve apenas como um "Efeito Psicológico" de sucesso para o Streamer.
    return { sucesso: true, message: "Saldo já se encontra disponível na tua conta principal!" };
  }
}