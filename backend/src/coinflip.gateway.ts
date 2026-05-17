import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from './prisma.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class CoinflipGateway {
  @WebSocketServer()
  server: Server;

  // Memória RAM para guardar os Coinflips ativos
  private coinflipsAtivos = new Map<string, any>();
  
  // A taxa do teu casino (5%)
  private MARGEM_CASINO = 0.05;

  constructor(private prisma: PrismaService) {}

  @SubscribeMessage('criar_coinflip')
  async handleCriarCoinflip(@MessageBody() dados: any, @ConnectedSocket() client: Socket) {
    const user = await (this.prisma as any).user.findUnique({ where: { id: Number(dados.userId) } });
    if (!user) return { erro: 'Jogador não encontrado' };

    let valorAposta = 0;

    // Se for aposta em SALDO
    if (dados.tipo === 'saldo') {
      valorAposta = parseFloat(dados.valor);
      if (user.saldo < valorAposta) return { erro: 'Saldo insuficiente' };
      await (this.prisma as any).user.update({ where: { id: user.id }, data: { saldo: user.saldo - valorAposta } });
    } 
    // Se for aposta em SKINS
    else if (dados.tipo === 'skins') {
      valorAposta = dados.skins.reduce((acc: number, skin: any) => acc + parseFloat(skin.preco || skin.valor), 0);
      // Apaga as skins do inventário do criador
      const idsSkins = dados.skins
        .map((s: any) => Number(s.id))
        .filter((id: number) => !isNaN(id) && id > 0);

      // Se a skin for fantasma (sem ID), cancela a aposta
      if (idsSkins.length === 0) return { erro: 'As skins selecionadas são inválidas. Atualiza a página.' };

      await (this.prisma as any).inventario.deleteMany({ where: { id: { in: idsSkins } } });
    }

    const jogoId = `cf_${Date.now()}`;
    const novoJogo = {
      id: jogoId,
      tipo: dados.tipo, // 'saldo' ou 'skins'
      criador: { id: user.id, nome: user.nome, foto: user.avatar || '/skins/glock.png', socketId: client.id, lado: dados.lado, aposta: dados.tipo === 'saldo' ? valorAposta : dados.skins },
      adversario: null,
      valorTotal: valorAposta,
      estado: 'espera',
      resultado: null
    };

    this.coinflipsAtivos.set(jogoId, novoJogo);
    this.server.emit('coinflips_atualizados', Array.from(this.coinflipsAtivos.values()));
    return { sucesso: true, jogoId };
  }

  @SubscribeMessage('entrar_coinflip')
  async handleEntrarCoinflip(@MessageBody() dados: any, @ConnectedSocket() client: Socket) {
    const jogo = this.coinflipsAtivos.get(dados.jogoId);
    if (!jogo || jogo.estado !== 'espera') return { erro: 'Jogo indisponível' };

    const user = await (this.prisma as any).user.findUnique({ where: { id: Number(dados.userId) } });
    if (!user) return { erro: 'Jogador não encontrado' };

    let apostaAdversario: any = null;

    if (jogo.tipo === 'saldo') {
      if (user.saldo < jogo.valorTotal) return { erro: 'Saldo insuficiente' };
      await (this.prisma as any).user.update({ where: { id: user.id }, data: { saldo: user.saldo - jogo.valorTotal } });
      apostaAdversario = jogo.valorTotal;
      jogo.valorTotal += apostaAdversario;
    } else {
      const valorAposta = dados.skins.reduce((acc: number, skin: any) => acc + parseFloat(skin.preco || skin.valor), 0);
      const margem = jogo.valorTotal * 0.10; // Pode haver diferença de 10% no valor das skins
      if (valorAposta < jogo.valorTotal - margem || valorAposta > jogo.valorTotal + margem) return { erro: 'Valor das skins tem de ser igual à aposta' };
      
      const idsSkins = dados.skins
        .map((s: any) => Number(s.id))
        .filter((id: number) => !isNaN(id) && id > 0);

      if (idsSkins.length === 0) return { erro: 'As skins selecionadas são inválidas. Atualiza a página.' };

      await (this.prisma as any).inventario.deleteMany({ where: { id: { in: idsSkins } } });
      apostaAdversario = dados.skins;
      jogo.valorTotal += valorAposta;
    }

    const ladoAdversario = jogo.criador.lado === 'CT' ? 'T' : 'CT';
    jogo.adversario = { id: user.id, nome: user.nome, foto: user.avatar || '/skins/glock.png', socketId: client.id, lado: ladoAdversario, aposta: apostaAdversario };
    jogo.estado = 'jogando';

    await this.processarSorteio(jogo);
    return { sucesso: true };
  }

  @SubscribeMessage('chamar_bot_coinflip')
  async handleChamarBot(@MessageBody() dados: { jogoId: string }) {
    const jogo = this.coinflipsAtivos.get(dados.jogoId);
    if (!jogo || jogo.estado !== 'espera') return { erro: 'Jogo indisponível' };

    // Perfis do Bot
    const nomesBots = ['Bot Neymar', 'Bot Ronaldo', 'Bot Messi', 'Bot Ninja'];
    const botAleatorio = nomesBots[Math.floor(Math.random() * nomesBots.length)];
    const ladoBot = jogo.criador.lado === 'CT' ? 'T' : 'CT';

    let apostaBot: any = null;

    if (jogo.tipo === 'saldo') {
      apostaBot = jogo.valorTotal; // Bot cobre o valor exato
      jogo.valorTotal += apostaBot;
    } else {
      // Se for skins, o bot "gera" uma skin fantasma equivalente ao valor do criador para equilibrar a balança
      const valorCriador = jogo.valorTotal;
      apostaBot = [{ nome: 'Skin do Bot', preco: valorCriador, imagem: '/skins/ak47.png', raridade: 'Secreto' }];
      jogo.valorTotal += valorCriador;
    }

    jogo.adversario = { id: -1, nome: botAleatorio, foto: `https://api.dicebear.com/7.x/bottts/svg?seed=${botAleatorio}`, lado: ladoBot, aposta: apostaBot };
    jogo.estado = 'jogando';

    await this.processarSorteio(jogo);
    return { sucesso: true };
  }

  private async processarSorteio(jogo: any) {
    // Sorteio justo 50/50
    const ladoVencedor = Math.random() < 0.5 ? 'CT' : 'T';
    let vencedor = jogo.criador.lado === ladoVencedor ? jogo.criador : jogo.adversario;
    let perdedor = jogo.criador.lado === ladoVencedor ? jogo.adversario : jogo.criador;

    jogo.resultado = { ladoVencedor, vencedorId: vencedor.id };
    this.coinflipsAtivos.set(jogo.id, jogo);

    // O Momento de cobrar a Margem da Casa 🏦
    if (vencedor.id !== -1) { // Se o bot não ganhou (O casino já lucrou 100% se o bot ganhou)
      
      if (jogo.tipo === 'saldo') {
        const pote = jogo.valorTotal;
        const taxaCasino = pote * this.MARGEM_CASINO;
        const premioLiquido = pote - taxaCasino;
        
        // Paga ao vencedor
        const user = await (this.prisma as any).user.findUnique({ where: { id: Number(vencedor.id) } });
        await (this.prisma as any).user.update({ where: { id: user.id }, data: { saldo: user.saldo + premioLiquido } });
      } 
      
      else if (jogo.tipo === 'skins') {
        let todasSkins = [...jogo.criador.aposta, ...jogo.adversario.aposta];
        
        // Ordena por preço (do mais barato para o mais caro)
        todasSkins.sort((a, b) => parseFloat(a.preco || a.valor) - parseFloat(b.preco || b.valor));
        
        // O Casino confisca a skin mais barata como taxa (se houver mais que 1 skin no pote)
        if (todasSkins.length > 1) {
            todasSkins.shift(); // Remove a primeira (mais barata) - Fica para a casa!
        }

        // Entrega o resto das skins ao vencedor
        await (this.prisma as any).inventario.createMany({ 
          data: todasSkins.map(s => ({ nome: s.nome, imagem: s.imagem || s.image, raridade: s.raridade || 'Comum', valor: parseFloat(s.preco || s.valor || 0), userId: Number(vencedor.id) })) 
        });
      }
    }

    // Avisa os ecrãs que a moeda está a girar!
    this.server.emit('coinflips_atualizados', Array.from(this.coinflipsAtivos.values()));
    
    // Limpa a memória 15 segundos depois da animação
    setTimeout(() => {
      this.coinflipsAtivos.delete(jogo.id);
      this.server.emit('coinflips_atualizados', Array.from(this.coinflipsAtivos.values()));
    }, 15000);
  }

  @SubscribeMessage('pedir_coinflips')
  handlePedirCoinflips(@ConnectedSocket() client: Socket) {
    client.emit('coinflips_atualizados', Array.from(this.coinflipsAtivos.values()));
  }
}