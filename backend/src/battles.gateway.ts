import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from './prisma.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class BattlesGateway {
  @WebSocketServer()
  server: Server;

  private batalhasAtivas = new Map<string, any>();
  constructor(private prisma: PrismaService) {}

  private sortearItens(skinsArray: any[], quantidade: number) {
    let pesoTotal = 0;
    const skinsComPeso = skinsArray.map(s => {
      const peso = parseFloat(s.probabilidade) || 1;
      pesoTotal += peso;
      return { ...s, peso };
    });

    const ganhos: any[] = [];
    let valorTotal = 0;
    for (let i = 0; i < quantidade; i++) {
      const num = Math.random() * pesoTotal;
      let sum = 0;
      let escolhida = skinsComPeso[0];
      for (const s of skinsComPeso) {
        sum += s.peso;
        if (num <= sum) { escolhida = s; break; }
      }
      ganhos.push(escolhida);
      valorTotal += parseFloat(escolhida.preco || escolhida.valor || 0);
    }
    return { ganhos, valorTotal };
  }

  @SubscribeMessage('criar_batalha')
  async handleCriarBatalha(@MessageBody() dados: any, @ConnectedSocket() client: Socket) {
    const precoTotal = dados.caixas.reduce((acc: number, c: any) => acc + parseFloat(c.preco), 0);

    const user = await (this.prisma as any).user.findUnique({ where: { id: Number(dados.userId) } });
    if (!user || user.saldo < precoTotal) return { erro: 'Saldo insuficiente' };
    
    await (this.prisma as any).user.update({ where: { id: Number(dados.userId) }, data: { saldo: user.saldo - precoTotal } });

    const batalhaId = `bat_${Date.now()}`;
    const novaBatalha = {
      id: batalhaId, 
      caixas: dados.caixas, 
      precoTotal, 
      maxJogadores: dados.maxJogadores || 2,
      estado: 'espera',
      jogadores: [{ id: dados.userId, nome: dados.userNome, foto: dados.userFoto, socketId: client.id }],
      resultado: null
    };

    this.batalhasAtivas.set(batalhaId, novaBatalha);
    this.server.emit('batalhas_atualizadas', Array.from(this.batalhasAtivas.values()));
    return { sucesso: true, batalhaId };
  }

  @SubscribeMessage('entrar_batalha')
  async handleEntrarBatalha(@MessageBody() dados: any, @ConnectedSocket() client: Socket) {
    const batalha = this.batalhasAtivas.get(dados.batalhaId);
    if (!batalha || batalha.estado !== 'espera') return { erro: 'Batalha indisponível' };
    if (batalha.jogadores.find((j: any) => j.id === dados.userId)) return { erro: 'Já estás na batalha' };

    const user = await (this.prisma as any).user.findUnique({ where: { id: Number(dados.userId) } });
    if (!user || user.saldo < batalha.precoTotal) return { erro: 'Saldo insuficiente' };
    
    await (this.prisma as any).user.update({ where: { id: Number(dados.userId) }, data: { saldo: user.saldo - batalha.precoTotal } });

    batalha.jogadores.push({ id: dados.userId, nome: dados.userNome, foto: dados.userFoto, socketId: client.id });

    if (batalha.jogadores.length === batalha.maxJogadores) {
      await this.processarSorteio(batalha);
    } else {
      this.batalhasAtivas.set(dados.batalhaId, batalha);
      this.server.emit('batalhas_atualizadas', Array.from(this.batalhasAtivas.values()));
    }

    return { sucesso: true };
  }

  @SubscribeMessage('chamar_bot')
  async handleChamarBot(@MessageBody() dados: { batalhaId: string }) {
    const batalha = this.batalhasAtivas.get(dados.batalhaId);
    if (!batalha || batalha.estado !== 'espera') return { erro: 'Batalha indisponível' };

    const nomesBots = ['Bot Gaben', 'Bot KennyS', 'Bot Fallen', 'Bot Zywoo', 'Bot S1mple', 'Bot Olof', 'Bot GeT_RiGhT'];
    const botAleatorio = nomesBots[Math.floor(Math.random() * nomesBots.length)];

    const botFalso = {
      id: -Math.floor(Math.random() * 10000) - 1,
      nome: botAleatorio,
      foto: `https://api.dicebear.com/7.x/bottts/svg?seed=${botAleatorio}`,
      socketId: `bot_${Date.now()}`
    };

    batalha.jogadores.push(botFalso);

    if (batalha.jogadores.length === batalha.maxJogadores) {
      await this.processarSorteio(batalha);
    } else {
      this.batalhasAtivas.set(dados.batalhaId, batalha);
      this.server.emit('batalhas_atualizadas', Array.from(this.batalhasAtivas.values()));
    }

    return { sucesso: true };
  }

  // =========================================================
  // 🔥 MOTOR DE SORTEIO COM DESEMPATE AUTOMÁTICO (RNG COINFLIP)
  // =========================================================
  private async processarSorteio(batalha: any) {
    batalha.estado = 'jogando';
    batalha.resultado = { ganhosPorJogador: {}, vencedorId: null, empateIds: [], teveDesempate: false };

    let maiorValor = -1;
    let vencedores: any[] = [];
    let todasAsSkinsDoPote: any[] = [];
    
    // 1. SORTEAR AS ARMAS PARA CADA JOGADOR
    for (const jogador of batalha.jogadores) {
      let ganhosDesteJogador: any[] = [];
      let valorDesteJogador = 0;

      for (const caixa of batalha.caixas) {
        let skins = typeof caixa.skins === 'string' ? JSON.parse(caixa.skins) : (caixa.skins || caixa.itens);
        const sorteio = this.sortearItens(skins, 1);
        ganhosDesteJogador.push(sorteio.ganhos[0]);
        valorDesteJogador += sorteio.valorTotal;
      }

      batalha.resultado.ganhosPorJogador[jogador.id] = { ganhos: ganhosDesteJogador, valorTotal: valorDesteJogador };
      todasAsSkinsDoPote.push(...ganhosDesteJogador);

      // Descobrir quem é o mais rico
      if (valorDesteJogador > maiorValor) {
        maiorValor = valorDesteJogador;
        vencedores = [jogador.id];
      } else if (valorDesteJogador === maiorValor) {
        vencedores.push(jogador.id); // Empate!
      }
    }

    // 2. DECLARAR O VENCEDOR (COM DESEMPATE DA MORTE 🪙)
    if (vencedores.length > 1) {
      // Sorteia um índice aleatório entre os jogadores que empataram
      const indexVencedorDesempate = Math.floor(Math.random() * vencedores.length);
      const grandeVencedorId = vencedores[indexVencedorDesempate];

      batalha.resultado.vencedorId = grandeVencedorId;
      batalha.resultado.teveDesempate = true; // Avisa o frontend que houve um sorteio de desempate
      batalha.resultado.empateIds = vencedores; // Lista de quem participou no desempate
    } else {
      batalha.resultado.vencedorId = vencedores[0];
    }

    this.batalhasAtivas.set(batalha.id, batalha);

    // 3. PAGAR AO ÚNICO VENCEDOR NA BASE DE DADOS
    // (Como agora há SEMPRE um único vencedor, não precisamos da velha lógica de divisão)
    const vencedorFinalId = batalha.resultado.vencedorId;
    
    if (vencedorFinalId > 0) { // Se não for bot
      await (this.prisma as any).inventario.createMany({ 
        data: todasAsSkinsDoPote.map(s => ({ 
          nome: s.nome, 
          imagem: s.imagem || s.image, 
          raridade: s.raridade || 'Comum', 
          valor: parseFloat(s.preco || s.valor || 0), 
          userId: Number(vencedorFinalId) 
        })) 
      });
    }
    // Se for bot, o casino engole as skins e lucra!

    // 4. AVISAR OS ECRÃS PARA COMEÇAR A ANIMAÇÃO!
    this.server.emit('batalhas_atualizadas', Array.from(this.batalhasAtivas.values()));
    for (const jogador of batalha.jogadores) {
      if (jogador.id > 0) {
        this.server.to(jogador.socketId).emit('batalha_comecou', batalha);
      }
    }

    // Limpa da RAM passado um tempo maior (25 segundos)
    setTimeout(() => {
      this.batalhasAtivas.delete(batalha.id);
      this.server.emit('batalhas_atualizadas', Array.from(this.batalhasAtivas.values()));
    }, 25000);
  }

  @SubscribeMessage('pedir_batalhas')
  handlePedirBatalhas(@ConnectedSocket() client: Socket) {
    client.emit('batalhas_atualizadas', Array.from(this.batalhasAtivas.values()));
  }
}