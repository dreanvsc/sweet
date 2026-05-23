import { Controller, Get, Post, Body, UseGuards, Req, Res, Param, Put, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// 🔥 Importamos os 4 novos Departamentos e a Base de Dados
import { UsersService } from './users.service';
import { CaixasService } from './caixas.service';
import { UpgraderService } from './upgrader.service';
import { AdminService } from './admin.service';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  // A "Telefonista" agora conhece os 4 gerentes do casino E tem a chave do Prisma!
  constructor(
    private readonly usersService: UsersService,
    private readonly caixasService: CaixasService,
    private readonly upgraderService: UpgraderService,
    private readonly adminService: AdminService,
    private prisma: PrismaService // 🔥 A CHAVE ADICIONADA AQUI (Resolve os erros!)
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
    return await this.usersService.venderItem(body.userId, body.inventarioId);
  }


  // 🔥 NOTA: Atualizei esta rota para ser mais segura e só mostrar o inventário DESTE jogador
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
        
        // 🔥 MOTOR DE PREÇOS AFINADO E FILTRO VIP 🔥
        let precoBase = 5.0;

        // 1. Tenta usar o preço da API (se a API o fornecer)
        if (skin.price && !isNaN(parseFloat(skin.price))) {
          precoBase = parseFloat(skin.price);
        } 
        // 2. Tabela VIP de Lendas (Override de Patrão para skins milionárias)
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
        // 3. Rede de segurança por raridade para as restantes
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
          
          // Procurar primeiro pelo nome, depois decidir entre Update ou Create
          const itemExistente = await this.prisma.item.findFirst({
            where: { nome: nomeCompleto }
          });

          if (itemExistente) {
            await this.prisma.item.update({
              where: { id: itemExistente.id },
              data: { preco: precoCalculado, imagem: imagemSegura, raridade: raridadeNome }
            });
          } else {
            await this.prisma.item.create({
              data: { 
                nome: nomeCompleto, 
                preco: precoCalculado, 
                imagem: imagemSegura, 
                raridade: raridadeNome 
              }
            });
          }
        }
      }

      return { 
        sucesso: true, 
        finalizado: false, 
        proximoOffset: offset + LOTE,
        message: `Processado até à arma ${offset + LOTE}.` 
      };

    } catch (error: any) {
      console.error("Erro na sincronização:", error);
      return { sucesso: false, message: error.message };
    }
  }


  // ==========================================
  // LOGIN DA STEAM (INTOCÁVEL)
  // ==========================================
  @Get('auth/steam')
  @UseGuards(AuthGuard('steam'))
  async steamLogin() {}

  @Get('auth/steam/return')
  @UseGuards(AuthGuard('steam'))
  async steamLoginReturn(@Req() req, @Res() res) {
    const user = req.user;
    return res.redirect(`https://sweetdrop.vercel.app/?userId=${user.id}`);
  }

  // ==========================================
  // 🔥 ROTA DE SEGURANÇA: PROMOVER A ADMIN
  // ==========================================
  @Post('admin/promover')
  async promoverAdmin(@Body() body: { adminId: string, alvoId: string }) {
    // 1. Verifica se quem está a pedir é REALMENTE um Admin ou o Fundador (ID 1)
    const admin = await this.prisma.user.findUnique({ where: { id: Number(body.adminId) } });
    
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'admin' && admin.id !== 1)) {
      return { erro: 'Acesso Negado! Não tens permissão.' };
    }

    // 2. Verifica se o jogador alvo existe
    const alvo = await this.prisma.user.findUnique({ where: { id: Number(body.alvoId) } });
    if (!alvo) {
      return { erro: 'Jogador não encontrado na Base de Dados.' };
    }

    // 3. Promove o jogador a Admin!
    await this.prisma.user.update({
      where: { id: Number(body.alvoId) },
      data: { role: 'ADMIN' }
    });

    return { sucesso: true, mensagem: `${alvo.nome} foi promovido a Admin!` };
  }

  @Post('admin/despromover')
  async despromoverAdmin(@Body() body: { adminId: string, alvoId: string }) {
    // 1. Verifica se quem pede é Admin
    const admin = await this.prisma.user.findUnique({ where: { id: Number(body.adminId) } });
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'admin' && admin.id !== 1)) {
      return { erro: 'Acesso Negado! Não tens permissão.' };
    }

    const alvoIdNum = Number(body.alvoId);

    // 2. Proteções de Segurança Máxima
    if (alvoIdNum === 1) {
      return { erro: 'ERRO: Não podes despedir o Fundador!' };
    }
    if (alvoIdNum === Number(body.adminId)) {
      return { erro: 'Não podes despedir-te a ti próprio por aqui.' };
    }

    // 3. Verifica se o alvo existe
    const alvo = await this.prisma.user.findUnique({ where: { id: alvoIdNum } });
    if (!alvo) {
      return { erro: 'Jogador não encontrado na Base de Dados.' };
    }

    // 4. Retira os poderes!
    await this.prisma.user.update({
      where: { id: alvoIdNum },
      data: { role: 'USER' } // Volta a ser um jogador normal
    });

    return { sucesso: true, mensagem: `O utilizador ${alvo.nome} foi removido da equipa!` };
  }

  // =======================================================
  // 🔥 ROTA DE CÓDIGOS PROMOCIONAIS (Para o Perfil)
  // =======================================================
  @Post('codigos/resgatar')
  async resgatarCodigo(@Body() body: { userId: string, codigo: string }) {
    const idNum = Number(body.userId);
    const user = await (this.prisma as any).user.findUnique({ where: { id: idNum } });
    
    if (!user) return { erro: 'Jogador não encontrado.' };

    // 1. Procura o código na tabela correta (promoCode)
    const promo = await (this.prisma as any).promoCode.findUnique({ 
      where: { codigo: body.codigo } 
    });

    if (!promo || !promo.ativo) return { erro: 'CÓDIGO INEXISTENTE OU DESATIVADO.' };
    
    // 🔥 Correção: Agora lê 'promo.limite' em vez de 'maxUsos'
    if (promo.usos >= promo.limite) return { erro: 'ESTE CÓDIGO JÁ ATINGIU O LIMITE DE USOS.' };

    // 2. Verifica se o jogador já usou na tabela correta (codigoUsado)
    const jaUsou = await (this.prisma as any).codigoUsado.findFirst({
      where: { 
        userId: idNum, 
        codigo: promo.codigo 
      }
    });

    if (jaUsou) return { erro: 'JÁ RESGATASTE ESTE CÓDIGO ANTERIORMENTE.' };

    // 3. Adiciona o saldo ao jogador
    await (this.prisma as any).user.update({
      where: { id: idNum },
      data: { saldo: user.saldo + promo.valor }
    });

    // 4. Aumenta o contador de usos do código
    await (this.prisma as any).promoCode.update({
      where: { id: promo.id },
      data: { usos: promo.usos + 1 }
    });

    // 5. Regista que este jogador já usou este código
    await (this.prisma as any).codigoUsado.create({
      data: { 
        userId: idNum, 
        codigo: promo.codigo 
      }
    });

    return { sucesso: true, valor: promo.valor };
  }

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

  // 2. Rota para criar um novo ticket
  @Post('suporte/ticket')
  async criarTicket(@Body() body: { userId: number, assunto: string, message: string }) {
    await (this.prisma as any).ticketSuporte.create({
      data: {
        userId: Number(body.userId),
        assunto: body.assunto.toUpperCase(),
        mensagem: body.message
      }
    });
    return { Guide: true, sucesso: true };
  }

  @Get('admin/tickets')
  async adminObterTodosTickets() {
    return await (this.prisma as any).ticketSuporte.findMany({
      include: { user: true }, // Inclui os dados do jogador (nome, avatar) para saberes com quem falas!
      orderBy: { id: 'desc' }
    });
  }

  // 🔥 ADMIN: Responder a um ticket
  @Post('admin/ticket/responder')
  async adminResponderTicket(@Body() body: { ticketId: number, resposta: string, status: string }) {
    await (this.prisma as any).ticketSuporte.update({
      where: { id: Number(body.ticketId) },
      data: {
        resposta: body.resposta,
        status: body.status // Vai passar a 'RESPONDIDO' ou 'FECHADO'
      }
    });
    return { sucesso: true, msg: "Resposta enviada ao jogador!" };
  }

  @Get('suporte/livechat/:userId')
  async obterHistoricoLiveChat(@Param('userId') userId: string) {
    const chat = await (this.prisma as any).liveChat.findFirst({
      where: { 
        userId: Number(userId), 
        status: 'ABERTO' 
      },
      orderBy: { createdAt: 'desc' }, // 🔥 Ignora as antigas e vai buscar a última!
      include: { mensagens: { orderBy: { createdAt: 'asc' } } }
    });
    
    return chat || { mensagens: [] };
  }

  @Get('admin/livechats')
  async adminObterLiveChats() {
    return await (this.prisma as any).liveChat.findMany({
      where: { status: 'ABERTO' }, 
      include: { 
        user: true, 
        mensagens: { orderBy: { createdAt: 'asc' } } 
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // ====================================================================
  // 🔥 SISTEMA DE MISSÕES: SUBMISSÃO DE LINKS (DINÂMICO)
  // ====================================================================
  @Post('missoes/submeter-link')
  async submeterLinkMissao(@Body() dados: { userId: number, link: string }) {
    try {
      const { userId, link } = dados;

      // 🔥 A VACINA: Corta o link no "?" e fica só com o link puro do vídeo!
      const linkLimpo = link.split('?')[0];

      // 1. Descobrir a plataforma pelo link LIMPO
      let plataforma = '';
      if (linkLimpo.includes('tiktok.com')) plataforma = 'TikTok';
      else if (linkLimpo.includes('instagram.com')) plataforma = 'Instagram';
      else if (linkLimpo.includes('youtube.com')) plataforma = 'YouTube';
      else throw new Error('Link inválido. Usa TikTok, Instagram ou YouTube.');

      // 2. ANTI-SPAM: Verificar se o jogador já tem um vídeo pendente NESTA plataforma
      const submissaoPendente = await (this.prisma as any).submissaoMissao.findFirst({
        where: { userId: Number(userId), plataforma, status: 'PENDENTE' }
      });
      if (submissaoPendente) {
        throw new Error(`Já tens um vídeo do ${plataforma} em análise! Aguarda a nossa aprovação.`);
      }

      // 3. ANTI-BATOTA: Verificar se o LINK LIMPO já existe na base de dados
      const linkRepetido = await (this.prisma as any).submissaoMissao.findUnique({
        where: { link: linkLimpo }
      });
      if (linkRepetido) {
        throw new Error('Este link já foi utilizado. Tens de gravar um vídeo original!');
      }

      // 4. 🔥 BUSCAR O VALOR DINÂMICO AO COFRE DE CONFIGURAÇÕES!
      const configSocial = await (this.prisma as any).configuracao.findUnique({ 
        where: { chave: 'recompensa_social' }
      });
      const recompensaFinal = configSocial ? parseFloat(configSocial.valor) : 0.09;

      // 5. Guardar na Base de Dados com o LINK LIMPO e o valor extraído da DB
      await (this.prisma as any).submissaoMissao.create({
        data: {
          userId: Number(userId),
          plataforma,
          link: linkLimpo, 
          recompensa: recompensaFinal, 
          status: 'PENDENTE'
        }
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

  // ====================================================================
  // 🔥 ADMIN: MODERAÇÃO DE MISSÕES (Aprovar / Rejeitar)
  // ====================================================================

  @Get('admin/missoes/pendentes')
  async obterMissoesPendentes() {
    return await (this.prisma as any).submissaoMissao.findMany({
      where: { status: 'PENDENTE' },
      include: {
        user: { select: { nome: true, avatar: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  @Post('admin/missoes/aprovar/:id')
  async aprovarMissao(@Param('id') id: string) {
    try {
      const missaoId = Number(id);
      const missao = await (this.prisma as any).submissaoMissao.findUnique({ where: { id: missaoId }});
      
      if (!missao || missao.status !== 'PENDENTE') throw new Error('Missão inválida ou já processada.');

      await (this.prisma as any).submissaoMissao.update({
        where: { id: missaoId },
        data: { status: 'APROVADA' }
      });

      await (this.prisma as any).user.update({
        where: { id: missao.userId },
        data: { saldo: { increment: missao.recompensa } }
      });

      await (this.prisma as any).historicoJogo.create({
        data: {
          userId: missao.userId,
          acao: 'Missão Social',
          detalhe: `Vídeo do ${missao.plataforma} Aprovado`,
          valor: missao.recompensa,
          tipo: 'GANHO'
        }
      });

      return { sucesso: true, mensagem: `Missão aprovada! ${missao.recompensa}€ enviados para o jogador.` };
    } catch (error: any) {
      return { sucesso: false, mensagem: error.message };
    }
  }

  @Post('admin/missoes/rejeitar/:id')
  async rejeitarMissao(@Param('id') id: string) {
    try {
      await (this.prisma as any).submissaoMissao.update({
        where: { id: Number(id) },
        data: { status: 'REJEITADA' }
      });
      return { sucesso: true, mensagem: 'Missão rejeitada. O jogador não recebeu saldo.' };
    } catch (error: any) {
      return { sucesso: false, mensagem: error.message };
    }
  }

  // ====================================================================
  // 🔥 CONFIGURAÇÕES GLOBAIS DA COFRE
  // ====================================================================
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
        where: { chave: dados.chave },
        data: { valor: String(dados.valor) }
      });
      return { sucesso: true, mensagem: 'Valor atualizado com sucesso!' };
    } catch (error: any) {
      return { sucesso: false, message: error.message };
    }
  }

  @Put('admin/item/preco')
  async atualizarPrecoItem(@Body() body: { itemId: number, preco: number }) {
    if (!body.itemId || body.preco === undefined) {
      return { sucesso: false, message: "Dados incompletos." };
    }

    try {
      // Usa o Prisma para atualizar a skin na Base de Dados
      await this.prisma.item.update({
        where: { id: Number(body.itemId) },
        data: { preco: Number(body.preco) }
      });
      return { sucesso: true, message: "Preço atualizado com sucesso no arsenal!" };
    } catch (error) {
      console.error("Erro ao atualizar preço:", error);
      return { sucesso: false, message: "Erro interno no servidor ao atualizar preço." };
    }
  }

  // ==========================================
  // DEPARTAMENTO DE LEVANTAMENTOS (WITHDRAWS)
  // ==========================================

  // Jogador: Pede para levantar uma skin
  @Post('levantar-skin')
  async levantarSkin(@Body() body: { userId: number, inventarioId: number }) {
    try {
      return await this.usersService.solicitarLevantamento(body.userId, body.inventarioId);
    } catch (error: any) {
      return { sucesso: false, mensagem: error.message };
    }
  }

  // Admin: Vê todos os pedidos pendentes
  @Get('admin/levantamentos')
  async verLevantamentos() {
    return await this.prisma.levantamento.findMany({
      where: { status: 'PENDENTE' },
      include: { user: { select: { nome: true, avatar: true } } },
      orderBy: { dataPedido: 'asc' }
    });
  }

  // Admin: Confirma que enviou a skin na Steam
  @Post('admin/levantamentos/aprovar/:id')
  async aprovarLevantamento(@Param('id') id: string) {
    await this.prisma.levantamento.update({
      where: { id: Number(id) }, data: { status: 'CONCLUIDO' }
    });
    return { sucesso: true, mensagem: "Levantamento marcado como concluído!" };
  }

  // Admin: Rejeita (o bot da steam falhou, trade bloqueada, etc) e devolve a skin ao site
  @Post('admin/levantamentos/rejeitar/:id')
  async rejeitarLevantamento(@Param('id') id: string) {
    const pedido = await this.prisma.levantamento.findUnique({ where: { id: Number(id) } });
    if (!pedido) return { sucesso: false, mensagem: "Pedido não encontrado." };

    // Atualiza status
    await this.prisma.levantamento.update({
      where: { id: Number(id) }, data: { status: 'REJEITADA' }
    });

    // Devolve a skin ao inventário do site do jogador
    await this.prisma.inventario.create({
      data: { userId: pedido.userId, nome: pedido.skinNome, imagem: pedido.skinImagem, raridade: 'Comum', valor: pedido.valor }
    });

    return { sucesso: true, mensagem: "Levantamento cancelado. A skin voltou para a conta do jogador no site." };
  }

  @Post('utilizador/verificar-email')
  async verificarEmail(@Body() body: { userId: number }) {
    // 🔥 No futuro, isto enviaria um link real por e-mail (SMTP). 
    // Por agora, o botão ativa a conta diretamente para testares o MVP!
    await this.prisma.user.update({
      where: { id: Number(body.userId) },
      data: { emailVerificado: true }
    });
    return { sucesso: true, msg: "E-mail verificado com sucesso!" };
  }

}