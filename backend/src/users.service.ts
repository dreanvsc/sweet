import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import Stripe from 'stripe';
import axios from 'axios';

@Injectable()
export class UsersService {
  // A tua chave de testes do Stripe
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
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

  getXpNecessarioParaNivel(level: number): number {
    return level * 100; 
  }

  async adicionarXp(userId: number, valorGasto: number) {
    const user = await (this.prisma as any).user.findUnique({ where: { id: userId } });
    if (!user) return;

    const xpGanho = Math.floor(valorGasto * 10); 
    
    let novoXp = user.xp + xpGanho;
    let novoNivel = user.level;

    let xpNecessario = this.getXpNecessarioParaNivel(novoNivel);
    
    while (novoXp >= xpNecessario) {
      novoXp -= xpNecessario;
      novoNivel += 1;
      xpNecessario = this.getXpNecessarioParaNivel(novoNivel);
    }

    return await (this.prisma as any).user.update({
      where: { id: userId },
      data: { level: novoNivel, xp: novoXp }
    });
  }

  // ==========================================
  // DEPARTAMENTO FINANCEIRO
  // ==========================================

  async gastarSaldo(userId: string, valor: number) {
    const idNumero = Number(userId);
    const user = await (this.prisma as any).user.findUnique({ where: { id: idNumero } });
    if (!user) throw new BadRequestException('Utilizador não encontrado na Base de Dados');

    const userAtualizado = await (this.prisma as any).user.update({
      where: { id: idNumero },
      data: { saldo: user.saldo - valor }
    });

    await this.adicionarXp(idNumero, valor);

    return userAtualizado;
  }

  async venderItem(userId: number, inventarioId: number) {
    try {
      const idUser = Number(userId);
      const idItem = Number(inventarioId);

      const user = await (this.prisma as any).user.findUnique({
        where: { id: idUser }, include: { inventario: true } 
      });
      if (!user) throw new BadRequestException("Jogador não encontrado.");

      const skin = user.inventario.find((s: any) => s.id === idItem);
      if (!skin) throw new BadRequestException("ERRO: Esta arma já não te pertence.");

      const valorDaArma = skin.valor || skin.preco || 0;
      const valorDeVenda = parseFloat((valorDaArma * 0.90).toFixed(2)); 

      // 🔥 A NOVA ESTRATÉGIA: O "Apagar Atómico"
      // Tentamos apagar a skin primeiro. Se o jogador der duplo clique, 
      // a segunda tentativa vai falhar automaticamente aqui e proteger o teu dinheiro!
      await (this.prisma as any).inventario.delete({ 
        where: { id: idItem } 
      });

      // Se a skin foi apagada com sucesso (ninguém a roubou entretanto), damos o dinheiro.
      const novoSaldo = user.saldo + valorDeVenda;

      await (this.prisma as any).user.update({
        where: { id: idUser }, data: { saldo: parseFloat(novoSaldo.toFixed(2)) }
      });

      // Registar a venda no histórico
      await (this.prisma as any).historicoJogo.create({
        data: {
          userId: idUser,
          acao: "Venda de Skin",
          detalhe: `Vendeu ${skin.nome}`,
          valor: valorDeVenda,
          tipo: "GANHO"
        }
      });

      return { sucesso: true, novoSaldo: parseFloat(novoSaldo.toFixed(2)), idVendido: idItem, valorRecebido: valorDeVenda };

    } catch (error: any) {
      // 🔥 A TUA CÂMARA DE VIGILÂNCIA: Se a venda falhar agora, o Render vai cuspir o motivo exato!
      console.error("🔥 ERRO FATAL AO VENDER SKIN:", error);
      throw new BadRequestException("A venda falhou no servidor. Atualiza a página e tenta novamente.");
    }
  }

  // ==========================================
  // DEPARTAMENTO DE DEPÓSITOS
  // ==========================================

