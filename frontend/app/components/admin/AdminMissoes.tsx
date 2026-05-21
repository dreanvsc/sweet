'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast'; // 🔥 Import adicionado

export default function AdminMissoes() {
  const [missoes, setMissoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarMissoes = async () => {
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/admin/missoes/pendentes');
      const data = await res.json();
      setMissoes(data);
    } catch (error) {
      toast.error("Erro ao carregar missões.");
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarMissoes();
  }, []);

  const aprovarMissao = async (id: number) => {
    if (!window.confirm('Aprovar este vídeo e pagar a recompensa ao jogador?')) return;
    
    const toastId = toast.loading("A processar pagamento...");
    try {
      const res = await fetch(`https://sweet-7ifa.onrender.com/admin/missoes/aprovar/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.sucesso) {
        toast.success('✅ ' + data.mensagem, { id: toastId });
        carregarMissoes(); // Recarrega a tabela para esconder o link aprovado
      } else {
        toast.error('❌ ' + data.mensagem, { id: toastId });
      }
    } catch (e) {
      toast.error('Erro no servidor.', { id: toastId });
    }
  };

  const rejeitarMissao = async (id: number) => {
    if (!window.confirm('Rejeitar este vídeo? O jogador não vai receber nada e terá de enviar novo link.')) return;

    const toastId = toast.loading("A rejeitar link...");
    try {
      const res = await fetch(`https://sweet-7ifa.onrender.com/admin/missoes/rejeitar/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.sucesso) {
        toast.success('✅ ' + data.mensagem, { id: toastId });
        carregarMissoes();
      } else {
        toast.error('❌ ' + data.mensagem, { id: toastId });
      }
    } catch (e) {
      toast.error('Erro no servidor.', { id: toastId });
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <span className="text-4xl mb-4">📹</span>
      <div className="text-zinc-500 font-black tracking-widest text-[10px] uppercase">A carregar moderação...</div>
    </div>
  );

  return (
    <div className="animate-in fade-in space-y-6">
      
      <div className="bg-[#121215]/80 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden shadow-xl p-6 md:p-8 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 border-b border-white/5 pb-4 mb-6">
          <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter flex items-center gap-3">
            <span className="text-3xl drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">📹</span> Moderação de <span className="text-purple-500">Links</span>
          </h3>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Aprova os vídeos dos jogadores para lhes dar saldo.</p>
        </div>

        {missoes.length === 0 ? (
          <div className="bg-black/40 rounded-2xl border border-dashed border-white/10 p-16 text-center relative z-10">
            <span className="text-5xl block mb-4 opacity-30 drop-shadow-md">😴</span>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-1">Nenhum vídeo pendente</h4>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Todos os links já foram analisados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                  <th className="p-4 pl-6 rounded-tl-xl">Jogador</th>
                  <th className="p-4">Plataforma</th>
                  <th className="p-4">Link (Clica para ver)</th>
                  <th className="p-4 text-right pr-6 rounded-tr-xl">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {missoes.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                    
                    {/* FOTO E NOME DO JOGADOR */}
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <img src={m.user?.avatar || '/skins/glock.png'} alt="Avatar" className="w-8 h-8 rounded-lg border border-white/10 group-hover:border-purple-500/50 transition-colors" />
                      <div>
                        <span className="text-white text-[10px] font-black uppercase block group-hover:text-purple-400 transition-colors">{m.user?.nome || 'Desconhecido'}</span>
                        <span className="text-zinc-500 text-[9px] font-mono">ID: {m.userId}</span>
                      </div>
                    </td>

                    {/* PLATAFORMA */}
                    <td className="p-4 text-xs font-black text-zinc-300">
                      <span className={`px-3 py-1.5 rounded-lg border text-[9px] uppercase tracking-widest ${
                        m.plataforma === 'TikTok' ? 'bg-pink-500/10 text-pink-400 border-pink-500/30' :
                        m.plataforma === 'YouTube' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      }`}>
                        {m.plataforma}
                      </span>
                    </td>

                    {/* LINK DO VÍDEO (ABRE NUMA NOVA ABA) */}
                    <td className="p-4">
                      <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline text-xs font-bold truncate max-w-[200px] inline-block transition-colors">
                        {m.link}
                      </a>
                    </td>

                    {/* BOTÕES DE APROVAR / REJEITAR */}
                    <td className="p-4 text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => aprovarMissao(m.id)}
                          className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black border border-emerald-500/20 px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                        >
                          Aprovar
                        </button>
                        <button 
                          onClick={() => rejeitarMissao(m.id)}
                          className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                        >
                          Rejeitar
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