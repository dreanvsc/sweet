'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function DashboardParceiro({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState<any>(null);
  const [transferindo, setTransferindo] = useState(false);

  // 1. Vai buscar os dados do código do influencer ao servidor
  const carregarDadosAfiliado = async (isRetry = false) => {
    try {
      const res = await fetch(`https://sweet-7ifa.onrender.com/afiliados/stats/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setEstatisticas(data);
        setLoading(false);
      } else {
        // Se falhar e ainda não tentámos outra vez (pode ser cold start do Render)
        if (!isRetry) {
          setTimeout(() => carregarDadosAfiliado(true), 4000);
        } else {
          setEstatisticas(null);
          setLoading(false);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar dados de afiliado:', e);
      // Retry uma vez por causa do cold start do Render
      if (!isRetry) {
        setTimeout(() => carregarDadosAfiliado(true), 4000);
      } else {
        setEstatisticas(null);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (userId) carregarDadosAfiliado();
  }, [userId]);

  // 2. Transforma as comissões virtuais em saldo real de jogo
  const handleTransferirSaldo = async () => {
    if (!estatisticas || estatisticas.saldoDisponivel <= 0) {
      return toast.error("Não tens saldo de comissão para transferir.");
    }

    setTransferindo(true);
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/afiliados/transferir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(userId) })
      });
      const data = await res.json();

      if (res.ok && data.sucesso) {
        toast.success(`🎉 Sucesso! ${estatisticas.saldoDisponivel.toFixed(2)}€ foram injetados no teu saldo do site!`);
        window.location.reload();
      } else {
        toast.error(data.message || "Erro ao transferir saldo.");
      }
    } catch (e) {
      toast.error("Erro ao ligar ao servidor.");
    }
    setTransferindo(false);
  };

  if (loading) {
    return (
      <div className="flex-1 h-[70vh] flex items-center justify-center">
        <span className="animate-pulse text-zinc-500 font-black text-xs uppercase tracking-widest">A carregar estatísticas de parceiro...</span>
      </div>
    );
  }

  if (!estatisticas) {
    return (
      <div className="flex-1 p-8 text-center text-zinc-500 font-bold uppercase text-xs">
        ❌ Não foste associado a nenhum código de parceiro VIP. Contacta a gerência.
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* CABEÇALHO HERO */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/40 via-black/40 to-transparent border border-purple-500/20 rounded-3xl p-6 sm:p-8 mb-8 shadow-[0_0_50px_rgba(168,85,247,0.05)]">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-purple-500/10 to-transparent blur-xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 font-black px-3 py-1 rounded-full uppercase tracking-widest">Painel de Parceiro VIP</span>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mt-3">Código Ativo: <span className="text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]">{estatisticas.codigo}</span></h2>
            <p className="text-zinc-400 text-xs mt-1">O teu código oferece <strong className="text-white">+5% de bónus</strong> aos teus seguidores e paga-te <strong className="text-purple-400">{estatisticas.comissao}% de comissão real</strong>.</p>
          </div>
          
          {/* LINK DE AFILIADO COPIÁVEL */}
          <button 
            onClick={() => {
              navigator.clipboard.writeText(`https://sweetdrop.pt/?ref=${estatisticas.codigo}`);
              toast.success("Link de referência copiado!");
            }} 
            className="bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest px-4 py-3 rounded-xl border border-white/5 transition-all flex items-center gap-2 hover:scale-105 shrink-0"
          >
            <span>🔗</span> COPIAR LINK DE REFERÊNCIA
          </button>
        </div>
      </div>

      {/* QUADRÍCULA DE ESTATÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        
        {/* USOS TOTAL */}
        <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center justify-center text-2xl">👥</div>
          <div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Utilizadores Registados</p>
            <p className="text-2xl font-black text-white mt-1">{estatisticas.usos} <span className="text-xs text-zinc-400 font-bold">fãs</span></p>
          </div>
        </div>

        {/* VOLUME DE DEPÓSITOS */}
        <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center justify-center text-2xl">📈</div>
          <div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Volume Total Gerado</p>
            <p className="text-2xl font-black text-white mt-1">{Number(estatisticas.volumeGerado).toFixed(2)}<span className="text-amber-500">€</span></p>
          </div>
        </div>

        {/* LUCRO HISTÓRICO */}
        <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center text-2xl">💰</div>
          <div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Ganhos Totais Acumulados</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{Number(estatisticas.ganhosAcumulados).toFixed(2)}€</p>
          </div>
        </div>

      </div>

      {/* BANCO DE RETIRADAS DE COMISSÕES */}
      <div className="bg-gradient-to-b from-zinc-900/60 to-black/80 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(16,185,129,0.1)]">💶</div>
          <div>
            <h4 className="text-white font-black uppercase tracking-wide">Carteira de Comissão</h4>
            <p className="text-zinc-500 text-xs mt-0.5">Dinheiro real pronto a ser injetado diretamente no teu saldo do site.</p>
            <p className="text-3xl font-black text-emerald-400 mt-2 tracking-tight">{Number(estatisticas.saldoDisponivel).toFixed(2)}€</p>
          </div>
        </div>

        <button 
          onClick={handleTransferirSaldo} 
          disabled={transferindo || estatisticas.saldoDisponivel <= 0} 
          className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 disabled:opacity-30 disabled:scale-100 transition-all text-black font-black uppercase text-xs tracking-widest rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-[1.03] relative z-10"
        >
          {transferindo ? 'A TRANSFERIR...' : '⚡ RESGATAR SALDO AGORA'}
        </button>
      </div>

    </div>
  );
}