import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import Stripe from 'stripe';

@Injectable()
export class UsersService {
  private stripe = new Stripe('sk_test_51Rpmc74OmjLR4F9r9O1pLeNghohaJ147VrG1p2hUmpBTjUgCNxO6VOYRJiXwNbzUrXuPgaHj0EagEbd05v4i7FJL00TLzbBaFb', {
    apiVersion: '2026-04-22.dahlia' as any,
  });

  constructor(private prisma: PrismaService) {}

  async loginComSteam(profile: any) {
    const steamId = profile.id;
    const nomeSteam = profile.displayName; 
    const fotoSteam = profile.photos && profile.photos.length > 0 ? profile.photos[profile.photos.length - 1].value : null;

    let user = await (this.prisma as any).user.findUnique({ where: { username: steamId } });

    if (!user) {
      user = await (this.prisma as any).user.create({
        data: { username: steamId, nome: nomeSteam, avatar: fotoSteam, saldo: 0.0 }
      });
    } else {
      user = await (this.prisma as any).user.update({
        where: { username: steamId },
        data: { nome: nomeSteam, avatar: fotoSteam }
      });
    }
    return user;
  }

  async getUtilizador(id: number) {
    return await (this.prisma as any).user.findUnique({ where: { id: id } });
  }

  async gastarSaldo(userId: string, valor: number) {
    const idNumero = Number(userId);
    const user = await (this.prisma as any).user.findUnique({ where: { id: idNumero } });
    if (!user) throw new Error('Utilizador não encontrado na Base de Dados');

    return await (this.prisma as any).user.update({
      where: { id: idNumero },
      data: { saldo: user.saldo - valor }
    });
  }

  async venderItem(userId: number, inventarioId: number) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: Number(userId) }, include: { inventario: true } 
    });
    if (!user) throw new Error("Jogador não encontrado.");

    const itemQueQuerVender = user.inventario.find((skin: any) => skin.id === Number(inventarioId));
    if (!itemQueQuerVender) throw new Error("Esta arma não te pertence!");

    await (this.prisma as any).inventario.delete({ where: { id: Number(inventarioId) } });

    const valorDaArma = itemQueQuerVender.valor || itemQueQuerVender.preco || 0;
    const valorDeVenda = parseFloat((valorDaArma * 0.90).toFixed(2)); 
    const novoSaldo = user.saldo + valorDeVenda;

    await (this.prisma as any).user.update({
      where: { id: Number(userId) }, data: { saldo: parseFloat(novoSaldo.toFixed(2)) }
    });

    return { sucesso: true, novoSaldo: parseFloat(novoSaldo.toFixed(2)), idVendido: inventarioId, valorRecebido: valorDeVenda };
  }

  async estadoBonusDiario(userId: number) {
    const user = await (this.prisma as any).user.findUnique({ where: { id: Number(userId) } });
    if (!user) throw new BadRequestException("Jogador não encontrado.");

    const DEPOSITO_MINIMO = 5.00;
    const faltaDepositar = Math.max(0, DEPOSITO_MINIMO - (user.totalDepositado || 0));

    let pronto = false;
    let horasRestantes = 0;

    if (faltaDepositar === 0) {
      if (!user.ultimoBonus) {
        pronto = true;
      } else {
        const agora = new Date().getTime();
        const ultimo = new Date(user.ultimoBonus).getTime();
        const horasPassadas = (agora - ultimo) / (1000 * 60 * 60);

        if (horasPassadas >= 24) pronto = true;
        else horasRestantes = 24 - horasPassadas;
      }
    }

    return { faltaDepositar: parseFloat(faltaDepositar.toFixed(2)), pronto, horasRestantes: parseFloat(horasRestantes.toFixed(1)) };
  }

  async resgatarBonusDiario(userId: number) {
    const estado = await this.estadoBonusDiario(userId);
    if (estado.faltaDepositar > 0) throw new BadRequestException(`Precisas de depositar mais ${estado.faltaDepositar}€!`);
    if (!estado.pronto) throw new BadRequestException(`Calma! Faltam ${estado.horasRestantes} horas.`);

    const premio = parseFloat((Math.random() * (2.00 - 0.10) + 0.10).toFixed(2));
    const user = await (this.prisma as any).user.findUnique({ where: { id: Number(userId) } });
    const novoSaldo = user.saldo + premio;

    await (this.prisma as any).user.update({
      where: { id: Number(userId) },
      data: { saldo: parseFloat(novoSaldo.toFixed(2)), ultimoBonus: new Date() }
    });

    return { sucesso: true, premio, novoSaldo: parseFloat(novoSaldo.toFixed(2)) };
  }

  async iniciarDeposito(dados: { userId: number, metodo: string, valor: number, telemovel?: string }) {
    if (dados.valor < 5) throw new BadRequestException("O depósito mínimo é de 5.00€");

    const transacao = await (this.prisma as any).transacao.create({
      data: { userId: Number(dados.userId), metodo: dados.metodo, valor: parseFloat(Number(dados.valor).toFixed(2)) }
    });
    
    if (dados.metodo === 'mbway') {
      if (!dados.telemovel) throw new BadRequestException("Número de telemóvel obrigatório.");
      return { sucesso: true, metodo: 'mbway', msg: `Pedido enviado para o telemóvel ${dados.telemovel}.`, txId: transacao.id };
    }

    if (dados.metodo === 'cartao') {
      try {
        const session = await this.stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{ price_data: { currency: 'eur', product_data: { name: 'Adicionar Saldo - IMPÉRIO' }, unit_amount: Math.round(dados.valor * 100) }, quantity: 1 }],
          mode: 'payment',
          success_url: `http://localhost:3001/?deposito=sucesso&tx=${transacao.id}`,
          cancel_url: `http://localhost:3001/?deposito=cancelado`,
          client_reference_id: transacao.id.toString(),
        });
        return { sucesso: true, metodo: 'cartao', url: session.url, msg: "Redirecionando...", txId: transacao.id };
      } catch (error) { throw new BadRequestException("Erro ao contactar a Gateway."); }
    }

    if (dados.metodo === 'crypto') {
      const valorBTC = (dados.valor / 60000).toFixed(6);
      return { sucesso: true, metodo: 'crypto', carteira: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", moeda: "BTC", valorCripto: valorBTC, msg: "Envia Cripto para a carteira.", txId: transacao.id };
    }

    throw new BadRequestException("Método desconhecido.");
  }

  async confirmarDeposito(txId: number) {
    const tx = await (this.prisma as any).transacao.findUnique({ where: { id: Number(txId) } });
    if (!tx) throw new BadRequestException("Transação não encontrada.");
    if (tx.status === "Concluido") return { sucesso: false, msg: "Depósito já processado." };

    await (this.prisma as any).transacao.update({ where: { id: Number(txId) }, data: { status: "Concluido" } });

    const user = await (this.prisma as any).user.findUnique({ where: { id: tx.userId } });
    const novoSaldo = user.saldo + tx.valor;
    const novoTotal = (user.totalDepositado || 0) + tx.valor;

    await (this.prisma as any).user.update({
      where: { id: tx.userId },
      data: { saldo: parseFloat(novoSaldo.toFixed(2)), totalDepositado: parseFloat(novoTotal.toFixed(2)) }
    });

    return { sucesso: true, valorDepositado: tx.valor, novoSaldo: parseFloat(novoSaldo.toFixed(2)) };
  }

  async verInventario(userId: number) {
    return await (this.prisma as any).inventario.findMany({
      where: { userId: userId }, // 🔥 Agora só puxa as skins deste jogador!
      orderBy: { dataGanho: 'desc' }
    });
  }
}