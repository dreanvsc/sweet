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

    if (diferenca <= 0) return 'À ESPERA DE JOGADORES..';

    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));

    if (dias > 0) return `${dias}d ${horas}h`;
    return `${horas}h ${minutos}m`;
  };

  const formatarNome = (nomeCompleto: string) => {
    if (!nomeCompleto.includes('|')) return { arma: nomeCompleto, skin: '' };
    const partes = nomeCompleto.split('|');
    return { arma: partes[0].trim(), skin: partes[1].trim() };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-32 w-full">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-r-2 border-emerald-400 rounded-full animate-[spin_1.5s_reverse_infinite]"></div>
          <div className="absolute inset-4 border-b-2 border-white/20 rounded-full animate-spin"></div>
        </div>
        <p className="text-zinc-500 font-bold uppercase tracking-widest mt-8 animate-pulse text-sm">Sincronizando Sorteios...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center animate-in fade-in pb-20 w-full max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* HEADER ULTRA PREMIUM */}
      <div className="w-full flex justify-between items-end mb-12 mt-6 pb-6 relative">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-emerald-500/50 via-white/5 to-transparent"></div>
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="relative flex items-center justify-center w-12 h-12 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <span className="text-2xl drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">🎁</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black italic uppercase text-white tracking-tighter">
              GIVEAWAYS <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">ATIVOS</span>
            </h2>
          </div>
          <p className="text-zinc-400 font-medium tracking-wide ml-16">Participa e ganha skins lendárias totalmente de graça!</p>
        </div>
        <button onClick={() => setView('store')} className="group flex items-center gap-2 text-zinc-500 hover:text-white font-bold tracking-widest text-xs uppercase transition-all bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl border border-white/5 hover:border-white/10 hover:shadow-lg">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Voltar à Loja
        </button>
      </div>

      {giveaways.length === 0 ? (
        <div className="bg-gradient-to-b from-[#16181c] to-[#0b0b0d] border border-white/5 rounded-3xl p-16 text-center w-full max-w-2xl mx-auto shadow-2xl relative overflow-hidden group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full group-hover:bg-emerald-500/10 transition-colors duration-1000"></div>
          <span className="text-7xl mb-6 block relative z-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] grayscale opacity-50">📦</span>
          <h3 className="text-2xl text-white font-black uppercase mb-3 relative z-10 tracking-wider">Nenhum Sorteio Ativo</h3>
          <p className="text-zinc-500 relative z-10">Os nossos agentes estão a preparar os próximos prémios.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
          {giveaways.map((g) => {
            const { arma, skin } = formatarNome(g.premioNome);
            
            return (
              <div key={g.id} className="relative p-[1px] rounded-2xl group overflow-hidden bg-gradient-to-b from-white/10 to-transparent hover:from-emerald-500/50 hover:to-emerald-500/0 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)]">
                
                {/* O Corpo da Carta */}
                <div className="h-full w-full bg-gradient-to-b from-[#15171e] to-[#0d0e12] rounded-[15px] flex flex-col relative z-10 overflow-hidden">
                  
                  {/* ⏰ ETIQUETA DE TEMPO (Neon) */}
                  <div className="absolute top-4 right-4 bg-[#0a0b0f]/80 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2 z-20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                    </span>
                    <span className="text-xs font-black text-emerald-400 tracking-widest font-mono drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]">
                      {calcularTempoRestante(g.terminaEm)}
                    </span>
                  </div>

                  {/* 🔫 IMAGEM DA SKIN COM AURA NUCLEAR */}
                  <div className="relative h-64 w-full flex items-center justify-center p-8 mt-2">
                    {/* Luz pulsante de fundo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-500/20 blur-[60px] rounded-full group-hover:bg-emerald-400/30 transition-colors duration-700"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03)_0%,transparent_70%)]"></div>
                    
                    <img 
                      src={g.premioImagem} 
                      alt={g.premioNome} 
                      className="max-h-full max-w-full drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] group-hover:scale-[1.15] group-hover:rotate-6 transition-transform duration-700 ease-out relative z-10" 
                    />
                  </div>

                  {/* 📊 INFORMAÇÕES DA CARTA */}
                  <div className="px-6 pb-6 pt-2 flex-1 flex flex-col relative z-20">
                    
                    {/* Divisor de luz */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-5"></div>

                    {/* Nome & Preço */}
                    <div className="mb-6 flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter truncate drop-shadow-md">
                          {arma}
                        </h3>
                        <p className="text-zinc-400 font-medium text-sm truncate">{skin || 'Special Item'}</p>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg shrink-0">
                        <p className="text-emerald-400 font-black tracking-tight drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                          {Number(g.valor).toFixed(2)}€
                        </p>
                      </div>
                    </div>

                    {/* Painel de Estatísticas High-Tech */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center gap-1 group-hover:bg-white/[0.02] transition-colors">
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Participantes</span>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-zinc-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path></svg>
                          <span className="text-white font-black">{g._count?.participantes || 0}</span>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center gap-1 group-hover:bg-white/[0.02] transition-colors">
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Requisito</span>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          <span className={g.depositoMinimo > 0 ? "text-amber-400 font-black text-sm" : "text-emerald-400 font-black text-sm"}>
                            {g.depositoMinimo > 0 ? `${g.depositoMinimo}€` : 'GRÁTIS'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 🟢 Botão Ultra Premium com brilho */}
                    <button 
                      onClick={() => entrarGiveaway(g.id)}
                      disabled={loadingId === g.id}
                      className={`w-full mt-auto py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-300 relative overflow-hidden
                        ${loadingId === g.id 
                          ? 'bg-[#1a1c23] text-zinc-600 border border-white/5 cursor-not-allowed' 
                          : 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:-translate-y-1'}`}
                    >
                      {/* Efeito de brilho que passa no botão */}
                      {loadingId !== g.id && (
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] -translate-x-[150%] hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
                      )}
                      
                      <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                        {loadingId === g.id ? (
                          <span className="animate-pulse flex items-center gap-2">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            A ENTRAR...
                          </span>
                        ) : (
                          <>
                            ENTRAR NO SORTEIO
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}