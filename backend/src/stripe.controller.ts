import { Controller, Post, Req, Res, Headers } from '@nestjs/common';
import type { Request, Response } from 'express'; // 🔥 CORREÇÃO 1: Adicionada a palavra "type"
import Stripe from 'stripe';
import { PrismaService } from './prisma.service';

@Controller('webhook')
export class StripeWebhookController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia' as any,
  });

  // ATENÇÃO: Substitui por um segredo falso agora, mas o verdadeiro sacas do painel do Stripe!
  private endpointSecret = 'whsec_oTeuSegredoDoStripeAQUI'; 

  constructor(private prisma: PrismaService) {}

  @Post()
  async handleIncomingWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    let event: any; // 🔥 CORREÇÃO 2: Mudamos para "any" para o compilador não chatear com os tipos do Stripe

    // 1. Verificar se é mesmo o Stripe a chamar! Anti-Hackers!
    try {
      event = this.stripe.webhooks.constructEvent(req.body, signature, this.endpointSecret);
    } catch (err: any) {
      console.log(`⚠️  Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 2. A MAGIA ACONTECE AQUI SE FOR PAGO!
    if (event.type === 'payment_intent.succeeded' || event.type === 'checkout.session.completed') {
      
      const paymentData = event.data.object as any;
      const metadata = paymentData.metadata || {};
      
      const txId = Number(metadata.txId || paymentData.client_reference_id);
      const userId = Number(metadata.userId);
      const promoCode = metadata.promoCode;
      const bonusEsperado = Number(metadata.bonusEsperado || 0);

      const valorRealEmEuros = paymentData.amount_total ? (paymentData.amount_total / 100) : (paymentData.amount / 100);

      if (txId && userId) {
        
        // Verifica se já processámos para não pagar a dobrar
        const tx = await (this.prisma as any).transacao.findUnique({ where: { id: txId } });
        if (tx && tx.status !== "Concluido") {

          // Marca a transação como paga
          await (this.prisma as any).transacao.update({ 
            where: { id: txId }, data: { status: "Concluido" } 
          });

          // 3. PAGA AO JOGADOR (O Valor Real + Bónus de Boas Vindas)
          const valorCreditarJogador = valorRealEmEuros + bonusEsperado;
          await (this.prisma as any).user.update({
            where: { id: userId },
            data: { 
              saldo: { increment: valorCreditarJogador },
              totalDepositado: { increment: valorRealEmEuros }
            }
          });

          // 🔥 4. A MÁQUINA DE AFILIADOS 🔥
          if (promoCode) {
            const codigoDb = await (this.prisma as any).promoCode.findUnique({ 
              where: { codigo: promoCode } 
            });

            // Se for um Youtuber válido...
            if (codigoDb && codigoDb.ownerId) {
              // Calcula a comissão do Youtuber
              const valorComissao = valorRealEmEuros * (codigoDb.comissao / 100);

              // Dá a guita ao Youtuber!
              await (this.prisma as any).user.update({
                where: { id: codigoDb.ownerId },
                data: { saldo: { increment: valorComissao } }
              });

              // Atualiza as stats do Youtuber no painel
              await (this.prisma as any).promoCode.update({
                where: { id: codigoDb.id },
                data: { 
                  usos: { increment: 1 },
                  ganhosAcumulados: { increment: valorComissao },
                  // volumeGerado: { increment: valorRealEmEuros } // Opcional
                }
              });
              
              console.log(`💰 COMISSÃO PAGA: ${valorComissao}€ para Parceiro #${codigoDb.ownerId}`);
            }
          }

          console.log(`✅ [STRIPE SEGURO] Jogador #${userId} recebeu ${valorCreditarJogador}€`);
        }
      }
    }

    // Avisar o Stripe que recebemos a mensagem com sucesso
    return res.status(200).json({ received: true });
  }
}