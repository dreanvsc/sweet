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

// Bancos de palavras para gerar nomes temáticos sem usar datas.
// Adiciona/remove palavras à vontade — quanto mais houver, menor a chance de repetição.
const ADJETIVOS_NOME = [
  'Sombrio', 'Relâmpago', 'Selvagem', 'Glacial', 'Ardente', 'Secreto', 'Rebelde',
  'Élite', 'Oculto', 'Feroz', 'Noturno', 'Dourado', 'Fantasma', 'Blindado', 'Letal',
  'Silencioso', 'Radioativo', 'Imortal', 'Vermelho', 'Negro',
];
const SUBSTANTIVOS_NOME = [
  'Vórtice', 'Cofre', 'Baú', 'Impacto', 'Trovão', 'Eclipse', 'Fúria', 'Águia',
  'Cobra', 'Fénix', 'Sombra', 'Arsenal', 'Bunker', 'Reator', 'Cartel', 'Sindicato',
  'Falcão', 'Lobo', 'Dragão', 'Tempestade',
];
const EMOJIS_CATEGORIA = ['🔥', '⚡', '💀', '🎯', '🐺', '🦅', '💰', '⚔️'];

const CORES_RARIDADE: Record<string, string> = {
  Comum: '#3b82f6',
  Raro: '#a855f7',
  Lendário: '#f59e0b',
};

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
   * Gera uma arte 3D de cofre/case única via API de geração de imagens da
   * OpenAI, e envia o resultado para o ImgBB (o mesmo serviço que já usas
   * nos banners), devolvendo o link final.
   *
   * Requer as variáveis de ambiente OPENAI_API_KEY e IMGBB_API_KEY.
   * Se qualquer passo falhar (sem chave, API em baixo, etc.), devolve null
   * e quem chamar esta função deve usar o cofre em SVG como alternativa.
   */
  private async gerarImagemCaixaIA(
    nomeDaCaixa: string,
    itemDestaque: any,
    precoCaixa: number,
  ): Promise<string | null> {
    const openaiKey = process.env.OPENAI_API_KEY;
    const imgbbKey = process.env.IMGBB_API_KEY;
    if (!openaiKey || !imgbbKey) return null;

    const corTema =
      itemDestaque?.raridade === 'Lendário'
        ? 'gold and amber'
        : itemDestaque?.raridade === 'Raro'
        ? 'purple and violet'
        : 'blue and cyan';

    const prompt =
      `A single premium 3D rendered video game loot crate icon, titled "${nomeDaCaixa}", ` +
      `military sci-fi style metal case with glowing ${corTema} accent lights and engraved emblem, ` +
      `dark background, dramatic studio lighting, high detail, centered composition, square format, ` +
      `no text, no watermark, no letters on the crate itself.`;

    try {
      // 1) Gera a imagem com a OpenAI
      const resOpenAI = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt,
          size: '1024x1024',
          n: 1,
        }),
      });

      if (!resOpenAI.ok) {
        console.error(`❌ [imagem-ia] OpenAI respondeu ${resOpenAI.status}: ${(await resOpenAI.text()).slice(0, 300)}`);
        return null;
      }

      const dataOpenAI = await resOpenAI.json();
      const base64Imagem = dataOpenAI?.data?.[0]?.b64_json;
      if (!base64Imagem) {
        console.error('❌ [imagem-ia] OpenAI não devolveu b64_json.');
        return null;
      }

      // 2) Envia para o ImgBB para ficar com um link permanente e leve
      const corpoImgbb = new URLSearchParams();
      corpoImgbb.set('image', base64Imagem);

      const resImgbb = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
        method: 'POST',
        body: corpoImgbb,
      });

      const dataImgbb = await resImgbb.json();
      const urlFinal = dataImgbb?.data?.url;
      if (!urlFinal) {
        console.error('❌ [imagem-ia] ImgBB não devolveu URL:', JSON.stringify(dataImgbb).slice(0, 300));
        return null;
      }

      console.log(`✅ [imagem-ia] Imagem gerada para "${nomeDaCaixa}": ${urlFinal}`);
      return urlFinal;
    } catch (e: any) {
      console.error('❌ [imagem-ia] Erro inesperado:', e.message);
      return null;
    }
  }

  /**
   * Descarrega uma imagem externa e devolve-a já como data URI base64,
   * para poder ser embutida dentro do SVG sem depender de pedidos externos
   * (que os browsers bloqueiam quando o SVG é usado num <img src="data:...">).
   */
  private async imagemParaBase64(url: string): Promise<string | null> {
    if (!url) return null;
    try {
      const resposta = await fetch(url);
      if (!resposta.ok) return null;
      const tipo = resposta.headers.get('content-type') || 'image/png';
      const buffer = Buffer.from(await resposta.arrayBuffer());
      return `data:${tipo};base64,${buffer.toString('base64')}`;
    } catch (e) {
      console.warn(`⚠️ Não foi possível embutir a imagem "${url}" no cofre:`, (e as any).message);
      return null;
    }
  }

  /**
   * Gera uma imagem de "cofre" (crate) para a caixa, na hora, como SVG —
   * sem depender de nenhum serviço externo em tempo de visualização (a
   * imagem da skin é descarregada UMA VEZ, aqui, e embutida como base64,
   * porque os browsers bloqueiam pedidos externos feitos de dentro de um
   * SVG usado como <img src="data:...">). A cor do brilho/moldura muda
   * conforme a raridade do item em destaque (igual à lógica de cores já
   * usada no frontend: Comum=azul, Raro=roxo, Lendário=dourado).
   */
  private async gerarImagemCaixa(itemDestaque: any, precoCaixa: number): Promise<string> {
    const cor = CORES_RARIDADE[itemDestaque?.raridade] || CORES_RARIDADE.Comum;
    const imagemItemBase64 = await this.imagemParaBase64(itemDestaque?.imagem || '');

    const svg = `
<svg width="500" height="500" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="42%" r="65%">
      <stop offset="0%" stop-color="${cor}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#0b0b0d" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="corpo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2a2a33"/>
      <stop offset="100%" stop-color="#0f0f13"/>
    </linearGradient>
    <filter id="sombraItem" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <rect width="500" height="500" fill="url(#glow)"/>

  <!-- Corpo do cofre -->
  <rect x="55" y="115" width="390" height="290" rx="26" fill="url(#corpo)" stroke="${cor}" stroke-width="3" stroke-opacity="0.75"/>
  <rect x="55" y="115" width="390" height="55" rx="26" fill="${cor}" fill-opacity="0.16"/>
  <line x1="55" y1="170" x2="445" y2="170" stroke="${cor}" stroke-width="2" stroke-opacity="0.5"/>

  <!-- Cantos decorativos, estilo "loot crate" -->
  <path d="M55 148 V141 a26 26 0 0 1 26 -26 h22" fill="none" stroke="${cor}" stroke-width="4"/>
  <path d="M445 148 V141 a26 26 0 0 0 -26 -26 h-22" fill="none" stroke="${cor}" stroke-width="4"/>
  <path d="M55 372 V379 a26 26 0 0 0 26 26 h22" fill="none" stroke="${cor}" stroke-width="4"/>
  <path d="M445 372 V379 a26 26 0 0 1 -26 26 h-22" fill="none" stroke="${cor}" stroke-width="4"/>

  <!-- Fecho central -->
  <circle cx="250" cy="143" r="15" fill="#0b0b0d" stroke="${cor}" stroke-width="3"/>
  <rect x="244" y="150" width="12" height="16" rx="2" fill="${cor}"/>

  <!-- Item em destaque, com sombra (embutido como base64, sem pedido externo) -->
  ${imagemItemBase64 ? `<image href="${imagemItemBase64}" x="125" y="195" width="250" height="180" preserveAspectRatio="xMidYMid meet" filter="url(#sombraItem)"/>` : ''}

  <!-- Faixa do preço -->
  <rect x="145" y="410" width="210" height="46" rx="23" fill="#0b0b0d" stroke="${cor}" stroke-width="2"/>
  <text x="250" y="440" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="${cor}">€${precoCaixa.toFixed(2)}</text>
</svg>`.trim();

    return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;
  }

  private aleatorio(lista: string[]) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  /**
   * Gera um nome temático aleatório (sem datas) que ainda não existe em
   * `nomesProibidos`. Tenta até 50 combinações antes de acrescentar um
   * sufixo numérico para garantir que nunca há colisão.
   */
  private gerarNomeUnico(nomesProibidos: Set<string>, comPrefixo: string = 'Caixa'): string {
    for (let tentativa = 0; tentativa < 50; tentativa++) {
      const nome = `${comPrefixo} ${this.aleatorio(ADJETIVOS_NOME)} ${this.aleatorio(SUBSTANTIVOS_NOME)}`;
      if (!nomesProibidos.has(nome.toLowerCase())) {
        nomesProibidos.add(nome.toLowerCase());
        return nome;
      }
    }
    // Fallback (praticamente nunca deve chegar aqui): garante unicidade com um sufixo.
    const sufixo = Math.floor(Math.random() * 9000) + 1000;
    const nomeComSufixo = `${comPrefixo} ${this.aleatorio(ADJETIVOS_NOME)} ${this.aleatorio(SUBSTANTIVOS_NOME)} ${sufixo}`;
    nomesProibidos.add(nomeComSufixo.toLowerCase());
    return nomeComSufixo;
  }

  private gerarCategoriaUnica(categoriasProibidas: Set<string>): string {
    for (let tentativa = 0; tentativa < 50; tentativa++) {
      const nome = `${this.aleatorio(EMOJIS_CATEGORIA)} COLEÇÃO ${this.aleatorio(ADJETIVOS_NOME).toUpperCase()} ${this.aleatorio(SUBSTANTIVOS_NOME).toUpperCase()}`;
      if (!categoriasProibidas.has(nome.toLowerCase())) {
        categoriasProibidas.add(nome.toLowerCase());
        return nome;
      }
    }
    const sufixo = Math.floor(Math.random() * 9000) + 1000;
    const nomeComSufixo = `${this.aleatorio(EMOJIS_CATEGORIA)} COLEÇÃO ${sufixo}`;
    categoriasProibidas.add(nomeComSufixo.toLowerCase());
    return nomeComSufixo;
  }

  /**
   * Gera N caixas novas (por defeito 6), escolhendo skins do catálogo atual
   * e atribuindo odds automaticamente, respeitando a margem da casa.
   * Nomes e categoria são temáticos e aleatórios (sem datas), e nunca repetem
   * nada que já exista na base de dados.
   * Pode ser chamado manualmente (endpoint admin) ou pelo cron diário.
   */
  async gerarCaixasAutomaticas(quantidade: number = 6) {
    const catalogo = await (this.prisma as any).item.findMany();
    if (catalogo.length === 0) {
      throw new BadRequestException(
        'Não há itens na base de dados. Corre primeiro a sincronização do arsenal (admin.service.ts).'
      );
    }

    const caixasExistentes = await (this.prisma as any).caixa.findMany({
      select: { nome: true, categoria: true, ordem: true },
    });

    const ordemAtual0 = caixasExistentes.reduce((max: number, c: any) => Math.max(max, c.ordem || 0), 0);
    let ordemAtual = ordemAtual0 + 1;

    // Junta os nomes/categorias já usados (em minúsculas, para comparar sem
    // sensibilidade a maiúsculas) para nunca gerar nada repetido.
    const nomesProibidos = new Set<string>(caixasExistentes.map((c: any) => c.nome.toLowerCase()));
    const categoriasProibidas = new Set<string>(
      caixasExistentes.map((c: any) => (c.categoria || '').toLowerCase())
    );

    // Uma categoria nova e única para este lote — assim as 6 caixas ficam
    // agrupadas na mesma secção na loja, com um nome que nunca se repete.
    const categoriaDoLote = this.gerarCategoriaUnica(categoriasProibidas);

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

      // A imagem da caixa é uma arte 3D gerada por IA (OpenAI + ImgBB).
      // Se isso falhar por algum motivo, usa o cofre em SVG como alternativa.
      const itemDestaque = [...itens].sort((a, b) => b.preco - a.preco)[0];
      const nomeDaCaixa = this.gerarNomeUnico(nomesProibidos);
      const imagemDaCaixa =
        (await this.gerarImagemCaixaIA(nomeDaCaixa, itemDestaque, precoCaixa)) ||
        (await this.gerarImagemCaixa(itemDestaque, precoCaixa));

      const caixa = await this.criarCaixa({
        nome: nomeDaCaixa,
        preco: precoCaixa,
        imagem: imagemDaCaixa,
        itens,
        ordem: ordemAtual++,
        isEvento: false,
        categoria: categoriaDoLote,
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