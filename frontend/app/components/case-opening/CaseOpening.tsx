'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import CaseRoulettes from './CaseRoulettes';
import CaseContents from './CaseContents';
import CaseVictoryModal from './CaseVictoryModal';
import { toast } from 'react-hot-toast'; // 🔥 Import adicionado!

export default function CaseOpening({ 
  caixaSelecionada, saldo, setSaldo, setXp, setView, setInventario, userId, addDropToFeed 
}: any) {
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [itemSorteado, setItemSorteado] = useState<any>(null);
  const [roletas, setRoletas] = useState<any[][]>([]);
  const [fastOpen, setFastOpen] = useState(false);
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    let skinsArray = [];
    if (caixaSelecionada && caixaSelecionada.skins) {
      if (typeof caixaSelecionada.skins === 'string') {
        try { skinsArray = JSON.parse(caixaSelecionada.skins); } catch(e) { skinsArray = []; }
      } else { skinsArray = caixaSelecionada.skins; }
      
      if(skinsArray.length > 0) {
         const multiplasRoletas = Array.from({ length: 5 }, () => {
            return Array.from({ length: 50 }, () => skinsArray[Math.floor(Math.random() * skinsArray.length)]);
         });
         setRoletas(multiplasRoletas);
      }
    }
  }, [caixaSelecionada]);

  const abrirCaixa = async () => {
    // 🔥 Agora usa o toast.error em vez do alert
    if (!userId) return toast.error("Erro: Não tens sessão iniciada.");
    
    const precoTotal = caixaSelecionada.preco * quantidade;
    if (saldo < precoTotal) return toast.error(`Saldo insuficiente! Precisas de ${precoTotal.toFixed(2)}€`);

    setIsSpinning(true);
    setItemSorteado(null); 

    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/abrir-caixa', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, caixaSelecionada, quantidade })
      });
      const v = await res.json();

      if (!res.ok) {
        toast.error(v.message || 'Erro ao abrir caixa.'); // 🔥
        setIsSpinning(false);
        return;
      }

      setRoletas(prev => {
        const novas = [...prev];
        v.itensSorteados.forEach((ganho: any, i: number) => {
           if (novas[i]) {
             novas[i] = [...novas[i]];
             novas[i][40] = { nome: ganho.nome, imagem: ganho.imageUrl, preco: ganho.valor, raridade: ganho.raridade };
           }
        });
        return novas;
      });

      const tempoDeAnimacao = fastOpen ? 400 : 5000;

      setTimeout(() => {
        setIsSpinning(false);
        setItemSorteado(v); 
        
        confetti({
          zIndex: 99999, particleCount: fastOpen ? 50 : 200, spread: 90,
          origin: { y: 0.6 }, colors: ['#10b981', '#fbbf24', '#ffffff'], disableForReducedMotion: true
        });
        
        setSaldo(v.novoSaldo);
        setXp((prev: number) => prev + (15 * quantidade)); 
        
        v.itensSorteados.forEach((itemGanho: any) => {
          addDropToFeed({ itemSorteado: itemGanho.nome, imageUrl: itemGanho.imageUrl, raridade: itemGanho.raridade, valor: itemGanho.valor });
          setInventario((prev: any[]) => [{
            nome: itemGanho.nome, imagem: itemGanho.imageUrl, raridade: itemGanho.raridade, preco: itemGanho.valor 
          }, ...(Array.isArray(prev) ? prev : [])]);
        });

      }, tempoDeAnimacao);

    } catch (error) {
      console.error("Erro de comunicação com o servidor:", error);
      toast.error("Falha de ligação ao servidor."); // 🔥
      setIsSpinning(false);
    }
  };

  if (!caixaSelecionada) return null;

  return (
    <div className="flex flex-col items-center justify-center animate-in fade-in pb-20 w-full max-w-full px-2 sm:px-0">
      
      <button onClick={() => setView('store')} className="mb-8 self-start text-zinc-500 hover:text-white flex items-center gap-2 font-bold tracking-widest text-xs uppercase ml-2 sm:ml-0 transition-colors">
        <span>←</span> Voltar à Loja
      </button>

      <h2 className="text-3xl sm:text-4xl font-black italic uppercase text-white tracking-tighter mb-2 text-center drop-shadow-md">{caixaSelecionada.nome}</h2>
      <p className="text-emerald-500 font-mono text-xl mb-6 font-black drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
        {(caixaSelecionada.preco * quantidade).toFixed(2)}€
      </p>

      {/* Controlos de Fast Open e Quantidade */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        <div className="bg-black/50 p-1 rounded-xl border border-white/10 flex gap-1 shadow-inner">
          {[1, 2, 3, 4, 5].map(num => (
            <button key={num} onClick={() => !isSpinning && setQuantidade(num)} disabled={isSpinning}
              className={`w-12 h-10 flex items-center justify-center rounded-lg font-black text-sm transition-all duration-300
                ${quantidade === num ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
            >{num}</button>
          ))}
        </div>
        <button onClick={() => !isSpinning && setFastOpen(!fastOpen)} disabled={isSpinning}
          className={`h-12 px-6 rounded-xl border font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 
            ${fastOpen ? 'bg-amber-500/10 text-amber-500 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-black/50 text-zinc-500 border-white/10 hover:text-white hover:border-white/20'}`}
        >
          <span className={fastOpen ? "animate-pulse" : ""}>⚡</span> Fast Open
        </button>
      </div>

      <CaseRoulettes roletas={roletas} quantidade={quantidade} isSpinning={isSpinning} fastOpen={fastOpen} itemSorteado={itemSorteado} />

      <button onClick={abrirCaixa} disabled={isSpinning}
        className={`px-8 sm:px-16 py-4 sm:py-5 font-black uppercase tracking-widest rounded-xl transition-all text-lg sm:text-xl mb-12 mt-6
          ${isSpinning ? 'bg-zinc-800/80 text-zinc-500 cursor-not-allowed border border-white/5' : 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:scale-[1.02]'}`}
      >
        {isSpinning ? 'A ABRIR...' : `ABRIR ${quantidade > 1 ? `${quantidade} CAIXAS` : 'CAIXA'}`}
      </button>

      <CaseContents caixaSelecionada={caixaSelecionada} />

      {itemSorteado && !isSpinning && (
        <CaseVictoryModal itemSorteado={itemSorteado} setItemSorteado={setItemSorteado} setView={setView} />
      )}
    </div>
  );
}