  async iniciarDeposito(dados: { userId: number, metodo: string, valor: number, telemovel?: string }) {
    if (dados.valor < 5) throw new BadRequestException("O depósito mínimo é de 5.00€");

    const transacao = await (this.prisma as any).transacao.create({
      data: { userId: Number(dados.userId), metodo: dados.metodo, valor: parseFloat(Number(dados.valor).toFixed(2)) }
    });
    
    // 🔥 1. O NOVO MOTOR MB WAY REAL LIGADO AO STRIPE
    if (dados.metodo === 'mbway') {
      if (!dados.telemovel) throw new BadRequestException("Número de telemóvel obrigatório.");
      
      try {
        // O Stripe trabalha em cêntimos (ex: 10€ = 1000)
        const amountEmCentimos = Math.round(dados.valor * 100);

        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: amountEmCentimos,
          currency: 'eur',
          payment_method_types: ['mb_way'],
          payment_method_data: {
            type: 'mb_way',
            billing_details: {
              // A SIBS e o Stripe exigem o indicativo de Portugal (+351) anexado
              phone: `+351${dados.telemovel.trim()}`,
            },
          },
          confirm: true, // Confirma imediatamente para disparar o pop-up no tlm!
          description: `Depósito SweetDrop - Jogador #${dados.userId}`,
          metadata: { 
            userId: String(dados.userId), 
            txId: String(transacao.id) 
          },
          // O Stripe exige uma return_url obrigatória por segurança
          return_url: `https://sweetdrop.pt/?deposito=pendente&tx=${transacao.id}`,
        });

        return { 
          sucesso: true, 
          metodo: 'mbway', 
          msg: `Pedido enviado para o telemóvel ${dados.telemovel}. Aceita na aplicação!`, 
          txId: transacao.id,
          intentId: paymentIntent.id
        };
      } catch (error: any) {
        console.error("🔥 Erro fatal no Stripe MB WAY:", error?.message || error);
        throw new BadRequestException(error?.message || "Erro ao conectar com a Gateway MB WAY.");
      }
    }

    // 💳 2. CARTÃO (MANTIDO IGUAL AO TEU)
    if (dados.metodo === 'cartao') {
      try {
        const session = await this.stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{ price_data: { currency: 'eur', product_data: { name: 'Adicionar Saldo - SweetDrop' }, unit_amount: Math.round(dados.valor * 100) }, quantity: 1 }],
          mode: 'payment',
          success_url: `https://sweetdrop.pt/?deposito=sucesso&tx=${transacao.id}`,
          cancel_url: `https://sweetdrop.pt/?deposito=cancelado`,
          client_reference_id: transacao.id.toString(),
        });
        return { sucesso: true, metodo: 'cartao', url: session.url, msg: "Redirecionando...", txId: transacao.id };
      } catch (error) { throw new BadRequestException("Erro ao contactar a Gateway."); }
    }

    // ₿ 3. CRYPTO (MANTIDO IGUAL AO TEU)
    if (dados.metodo === 'crypto') {
      try {
        const apiKey = (process.env.NOWPAYMENTS_API_KEY || '').trim();
        
        const response = await axios.post('https://api.nowpayments.io/v1/invoice', {
          price_amount: dados.valor,
          price_currency: 'eur',
          order_id: transacao.id.toString(),
          order_description: 'Deposito Sweet Drop',
          success_url: 'https://sweetdrop.vercel.app/sucesso',
          cancel_url: 'https://sweetdrop.vercel.app/erro'
        }, {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
          }
        });

        if (response.data && response.data.invoice_url) {
          return { 
            sucesso: true, 
            metodo: 'crypto', 
            url: response.data.invoice_url, 
            msg: "Redirecionando para a Gateway de Cripto...", 
            txId: transacao.id 
          };
        } else {
          console.error("Erro estrutural NOWPayments:", response.data);
          throw new BadRequestException("Erro na Gateway de Criptomoedas.");
        }
      } catch (error: any) {
        console.error("Erro NOWPayments Completo:", error?.response?.data || error);
        throw new BadRequestException("Falha ao gerar o link de criptomoedas.");
      }
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
  // DEPARTAMENTO DE INVENTÁRIO & LEVANTAMENTOS
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
    
    if (!user) throw new BadRequestException("Jogador não encontrado.");

    if (!user.tradeUrl || user.tradeUrl.length < 15) {
      throw new BadRequestException("Tens de configurar o teu Trade URL da Steam nas Definições primeiro!");
    }

    if (!user.contaVerificada) {
      throw new BadRequestException("CONTA NÃO VERIFICADA: Pede a verificação da tua conta nas Configurações para poderes levantar skins.");
    }

    const skin = user.inventario.find((s: any) => s.id === Number(inventarioId));
    if (!skin) throw new BadRequestException("Esta arma não te pertence ou já foi processada!");

    const valorDaSkin = skin.valor || skin.preco || 0;
    if (valorDaSkin < 2.00) {
      throw new BadRequestException("O SweetDrop não envia armas abaixo de 2.00€. Vende a skin por saldo ou faz Upgrade!");
    }

    try {
      await (this.prisma as any).inventario.delete({
        where: { id: Number(inventarioId) }
      });

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

    } catch (error) {
      throw new BadRequestException("Erro ao processar o levantamento. A skin pode já ter sido movida.");
    }
  }

  async adicionarSaldo(userId: number, valor: number) {
  const user = await (this.prisma as any).user.findUnique({ where: { id: userId } });
  if (!user) throw new BadRequestException('Utilizador não encontrado.');

  const novoSaldo = parseFloat((user.saldo + valor).toFixed(2));
  const novoTotal = parseFloat(((user.totalDepositado || 0) + valor).toFixed(2));

  await (this.prisma as any).user.update({
    where: { id: userId },
    data: { saldo: novoSaldo, totalDepositado: novoTotal }
  });

  await (this.prisma as any).historicoJogo.create({
    data: {
      userId,
      acao: 'Depósito de Skins',
      detalhe: `Depositou skins no valor de ${valor.toFixed(2)}€`,
      valor,
      tipo: 'GANHO'
    }
  });

  return { sucesso: true, novoSaldo };
}
}