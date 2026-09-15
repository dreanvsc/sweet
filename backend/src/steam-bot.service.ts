import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// npm install steam-user steamcommunity steam-tradeoffer-manager steam-totp
const SteamUser = require('steam-user');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const SteamTotp = require('steam-totp');

@Injectable()
export class SteamBotService implements OnModuleInit {
  private readonly logger = new Logger(SteamBotService.name);

  private client = new SteamUser();
  private community = new SteamCommunity();
  private manager: any;

  // Preenchido depois do login, útil para gerar o link de depósito de cada utilizador
  public botSteamId: string | null = null;

  // Evita creditar duas vezes a mesma troca (ex: se o servidor reiniciar
  // a meio e o evento voltar a disparar durante o polling inicial).
  private ofertasJaProcessadas = new Set<string>();

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Só liga o bot automaticamente se as credenciais estiverem configuradas.
    // Assim não rebenta o arranque do servidor enquanto ainda estás a testar.
    if (!process.env.STEAM_BOT_USERNAME) {
      this.logger.warn(
        'STEAM_BOT_USERNAME não definida — bot da Steam desligado.',
      );
      return;
    }

    this.manager = new TradeOfferManager({
      steam: this.client,
      community: this.community,
      language: 'pt',
      pollInterval: 10000, // verifica novas trades a cada 10s
      cancelTime: 10 * 60 * 1000, // cancela trades não confirmadas ao fim de 10 min
    });

