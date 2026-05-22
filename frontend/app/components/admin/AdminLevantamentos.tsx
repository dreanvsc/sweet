'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function AdminLevantamentos() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarPedidos = async () => {
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/admin/levantamentos');
      const data = await res.json();
      setPedidos(data);
    } catch (e) {
      toast.error("Erro ao carregar levantamentos.");
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  const aprovarPedido = async (id: number) => {
    if (!window.confirm('Já enviaste a proposta de troca (Trade Offer) na Steam? O pedido será marcado como concluído.')) return;
    const toastId = toast.loading("A atualizar...");
    try {
      const res = await fetch(`https://sweet-7ifa.onrender.com/admin/levantamentos/aprovar/${id}`, { method: 'POST' });
      if (res.ok) {
        toast.success("✅ Pedido concluído com sucesso!", { id: toastId });
        carregarPedidos();
      }
    } catch(e) { toast.error("Erro no servidor.", { id: toastId }); }
  };

  const rejeitarPedido = async (id: number) => {
    if (!window.confirm('Rejeitar este pedido? A skin será devolvida ao inventário do jogador no site.')) return;
    const toastId = toast.loading("A rejeitar e devolver skin...");
    try {
      const res = await fetch(`https://sweet-7ifa.onrender.com/admin/levantamentos/rejeitar/${id}`, { method: 'POST' });
      if (res.ok) {
        toast.success("❌ Pedido rejeitado e skin devolvida.", { id: toastId });
        carregarPedidos();
      }
    } catch(e) { toast.error("Erro no servidor.", { id: toastId }); }
  };

  if (loading) return <div className="py-20 text-center text-zinc-500 font-black animate-pulse">A carregar logística...</div>;

  return (
    <div className="animate-in fade-in space-y-6">
      <div className="bg-[#121215]/80 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden shadow-xl p-6 md:p-8 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 border-b border-white/5 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter flex items-center gap-3">
              <span className="text-3xl drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">📦</span> Centro de <span className="text-blue-500">Logística</span>
            </h3>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Pedidos de levantamento (Withdraws) para a Steam.</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
            {pedidos.length} Pendentes
          </div>
        </div>

        {pedidos.length === 0 ? (
          <div className="bg-black/40 rounded-2xl border border-dashed border-white/10 p-16 text-center relative z-10">
            <span className="text-5xl block mb-4 opacity-30 drop-shadow-md">🏖️</span>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-1">Sem Pedidos</h4>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Nenhum levantamento pendente neste momento.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                  <th className="p-4 pl-6 rounded-tl-xl">Jogador</th>
                  <th className="p-4">Skin Requerida</th>
                  <th className="p-4">Trade URL (Steam)</th>
                  <th className="p-4 text-right pr-6 rounded-tr-xl">Ação (Envio)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {pedidos.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <img src={p.user?.avatar || '/skins/glock.png'} className="w-8 h-8 rounded-lg border border-white/10" alt="Avatar" />
                      <div>
                        <span className="text-white text-[10px] font-black uppercase block">{p.user?.nome || 'Jogador'}</span>
                        <span className="text-zinc-500 text-[9px] font-mono">ID: {p.userId}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.skinImagem} className="w-10 h-10 object-contain drop-shadow-md" alt="Skin" />
                        <div>
                          <p className="text-xs font-black text-white">{p.skinNome}</p>
                          <p className="text-[10px] font-mono text-emerald-400">{Number(p.valor).toFixed(2)}€</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <a href={p.tradeUrl} target="_blank" rel="noreferrer" className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all inline-block text-center">
                        🔗 ABRIR TRADE NA STEAM
                      </a>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => aprovarPedido(p.id)} className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black border border-emerald-500/20 px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                          ✅ ENVIADO
                        </button>
                        <button onClick={() => rejeitarPedido(p.id)} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                          ❌ REJEITAR
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}