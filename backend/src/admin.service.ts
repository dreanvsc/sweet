import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // 🔥 Cache para evitar rate limit da Skinport
  private ultimaAtualizacao: Date | null = null;

  async sincronizarArsenal() {
    try {
      const resSkins = await fetch('https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json');
      if (!resSkins.ok) throw new Error(`API falhou: ${resSkins.status}`);
      
      const textSkins = await resSkins.text();
      let skins = [];
      try { skins = JSON.parse(textSkins); } catch (e) { throw new Error("API devolveu HTML."); }
      const skinsValidas = skins.filter((s: any) => s.image && s.rarity);

      let dictPrecos: any = {};
      try {
        const resPrecos = await fetch('https://api.skinport.com/v1/items?app_id=730&currency=EUR&tradable=0', { headers: { 'Accept-Encoding': 'br' } });
        if (resPrecos.ok) {
          const dadosSkinport = await resPrecos.json();
          if (Array.isArray(dadosSkinport)) {
            dadosSkinport.forEach((item: any) => { 
              dictPrecos[item.market_hash_name] = item.min_price || item.suggested_price || null; 
            });
          }
        }
      } catch (e) { console.log("Aviso: A API da Skinport falhou."); }

      await (this.prisma as any).item.deleteMany();

      let contador = 0;
      const tamanhoLote = 100;

      for (let i = 0; i < skinsValidas.length; i += tamanhoLote) {
        const lote = skinsValidas.slice(i, i + tamanhoLote);
        const dadosParaGravar = lote.map((skin: any) => {
          const nomeFieldTested = `${skin.name} (Field-Tested)`;
          const nomeVanilla = skin.name; 
          let precoMercado = dictPrecos[nomeFieldTested] || dictPrecos[nomeVanilla] || 5.00;

          let tipoRaridade = 'Comum';
          if (skin.rarity.name === 'Restricted') { tipoRaridade = 'Comum'; if(precoMercado === 5) precoMercado=15; }
          else if (skin.rarity.name === 'Classified') { tipoRaridade = 'Raro'; if(precoMercado === 5) precoMercado=40; }
          else if (skin.rarity.name === 'Covert') { tipoRaridade = 'Lendário'; if(precoMercado === 5) precoMercado=120; }
          if (skin.category?.name === 'Knives' || skin.category?.name === 'Gloves') { tipoRaridade = 'Lendário'; if(precoMercado === 5) precoMercado=450; }

          return { nome: skin.name, imagem: skin.image, raridade: tipoRaridade, preco: parseFloat(Number(precoMercado).toFixed(2)) };
        });

        await (this.prisma as any).item.createMany({ data: dadosParaGravar });
        contador += dadosParaGravar.length;
      }
      return { message: `🔥 SUCESSO! ${contador} skins injetadas!` };
    } catch (error) { throw new Error('Falha ao sincronizar arsenal.'); }
  }

  async obterEstatisticas() {
    const totalUsers = await (this.prisma as any).user.count();
    const users = await (this.prisma as any).user.findMany({ select: { saldo: true } });
    const saldoEmCirculacao = users.reduce((total: number, user: any) => total + user.saldo, 0);
    const armasEmCirculacao = await (this.prisma as any).inventario.count();
    const totalCaixasCriadas = await (this.prisma as any).caixa.count();

    return { totalUsers, saldoEmCirculacao: parseFloat(saldoEmCirculacao.toFixed(2)), armasEmCirculacao, totalCaixasCriadas };
  }

  async listarUtilizadoresAdmin() {
    return await (this.prisma as any).user.findMany({
      include: { inventario: true, historicoJogo: { orderBy: { data: 'desc' }, take: 20 } }, orderBy: { id: 'asc' }
    });
  }

  async atualizarSaldoAdmin(userId: number, novoSaldo: number) {
    const user = await (this.prisma as any).user.findUnique({ where: { id: Number(userId) } });
    let valorDepositado = 0;
    if (novoSaldo > user.saldo) valorDepositado = novoSaldo - user.saldo;

    return await (this.prisma as any).user.update({
      where: { id: Number(userId) },
      data: { saldo: parseFloat(novoSaldo.toFixed(2)), totalDepositado: (user.totalDepositado || 0) + valorDepositado }
    });
  }

  async criarPromoCode(dados: { codigo: string, valor: number, limite: number }) {
    const codigoLimpo = dados.codigo.trim().toUpperCase();
    const existe = await (this.prisma as any).promoCode.findUnique({ where: { codigo: codigoLimpo } });
    if (existe) throw new Error("Esse código já existe!");

    await (this.prisma as any).promoCode.create({
      data: { codigo: codigoLimpo, valor: parseFloat(Number(dados.valor).toFixed(2)), limite: Number(dados.limite) || 100 }
    });
    return { sucesso: true, msg: `Código ${codigoLimpo} criado!` };
  }

  async usarPromoCode(userId: number, codigo: string) {
    const codigoLimpo = codigo.trim().toUpperCase();
    const promo = await (this.prisma as any).promoCode.findUnique({ where: { codigo: codigoLimpo } });
    
    if (!promo) throw new BadRequestException("Código inválido.");
    if (!promo.ativo) throw new BadRequestException("Código inativo.");
    if (promo.usos >= promo.limite) throw new BadRequestException("Limite de usos atingido.");

    const jaUsou = await (this.prisma as any).codigoUsado.findFirst({ where: { userId: Number(userId), codigo: codigoLimpo } });
    if (jaUsou) throw new BadRequestException("Já resgataste este código!");

    const user = await (this.prisma as any).user.findUnique({ where: { id: Number(userId) } });
    const novoSaldo = user.saldo + promo.valor;

    await (this.prisma as any).user.update({ where: { id: Number(userId) }, data: { saldo: parseFloat(novoSaldo.toFixed(2)) } });
    await (this.prisma as any).promoCode.update({ where: { id: promo.id }, data: { usos: promo.usos + 1 } });
    await (this.prisma as any).codigoUsado.create({ data: { userId: Number(userId), codigo: codigoLimpo } });

    return { sucesso: true, novoSaldo: parseFloat(novoSaldo.toFixed(2)), valorGanho: promo.valor };
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async atualizarPrecosMercadoNoturno() {
    console.log('🌙 [CRON] A iniciar a atualização de preços pelo Market CSGO (Otimizado)...');

    try {
      // Controlador para cancelar o pedido se demorar demasiado (Timeout de 15 segundos)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      // 1. Pedido com compressão (GZIP) e limite de tempo para ser ultra rápido
      const resPrecos = await fetch('https://market.csgo.com/api/v2/prices/EUR.json', {
        signal: controller.signal,
        headers: {
          'Accept-Encoding': 'gzip, deflate, br' // Pede o ficheiro compactado (pesa 10x menos!)
        }
      });
      
      clearTimeout(timeoutId); // Limpa o temporizador se o download correu bem

      if (!resPrecos.ok) {
        console.log(`❌ [CRON] Market CSGO devolveu status ${resPrecos.status}`);
        return { sucesso: false, message: `Market status: ${resPrecos.status}` };
      }

      console.log('📦 [CRON] Ficheiro descarregado com sucesso! A ler dados...');

      const text = await resPrecos.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.log('❌ [CRON] Erro ao decifrar os dados. API enviou formato inválido.');
        return { sucesso: false, message: 'Erro no JSON parse.' };
      }

      if (!data.success || !data.items) {
        console.log('❌ [CRON] Formato inválido devolvido pelo Market CSGO.');
        return { sucesso: false, message: 'Formato inválido' };
      }

      console.log(`⚡ [CRON] A processar ${data.items.length} itens do mercado na memória...`);

      const mapPrecos = new Map<string, number>();
      for (const itemApi of data.items) {
        if (itemApi.market_hash_name && itemApi.price) {
           mapPrecos.set(itemApi.market_hash_name, parseFloat(itemApi.price));
        }
      }

      let skinsAtualizadas = 0;
      const itensNaBaseDeDados = await this.prisma.item.findMany();

      console.log(`💾 [CRON] A injetar os novos preços em ${itensNaBaseDeDados.length} armas no teu banco de dados...`);

      for (const item of itensNaBaseDeDados) {
        const precoMercadoEuros = mapPrecos.get(item.nome);
        
        if (precoMercadoEuros && precoMercadoEuros > 0) {
          await this.prisma.item.update({
            where: { id: item.id },
            data: { preco: parseFloat(precoMercadoEuros.toFixed(2)) }
          });
          skinsAtualizadas++;
        }
      }

      console.log(`✅ [CRON] Sucesso Supremo! ${skinsAtualizadas} skins atualizadas com preços em Euros.`);
      return { sucesso: true, message: `${skinsAtualizadas} preços atualizados.` };

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('❌ [CRON] Limite de tempo esgotado (Timeout)! A API do Market CSGO demorou mais de 15 segundos a responder.');
        return { sucesso: false, message: 'Timeout na API externa.' };
      }
      console.error('❌ [CRON] Erro crítico no Market CSGO:', error.message);
      return { sucesso: false, message: 'Erro interno no CRON.' };
    }
  }

  async obterBanner() {
    const banner = await (this.prisma as any).configuracao.findMany({
      where: { chave: { startsWith: 'banner_' } }
    });
    
    const resultado: any = { imagem: '', titulo: '', descricao: '', ativo: true };
    banner.forEach((c: any) => {
      if (c.chave === 'banner_imagem') resultado.imagem = c.valor;
      if (c.chave === 'banner_titulo') resultado.titulo = c.valor;
      if (c.chave === 'banner_descricao') resultado.descricao = c.valor;
      if (c.chave === 'banner_ativo') resultado.ativo = c.valor === 'true';
    });
    return resultado;
  }

  async guardarBanner(dados: { imagem: string, titulo: string, descricao: string, ativo: boolean }) {
    const upsert = async (chave: string, valor: string) => {
      await (this.prisma as any).configuracao.upsert({
        where: { chave },
        update: { valor },
        create: { chave, valor, descricao: `Banner: ${chave}` }
      });
    };

    await upsert('banner_imagem', dados.imagem);
    await upsert('banner_titulo', dados.titulo);
    await upsert('banner_descricao', dados.descricao);
    await upsert('banner_ativo', String(dados.ativo));

    return { sucesso: true };
  }
}