import { Controller, Get, Post, Body, UseGuards, Req, Res, Param, Put, Delete, BadRequestException, NotFoundException, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UsersService } from './users.service';
import { CaixasService } from './caixas.service';
import { UpgraderService } from './upgrader.service';
import { AdminService } from './admin.service';
import { PrismaService } from './prisma.service';
import { gerarToken, verificarToken } from './steam.strategy';

@Controller()
export class AppController {
  constructor(
    private readonly usersService: UsersService,
    private readonly caixasService: CaixasService,
    private readonly upgraderService: UpgraderService,
    private readonly adminService: AdminService,
    private prisma: PrismaService 
  ) {}

  // ==========================================
  // DEPARTAMENTO DAS CAIXAS E ITENS
  // ==========================================
  @Post('abrir-caixa')
  async abrirCaixa(@Body() body: { userId: string, caixaSelecionada: any, quantidade?: number }) {
    return await this.caixasService.abrirCaixa(body);
  }

  @Get('itens')
  async listarItens() {
    return await this.caixasService.listarTodosItens();
  }

  @Get('caixas')
  async listarCaixas() {
    return await this.caixasService.listarCaixas();
  }

  @Put('admin/caixa/:id')
  async atualizarCaixa(@Param('id') id: string, @Body() body: any) {
    return this.caixasService.atualizarCaixa(Number(id), body);
  }

  @Delete('admin/caixa/:id')
  async apagarCaixa(@Param('id') id: string) {
    return this.caixasService.apagarCaixa(Number(id));
  }

  @Post('admin/caixa')
  async criarCaixa(@Body() body: any) {
    return await this.caixasService.criarCaixa(body);
  }

  // ==========================================
  // DEPARTAMENTO DOS UTILIZADORES E SALDO
  // ==========================================
  @Get('utilizador/:id')
  async getUtilizador(@Param('id') id: string) {
    return await this.usersService.getUtilizador(Number(id));
  }

  @Post('gastar-saldo')
  async gastarSaldo(@Body() body: { userId: string, valor: number }) {
    return await this.usersService.gastarSaldo(body.userId, body.valor);
  }

  @Post('depositar')
  async fazerDeposito(@Body() body: { userId: number, metodo: string, valor: number, telemovel?: string }) {
    return await this.usersService.iniciarDeposito(body);
  }

  @Get('confirmar-deposito/:txId')
  async confirmarDeposito(@Param('txId') txId: string) {
    return await this.usersService.confirmarDeposito(Number(txId));
  }

  @Post('vender-item')
  async venderItem(@Body() body: { userId: number, inventarioId: number }) {
    // 🔥 O reencaminhamento está perfeito! O bug está dentro desta função no users.service.ts
    return await this.usersService.venderItem(body.userId, body.inventarioId);
  }

  @Get('meu-inventario/:userId')
  async verInventario(@Param('userId') userId: string) {
    return await this.usersService.verInventario(Number(userId));
  }

  // ==========================================
  // DEPARTAMENTO DO UPGRADER
  // ==========================================
  @Post('upgrade')
  async upgrade(@Body() body: { userId: number, skinIds: number[], alvoId: number }) {
    return await this.upgraderService.realizarUpgrade(body);
  }

  // ==========================================
  // DEPARTAMENTO DO ADMIN E SISTEMA
  // ==========================================
  @Get('admin/estatisticas')
  async obterEstatisticas() {
    return await this.adminService.obterEstatisticas();
  }

  @Get('admin/utilizadores')
  async listarUtilizadoresAdmin() {
    return await this.adminService.listarUtilizadoresAdmin();
  }

  @Post('admin/utilizador/saldo')
  async atualizarSaldoAdmin(@Body() body: { userId: number, novoSaldo: number }) {
    return await this.adminService.atualizarSaldoAdmin(body.userId, body.novoSaldo);
  }

  @Post('admin/criar-promo')
  async criarPromo(@Body() body: { codigo: string, valor: number, limite: number }) {
    return await this.adminService.criarPromoCode(body);
  }

  @Post('resgatar-promo')
  async usarPromo(@Body() body: { userId: number, codigo: string }) {
    return await this.adminService.usarPromoCode(body.userId, body.codigo);
  }

