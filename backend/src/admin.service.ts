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
    console.log('🌙 [CRON] A iniciar a atualização de preços pela Skinport...');

    // 🔥 Bloqueia se foi chamado há menos de 30 minutos
    if (this.ultimaAtualizacao) {
      const diffMinutos = (Date.now() - this.ultimaAtualizacao.getTime()) / 1000 / 60;
      if (diffMinutos < 30) {
        const restante = Math.ceil(30 - diffMinutos);
        console.log(`⏳ [CRON] Rate limit interno — aguarda ${restante} minutos.`);
        return { sucesso: false, message: `Aguarda ${restante} minutos para atualizar novamente.` };
      }
    }
    this.ultimaAtualizacao = new Date();

    try {
      const respostaApi = await fetch(
        'https://api.skinport.com/v1/items?app_id=730&currency=EUR',
        { headers: { 'Accept-Encoding': 'br', 'User-Agent': 'Mozilla/5.0' } }
      );

      if (!respostaApi.ok) {
        console.error(`❌ [CRON] Skinport devolveu status ${respostaApi.status}`);
        this.ultimaAtualizacao = null; // reset para permitir tentar novamente
        return { sucesso: false, message: `Skinport status: ${respostaApi.status}` };
      }

      const mercadoRaw = await respostaApi.json();

      if (!Array.isArray(mercadoRaw)) {
        console.error('❌ [CRON] Skinport devolveu formato inválido:', JSON.stringify(mercadoRaw).substring(0, 200));
        this.ultimaAtualizacao = null;
        return { sucesso: false, message: 'Skinport devolveu formato inválido.' };
      }

      console.log(`📦 [CRON] ${mercadoRaw.length} preços recebidos da Skinport.`);

      // Monta dicionário de preços
      const precosMercado: Record<string, number> = {};
      for (const skin of mercadoRaw) {
        const precoReal = skin.min_price || skin.suggested_price;
        if (precoReal) precosMercado[skin.market_hash_name] = precoReal;
      }

      // Busca todas as skins da BD
      const minhasSkins = await (this.prisma as any).item.findMany();
      let atualizadas = 0;
      let semPreco = 0;

      // 🔥 Prepara lista de updates
      const paraAtualizar: { id: number, preco: number }[] = [];
      for (const skin of minhasSkins) {
        const precoNovo = precosMercado[skin.nome];
        if (!precoNovo || precoNovo <= 0.05) { semPreco++; continue; }
        paraAtualizar.push({ id: skin.id, preco: parseFloat(precoNovo.toFixed(2)) });
        atualizadas++;
      }

      // 🔥 Executa em lotes de 200 em paralelo — muito mais rápido
      const tamanhoLote = 200;
      for (let i = 0; i < paraAtualizar.length; i += tamanhoLote) {
        const lote = paraAtualizar.slice(i, i + tamanhoLote);
        await Promise.all(
          lote.map((item) =>
            (this.prisma as any).item.update({
              where: { id: item.id },
              data: { preco: item.preco }
            })
          )
        );
        console.log(`📦 [CRON] Lote ${Math.floor(i / tamanhoLote) + 1}/${Math.ceil(paraAtualizar.length / tamanhoLote)} concluído`);
      }

      const msg = `✅ [CRON] Concluído! ${atualizadas} atualizadas, ${semPreco} sem preço na Skinport.`;
      console.log(msg);
      return { sucesso: true, atualizadas, semPreco, message: msg };

    } catch (error: any) {
      console.error('❌ [CRON] Falha:', error);
      this.ultimaAtualizacao = null;
      throw new Error(error.message || 'Falha ao comunicar com a Skinport.');
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