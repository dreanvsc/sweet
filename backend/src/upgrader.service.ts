import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class UpgraderService {
  constructor(private prisma: PrismaService) {}

  // 🔥 1. Ajustei para aceitar alvoId ou targetSkinId (o que o frontend enviar)
  async realizarUpgrade(dados: { userId: number, skinIds: any[], alvoId?: number, targetSkinId?: number }) {
    try {
      const idDoAlvo = Number(dados.alvoId || dados.targetSkinId);

      // Vai buscar o jogador e a mochila dele
      const user = await (this.prisma as any).user.findUnique({
        where: { id: Number(dados.userId) },
        include: { inventario: true }
      });
      if (!user) throw new Error('Jogador não encontrado.');

      // 🔥 2. CORTAMOS O MAL PELA RAIZ: 
      // Se vier "15-0" (do uniqueClickId do frontend), apanhamos só o 15 e transformamos em Número!
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

      const numeroSorteado = Math.random() * 100;
      const sucesso = numeroSorteado <= chance;

      // 🔥 3. AGORA SIM, apagamos os ids corretos e numéricos
      await (this.prisma as any).inventario.deleteMany({ where: { id: { in: idsApostados } } });

      let novoItemId = null; 

      if (sucesso) {
        const novoItem = await (this.prisma as any).inventario.create({
          data: { nome: alvo.nome, imagem: alvo.imagem || alvo.image, raridade: alvo.raridade || 'Comum', valor: precoAlvo, userId: Number(dados.userId) }
        });
        novoItemId = novoItem.id; 

        await (this.prisma as any).historicoJogo.create({
          data: { userId: Number(dados.userId), acao: "Upgrader", detalhe: `Ganhou ${alvo.nome} (Apostou ${valorApostado.toFixed(2)}€)`, valor: precoAlvo, tipo: "GANHO" }
        });
      } else {
        await (this.prisma as any).historicoJogo.create({
          data: { userId: Number(dados.userId), acao: "Upgrader", detalhe: `Perdeu upgrade para ${alvo.nome}`, valor: valorApostado, tipo: "PERDA" }
        });
      }

      // Devolvemos os ids originais destruídos para o Frontend saber exatamente o que tirar do ecrã
      return { sucesso, chance: chance.toFixed(2), skinGanha: alvo, novoItemId: novoItemId, idsDestruidos: dados.skinIds };
      
    } catch (error) { 
      console.error("Erro no Upgrader:", error);
      throw error; 
    }
  }
}