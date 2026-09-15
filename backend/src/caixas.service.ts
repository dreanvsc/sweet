import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { FeedGateway } from './feed.gateway';
import { UsersService } from './users.service';
import { Cron } from '@nestjs/schedule';

// ==========================================================================
// 🤖 CONFIGURAÇÃO DA GERAÇÃO AUTOMÁTICA DE CAIXAS
// ==========================================================================
// Cada "tier" define uma faixa de preço (relativa ao preço da caixa) e a
// percentagem total de chance atribuída a essa faixa. Isto imita a estrutura
// de odds das caixas oficiais (itens baratos com alta chance, itens caros
// muito raros).
const TIERS_AUTOMATICOS = [
  { chance: 70, min: 0.1, max: 0.5, quantidadeItens: 4 },
  { chance: 22, min: 0.5, max: 1.5, quantidadeItens: 3 },
  { chance: 6, min: 1.5, max: 4, quantidadeItens: 2 },
  { chance: 1.8, min: 4, max: 10, quantidadeItens: 1 },
  { chance: 0.2, min: 10, max: 40, quantidadeItens: 1 }, // 🎯 item "jackpot"
];

const MARGEM_DA_CASA = 0.12; // 12% de margem alvo — ajusta como quiseres
const PRECOS_DAS_CAIXAS = [2.5, 5, 10, 15, 25, 50]; // um preço por caixa/dia

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

  // ==========================================================================
  // 🤖 GERAÇÃO AUTOMÁTICA DE CAIXAS (6 por dia)
  // ==========================================================================

  private escolherItensAleatorios(pool: any[], quantidade: number) {
    const copia = [...pool];
    const escolhidos: any[] = [];
    while (escolhidos.length < quantidade && copia.length > 0) {
      const idx = Math.floor(Math.random() * copia.length);
      escolhidos.push(copia.splice(idx, 1)[0]);
    }
    return escolhidos;
  }

  /**
   * Monta a lista de itens + probabilidades para UMA caixa, a partir do
   * catálogo de Items já existente na BD (preços sincronizados pelo teu
   * cron noturno em admin.service.ts).
   */
  private montarItensDaCaixa(catalogo: any[], precoCaixa: number) {
    const itens: any[] = [];

    for (const tier of TIERS_AUTOMATICOS) {
      const candidatos = catalogo.filter(
        (i) => i.preco >= precoCaixa * tier.min && i.preco <= precoCaixa * tier.max
      );
      if (candidatos.length === 0) continue;

      const escolhidos = this.escolherItensAleatorios(
        candidatos,
        Math.min(tier.quantidadeItens, candidatos.length)
      );
      const chancePorItem = tier.chance / escolhidos.length;

      for (const item of escolhidos) {
        itens.push({
          nome: item.nome,
          imagem: item.imagem,
          raridade: item.raridade,
          preco: item.preco,
          probabilidade: chancePorItem,
        });
      }
    }

    // Normaliza para a soma dar exatamente 100 (evita erros de arredondamento)
    const total = itens.reduce((s, i) => s + i.probabilidade, 0);
    itens.forEach((i) => (i.probabilidade = +(i.probabilidade * (100 / total)).toFixed(4)));

    return itens;
  }

  private calcularEV(itens: any[]) {
    return itens.reduce((s, i) => s + (i.preco * i.probabilidade) / 100, 0);
  }

  /**
   * Gera N caixas novas (por defeito 6), escolhendo skins do catálogo atual
   * e atribuindo odds automaticamente, respeitando a margem da casa.
   * Pode ser chamado manualmente (endpoint admin) ou pelo cron diário.
   */
  async gerarCaixasAutomaticas(quantidade: number = 6) {
    const catalogo = await (this.prisma as any).item.findMany();
    if (catalogo.length === 0) {
      throw new BadRequestException(
        'Não há itens na base de dados. Corre primeiro a sincronização do arsenal (admin.service.ts).'
      );
    }

    const ultimaCaixa = await (this.prisma as any).caixa.findFirst({ orderBy: { ordem: 'desc' } });
    let ordemAtual = (ultimaCaixa?.ordem || 0) + 1;

    const dataStr = new Date().toISOString().slice(0, 10);
    const caixasCriadas: any[] = [];

    for (let i = 0; i < quantidade; i++) {
      const precoCaixa = PRECOS_DAS_CAIXAS[i % PRECOS_DAS_CAIXAS.length];
      let itens = this.montarItensDaCaixa(catalogo, precoCaixa);
      let ev = this.calcularEV(itens);

      // Se a EV ficar acima da margem alvo, reduz gradualmente a chance dos
      // itens mais caros que o preço da caixa até ficar dentro da margem.
      let seguranca = 0;
      while (ev > precoCaixa * (1 - MARGEM_DA_CASA) && seguranca < 20) {
        itens = itens.map((it) =>
          it.preco > precoCaixa ? { ...it, probabilidade: it.probabilidade * 0.85 } : it
        );
        const total = itens.reduce((s, i) => s + i.probabilidade, 0);
        itens.forEach((i) => (i.probabilidade = +(i.probabilidade * (100 / total)).toFixed(4)));
        ev = this.calcularEV(itens);
        seguranca++;
      }

      // A imagem/banner da caixa é a do item mais valioso lá dentro
      // (o mesmo padrão visual que já usas nos itens do Arsenal).
      const itemDestaque = [...itens].sort((a, b) => b.preco - a.preco)[0];

      const caixa = await this.criarCaixa({
        nome: `Caixa ${dataStr} #${i + 1}`,
        preco: precoCaixa,
        imagem: itemDestaque?.imagem || '/skins/glock.png',
        itens,
        ordem: ordemAtual++,
        isEvento: false,
        categoria: '🤖 CAIXAS DO DIA',
      });

      caixasCriadas.push({ ...caixa, expectedValue: +ev.toFixed(2) });
    }

    return caixasCriadas;
  }

  // Corre todos os dias às 05:00 (uma hora depois da sincronização de preços
  // às 04:00 em admin.service.ts, para usar preços frescos).
  @Cron('0 5 * * *')
  async gerarCaixasAutomaticasCron() {
    console.log('🤖 [CRON] A gerar as 6 caixas automáticas do dia...');
    try {
      const criadas = await this.gerarCaixasAutomaticas(6);
      console.log(`✅ [CRON] ${criadas.length} caixas criadas com sucesso.`);
    } catch (error: any) {
      console.error('❌ [CRON] Falha ao gerar caixas automáticas:', error.message);
    }
  }
}