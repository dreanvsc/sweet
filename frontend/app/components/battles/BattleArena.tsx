'use client';

import React, { useState, useEffect, useRef } from 'react';

function ItemRoleta({ item }: { item: any }) {
  const raridadeCores: { [key: string]: string } = {
    'Consumidor': '#52525b', 'Industrial': '#3b82f6', 'Militar': '#a855f7',
    'Restrito': '#ec4899', 'Secreto': '#ef4444', 'Lendário': '#f59e0b',
  };
  const cor = raridadeCores[item?.raridade || item?.rarity] || '#52525b';
  
  return (
    <div className="flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-xl bg-[#0b0b0d] border-2 relative overflow-hidden"
      style={{ width: '120px', height: '120px', borderColor: cor }}>
      <img src={item?.imagem || item?.image || '/skins/glock.png'} className="w-16 h-16 object-contain drop-shadow-xl relative z-10" alt="skin" />
      <span className="text-[8px] font-black text-zinc-400 truncate w-full text-center uppercase tracking-widest mt-2 relative z-10">{item?.nome || '???'}</span>
    </div>
  );
}

export default function BattleArena({ batalha, userId, onLeave }: any) {
  const totalRondas = batalha?.caixas?.length || 1;
  const resultado = batalha?.resultado;
  const vencedorId = resultado?.vencedorId;
  const empateIds = resultado?.empateIds || [];

  const [rondaAtual, setRondaAtual] = useState(0);
  const [terminou, setTerminou] = useState(false);
  const [isSpinning, setIsSpinning] = useState(true);
  
  // 🔥 ESTADOS DINÂMICOS PARA MULTIPLAYER
  const [roletas, setRoletas] = useState<Record<string, any[]>>({});
  const [historico, setHistorico] = useState<Record<string, any[]>>({});
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  const caixaAtual = batalha?.caixas?.[rondaAtual];
  const maxJogadores = batalha.maxJogadores || 2;

  // Inicia o histórico vazio para todos os jogadores
  useEffect(() => {
    const initHist: any = {};
    batalha.jogadores.forEach((j: any) => { initHist[j.id] = []; });
    setHistorico(initHist);
  }, []);

  useEffect(() => {
    if (rondaAtual >= totalRondas) {
      setTerminou(true);
      setIsSpinning(false);
      return;
    }

    setIsSpinning(true);

    let skinsDaCaixaAtual: any[] = [];
    try { skinsDaCaixaAtual = typeof caixaAtual?.skins === 'string' ? JSON.parse(caixaAtual.skins) : (caixaAtual?.skins || caixaAtual?.itens); } 
    catch (e) { }
    if (!skinsDaCaixaAtual || skinsDaCaixaAtual.length === 0) skinsDaCaixaAtual = [{ nome: "Item Mistério", preco: 0 }];

    const novasRoletas: any = {};
    
    // GERA A ROLETA E METE O ITEM CERTO NO FIM PARA CADA JOGADOR
    batalha.jogadores.forEach((j: any) => {
      const itemVencedor = resultado?.ganhosPorJogador?.[j.id]?.ganhos?.[rondaAtual] || skinsDaCaixaAtual[0];
      
      const fila = [];
      for (let i = 0; i < 70; i++) fila.push(skinsDaCaixaAtual[Math.floor(Math.random() * skinsDaCaixaAtual.length)]);
      fila[60] = itemVencedor;
      
      novasRoletas[j.id] = fila;

      // Reseta a posição física da roleta dele
      if (refs.current[j.id]) {
        refs.current[j.id]!.style.transition = 'none';
        refs.current[j.id]!.style.transform = 'translateX(0px)';
      }
    });

    setRoletas(novasRoletas);

    // Gira todas as roletas ao mesmo tempo!
    const tSpin = setTimeout(() => {
      batalha.jogadores.forEach((j: any) => {
        if (refs.current[j.id]) {
          const varAleatoria = Math.floor(Math.random() * 30) - 15;
          refs.current[j.id]!.style.transition = 'transform 6.5s cubic-bezier(0.15, 0.85, 0.3, 1)';
          refs.current[j.id]!.style.transform = `translateX(-${7740 + varAleatoria}px)`;
        }
      });
    }, 100);

    // Termina a ronda
    const tEnd = setTimeout(() => {
      setIsSpinning(false);
      
      // Adiciona ao histórico de cada um
      setHistorico(prev => {
        const novoHist = { ...prev };
        batalha.jogadores.forEach((j: any) => {
          const itemGanho = resultado?.ganhosPorJogador?.[j.id]?.ganhos?.[rondaAtual];
          if (itemGanho) novoHist[j.id] = [...(novoHist[j.id] || []), itemGanho];
        });
        return novoHist;
      });

      setTimeout(() => { setRondaAtual(r => r + 1); }, 2000);
    }, 7000); 

    return () => { clearTimeout(tSpin); clearTimeout(tEnd); };
  }, [rondaAtual]);

  // Função para saber a cor da borda dependendo de quem ganha
  const getCardStyle = (jId: any) => {
    if (!terminou) return 'border-white/5 opacity-100';
    if (vencedorId === 'empate' && empateIds.includes(jId)) return 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)] opacity-100';
    if (vencedorId === jId) return 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] scale-[1.02] z-10 opacity-100';
    return 'border-transparent opacity-30 grayscale';
  };

  // Define quantas colunas a Arena vai ter (2, 3 ou 4)
  const gridClass = maxJogadores === 4 ? 'grid-cols-1 md:grid-cols-2' : maxJogadores === 3 ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';

  return (
    <div className="w-full max-w-7xl mx-auto p-4 animate-in fade-in">
      
      <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
        <div>
           <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Arena <span className="text-red-500">Mortal</span> ⚔️</h2>
           {!terminou && <p className="text-emerald-500 font-bold uppercase tracking-widest text-xs mt-1">A Abrir: {caixaAtual?.nome} (Ronda {rondaAtual + 1}/{totalRondas})</p>}
        </div>
        <button onClick={onLeave} disabled={!terminou} className="text-white hover:text-red-500 font-bold tracking-widest text-xs uppercase px-6 py-3 rounded-xl bg-zinc-900 border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {terminou ? 'Sair da Batalha' : 'A Decorrer...'}
        </button>
      </div>

      {/* A GRELHA DINÂMICA DE JOGADORES */}
      <div className={`grid gap-4 w-full relative ${gridClass}`}>
        
        {batalha.jogadores.map((jogador: any, idx: number) => {
          const poteDesteJogador = (historico[jogador.id] || []).reduce((acc: number, item: any) => acc + parseFloat(item?.preco || item?.valor || 0), 0);
          const corAgulha = idx % 2 === 0 ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-blue-500 shadow-[0_0_10px_blue]';

          return (
            <div key={jogador.id} className={`flex flex-col bg-[#121215] border-2 rounded-2xl overflow-hidden transition-all duration-1000 ${getCardStyle(jogador.id)}`}>
              
              {/* CABEÇALHO DO JOGADOR */}
              <div className="p-4 flex flex-col items-center justify-center border-b border-white/5 relative bg-gradient-to-b from-white/5 to-transparent">
                <img src={jogador.foto} className="w-14 h-14 rounded-xl border border-zinc-700 mb-2 object-cover" alt="P" />
                <h3 className="text-white font-black uppercase text-[10px] truncate w-full text-center">{jogador.nome}</h3>
                <p className="text-emerald-500 font-mono font-black mt-1 bg-emerald-500/10 px-3 py-1 rounded-full text-sm">{poteDesteJogador.toFixed(2)}€</p>
              </div>
              
              {/* O VISOR DA ROLETA */}
              <div className="h-40 w-full relative bg-black/90 flex items-center overflow-hidden">
                <div className="absolute left-1/2 top-0 bottom-0 flex items-center h-full">
                    <div ref={el => { refs.current[jogador.id] = el; }} className="flex" style={{ gap: '8px' }}>
                      {(roletas[jogador.id] || []).map((item: any, i: number) => <ItemRoleta key={i} item={item} />)}
                    </div>
                </div>
                {/* A Agulha */}
                <div className={`absolute left-1/2 top-0 bottom-0 w-1 z-20 -translate-x-1/2 ${corAgulha}`}></div>
              </div>

              {/* MOCHILA DO JOGADOR (Histórico) */}
              <div className="bg-[#161619] h-16 p-2 flex gap-1 justify-start items-center overflow-x-auto border-t border-white/5 px-4">
                {(historico[jogador.id] || []).map((item: any, i: number) => (
                  <img key={i} src={item?.imagem || item?.image} className="w-10 h-10 object-contain bg-black/40 rounded border border-white/5 p-1 flex-shrink-0 animate-in zoom-in" title={item?.nome} alt="drop" />
                ))}
              </div>

            </div>
          );
        })}
      </div>

      {/* PLACARD FINAL DE VITÓRIA */}
      {terminou && (
        <div className="mt-8 text-center flex flex-col items-center justify-center animate-in slide-in-from-bottom-8">
          {vencedorId === 'empate' ? (
            <div className="bg-blue-500/10 border border-blue-500/30 px-16 py-6 rounded-2xl">
              <h2 className="text-3xl font-black text-blue-500 uppercase tracking-widest italic">EMPATE MÚLTIPLO!</h2>
              <p className="text-zinc-400 font-bold uppercase text-xs mt-2">Cada um leva o que abriu.</p>
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/30 px-20 py-8 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.2)]">
              <p className="text-amber-500 font-black tracking-widest text-xs mb-1 uppercase">O Vencedor Limpou Tudo!</p>
              
              {/* Procura o nome do vencedor na lista */}
              <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">
                {batalha.jogadores.find((j: any) => j.id === vencedorId)?.nome} GANHOU!
              </h2>
              
              <p className="text-emerald-500 font-mono font-black text-3xl mt-4 bg-black/40 inline-block px-6 py-2 rounded-xl border border-white/5">
                Pote Total: {batalha.jogadores.reduce((acc: number, j: any) => {
                  return acc + (historico[j.id] || []).reduce((soma: number, item: any) => soma + parseFloat(item?.preco || item?.valor || 0), 0);
                }, 0).toFixed(2)}€
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}