  @Post('sincronizar-arsenal')
  async sincronizarArsenal(@Body() body: { offset: number }) {
    const offset = body.offset || 0; 
    const LOTE = 200; 

    try {
      const respostaApi = await fetch('https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json');
      const skinsCruas = await respostaApi.json();

      const loteSkins = skinsCruas.slice(offset, offset + LOTE);
      if (loteSkins.length === 0) return { sucesso: true, finalizado: true, message: "Todas as skins carregadas!" };

      const qualidades = [
        { sufixo: ' (Factory New)', multiplicador: 1.45 },
        { sufixo: ' (Minimal Wear)', multiplicador: 1.15 },
        { sufixo: ' (Field-Tested)', multiplicador: 1.00 },
        { sufixo: ' (Well-Worn)', multiplicador: 0.85 },
        { sufixo: ' (Battle-Scarred)', multiplicador: 0.55 }
      ];

      for (const skin of loteSkins) {
        if (!skin.name) continue;
        const raridadeNome = skin.rarity?.name || 'Mil-Spec Grade';
        const imagemSegura = skin.image || '/skins/glock.png';
        
        let precoBase = 5.0;

        if (skin.price && !isNaN(parseFloat(skin.price))) precoBase = parseFloat(skin.price);
        else if (skin.name.includes('Dragon Lore')) precoBase = 6500.0;
        else if (skin.name.includes('Gungnir')) precoBase = 7000.0;
        else if (skin.name.includes('Howl')) precoBase = 4500.0;
        else if (skin.name.includes('Wild Lotus')) precoBase = 3500.0;
        else if (skin.name.includes('Fire Serpent')) precoBase = 800.0;
        else if (skin.name.includes('Medusa')) precoBase = 2000.0;
        else if (skin.name.includes('Prince')) precoBase = 2500.0;
        else if (skin.name.includes('Fade') && skin.name.includes('Butterfly')) precoBase = 2800.0;
        else if (skin.name.includes('Doppler') && skin.name.includes('Karambit')) precoBase = 1200.0;
        else if (skin.name.includes('Vanilla') && skin.name.includes('Butterfly')) precoBase = 1800.0;
        else {
          if (raridadeNome.includes('Covert')) precoBase = 120.0;
          else if (raridadeNome.includes('Classified')) precoBase = 45.0;
          else if (raridadeNome.includes('Restricted')) precoBase = 15.0;
          else if (raridadeNome.includes('Mil-Spec')) precoBase = 5.0;
          else precoBase = 2.0;
        }

        for (const q of qualidades) {
          const nomeCompleto = `${skin.name}${q.sufixo}`;
          const precoCalculado = Math.max(0.03, parseFloat((precoBase * q.multiplicador).toFixed(2)));
          
          const itemExistente = await this.prisma.item.findFirst({ where: { nome: nomeCompleto } });

          if (itemExistente) {
            await this.prisma.item.update({
              where: { id: itemExistente.id },
              data: { preco: precoCalculado, imagem: imagemSegura, raridade: raridadeNome }
            });
          } else {
            await this.prisma.item.create({
              data: { nome: nomeCompleto, preco: precoCalculado, imagem: imagemSegura, raridade: raridadeNome }
            });
          }
        }
      }

      return { sucesso: true, finalizado: false, proximoOffset: offset + LOTE, message: `Processado até à arma ${offset + LOTE}.` };
    } catch (error: any) {
      return { sucesso: false, message: error.message };
    }
  }

  // ==========================================
  // LOGIN DA STEAM
  // ==========================================
  // 1. A porta onde o teu SITE bate (SEM o api/)
  @Get('auth/steam')
  @UseGuards(AuthGuard('steam'))
  async steamLogin() {}

  // 2. A porta onde a STEAM devolve o jogador (COM o api/)
  @Get('api/auth/steam/return')
  @UseGuards(AuthGuard('steam'))
  async steamLoginReturn(@Req() req, @Res() res) {
    const token = gerarToken(req.user.id);
    return res.redirect(`https://sweetdrop.pt/?token=${token}`);
  }

