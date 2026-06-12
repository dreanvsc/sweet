'use client';

import React, { useState, useEffect } from 'react';

export default function AdminDepositosSkins() {
  const [depositos, setDepositos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAcao, setLoadingAcao] = useState<number | null>(null);

  const fetchDepositos = async () => {
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/admin/depositos-skins');
      if (res.ok) {
        const data = await res.json();
        setDepositos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar depósitos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepositos();
    // Atualiza a cada 30 segundos automaticamente para não teres de fazer refresh
    const interval = setInterval(fetchDepositos, 30000);
    return () => clearInterval(interval);
  }, []);

  const aprovarDeposito = async (id: number) => {
    if (!confirm('⚠️ ATENÇÃO: Confirma se JÁ RECEBESTE a skin na tua Steam. Queres dar o saldo a este jogador?')) return;
    setLoadingAcao(id);
    try {
      const res = await fetch(`https://sweet-7ifa.onrender.com/admin/depositos-skins/confirmar/${id}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.sucesso) {
        alert(`✅ SUCESSO! Saldo creditado na conta do jogador.`);
        fetchDepositos();
      } else {
        alert(`❌ Erro: ${data.mensagem}`);
      }
    } catch (e) {
      alert('Erro ao ligar ao servidor.');
    } finally {
      setLoadingAcao(null);
    }
  };

  const rejeitarDeposito = async (id: number) => {
    if (!confirm('Tem a certeza que quer CANCELAR este depósito? (O jogador não receberá saldo)')) return;
    setLoadingAcao(id);
    try {
      await fetch(`https://sweet-7ifa.onrender.com/admin/depositos-skins/rejeitar/${id}`, {
        method: 'POST'
      });
      fetchDepositos();
    } catch (e) {
      alert('Erro ao ligar ao servidor.');
    } finally {
      setLoadingAcao(null);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      {/* TÍTULO */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
           <span className="text-2xl">📥</span>
        </div>
        <div>
          <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">Depósitos Manuais</h3>
          <p className="text-zinc-400 text-[10px] font-bold tracking-widest uppercase mt-1">Aprova as skins que caíram na tua conta Steam</p>
        </div>
      </div>

      {/* LISTA DE DEPÓSITOS PENDENTES */}
      <div className="bg-[#161619]/80 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 bg-black/40 border-b border-white/5 grid grid-cols-12 gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
          <div className="col-span-4">Jogador / Skin</div>
          <div className="col-span-3 text-center">Trade URL do Jogador</div>
          <div className="col-span-2 text-center">Valor a Pagar</div>
          <div className="col-span-3 text-right">Ação</div>
        </div>

        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="p-12 text-center text-zinc-500 font-black uppercase tracking-widest animate-pulse">
              A procurar radar de skins...
            </div>
          ) : depositos.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center gap-4 text-zinc-500">
              <span className="text-4xl grayscale opacity-50">🕸️</span>
              <p className="font-black uppercase tracking-widest text-xs">Nenhum depósito pendente</p>
            </div>
          ) : (
            depositos.map((dep: any) => (
              <div key={dep.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-white/[0.02] transition-colors">
                
                {/* JOGADOR E SKIN */}
                <div className="col-span-4 flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {dep.skinImagem ? (
                      <img src={`https://community.cloudflare.steamstatic.com/economy/image/${dep.skinImagem}`} alt={dep.skinNome} className="max-w-[80%] max-h-[80%] object-contain" />
                    ) : (
                      <span className="text-xl">🔫</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-black text-sm truncate">{dep.skinNome}</p>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5 truncate">
                      De: {dep.user?.nome || 'Desconhecido'} (ID: {dep.userId})
                    </p>
                  </div>
                </div>

                {/* TRADE URL DO JOGADOR */}
                <div className="col-span-3 flex justify-center">
                  {dep.user?.tradeUrl ? (
                    <a href={dep.user.tradeUrl} target="_blank" rel="noreferrer" className="text-[10px] bg-blue-500/10 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/20 font-bold uppercase tracking-widest transition-colors inline-block truncate max-w-full">
                      Ver Trade URL
                    </a>
                  ) : (
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Não definido</span>
                  )}
                </div>

                {/* VALOR */}
                <div className="col-span-2 text-center">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg font-black text-sm shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    {dep.valor.toFixed(2)}€
                  </span>
                </div>

                {/* BOTÕES */}
                <div className="col-span-3 flex justify-end gap-2">
                  <button
                    onClick={() => rejeitarDeposito(dep.id)}
                    disabled={loadingAcao === dep.id}
                    className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
                    title="Cancelar Depósito"
                  >
                    ❌
                  </button>
                  <button
                    onClick={() => aprovarDeposito(dep.id)}
                    disabled={loadingAcao === dep.id}
                    className="px-4 h-10 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] disabled:opacity-50 flex items-center gap-2"
                  >
                    {loadingAcao === dep.id ? '...' : 'APROVAR'}
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}