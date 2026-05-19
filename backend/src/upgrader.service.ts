import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UsersService } from './users.service'; // 🔥 Importamos o gerente de XP

@Injectable()
export class UpgraderService {
  constructor(
    private prisma: PrismaService,
    private readonly usersService: UsersService // 🔥 Injetamos o serviço de XP no constructor!
  ) {}

  // 🔥 Ajustado para aceitar o "lado" que o frontend envia ('under' ou 'over')
  async realizarUpgrade(dados: { userId: number, skinIds: any[], alvoId?: number, targetSkinId?: number, lado?: 'under' | 'over' }) {
    try {
      const idDoAlvo = Number(dados.alvoId || dados.targetSkinId);
      const ladoEscolhido = dados.lado || 'under'; // Se não vier lado, assume Esquerda por segurança

      // Vai buscar o jogador e a mochila dele
      const user = await (this.prisma as any).user.findUnique({
        where: { id: Number(dados.userId) },
        include: { inventario: true }
      });
      if (!user) throw new Error('Jogador não encontrado.');

      // 🔥 CORTAMOS O MAL PELA RAIZ
      const idsLimpos = dados.skinIds.map((id: any) => {
        if (typeof id === 'string' && id.includes('-')) {
          return Number(id.split('-')[0]);
        }
        return Number(id);
      });
      
      const idsApostados = [...new Set(idsLimpos)]; // Removemos duplicados acidentais

      // Comparamos Número com Número na perfeição
      const skinsApostadas = user.inventario.filter((skin: any) => 
        idsApostados.includes(Number(skin.id))
      );

      if (skinsApostadas.length !== idsApostados.length) {
        throw new Error(`Skins inválidas ou não te pertencem.`);
      }

      const alvo = await (this.prisma as any).item.findUnique({ where: { id: idDoAlvo } });
      if (!alvo) throw new Error('Skin alvo não existe.');

      const valorApostado = skinsApostadas.reduce((acc: number, skin: any) => acc + parseFloat(skin.valor || skin.preco), 0);
      const precoAlvo = parseFloat(alvo.preco || alvo.valor);

      if (precoAlvo <= valorApostado) throw new Error('O alvo tem de ser mais caro do que a aposta.');

      const chanceRaw = (valorApostado / precoAlvo) * 100 * 0.90;
      const chance = Math.min(chanceRaw, 90);

      // =======================================================
      // 🔥 O RNG (Gerador de Números) E A ESCOLHA DO LADO!
      // =======================================================
      const numeroSorteado = Math.random() * 100;
      let sucesso = false;

      if (ladoEscolhido === 'under') {
        // ESQUERDA: Ganha se o número sorteado for MENOR ou igual à chance (Ex: chance 20%, ganha do 0 ao 20)
        sucesso = numeroSorteado <= chance;
      } else {
        // DIREITA: Ganha se o número cair na reta final do círculo! (Ex: chance 20%, ganha do 80 ao 100)
        sucesso = numeroSorteado >= (100 - chance);
      }

      // 🔥 APAGAMOS OS IDS CORRETOS E NUMÉRICOS
      await (this.prisma as any).inventario.deleteMany({ where: { id: { in: idsApostados } } });

      // Dá XP equivalente ao valor total das skins sacrificadas!
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

      // 🔥 RETORNAMOS O "roll" PARA O FRONTEND ANIMAR A AGULHA PRO SÍTIO EXATO!
      return { 
        sucesso, 
        chance: chance.toFixed(2), 
        roll: numeroSorteado, // <--- Sem isto a roda encrava!
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