  // ==========================================
  // ADMIN E CÓDIGOS PROMOCIONAIS
  // ==========================================
  @Post('admin/promover')
  async promoverAdmin(@Body() body: { adminId: string, alvoId: string }) {
    const admin = await this.prisma.user.findUnique({ where: { id: Number(body.adminId) } });
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'admin' && admin.id !== 1)) {
      return { erro: 'Acesso Negado! Não tens permissão.' };
    }

    const alvo = await this.prisma.user.findUnique({ where: { id: Number(body.alvoId) } });
    if (!alvo) return { erro: 'Jogador não encontrado na Base de Dados.' };

    await this.prisma.user.update({
      where: { id: Number(body.alvoId) },
      data: { role: 'ADMIN' }
    });

    return { sucesso: true, mensagem: `${alvo.nome} foi promovido a Admin!` };
  }

  @Post('admin/despromover')
  async despromoverAdmin(@Body() body: { adminId: string, alvoId: string }) {
    const admin = await this.prisma.user.findUnique({ where: { id: Number(body.adminId) } });
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'admin' && admin.id !== 1)) return { erro: 'Acesso Negado!' };

    const alvoIdNum = Number(body.alvoId);
    if (alvoIdNum === 1) return { erro: 'ERRO: Não podes despedir o Fundador!' };
    if (alvoIdNum === Number(body.adminId)) return { erro: 'Não podes despedir-te a ti próprio por aqui.' };

    const alvo = await this.prisma.user.findUnique({ where: { id: alvoIdNum } });
    if (!alvo) return { erro: 'Jogador não encontrado.' };

    await this.prisma.user.update({
      where: { id: alvoIdNum },
      data: { role: 'USER' } 
    });

    return { sucesso: true, mensagem: `O utilizador ${alvo.nome} foi removido da equipa!` };
  }

  @Post('codigos/resgatar')
  async resgatarCodigo(@Body() body: { userId: string, codigo: string }) {
    try {
      // 🔥 CADEADO DE SEGURANÇA: Usamos uma Transação para não haver uso duplo se a net falhar
      return await this.prisma.$transaction(async (prisma: any) => {
        const idNum = Number(body.userId);
        const user = await prisma.user.findUnique({ where: { id: idNum } });
        if (!user) throw new BadRequestException('Jogador não encontrado.');

        const promo = await prisma.promoCode.findUnique({ where: { codigo: body.codigo } });
        if (!promo || !promo.ativo) throw new BadRequestException('CÓDIGO INEXISTENTE OU DESATIVADO.');
        if (promo.usos >= promo.limite) throw new BadRequestException('ESTE CÓDIGO JÁ ATINGIU O LIMITE DE USOS.');

        const jaUsou = await prisma.codigoUsado.findFirst({ where: { userId: idNum, codigo: promo.codigo } });
        if (jaUsou) throw new BadRequestException('JÁ RESGATASTE ESTE CÓDIGO ANTERIORMENTE.');

        await prisma.user.update({ where: { id: idNum }, data: { saldo: user.saldo + promo.valor } });
        await prisma.promoCode.update({ where: { id: promo.id }, data: { usos: promo.usos + 1 } });
        await prisma.codigoUsado.create({ data: { userId: idNum, codigo: promo.codigo } });

        return { sucesso: true, valor: promo.valor };
      });
    } catch (error: any) {
      return { erro: error.message || 'Erro ao resgatar código.' };
    }
  }

  // ==========================================
  // OUTRAS CONFIGURAÇÕES E SUPORTE
  // ==========================================
  @Post('utilizador/configuracoes')
  async atualizarConfiguracoes(@Body() body: { userId: number, tradeUrl?: string, email?: string, newsletter?: boolean }) {
    const updateData: any = {};
    if (body.tradeUrl !== undefined) updateData.tradeUrl = body.tradeUrl;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.newsletter !== undefined) updateData.newsletter = body.newsletter;

    await (this.prisma as any).user.update({
      where: { id: Number(body.userId) },
      data: updateData
    });

    return { sucesso: true, msg: "Configurações guardadas com sucesso!" };
  }

  @Get('utilizador/historico/:userId')
  async obterHistorico(@Param('userId') userId: string) {
    return await (this.prisma as any).historicoJogo.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: 'desc' }, 
      take: 50
    });
  }

  @Get('suporte/tickets/:userId')
  async obterTicketsUtilizador(@Param('userId') userId: string) {
    return await (this.prisma as any).ticketSuporte.findMany({
      where: { userId: Number(userId) },
      orderBy: { id: 'desc' }
    });
  }

  @Post('suporte/ticket')
  async criarTicket(@Body() body: { userId: number, assunto: string, message: string }) {
    await (this.prisma as any).ticketSuporte.create({
      data: { userId: Number(body.userId), assunto: body.assunto.toUpperCase(), mensagem: body.message }
    });
    return { Guide: true, sucesso: true };
  }

  @Get('admin/tickets')
  async adminObterTodosTickets() {
    return await (this.prisma as any).ticketSuporte.findMany({
      include: { user: true },
      orderBy: { id: 'desc' }
    });
  }

  @Post('admin/ticket/responder')
  async adminResponderTicket(@Body() body: { ticketId: number, resposta: string, status: string }) {
    await (this.prisma as any).ticketSuporte.update({
      where: { id: Number(body.ticketId) },
      data: { resposta: body.resposta, status: body.status }
    });
    return { sucesso: true, msg: "Resposta enviada ao jogador!" };
  }

  @Get('suporte/livechat/:userId')
  async obterHistoricoLiveChat(@Param('userId') userId: string) {
    const chat = await (this.prisma as any).liveChat.findFirst({
      where: { userId: Number(userId), status: 'ABERTO' },
      orderBy: { createdAt: 'desc' },
      include: { mensagens: { orderBy: { createdAt: 'asc' } } }
    });
    return chat || { mensagens: [] };
  }

  @Get('admin/livechats')
  async adminObterLiveChats() {
    return await (this.prisma as any).liveChat.findMany({
      where: { status: 'ABERTO' }, 
      include: { user: true, mensagens: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  // ==========================================
  // MISSÕES
  // ==========================================
  @Post('missoes/submeter-link')
  async submeterLinkMissao(@Body() dados: { userId: number, link: string }) {
    try {
      const { userId, link } = dados;
      const linkLimpo = link.split('?')[0];

      let plataforma = '';
      if (linkLimpo.includes('tiktok.com')) plataforma = 'TikTok';
      else if (linkLimpo.includes('instagram.com')) plataforma = 'Instagram';
      else if (linkLimpo.includes('youtube.com')) plataforma = 'YouTube';
      else throw new Error('Link inválido. Usa TikTok, Instagram ou YouTube.');

      const submissaoPendente = await (this.prisma as any).submissaoMissao.findFirst({
        where: { userId: Number(userId), plataforma, status: 'PENDENTE' }
      });
      if (submissaoPendente) throw new Error(`Já tens um vídeo do ${plataforma} em análise! Aguarda a nossa aprovação.`);

      const linkRepetido = await (this.prisma as any).submissaoMissao.findUnique({ where: { link: linkLimpo } });
      if (linkRepetido) throw new Error('Este link já foi utilizado. Tens de gravar um vídeo original!');

      const configSocial = await (this.prisma as any).configuracao.findUnique({ where: { chave: 'recompensa_social' } });
      const recompensaFinal = configSocial ? parseFloat(configSocial.valor) : 0.09;

      await (this.prisma as any).submissaoMissao.create({
        data: { userId: Number(userId), plataforma, link: linkLimpo, recompensa: recompensaFinal, status: 'PENDENTE' }
      });

      return { sucesso: true, mensagem: 'Vídeo enviado com sucesso para análise!' };
    } catch (error: any) {
      return { sucesso: false, mensagem: error.message };
    }
  }

  @Get('missoes/status/:userId')
  async obterStatusMissoesUser(@Param('userId') userId: string) {
    try {
      const submissoes = await (this.prisma as any).submissaoMissao.findMany({
        where: { userId: Number(userId) }
      });

      const statusFinal = { tiktok: 'LIVRE', instagram: 'LIVRE', youtube: 'LIVRE' };
      submissoes.forEach((sub: any) => {
        if (sub.plataforma === 'TikTok') statusFinal.tiktok = sub.status;
        if (sub.plataforma === 'Instagram') statusFinal.instagram = sub.status;
        if (sub.plataforma === 'YouTube') statusFinal.youtube = sub.status;
      });

      return statusFinal;
    } catch (error) {
      return { erro: 'Erro ao buscar missões' };
    }
  }

  @Get('admin/missoes/pendentes')
  async obterMissoesPendentes() {
    return await (this.prisma as any).submissaoMissao.findMany({
      where: { status: 'PENDENTE' },
      include: { user: { select: { nome: true, avatar: true } } },
      orderBy: { createdAt: 'asc' }
    });
  }

  @Post('admin/missoes/aprovar/:id')
  async aprovarMissao(@Param('id') id: string) {
    try {
      // 🔥 CADEADO DE SEGURANÇA: Transação garante que tudo é salvo junto!
      await this.prisma.$transaction(async (prisma: any) => {
        const missaoId = Number(id);
        const missao = await prisma.submissaoMissao.findUnique({ where: { id: missaoId }});
        
        if (!missao || missao.status !== 'PENDENTE') throw new Error('Missão inválida ou já processada.');

        await prisma.submissaoMissao.update({ where: { id: missaoId }, data: { status: 'APROVADA' } });
        await prisma.user.update({ where: { id: missao.userId }, data: { saldo: { increment: missao.recompensa } } });
        await prisma.historicoJogo.create({
          data: { userId: missao.userId, acao: 'Missão Social', detalhe: `Vídeo do ${missao.plataforma} Aprovado`, valor: missao.recompensa, tipo: 'GANHO' }
        });
      });
      return { sucesso: true, mensagem: `Missão aprovada com sucesso e saldo entregue!` };
    } catch (error: any) {
      return { sucesso: false, mensagem: error.message };
    }
  }

  @Post('admin/missoes/rejeitar/:id')
  async rejeitarMissao(@Param('id') id: string) {
    try {
      await (this.prisma as any).submissaoMissao.update({
        where: { id: Number(id) }, data: { status: 'REJEITADA' }
      });
      return { sucesso: true, mensagem: 'Missão rejeitada. O jogador não recebeu saldo.' };
    } catch (error: any) {
      return { sucesso: false, mensagem: error.message };
    }
  }

  // ==========================================
  // CONFIGURAÇÕES GLOBAIS
  // ==========================================
  @Get('config')
  async obterConfiguracoes() {
    let configs = await (this.prisma as any).configuracao.findMany();
    if (configs.length === 0) {
      await (this.prisma as any).configuracao.createMany({
        data: [
          { chave: 'recompensa_social', valor: '0.09', descricao: 'Recompensa por vídeo (TikTok, Insta, YT)' },
          { chave: 'recompensa_discord', valor: '0.03', descricao: 'Recompensa por entrar no Discord' },
          { chave: 'recompensa_email', valor: '0.03', descricao: 'Recompensa por validar E-mail' }
        ]
      });
      configs = await (this.prisma as any).configuracao.findMany();
    }
    return configs;
  }

  @Post('admin/config')
  async atualizarConfiguracao(@Body() dados: { chave: string, valor: string }) {
    try {
      await (this.prisma as any).configuracao.update({
        where: { chave: dados.chave }, data: { valor: String(dados.valor) }
      });
      return { sucesso: true, mensagem: 'Valor atualizado com sucesso!' };
    } catch (error: any) {
      return { sucesso: false, message: error.message };
    }
  }

  @Put('admin/item/preco')
  async atualizarPrecoItem(@Body() body: { itemId: number, preco: number }) {
    if (!body.itemId || body.preco === undefined) return { sucesso: false, message: "Dados incompletos." };
    try {
      await this.prisma.item.update({
        where: { id: Number(body.itemId) }, data: { preco: Number(body.preco) }
      });
      return { sucesso: true, message: "Preço atualizado com sucesso no arsenal!" };
    } catch (error) {
      return { sucesso: false, message: "Erro interno no servidor ao atualizar preço." };
    }
  }

  // ==========================================
  // LEVANTAMENTOS
  // ==========================================
  @Post('levantar-skin')
  async levantarSkin(@Body() body: { userId: number, inventarioId: number }) {
    try {
      return await this.usersService.solicitarLevantamento(body.userId, body.inventarioId);
    } catch (error: any) {
      return { sucesso: false, mensagem: error.message };
    }
  }

  @Get('admin/levantamentos')
  async verLevantamentos() {
    return await this.prisma.levantamento.findMany({
      where: { status: 'PENDENTE' },
      include: { user: { select: { nome: true, avatar: true } } },
      orderBy: { dataPedido: 'asc' }
    });
  }

  @Post('admin/levantamentos/aprovar/:id')
  async aprovarLevantamento(@Param('id') id: string) {
    await this.prisma.levantamento.update({
      where: { id: Number(id) }, data: { status: 'CONCLUIDO' }
    });
    return { sucesso: true, mensagem: "Levantamento marcado como concluído!" };
  }

  @Post('admin/levantamentos/rejeitar/:id')
  async rejeitarLevantamento(@Param('id') id: string) {
    try {
      // 🔥 CADEADO DE SEGURANÇA: Rejeitar um levantamento também exige transação para não duplicar armas!
      await this.prisma.$transaction(async (prisma: any) => {
        const pedido = await prisma.levantamento.findUnique({ where: { id: Number(id) } });
        if (!pedido) throw new Error("Pedido não encontrado.");

        await prisma.levantamento.update({ where: { id: Number(id) }, data: { status: 'REJEITADA' } });
        await prisma.inventario.create({
          data: { userId: pedido.userId, nome: pedido.skinNome, imagem: pedido.skinImagem, raridade: 'Comum', valor: pedido.valor }
        });
      });
      return { sucesso: true, mensagem: "Levantamento cancelado. A skin voltou para a conta do jogador no site." };
    } catch (error: any) {
      return { sucesso: false, mensagem: error.message };
    }
  }

  // ==========================================
  // VERIFICAÇÕES DE CONTA E EMAIL
  // ==========================================
  @Post('utilizador/pedir-codigo')
  async pedirCodigoVerificacao(@Body() body: { userId: number, email: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: Number(body.userId) } });
    if (!user) return { sucesso: false, msg: "Utilizador não encontrado." };

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.user.update({
      where: { id: Number(body.userId) },
      data: { codigoVerificacao: codigo, email: body.email } 
    });

    try {
      // Movido para dentro do try para evitar crash se a lib falhar
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: 'o-teu-email@gmail.com', pass: 'a-tua-password-de-aplicacao' }
      });

      console.log(`[ALERTA] CÓDIGO GERADO PARA ${body.email}: ${codigo}`);

      await transporter.sendMail({
        from: '"Sweet Drop" <o-teu-email@gmail.com>',
        to: body.email,
        subject: 'Código de Verificação - Sweet Drop',
        html: `
          <div style="background-color: #121215; color: white; padding: 30px; font-family: sans-serif; text-align: center; border-radius: 10px;">
            <h2 style="color: #10b981;">Verificação de E-mail</h2>
            <p>O teu código de verificação para o SweetDrop é:</p>
            <h1 style="background-color: #1b1b1e; padding: 15px; letter-spacing: 5px; border: 1px solid #10b981; display: inline-block;">${codigo}</h1>
          </div>
        `
      });
    } catch (err) {
      console.log("Aviso: Falha ao enviar e-mail. Verifica as credenciais.");
    }

    return { sucesso: true, msg: "Código enviado! Verifica a tua caixa de entrada." };
  }

  @Post('utilizador/confirmar-codigo')
  async confirmarCodigo(@Body() body: { userId: number, codigo: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: Number(body.userId) } });
    if (user?.codigoVerificacao === body.codigo.trim()) {
      await this.prisma.user.update({
        where: { id: Number(body.userId) },
        data: { emailVerificado: true, codigoVerificacao: null }
      });
      return { sucesso: true, msg: "E-mail verificado com sucesso!" };
    }
    return { sucesso: false, msg: "Código incorreto. Tenta novamente." };
  }

  @Post('utilizador/pedir-verificacao')
  async pedirVerificacao(@Body() body: { userId: number }) {
    await this.prisma.user.update({
      where: { id: Number(body.userId) }, data: { pedidoVerificacao: true }
    });
    return { sucesso: true, msg: "Pedido enviado! Aguarda a aprovação da administração." };
  }

  @Get('admin/verificacoes-pendentes')
  async getVerificacoes() {
    return this.prisma.user.findMany({
      where: { pedidoVerificacao: true, contaVerificada: false },
      select: { id: true, username: true, nome: true, avatar: true, tradeUrl: true } 
    });
  }

  @Post('admin/aprovar-verificacao/:id')
  async aprovarVerificacao(@Param('id') id: string) {
    await this.prisma.user.update({
      where: { id: Number(id) }, data: { contaVerificada: true, pedidoVerificacao: false }
    });
    return { sucesso: true };
  }

  @Post('admin/rejeitar-verificacao/:id')
  async rejeitarVerificacao(@Param('id') id: string) {
    await this.prisma.user.update({
      where: { id: Number(id) }, data: { pedidoVerificacao: false } 
    });
    return { sucesso: true };
  }

  @Post('pagamentos/webhook')
  async cryptoWebhook(@Body() body: any) {
    if (body.payment_status === 'finished' || body.payment_status === 'completed') {
      const txId = body.order_id; 
      try {
        await this.usersService.confirmarDeposito(Number(txId));
        console.log(`💰 SUCESSO: Depósito Crypto #${txId} confirmado! Dinheiro a caminho da carteira!`);
      } catch (e) {
        console.log(`Aviso: Tentativa de re-confirmar o depósito #${txId}.`);
      }
    }
    return "OK";
  }

  @Get('skins-disponiveis')
  async obterSkins() {
    return this.prisma.item.findMany({
      select: {
        id: true,
        nome: true,
        imagem: true,
        preco: true,
      },
      orderBy: { nome: 'asc' },
    });
  }

  @Put('caixas/:id/evento')
  async alternarEventoCaixa(@Param('id') id: string, @Body() body: { isEvento: boolean }) {
    return await this.prisma.caixa.update({
      where: { id: Number(id) },
      data: { isEvento: body.isEvento }
    });
  }

  @Post('admin/caixa/toggle-evento/:id')
  async toggleEventoCaixa(@Param('id') id: string) {
    const caixa = await this.prisma.caixa.findUnique({
      where: { id: Number(id) }
    });

    if (!caixa) throw new NotFoundException('Caixa não encontrada');

    const caixaAtualizada = await this.prisma.caixa.update({
      where: { id: Number(id) },
      data: { isEvento: !caixa.isEvento }
    });

    return caixaAtualizada;
  }

  @Get('admin/banner')
  async obterBanner() {
    return await this.adminService.obterBanner();
  }

  @Post('admin/banner')
  async guardarBanner(@Body() body: { imagem: string, titulo: string, descricao: string, ativo: boolean }) {
    return await this.adminService.guardarBanner(body);
  }
  
  // Buscar inventário Steam via Waxpeer
  @Get('deposito-skins/inventario/:userId')
  async buscarInventarioSkins(@Param('userId') userId: string, @Query('tradeUrl') tradeUrl: string) {
    const user = await this.prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return { items: [] };
    
    const steamId = user.username;
    
    // 1️⃣ Busca inventário Steam
    const resInv = await fetch(
      `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=100`
    );
    const dataInv = await resInv.json();
    
    if (!dataInv || !dataInv.assets) return { items: [] };

    // 2️⃣ Monta lista de items tradeable (da mochila do utilizador)
    const items = dataInv.assets.map((asset: any) => {
      const desc = dataInv.descriptions.find(
        (d: any) => d.classid === asset.classid && d.instanceid === asset.instanceid
      );
      return {
        item_id: asset.assetid,
        name: desc?.market_hash_name || 'Unknown',
        image: desc?.icon_url || '',
        price: 0,
        tradable: desc?.tradable === 1
      };
    }).filter((i: any) => i.tradable && i.name !== 'Unknown');

    // 3️⃣ Busca preços ao Market CSGO (Rápido, anti-bloqueio, em Euros reais)
    try {
      const resPrecos = await fetch('https://market.csgo.com/api/v2/prices/EUR.json', {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br'
        }
      });
      
      if (!resPrecos.ok) {
        console.log('⚠️ Market CSGO falhou. A devolver itens com preço 0.');
        return { items };
      }

      const text = await resPrecos.text();
      let dataPrecos;
      try {
        dataPrecos = JSON.parse(text);
      } catch (e) {
        return { items };
      }

      if (!dataPrecos.success || !dataPrecos.items) {
         return { items };
      }

      // Constrói o "Dicionário" em memória num milissegundo
      const mapPrecos = new Map<string, number>();
      for (const itemApi of dataPrecos.items) {
        if (itemApi.market_hash_name && itemApi.price) {
           mapPrecos.set(itemApi.market_hash_name, parseFloat(itemApi.price));
        }
      }

      // Cola o preço em cada arma da mochila do utilizador
      const itemsComPreco = items.map((item: any) => {
        const precoMercado = mapPrecos.get(item.name) || 0;
        
        return {
          ...item,
          // O frontend espera o preço em cêntimos (ex: 15.50€ -> 1550).
          // Math.floor para não haver bugs de arredondamento em pagamentos.
          price: precoMercado > 0 ? Math.floor(precoMercado * 1000) : 0
        };
      });

      return { items: itemsComPreco };

    } catch (e) {
      console.error('❌ Erro ao cruzar inventário com preços:', e);
      return { items };
    }
  }

  // Criar troca Waxpeer
  @Post('deposito-skins/criar')
  async criarDepositoSkins(@Body() body: { userId: string, tradeUrl: string, items: any[] }) {
    try {
      await Promise.all(
        body.items.map((item: any) =>
          (this.prisma as any).depositoSkin.create({
            data: {
              userId: Number(body.userId),
              skinNome: item.name,
              skinImagem: item.image || '',
              skinAssetId: item.item_id?.toString() || '',
              valor: parseFloat((item.price / 1000).toFixed(2)),
              status: 'PENDENTE'
            }
          })
        )
      );
      const valorTotal = body.items.reduce((acc: number, i: any) => acc + (i.price / 1000), 0);
      return { sucesso: true, mensagem: `Skins registadas! Envia para o nosso Trade URL e aguarda confirmação.`, valorTotal: valorTotal.toFixed(2) };
    } catch (e: any) {
      return { sucesso: false, mensagem: 'Erro ao registar pedido.' };
    }
  }

  @Post('admin/injetar-saldo')
  async injetarSaldo(@Body() body: { adminId: string, alvoId: string, valor: number }) {
    const { adminId, alvoId, valor } = body;

    // 1. Validação de segurança básica
    if (!adminId || !alvoId || !valor || valor <= 0) {
      return { sucesso: false, erro: 'Dados inválidos ou valor zero.' };
    }

    try {
      // 2. CONVERSÃO PARA NÚMERO: Converter os IDs recebidos do Frontend
      const idAdminNum = Number(adminId);
      const idAlvoNum = Number(alvoId);

      if (isNaN(idAdminNum) || isNaN(idAlvoNum)) {
        return { sucesso: false, erro: 'Os IDs fornecidos têm de ser números válidos.' };
      }

      // 3. SEGURANÇA: Verificar se quem está a pedir é mesmo o Admin/Patrão
      // 🔥 Ajustado para 'this.prisma.user'
      const admin = await this.prisma.user.findUnique({
        where: { id: idAdminNum }
      });

      if (!admin || (admin.role !== 'admin' && admin.role !== 'ADMIN' && idAdminNum !== 1)) {
        return { sucesso: false, erro: 'Acesso negado! Não és um Administrador.' };
      }

      // 4. O COFRE: Injetar o dinheiro na conta do jogador (Incremento numérico)
      // 🔥 Ajustado para 'this.prisma.user'
      await this.prisma.user.update({
        where: { id: idAlvoNum },
        data: {
          saldo: {
            increment: parseFloat(valor.toString())
          }
        }
      });

      console.log(`🏦 BANCO: Admin #${idAdminNum} injetou ${valor}€ na conta #${idAlvoNum}`);
      return { sucesso: true, mensagem: `Injeção de ${valor}€ concluída com sucesso!` };

    } catch (error) {
      console.error("Erro no Banco Central:", error);
      return { sucesso: false, erro: 'Erro ao injetar. O ID do jogador existe na Base de Dados?' };
    }
  }

  @Post('admin/atualizar-precos')
  async atualizarPrecos() {
    this.adminService.atualizarPrecosMercadoNoturno()
      .then(r => console.log('✅ Preços:', r))
      .catch(err => console.error('❌ Erro:', err));
    return { sucesso: true, message: 'Atualização iniciada! Verifica os logs.' };
  }

  // 🔥 Lista depósitos de skins pendentes para o admin
  @Get('admin/depositos-skins')
  async listarDepositosSkins() {
    return await (this.prisma as any).depositoSkin.findMany({
      where: { status: 'PENDENTE' },
      include: { user: { select: { nome: true, avatar: true, tradeUrl: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 🔥 Confirma depósito e credita saldo
  @Post('admin/depositos-skins/confirmar/:id')
  async confirmarDepositoSkin(@Param('id') id: string) {
    const deposito = await (this.prisma as any).depositoSkin.findUnique({ 
      where: { id: Number(id) } 
    });
    if (!deposito) return { sucesso: false, mensagem: 'Pedido não encontrado.' };
    await (this.prisma as any).depositoSkin.update({
      where: { id: Number(id) }, data: { status: 'CONFIRMADO' }
    });
    await this.usersService.adicionarSaldo(deposito.userId, deposito.valor);
    return { sucesso: true, mensagem: `${deposito.valor}€ creditados!` };
  }

  // 🔥 Rejeita depósito de skin
  @Post('admin/depositos-skins/rejeitar/:id')
  async rejeitarDepositoSkin(@Param('id') id: string) {
    await (this.prisma as any).depositoSkin.update({
      where: { id: Number(id) }, data: { status: 'REJEITADO' }
    });
    return { sucesso: true };
  }

  @Get('auth/me')
  async getMe(@Req() req) {
    const auth = req.headers.authorization;
    if (!auth) return { erro: 'Sem token' };
    const token = auth.replace('Bearer ', '');
    const payload = verificarToken(token);
    if (!payload) return { erro: 'Token inválido' };
    return await this.usersService.getUtilizador(payload.userId);
  }


  @Post('admin/promover-streamer')
  async promoverStreamer(@Body() body: { adminId: string, alvoId: string }) {
    await this.prisma.user.update({
      where: { id: Number(body.alvoId) },
      data: { role: 'STREAMER' }
    });
    return { sucesso: true, mensagem: `Jogador #${body.alvoId} promovido a Parceiro VIP com sucesso!` };
  }

  // 🔥 ADICIONA O "admin/" AQUI NO @POST TAMBÉM
  @Post('admin/despromover-streamer')
  async despromoverStreamer(@Body() body: { adminId: string, alvoId: string }) {
    await this.prisma.user.update({
      where: { id: Number(body.alvoId) },
      data: { role: 'USER' }
    });
    return { sucesso: true, mensagem: `Acesso VIP do jogador #${body.alvoId} foi revogado.` };
  }
}