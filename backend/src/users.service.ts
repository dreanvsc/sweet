import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import Stripe from 'stripe';

@Injectable()
export class UsersService {
  // A tua chave de testes do Stripe
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

  // ==========================================
  // 🔥 SISTEMA DE PROGRESSÃO (ESTILO KEY-DROP)
  // ==========================================

  // 1. Calcula o XP necessário para passar de nível (ex: Nível 1 = 100xp, Nível 2 = 200xp...)
  getXpNecessarioParaNivel(level: number): number {
    return level * 100; 
  }

  // 2. Injeta XP e sobe o nível de forma persistente
  async adicionarXp(userId: number, valorGasto: number) {
    const user = await (this.prisma as any).user.findUnique({ where: { id: userId } });
    if (!user) return;

    // 1€ = 10 XP. Math.floor garante que é um número Inteiro sem vírgulas!
    const xpGanho = Math.floor(valorGasto * 10); 
    
    let novoXp = user.xp + xpGanho;
    let novoNivel = user.level;

    let xpNecessario = this.getXpNecessarioParaNivel(novoNivel);
    
    // Loop para subir de nível caso ganhe muito XP de uma vez
    while (novoXp >= xpNecessario) {
      novoXp -= xpNecessario;
      novoNivel += 1;
      xpNecessario = this.getXpNecessarioParaNivel(novoNivel);
    }

    return await (this.prisma as any).user.update({
      where: { id: userId },
      data: {
        level: novoNivel,
        xp: novoXp
      }
    });
  }

  // ==========================================
  // DEPARTAMENTO FINANCEIRO
  // ==========================================

  async gastarSaldo(userId: string, valor: number) {
    const idNumero = Number(userId);
    const user = await (this.prisma as any).user.findUnique({ where: { id: idNumero } });
    if (!user) throw new Error('Utilizador não encontrado na Base de Dados');

    // 1. Tira o saldo
    const userAtualizado = await (this.prisma as any).user.update({
      where: { id: idNumero },
      data: { saldo: user.saldo - valor }
    });

    // 2. 🔥 Dá XP pela aposta/abertura!
    await this.adicionarXp(idNumero, valor);

    return userAtualizado;
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

  // ==========================================
  // DEPARTAMENTO DE DEPÓSITOS
  // ==========================================

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

  // ==========================================
  // DEPARTAMENTO DE INVENTÁRIO
  // ==========================================

  async verInventario(userId: number) {
    return await (this.prisma as any).inventario.findMany({
      where: { userId: userId },
      orderBy: { dataGanho: 'desc' }
    });
  }

  async solicitarLevantamento(userId: number, inventarioId: number) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: Number(userId) }, include: { inventario: true } 
    });
    if (!user) throw new Error("Jogador não encontrado.");

    if (!user.tradeUrl || user.tradeUrl.length < 15) {
      throw new Error("Tens de configurar o teu Trade URL da Steam nas Definições primeiro!");
    }

    const skin = user.inventario.find((s: any) => s.id === Number(inventarioId));
    if (!skin) throw new Error("Esta arma não te pertence!");

    // 💡 NOTA: DEIXÁMOS DE APAGAR A SKIN DA BASE DE DADOS AQUI!
    // O Frontend vai ler a tabela "Levantamento" para saber se esta skin está trancada.

    // Criar a encomenda para o Admin enviar
    await (this.prisma as any).levantamento.create({
      data: {
        userId: Number(userId),
        skinNome: skin.nome,
        skinImagem: skin.imagem,
        valor: skin.valor,
        tradeUrl: user.tradeUrl,
        status: "PENDENTE"
      }
    });

    await (this.prisma as any).historicoJogo.create({
      data: { userId: Number(userId), acao: "Levantamento", detalhe: `Solicitou envio de ${skin.nome}`, valor: skin.valor, tipo: "LEVANTAMENTO" }
    });

    return { sucesso: true, mensagem: "Pedido efetuado! Fica atento à tua Steam, vamos enviar a troca em breve." };
  }
}