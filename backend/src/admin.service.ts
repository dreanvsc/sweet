import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

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
          dadosSkinport.forEach((item: any) => { dictPrecos[item.market_hash_name] = item.suggested_price || item.min_price || item.market_price || null; });
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

  // ====================================================================
  // 🔥 O TRABALHADOR DA NOITE (VERSÃO SKINPORT - SEM API KEY) 🔥
  // ====================================================================
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async atualizarPrecosMercadoNoturno() {
    console.log('🌙 [CRON] A iniciar a atualização de preços pela Skinport...');

    try {
      // 1. Vai buscar os preços à API Pública da Skinport (GRÁTIS E SEM LOGIN)
      const respostaApi = await fetch('https://api.skinport.com/v1/items?app_id=730&currency=EUR');
      const mercadoRaw = await respostaApi.json();

      // 2. Transforma a resposta num dicionário fácil de ler
      const precosMercado: Record<string, number> = {};
      
      for (const skin of mercadoRaw) {
        const precoReal = skin.suggested_price || skin.min_price;
        if (precoReal) precosMercado[skin.market_hash_name] = precoReal;
      }

      // 3. Puxa TODAS as armas da base de dados usando 'item'
      const minhasSkins = await (this.prisma as any).item.findMany();
      let atualizadas = 0;
      let ignoradas = 0;

      // 4. O Sistema de Verificação e Segurança
      for (const skin of minhasSkins) {
        const precoNovo = precosMercado[skin.nome];

        if (precoNovo && precoNovo > 0.05) {
          
          // 🔥 CINTA DE SEGURANÇA: ANTI PUMP & DUMP 🔥
          const limiteSeguranca = skin.preco * 1.50; 

          if (precoNovo > limiteSeguranca) {
            console.log(`🚨 [ALERTA] A skin ${skin.nome} saltou de ${skin.preco}€ para ${precoNovo}€. Atualização Bloqueada!`);
            ignoradas++;
            continue;
          }

          // Se passar na segurança, atualiza o preço na Base de Dados
          await (this.prisma as any).item.update({
            where: { id: skin.id },
            data: { preco: parseFloat(precoNovo.toFixed(2)) }
          });
          atualizadas++;
        }
      }

      console.log(`✅ [CRON] Concluído! ${atualizadas} preços atualizados. ${ignoradas} manipulações bloqueadas.`);

    } catch (error) {
      console.error('❌ [CRON] Falha ao comunicar com a API da Skinport:', error);
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