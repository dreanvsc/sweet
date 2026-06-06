'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function AdminVerificacoes() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarPedidos = async () => {
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/admin/verificacoes-pendentes');
      
      // Se o servidor der erro 404 (rota ainda não existe) ou 500
      if (!res.ok) throw new Error("Servidor não respondeu corretamente.");
      
      const data = await res.json();
      
      // 🔥 ESCUDO ANTI-CRASH: Só guarda se for realmente uma lista!
      if (Array.isArray(data)) {
        setPedidos(data);
      } else {
        setPedidos([]);
      }
    } catch (e) {
      console.error("Erro ao carregar:", e);
      setPedidos([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    carregarPedidos();
  }, []);

  const aprovar = async (id: number) => {
    const toastId = toast.loading("A aprovar...");
    try {
      const res = await fetch(`https://sweet-7ifa.onrender.com/admin/aprovar-verificacao/${id}`, { method: 'POST' });
      if (res.ok) {
        toast.success("✅ Jogador aprovado!", { id: toastId });
        carregarPedidos();
      } else {
        toast.error("Erro ao aprovar.", { id: toastId });
      }
    } catch(e) { 
      toast.error("Erro no servidor.", { id: toastId }); 
    }
  };

  const rejeitar = async (id: number) => {
    const toastId = toast.loading("A rejeitar...");
    try {
      const res = await fetch(`https://sweet-7ifa.onrender.com/admin/rejeitar-verificacao/${id}`, { method: 'POST' });
      if (res.ok) {
        toast.error("❌ Pedido rejeitado.", { id: toastId });
        carregarPedidos();
      } else {
        toast.error("Erro ao rejeitar.", { id: toastId });
      }
    } catch(e) { 
      toast.error("Erro no servidor.", { id: toastId }); 
    }
  };

  if (loading) return <div className="py-20 text-center text-zinc-500 font-black animate-pulse">A procurar pedidos...</div>;

  // 🔥 ESCUDO 2: Garante que "pedidos" é sempre uma lista antes de tentar desenhar
  const listaSegura = Array.isArray(pedidos) ? pedidos : [];

  return (
    <div className="animate-in fade-in space-y-6">
      <div className="bg-[#121215]/80 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden shadow-xl p-6 md:p-8 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 border-b border-white/5 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter flex items-center gap-3">
              <span className="text-3xl drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">🛡️</span> Painel de <span className="text-indigo-400">Verificações</span>
            </h3>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Aprova ou rejeita quem pode levantar skins do teu império.</p>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
            {listaSegura.length} Pendentes
          </div>
        </div>

        {listaSegura.length === 0 ? (
          <div className="bg-black/40 rounded-2xl border border-dashed border-white/10 p-16 text-center relative z-10">
            <span className="text-5xl block mb-4 opacity-30 drop-shadow-md">🕵️‍♂️</span>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-1">Tudo Limpo</h4>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Nenhum pedido de verificação na mesa.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {listaSegura.map((p) => (
              <div key={p.id} className="bg-black/40 border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={p.avatar || '/skins/glock.png'} className="w-12 h-12 rounded-lg border border-white/10" alt="Avatar" />
                  <div>
                    <h4 className="text-white font-black uppercase text-sm">{p.nome}</h4>
                    <p className="text-zinc-500 text-[9px] font-mono mt-1">ID: {p.id}</p>
                    {p.tradeUrl && p.tradeUrl.length > 15 ? (
                      <p className="text-emerald-500 text-[9px] font-black uppercase mt-1">🔗 Trade URL Configurado</p>
                    ) : (
                      <p className="text-red-500 text-[9px] font-black uppercase mt-1">⚠️ Sem Trade URL</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => aprovar(p.id)} className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black border border-emerald-500/20 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                    ✅ APROVAR
                  </button>
                  <button onClick={() => rejeitar(p.id)} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                    ❌ REJEITAR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}