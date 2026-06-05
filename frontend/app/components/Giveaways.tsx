'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function Giveaways({ userId, setView }: any) {
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    carregarGiveaways();
  }, []);

  const carregarGiveaways = async () => {
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/giveaways/ativos');
      const data = await res.json();
      setGiveaways(data);
    } catch (error) {
      toast.error('Erro ao carregar os giveaways.');
    } finally {
      setLoading(false);
    }
  };

  const entrarGiveaway = async (giveawayId: number) => {
    if (!userId) return toast.error('Precisas de iniciar sessão para participar!');
    
    setLoadingId(giveawayId);
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/giveaways/entrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, giveawayId })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Inscrição confirmada com sucesso! Boa sorte 🍀');
        carregarGiveaways(); // Atualiza o número de participantes na hora
      } else {
        toast.error(data.message || 'Erro ao entrar no giveaway.');
      }
    } catch (error) {
      toast.error('Falha de ligação ao servidor.');
    } finally {
      setLoadingId(null);
    }
  };

  // Função para formatar o tempo restante
  const calcularTempoRestante = (dataFim: string) => {
    const agora = new Date().getTime();
    const fim = new Date(dataFim).getTime();
    const diferenca = fim - agora;

    if (diferenca <= 0) return 'A TERMINAR...';

    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));

    if (dias > 0) return `${dias}d ${horas}h`;
    return `${horas}h ${minutos}m`;
  };

  if (loading) {
    return <div className="text-white text-center mt-20 font-black animate-pulse">A CARREGAR GIVEAWAYS...</div>;
  }

  return (
    <div className="flex flex-col items-center animate-in fade-in pb-20 w-full max-w-6xl mx-auto px-4">
      
      <div className="w-full flex justify-between items-center mb-10 mt-6">
        <div>
          <h2 className="text-4xl sm:text-5xl font-black italic uppercase text-white tracking-tighter drop-shadow-md">
            GIVEAWAYS <span className="text-emerald-500">ATIVOS</span>
          </h2>
          <p className="text-zinc-400 font-medium mt-2">Participa e ganha skins totalmente de graça!</p>
        </div>
        <button onClick={() => setView('store')} className="text-zinc-500 hover:text-white font-bold tracking-widest text-xs uppercase transition-colors">
          ← Voltar
        </button>
      </div>

      {giveaways.length === 0 ? (
        <div className="bg-[#121215] border border-white/5 rounded-2xl p-12 text-center w-full">
          <span className="text-4xl mb-4 block">🎁</span>
          <h3 className="text-xl text-white font-black uppercase mb-2">Nenhum Giveaway Ativo</h3>
          <p className="text-zinc-500">Fica atento, a administração vai lançar novos sorteios em breve!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {giveaways.map((g) => (
            <div key={g.id} className="bg-[#121215] border border-white/10 rounded-2xl overflow-hidden relative shadow-xl hover:border-emerald-500/50 transition-colors flex flex-col">
              
              {/* Etiqueta de Tempo */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full flex items-center gap-2 z-10">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-black text-white tracking-widest">{calcularTempoRestante(g.terminaEm)}</span>
              </div>

              {/* Imagem do Prémio */}
              <div className="h-48 w-full bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center p-6">
                <img src={g.premioImagem} alt={g.premioNome} className="max-h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-110 transition-transform duration-500" />
              </div>

              {/* Informações */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">{g.premioNome}</h3>
                <p className="text-emerald-500 font-mono font-bold mb-4">{g.valor.toFixed(2)}€</p>
                
                <div className="bg-black/30 rounded-lg p-3 border border-white/5 mb-6">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-500 uppercase font-bold">Participantes</span>
                    <span className="text-white font-black">{g._count.participantes}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 uppercase font-bold">Depósito Mínimo</span>
                    <span className={g.depositoMinimo > 0 ? "text-amber-500 font-black" : "text-emerald-500 font-black"}>
                      {g.depositoMinimo > 0 ? `${g.depositoMinimo}€ (Últimos ${g.diasDeposito}d)` : 'GRÁTIS'}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => entrarGiveaway(g.id)}
                  disabled={loadingId === g.id}
                  className={`w-full mt-auto py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all
                    ${loadingId === g.id ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]'}`}
                >
                  {loadingId === g.id ? 'A ENTRAR...' : 'ENTRAR NO GIVEAWAY'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}