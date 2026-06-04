import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UsersService } from './users.service';

@Injectable()
export class UpgraderService {
  constructor(
    private prisma: PrismaService,
    private readonly usersService: UsersService
  ) {}

  async realizarUpgrade(dados: { userId: number, skinIds: any[], alvoId?: number, targetSkinId?: number, lado?: 'under' | 'over' }) {
    try {
      const idDoAlvo = Number(dados.alvoId || dados.targetSkinId);
      const ladoEscolhido = dados.lado || 'under'; 

      const user = await (this.prisma as any).user.findUnique({
        where: { id: Number(dados.userId) },
        include: { inventario: true }
      });
      if (!user) throw new BadRequestException('Jogador não encontrado.');

      const idsLimpos = dados.skinIds.map((id: any) => {
        if (typeof id === 'string' && id.includes('-')) {
          return Number(id.split('-')[0]);
        }
        return Number(id);
      });
      
      const idsApostados = [...new Set(idsLimpos)]; 

      const skinsApostadas = user.inventario.filter((skin: any) => 
        idsApostados.includes(Number(skin.id))
      );

      // 🔥 BLINDAGEM DE SINCROMISMO: Se a skin já não estiver na BD (ex: foi levantada), o tamanho será diferente e bloqueia imediatamente com erro 400.
      if (skinsApostadas.length !== idsApostados.length) {
        throw new BadRequestException('ERRO: Uma ou mais skins selecionadas já não te pertencem ou estão pendentes de levantamento. Atualiza a página.');
      }

      const alvo = await (this.prisma as any).item.findUnique({ where: { id: idDoAlvo } });
      if (!alvo) throw new BadRequestException('Skin alvo não existe.');

      const valorApostado = skinsApostadas.reduce((acc: number, skin: any) => acc + parseFloat(skin.valor || skin.preco), 0);
      const precoAlvo = parseFloat(alvo.preco || alvo.valor);

      if (precoAlvo <= valorApostado) throw new BadRequestException('O alvo tem de ser mais caro do que a aposta.');

      const chanceRaw = (valorApostado / precoAlvo) * 100 * 0.90;
      const chance = Math.min(chanceRaw, 90);

      const numeroSorteado = Math.random() * 100;
      let sucesso = false;

      if (ladoEscolhido === 'under') {
        sucesso = numeroSorteado <= chance;
      } else {
        sucesso = numeroSorteado >= (100 - chance);
      }

      await (this.prisma as any).inventario.deleteMany({ where: { id: { in: idsApostados } } });

      await this.usersService.adicionarXp(Number(dados.userId), valorApostado);

      let novoItemId = null; 

      if (sucesso) {
        const novoItem = await (this.prisma as any).inventario.create({
          data: { nome: alvo.nome, imagem: alvo.imagem || alvo.image, raridade: alvo.raridade || 'Comum', valor: precoAlvo, userId: Number(dados.userId) }
        });
        novoItemId = novoItem.id; 

        await (this.prisma as any).historicoJogo.create({
          data: { userId: Number(dados.userId), acao: "Upgrader", detalhe: `Ganhou ${alvo.nome} (${ladoEscolhido})`, valor: precoAlvo, tipo: "GANHO" }
        });
      } else {
        await (this.prisma as any).historicoJogo.create({
          data: { userId: Number(dados.userId), acao: "Upgrader", detalhe: `Perdeu upgrade para ${alvo.nome} (${ladoEscolhido})`, valor: valorApostado, tipo: "PERDA" }
        });
      }

      return { 
        sucesso, 
        chance: chance.toFixed(2), 
        roll: numeroSorteado, 
        skinGanha: alvo, 
        novoItemId: novoItemId, 
        idsDestruidos: dados.skinIds 
      };
      
    } catch (error) { 
      console.error("Erro no Upgrader:", error);
      throw error; 
    }
  }
}