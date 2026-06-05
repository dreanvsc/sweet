import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class GiveawaysService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // ADMIN: CRIAR GIVEAWAY
  // ==========================================
  async criarGiveaway(dados: { premioNome: string; premioImagem: string; valor: number; depositoMinimo: number; diasDeposito: number; terminaEm: Date }) {
    // A MAGIA PROVABLY FAIR COMEÇA AQUI: Geramos um segredo absoluto no início
    const serverSeed = crypto.randomBytes(32).toString('hex');

    return await this.prisma.giveaway.create({
      data: {
        premioNome: dados.premioNome,
        premioImagem: dados.premioImagem,
        valor: dados.valor,
        depositoMinimo: dados.depositoMinimo,
        diasDeposito: dados.diasDeposito,
        terminaEm: new Date(dados.terminaEm),
        serverSeed: serverSeed,
      },
    });
  }

  // ==========================================
  // JOGADOR: ENTRAR NO GIVEAWAY
  // ==========================================
  async entrarGiveaway(userId: number, giveawayId: number) {
    const giveaway = await this.prisma.giveaway.findUnique({ where: { id: giveawayId } });
    if (!giveaway) throw new BadRequestException('Giveaway não encontrado.');
    if (giveaway.status !== 'ATIVO') throw new BadRequestException('Este giveaway já terminou.');

    // 1. Verificar se já está a participar
    const jaParticipa = await this.prisma.participanteGiveaway.findUnique({
      where: { giveawayId_userId: { giveawayId, userId } },
    });
    if (jaParticipa) throw new BadRequestException('Já estás inscrito neste giveaway!');

    // 2. Verificar regras de Depósito (O Escudo Anti-Bots)
    if (giveaway.depositoMinimo > 0) {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - giveaway.diasDeposito);

      // Procura todos os depósitos deste utilizador nos últimos X dias
      const depositos = await this.prisma.historicoJogo.aggregate({
        where: {
          userId: userId,
          acao: 'Depósito',
          createdAt: { gte: dataLimite },
        },
        _sum: { valor: true },
      });

      const totalDepositado = depositos._sum.valor || 0;
      if (totalDepositado < giveaway.depositoMinimo) {
        throw new BadRequestException(`Precisas de depositar pelo menos ${giveaway.depositoMinimo}€ nos últimos ${giveaway.diasDeposito} dias para participar. O teu total: ${totalDepositado}€.`);
      }
    }

    // 3. Tudo OK, adicionar o jogador!
    await this.prisma.participanteGiveaway.create({
      data: { giveawayId, userId },
    });

    return { sucesso: true, mensagem: 'Inscrição confirmada com sucesso!' };
  }

  // ==========================================
  // SISTEMA: LISTAR ATIVOS E FINALIZAR
  // ==========================================
  async listarAtivos() {
    return await this.prisma.giveaway.findMany({
      where: { status: 'ATIVO' },
      include: { _count: { select: { participantes: true } } },
      orderBy: { terminaEm: 'asc' },
    });
  }

  async finalizarGiveaway(giveawayId: number) {
    const giveaway = await this.prisma.giveaway.findUnique({
      where: { id: giveawayId },
      include: { participantes: true },
    });

    if (!giveaway || giveaway.status === 'TERMINADO') throw new BadRequestException('Inválido ou já terminado.');
    
    const totalParticipantes = giveaway.participantes.length;
    if (totalParticipantes === 0) {
      // Se ninguém entrou, cancelamos sem vencedor
      return await this.prisma.giveaway.update({
        where: { id: giveawayId },
        data: { status: 'TERMINADO' },
      });
    }

    // A MISTURA PROVABLY FAIR:
    const publicSeed = crypto.randomBytes(16).toString('hex'); // Criamos a chave pública final
    
    // Misturamos a Server Seed com a Public Seed
    const hashSorteio = crypto.createHmac('sha256', giveaway.serverSeed || 'segredo-de-emergencia').update(publicSeed).digest('hex');
    
    // Convertemos parte dessa hash num número gigante e fazemos o módulo para encontrar o índice vencedor
    const numeroSorteio = parseInt(hashSorteio.substring(0, 8), 16);
    const indiceVencedor = numeroSorteio % totalParticipantes;
    const vencedor = giveaway.participantes[indiceVencedor];

    // Atualiza o Giveaway e adiciona a arma ao inventário do vencedor!
    await this.prisma.$transaction(async (prisma) => {
      await prisma.giveaway.update({
        where: { id: giveawayId },
        data: { status: 'TERMINADO', vencedorId: vencedor.userId, publicSeed: publicSeed },
      });

      await prisma.inventario.create({
        data: {
          userId: vencedor.userId,
          nome: giveaway.premioNome,
          imagem: giveaway.premioImagem,
          raridade: 'Giveaway',
          valor: giveaway.valor,
        },
      });
    });

    return { sucesso: true, vencedorId: vencedor.userId, hashUsada: hashSorteio };
  }
  
  async getParticipantes(giveawayId: number) {
  return this.prisma.participanteGiveaway.findMany({
    where: { giveawayId },
    include: {
      user: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
}