    this.registerEventHandlers();
    this.login();
  }

  private login() {
    this.logger.log('A ligar à Steam...');

    this.client.logOn({
      accountName: process.env.STEAM_BOT_USERNAME,
      password: process.env.STEAM_BOT_PASSWORD,
      twoFactorCode: SteamTotp.generateAuthCode(
        process.env.STEAM_BOT_SHARED_SECRET,
      ),
    });
  }

  private registerEventHandlers() {
    this.client.on('loggedOn', () => {
      this.botSteamId = this.client.steamID.getSteamID64();
      this.logger.log(`Bot ligado à Steam como ${this.botSteamId}`);
      this.client.setPersona(SteamUser.EPersonaState.Online);
    });

    // A Steam dá-nos um "web session" que passamos ao community e ao manager
    this.client.on('webSession', (sessionID: string, cookies: string[]) => {
      this.community.setCookies(cookies);
      this.manager.setCookies(cookies, (err: any) => {
        if (err) {
          this.logger.error('Erro ao definir cookies no manager: ' + err);
          return;
        }
        this.logger.log('Manager de trade offers pronto.');
      });

      // Mantém o Steam Guard mobile "confirmado" automaticamente
      this.community.startConfirmationChecker(
        10000,
        process.env.STEAM_BOT_IDENTITY_SECRET,
      );
    });

    this.client.on('error', (err: any) => {
      this.logger.error('Erro na ligação Steam: ' + err);
      // Tenta reconectar passado 30s em caso de queda
      setTimeout(() => this.login(), 30000);
    });

    // 🔥 Chegou uma trade nova — só faz a validação e aceita. NÃO credita
    // saldo aqui, porque "aceite" pode só significar "a aguardar
    // confirmação móvel" (offer.accept devolve status "pending").
    this.manager.on('newOffer', (offer: any) => {
      this.processarOfertaRecebida(offer);
    });

    this.manager.on('sentOfferChanged', (offer: any, oldState: any) => {
      this.logger.log(
        `Trade enviada #${offer.id} mudou de estado: ${oldState} -> ${offer.state}`,
      );
    });

    // ✅ Este é o único sítio onde o saldo é creditado: só quando a troca
    // fica com o estado final "Accepted", ou seja, a skin já está
    // confirmada no inventário do bot (não apenas "pending").
    this.manager.on('receivedOfferChanged', (offer: any, oldState: any) => {
      this.logger.log(
        `Trade recebida #${offer.id} mudou de estado: ${oldState} -> ${offer.state}`,
      );

      if (offer.state === TradeOfferManager.ETradeOfferState.Accepted) {
        this.creditarDepositoConfirmado(offer);
      }
    });
  }

  /**
   * Validação de segurança da trade recebida. NÃO credita saldo aqui.
   *
   * Regra de segurança MAIS IMPORTANTE:
   * só aceitamos automaticamente trades em que o utilizador
   * não está a pedir NADA do bot em troca (itemsToGive vazio).
   * Isto evita que alguém tente enganar o bot para lhe dar skins de graça.
   */
  private async processarOfertaRecebida(offer: any) {
    this.logger.log(`Nova oferta recebida: #${offer.id} de ${offer.partner}`);

    // 1. Recusa logo se o bot teria de dar algo — nunca deve acontecer numa trade
    // de depósito genuína.
    if (offer.itemsToGive && offer.itemsToGive.length > 0) {
      this.logger.warn(
        `Oferta #${offer.id} pede itens do bot — a recusar por segurança.`,
      );
      offer.decline((err: any) => {
        if (err) this.logger.error(err);
      });
      return;
    }

    // 2. Tem de trazer pelo menos um item
    if (!offer.itemsToReceive || offer.itemsToReceive.length === 0) {
      offer.decline(() => {});
      return;
    }

    // 3. Identificar a que utilizador da plataforma pertence este steamID
    const steamId = offer.partner.getSteamID64();
    const user = await (this.prisma as any).user.findUnique({
      where: { username: steamId },
    });

    if (!user) {
      this.logger.warn(
        `Oferta #${offer.id} de um SteamID não registado na plataforma (${steamId}) — a recusar.`,
      );
      offer.decline(() => {});
      return;
    }

    // 4. Aceitar a troca. O saldo só é creditado mais tarde, quando o
    // evento receivedOfferChanged confirmar o estado "Accepted" (ver acima).
    offer.accept((err: any, status: string) => {
      if (err) {
        this.logger.error(`Erro ao aceitar oferta #${offer.id}: ${err}`);
        return;
      }
      this.logger.log(
        `Oferta #${offer.id} aceite pelo bot. Estado inicial: ${status}. ` +
          `A aguardar confirmação final antes de creditar saldo.`,
      );
      // Se ficou "pending", precisa de confirmação móvel — o
      // startConfirmationChecker (ligado acima) trata disso sozinho, e
      // o evento receivedOfferChanged dispara de novo quando resolver.
    });
  }

  /**
   * Calcula o valor dos itens recebidos e credita o saldo do utilizador.
   * Só é chamado quando a troca está mesmo "Accepted" (confirmada).
   *
   * Idempotente: usa o skinAssetId (único por item na Steam) para nunca
   * creditar o mesmo item duas vezes, mesmo que o evento dispare mais que
   * uma vez ou o servidor reinicie a meio do processo.
   */
  private async creditarDepositoConfirmado(offer: any) {
    if (this.ofertasJaProcessadas.has(offer.id)) return;
    this.ofertasJaProcessadas.add(offer.id);

    const steamId = offer.partner.getSteamID64();
    const user = await (this.prisma as any).user.findUnique({
      where: { username: steamId },
    });

    if (!user) {
      this.logger.error(
        `Trade #${offer.id} ficou Accepted mas o utilizador ${steamId} já não existe — revê manualmente.`,
      );
      return;
    }

    let valorTotal = 0;
    const nomesDepositados: string[] = [];

    for (const item of offer.itemsToReceive) {
      const assetId = item.assetid || item.id;

      // Idempotência ao nível do item: se este assetId já foi registado
      // antes (ex: reinício do servidor a meio), não conta outra vez.
      const jaExiste = await (this.prisma as any).depositoSkin.findFirst({
        where: { skinAssetId: String(assetId) },
      });
      if (jaExiste) continue;

      const nomeItem = item.market_hash_name;
      nomesDepositados.push(nomeItem);

      // Liga ao catálogo de preços real (tabela Item, já sincronizada
      // pelo cron noturno em admin.service.ts).
      const itemCatalogo = await (this.prisma as any).item.findFirst({
        where: { nome: nomeItem },
      });

      const valorItem = itemCatalogo?.preco || 0;
      valorTotal += valorItem;

      if (!itemCatalogo) {
        this.logger.warn(
          `Item "${nomeItem}" depositado mas sem preço no catálogo — valor 0€ atribuído. Confirma manualmente!`,
        );
      }

      // Regista este depósito na tabela já existente para isso, já como
      // CONFIRMADO (visível no teu painel admin de depósitos de skins).
      await (this.prisma as any).depositoSkin.create({
        data: {
          userId: user.id,
          skinNome: nomeItem,
          skinImagem: item.getImageURL ? item.getImageURL() : (itemCatalogo?.imagem || ''),
          skinAssetId: String(assetId),
          valor: valorItem,
          status: 'CONFIRMADO',
        },
      });
    }

    if (valorTotal <= 0) {
      this.logger.warn(
        `Depósito da trade #${offer.id} resultou em 0€ (ou já tinha sido processado) — nada creditado.`,
      );
      return;
    }

    const novoSaldo = parseFloat(((user.saldo || 0) + valorTotal).toFixed(2));

    await (this.prisma as any).user.update({
      where: { id: user.id },
      data: {
        saldo: novoSaldo,
        totalDepositado: parseFloat(
          ((user.totalDepositado || 0) + valorTotal).toFixed(2),
        ),
      },
    });

    await (this.prisma as any).historicoJogo.create({
      data: {
        userId: user.id,
        acao: 'Depósito de Skins',
        detalhe: `Depositou: ${nomesDepositados.join(', ')}`,
        valor: valorTotal,
        tipo: 'GANHO',
      },
    });

    this.logger.log(
      `✅ Utilizador #${user.id} creditado com ${valorTotal.toFixed(2)}€ (trade #${offer.id}, confirmada no inventário do bot).`,
    );
  }

  /**
   * Usado pelo DepositController para dar ao frontend o SteamID/trade
   * URL do bot, para o utilizador saber para onde enviar a trade.
   */
  getBotSteamId(): string | null {
    return this.botSteamId;
  }
}
