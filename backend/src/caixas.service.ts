import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { FeedGateway } from './feed.gateway';
import { UsersService } from './users.service';

@Injectable()
export class CaixasService {
  constructor(
    private prisma: PrismaService,
    private feedGateway: FeedGateway,
    private readonly usersService: UsersService 
  ) {}

  async criarCaixa(dados: { nome: string, preco: number, imagem: string, itens: any[], ordem?: number, isEvento?: boolean, categoria?: string }) {
    return await (this.prisma as any).caixa.create({
      data: { 
        nome: dados.nome, 
        preco: Number(dados.preco), 
        imagem: dados.imagem || '/skins/glock.png', 
        itens: JSON.stringify(dados.itens), 
        ordem: Number(dados.ordem) || 0,
        isEvento: dados.isEvento || false,
        categoria: dados.categoria || "CAIXAS ORIGINAIS" // 🔥 Aqui está a magia!
      }
    });
  }

  async atualizarCaixa(id: number, dados: { nome: string, preco: number, imagem: string, itens: any[], ordem?: number, isEvento?: boolean, categoria?: string }) {
    return await (this.prisma as any).caixa.update({
      where: { id: Number(id) },
      data: { 
        nome: dados.nome, 
        preco: Number(dados.preco), 
        imagem: dados.imagem || '/skins/glock.png', 
        itens: JSON.stringify(dados.itens), 
        ordem: Number(dados.ordem) || 0,
        isEvento: dados.isEvento || false,
        categoria: dados.categoria || "CAIXAS ORIGINAIS" // 🔥 Aqui está a magia!
      }
    });
  }

  async apagarCaixa(id: number) {
    return await (this.prisma as any).caixa.delete({ where: { id: Number(id) } });
  }

  async listarCaixas() {
    return await (this.prisma as any).caixa.findMany({ orderBy: { ordem: 'asc' } });
  }

  async listarTodosItens() {
    return await (this.prisma as any).item.findMany();
  }

  async abrirCaixa(dados: { userId: string, caixaSelecionada: any, quantidade?: number }) {
    try {
      // 🔥 BLOQUEIO DE FRAUDE: Impede hackers de usarem valores negativos, zero, ou frações (ex: 1.5).
      const quantidade = Math.floor(Number(dados.quantidade || 1));
      if (quantidade < 1 || quantidade > 50) {
        throw new BadRequestException('Quantidade inválida (entre 1 e 50).');
      }

      const precoDaCaixa = Number(dados.caixaSelecionada.preco);
      const precoTotal = precoDaCaixa * quantidade;

      // ======================================================================
      // 🔥 O CADEADO DE TRANSAÇÃO: Se falhar a meio, ninguém perde nada!
      // ======================================================================
      return await (this.prisma as any).$transaction(async (prisma: any) => {
        
        const user = await prisma.user.findUnique({ where: { id: Number(dados.userId) } });
        if (!user) throw new BadRequestException('Utilizador não encontrado');

        if (user.saldo < precoTotal) {
            throw new BadRequestException(`Saldo insuficiente. Precisas de ${precoTotal.toFixed(2)}€`);
        }

        let listaSkins = dados.caixaSelecionada.skins || dados.caixaSelecionada.itens || [];
        if (typeof listaSkins === 'string') {
          try { listaSkins = JSON.parse(listaSkins); } catch(e) { listaSkins = []; }
        }
        if (listaSkins.length === 0) throw new BadRequestException('Esta caixa não tem skins disponíveis!');

        let pesoTotal = 0;
        const skinsComPeso = listaSkins.map((skin: any) => {
          const peso = parseFloat(skin.probabilidade) || 0;
          pesoTotal += peso;
          return { ...skin, peso: peso };
        });
        
        // Proteção: Se o admin esquecer de meter pesos, todas têm 1 (mesma chance)
        if (pesoTotal <= 0) skinsComPeso.forEach((s: any) => { s.peso = 1; pesoTotal += 1; });

        const skinsGanhas: any[] = [];
        let valorTotalGanho = 0;

        // O Motor de RNG (Sorteio)
        for (let i = 0; i < quantidade; i++) {
          const numeroSorteado = Math.random() * pesoTotal;
          let pesoAcumulado = 0;
          let skinSorteada = skinsComPeso[0];

          for (const skin of skinsComPeso) {
            pesoAcumulado += skin.peso;
            if (numeroSorteado <= pesoAcumulado) {
              skinSorteada = skin;
              break;
            }
          }
          skinsGanhas.push(skinSorteada);
          valorTotalGanho += parseFloat(skinSorteada.preco || skinSorteada.valor || 0);
        }

        const novoSaldo = user.saldo - precoTotal;

        // 1. Tira o dinheiro (Garantido pelo Prisma)
        await prisma.user.update({
          where: { id: Number(dados.userId) }, data: { saldo: parseFloat(novoSaldo.toFixed(2)) }
        });

        // 2. Guarda as skins no inventário
        const inventarioData = skinsGanhas.map(skin => ({
          nome: skin.nome, 
          imagem: skin.imagem || skin.image, 
          raridade: skin.raridade || 'Comum', 
          valor: parseFloat(Number(skin.preco || skin.valor || 0).toFixed(2)), 
          userId: Number(dados.userId)
        }));

        await prisma.inventario.createMany({ data: inventarioData });

        // 3. Regista no Histórico
        await prisma.historicoJogo.create({
          data: { 
            userId: Number(dados.userId), 
            acao: "Abertura de Caixa", 
            detalhe: quantidade > 1 ? `Abriu ${quantidade}x ${dados.caixaSelecionada.nome}` : `Abriu a ${dados.caixaSelecionada.nome}`, 
            valor: parseFloat(Number(valorTotalGanho).toFixed(2)), 
            tipo: "GANHO" 
          }
        });

        // Retorna o resultado DA TRANSAÇÃO. 
        // O XP e o Live Feed podem ocorrer de forma assíncrona, fora da transação vital
        return {
            skinsGanhas,
            valorTotalGanho,
            novoSaldo,
            user
        };
      }).then(async (resultado: any) => {
          // ======================================================================
          // PÓS-TRANSAÇÃO (Sucesso garantido! O XP sobe e o Feed grita)
          // ======================================================================
          
          await this.usersService.adicionarXp(Number(dados.userId), precoTotal);

          // 🔥 O ANTI-SPOILER: Quantos milissegundos demora a tua roleta a girar?
          // Ajusta este valor! (ex: 6000 = 6 segundos de roleta)
          const TEMPO_DA_ROLETA = 6000; 

          setTimeout(() => {
            resultado.skinsGanhas.forEach((skin: any) => {
              this.feedGateway.emitirNovoDrop({
                nome: skin.nome,
                imagem: skin.imagem || skin.image,
                raridade: skin.raridade || 'Comum',
                valor: parseFloat(Number(skin.preco || skin.valor || 0).toFixed(2)),
                userNome: resultado.user.nome || 'Anónimo',
                userFoto: resultado.user.avatar || '/skins/glock.png'
              });
            });
          }, TEMPO_DA_ROLETA);

          return {
            itensSorteados: resultado.skinsGanhas.map((s: any) => ({ nome: s.nome, imageUrl: s.imagem || s.image, valor: parseFloat(Number(s.preco || s.valor || 0).toFixed(2)), raridade: s.raridade })),
            valorTotal: parseFloat(resultado.valorTotalGanho.toFixed(2)),
            novoSaldo: parseFloat(resultado.novoSaldo.toFixed(2))
          };
      });

    } catch (error: any) { 
        throw new BadRequestException(error.message || "Erro ao processar a abertura da caixa."); 
    }
  }
}