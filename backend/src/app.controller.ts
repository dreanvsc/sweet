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

  @Get('bonus-diario/:userId')
  async estadoBonus(@Param('userId') userId: string) {
    return await this.usersService.estadoBonusDiario(Number(userId));
  }

  @Post('resgatar-bonus')
  async resgatarBonus(@Body() body: { userId: number }) {
    return await this.usersService.resgatarBonusDiario(body.userId);
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
  async sincronizarArsenal() {
    return await this.adminService.sincronizarArsenal();
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
    return res.redirect(`http://localhost:3001/?userId=${user.id}`);
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

  // =======================================================
  // 🔥 ROTA DE CÓDIGOS PROMOCIONAIS (Para o Perfil)
  // =======================================================
  @Post('codigos/resgatar')
  async resgatarCodigo(@Body() body: { userId: string, codigo: string }) {
    const { userId, codigo } = body;
    const user = await this.prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return { erro: 'Jogador não encontrado.' };

    const promo = await (this.prisma as any).promoCode.findUnique({ where: { codigo } });

    if (!promo) return { erro: 'CÓDIGO INEXISTENTE OU EXPIRADO.' };
    if (promo.usos >= promo.maxUsos) return { erro: 'ESTE CÓDIGO JÁ ATINGIU O LIMITE DE USOS.' };

    const jaUsou = await (this.prisma as any).promoUsage.findFirst({
      where: { userId: user.id, promoId: promo.id }
    });

    if (jaUsou) return { erro: 'JÁ RESGATASTE ESTE CÓDIGO ANTERIORMENTE.' };

    await this.prisma.user.update({
      where: { id: user.id },
      data: { saldo: user.saldo + promo.valor }
    });

    await (this.prisma as any).promoCode.update({
      where: { id: promo.id },
      data: { usos: promo.usos + 1 }
    });

    await (this.prisma as any).promoUsage.create({
      data: { userId: user.id, promoId: promo.id }
    });

    return { sucesso: true, valor: promo.valor };
  }
}