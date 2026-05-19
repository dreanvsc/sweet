import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { FeedGateway } from './feed.gateway';
import { UsersService } from './users.service';

@Injectable()
export class CaixasService {
  constructor(
    private prisma: PrismaService,
    private feedGateway: FeedGateway,
    private readonly usersService: UsersService // 🔥 O gerente de XP está pronto!
  ) {}

  async criarCaixa(dados: { nome: string, preco: number, imagem: string, itens: any[], ordem?: number }) {
    return await (this.prisma as any).caixa.create({
      data: { nome: dados.nome, preco: Number(dados.preco), imagem: dados.imagem || '/skins/glock.png', itens: JSON.stringify(dados.itens), ordem: Number(dados.ordem) || 0 }
    });
  }

  async atualizarCaixa(id: number, dados: { nome: string, preco: number, imagem: string, itens: any[], ordem?: number }) {
    return await (this.prisma as any).caixa.update({
      where: { id: Number(id) },
      data: { nome: dados.nome, preco: Number(dados.preco), imagem: dados.imagem || '/skins/glock.png', itens: JSON.stringify(dados.itens), ordem: Number(dados.ordem) || 0 }
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
      const quantidade = dados.quantidade || 1;
      const user = await (this.prisma as any).user.findUnique({ where: { id: Number(dados.userId) } });
      if (!user) throw new Error('Utilizador não encontrado');

      const precoDaCaixa = Number(dados.caixaSelecionada.preco);
      const precoTotal = precoDaCaixa * quantidade;

      if (user.saldo < precoTotal) throw new Error(`Saldo insuficiente. Precisas de ${precoTotal.toFixed(2)}€`);

      let listaSkins = dados.caixaSelecionada.skins || dados.caixaSelecionada.itens || [];
      if (typeof listaSkins === 'string') {
        try { listaSkins = JSON.parse(listaSkins); } catch(e) { listaSkins = []; }
      }
      if (listaSkins.length === 0) throw new Error('Esta caixa não tem skins!');

      let pesoTotal = 0;
      const skinsComPeso = listaSkins.map((skin: any) => {
        const peso = parseFloat(skin.probabilidade) || 0;
        pesoTotal += peso;
        return { ...skin, peso: peso };
      });
      if (pesoTotal <= 0) skinsComPeso.forEach((s: any) => { s.peso = 1; pesoTotal += 1; });

      const skinsGanhas: any[] = [];
      let valorTotalGanho = 0;

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

      // 1. Tira o dinheiro do jogador
      await (this.prisma as any).user.update({
        where: { id: Number(dados.userId) }, data: { saldo: parseFloat(novoSaldo.toFixed(2)) }
      });

      // 2. 🔥 INJETA O XP! (Isto faz o nível subir de verdade!)
      await this.usersService.adicionarXp(Number(dados.userId), precoTotal);

      // 3. Guarda as skins no inventário
      const inventarioData = skinsGanhas.map(skin => ({
        nome: skin.nome, imagem: skin.imagem || skin.image, raridade: skin.raridade || 'Comum', valor: parseFloat(Number(skin.preco || skin.valor || 0).toFixed(2)), userId: Number(dados.userId)
      }));

      await (this.prisma as any).inventario.createMany({ data: inventarioData });

      await (this.prisma as any).historicoJogo.create({
        data: { userId: Number(dados.userId), acao: "Abertura de Caixa", detalhe: quantidade > 1 ? `Abriu ${quantidade}x ${dados.caixaSelecionada.nome}` : `Abriu a ${dados.caixaSelecionada.nome}`, valor: parseFloat(Number(valorTotalGanho).toFixed(2)), tipo: "GANHO" }
      });

      // 🔥 AQUI ENTRA A ANTENA: AVISA O FRONTEND EM TEMPO REAL PARA ROLAR NO LIVE FEED 🔥
      skinsGanhas.forEach(skin => {
        this.feedGateway.emitirNovoDrop({
          nome: skin.nome,
          imagem: skin.imagem || skin.image,
          raridade: skin.raridade || 'Comum',
          valor: parseFloat(Number(skin.preco || skin.valor || 0).toFixed(2)),
          userNome: user.nome || 'Anónimo',
          userFoto: user.avatar || '/skins/glock.png'
        });
      });

      return {
        itensSorteados: skinsGanhas.map(s => ({ nome: s.nome, imageUrl: s.imagem || s.image, valor: parseFloat(Number(s.preco || s.valor || 0).toFixed(2)), raridade: s.raridade })),
        valorTotal: parseFloat(valorTotalGanho.toFixed(2)),
        novoSaldo: parseFloat(novoSaldo.toFixed(2))
      };
    } catch (error) { throw error; }
  }
}