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
        carregarGiveaways(); 
      } else {
        toast.error(data.message || 'Erro ao entrar no giveaway.');
      }
    } catch (error) {
      toast.error('Falha de ligação ao servidor.');
    } finally {
      setLoadingId(null);
    }
  };

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

  // Função para formatar o nome da arma (separa o nome da camuflagem)
  const formatarNome = (nomeCompleto: string) => {
    if (!nomeCompleto.includes('|')) return { arma: nomeCompleto, skin: '' };
    const partes = nomeCompleto.split('|');
    return { arma: partes[0].trim(), skin: partes[1].trim() };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-32 w-full">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-bold uppercase tracking-widest mt-6 animate-pulse">A carregar sorteios...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center animate-in fade-in pb-20 w-full max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* HEADER PREMIUM */}
      <div className="w-full flex justify-between items-end mb-12 mt-6 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
            </span>
            <h2 className="text-4xl sm:text-5xl font-black italic uppercase text-white tracking-tighter drop-shadow-md">
              GIVEAWAYS <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">ATIVOS</span>
            </h2>
          </div>
          <p className="text-zinc-400 font-medium">Participa e ganha skins lendárias totalmente de graça!</p>
        </div>
        <button onClick={() => setView('store')} className="group flex items-center gap-2 text-zinc-500 hover:text-white font-bold tracking-widest text-xs uppercase transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Voltar
        </button>
      </div>

      {giveaways.length === 0 ? (
        <div className="bg-gradient-to-b from-[#121215] to-[#0b0b0d] border border-white/5 rounded-3xl p-16 text-center w-full max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
          <span className="text-6xl mb-6 block relative z-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">🎁</span>
          <h3 className="text-2xl text-white font-black uppercase mb-3 relative z-10">Nenhum Sorteio Ativo</h3>
          <p className="text-zinc-500 relative z-10">Fica atento, a administração vai lançar novos giveaways em breve!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
          {giveaways.map((g) => {
            const { arma, skin } = formatarNome(g.premioNome);
            
            return (
              <div key={g.id} className="bg-[#121215] border border-white/5 rounded-2xl overflow-hidden relative shadow-2xl hover:border-emerald-500/40 transition-all duration-500 flex flex-col group transform hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)]">
                
                {/* ⏰ ETIQUETA DE TEMPO */}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 z-20 shadow-lg">
                  <div className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </div>
                  <span className="text-xs font-black text-white tracking-widest font-mono">{calcularTempoRestante(g.terminaEm)}</span>
                </div>

                {/* 🔫 IMAGEM DA SKIN COM EFEITOS */}
                <div className="relative h-56 w-full flex items-center justify-center p-6 overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent">
                  {/* Fundo brilhante radial */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  <img 
                    src={g.premioImagem} 
                    alt={g.premioNome} 
                    className="max-h-full max-w-full drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 relative z-10" 
                  />
                </div>

                {/* 📊 INFORMAÇÕES DA CARTA */}
                <div className="p-6 flex-1 flex flex-col relative z-20 bg-gradient-to-t from-[#0b0b0d] to-transparent">
                  
                  {/* Nome da Skin Dividido */}
                  <div className="mb-4">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight truncate drop-shadow-md">
                      {arma} <span className="text-zinc-400 font-medium">| {skin}</span>
                    </h3>
                    <p className="text-emerald-400 font-black text-xl tracking-tighter drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] mt-1">
                      {Number(g.valor).toFixed(2)}€
                    </p>
                  </div>

                  {/* Caixa de Estatísticas com Ícones */}
                  <div className="bg-[#0b0b0d]/80 rounded-xl p-4 border border-white/5 mb-6 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 uppercase font-bold flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path></svg>
                        Participantes
                      </span>
                      <span className="text-white font-black text-sm">{g._count?.participantes || 0}</span>
                    </div>
                    
                    <div className="h-px w-full bg-white/5"></div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 uppercase font-bold flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                        Requisito
                      </span>
                      <span className={g.depositoMinimo > 0 ? "text-amber-400 font-black drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]" : "text-emerald-400 font-black drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]"}>
                        {g.depositoMinimo > 0 ? `${g.depositoMinimo}€ (${g.diasDeposito}d)` : 'GRÁTIS'}
                      </span>
                    </div>
                  </div>

                  {/* 🟢 Botão Premium */}
                  <button 
                    onClick={() => entrarGiveaway(g.id)}
                    disabled={loadingId === g.id}
                    className={`w-full mt-auto py-3.5 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-300 relative overflow-hidden group/btn
                      ${loadingId === g.id 
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-black hover:from-emerald-400 hover:to-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-0.5'}`}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loadingId === g.id ? (
                        <span className="animate-pulse">A ENTRAR...</span>
                      ) : (
                        <>
                          ENTRAR NO GIVEAWAY
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}