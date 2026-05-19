'use client';

import React, { useEffect, useState } from 'react';

export default function AdminMissoes() {
  const [missoes, setMissoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarMissoes = async () => {
    try {
      const res = await fetch('http://localhost:3000/admin/missoes/pendentes');
      const data = await res.json();
      setMissoes(data);
    } catch (error) {
      console.error("Erro ao carregar missões.");
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarMissoes();
  }, []);

  const aprovarMissao = async (id: number) => {
    if (!confirm('Queres mesmo aprovar este vídeo e pagar 0.09€ ao jogador?')) return;
    
    try {
      const res = await fetch(`http://localhost:3000/admin/missoes/aprovar/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.sucesso) {
        alert('✅ ' + data.mensagem);
        carregarMissoes(); // Recarrega a tabela para esconder o link aprovado
      } else alert('❌ ' + data.mensagem);
    } catch (e) {
      alert('Erro no servidor.');
    }
  };

  const rejeitarMissao = async (id: number) => {
    if (!confirm('Rejeitar este vídeo? O jogador não vai receber nada.')) return;

    try {
      const res = await fetch(`http://localhost:3000/admin/missoes/rejeitar/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.sucesso) {
        alert('✅ ' + data.mensagem);
        carregarMissoes();
      } else alert('❌ ' + data.mensagem);
    } catch (e) {
      alert('Erro no servidor.');
    }
  };

  if (loading) return <div className="text-zinc-500 animate-pulse font-black uppercase text-xs">⏳ A carregar moderação...</div>;

  return (
    <div className="animate-in fade-in">
      <h3 className="text-2xl font-black italic uppercase text-white mb-2">Moderação de <span className="text-purple-500">Links</span></h3>
      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">Aprova os vídeos dos jogadores para lhes dar saldo.</p>

      {missoes.length === 0 ? (
        <div className="bg-black/20 rounded-xl border border-white/5 p-16 text-center">
          <span className="text-5xl block mb-4 opacity-50">😴</span>
          <h4 className="text-white font-black uppercase tracking-widest">Nenhum vídeo pendente</h4>
          <p className="text-zinc-500 text-[10px] font-bold uppercase">Todos os links já foram analisados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-black/20 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                <th className="p-4 pl-6">Jogador</th>
                <th className="p-4">Plataforma</th>
                <th className="p-4">Link (Clica para ver)</th>
                <th className="p-4 text-right pr-6">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {missoes.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.01] transition-colors group">
                  
                  {/* FOTO E NOME DO JOGADOR */}
                  <td className="p-4 pl-6 flex items-center gap-3">
                    <img src={m.user?.avatar || '/skins/glock.png'} alt="Avatar" className="w-8 h-8 rounded-lg border border-white/10" />
                    <div>
                      <span className="text-white text-xs font-black uppercase block">{m.user?.nome || 'Desconhecido'}</span>
                      <span className="text-zinc-500 text-[9px] font-mono">ID: {m.userId}</span>
                    </div>
                  </td>

                  {/* PLATAFORMA */}
                  <td className="p-4 text-xs font-black text-zinc-300">
                    <span className={`px-2 py-1 rounded border text-[9px] uppercase tracking-widest ${
                      m.plataforma === 'TikTok' ? 'bg-pink-500/10 text-pink-500 border-pink-500/20' :
                      m.plataforma === 'YouTube' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      'bg-purple-500/10 text-purple-500 border-purple-500/20'
                    }`}>
                      {m.plataforma}
                    </span>
                  </td>

                  {/* LINK DO VÍDEO (ABRE NUMA NOVA ABA) */}
                  <td className="p-4">
                    <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline text-xs font-bold truncate max-w-[200px] inline-block">
                      {m.link}
                    </a>
                  </td>

                  {/* BOTÕES DE APROVAR / REJEITAR */}
                  <td className="p-4 text-right pr-6 flex justify-end gap-2">
                    <button 
                      onClick={() => aprovarMissao(m.id)}
                      className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black border border-emerald-500/20 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      Aprovar
                    </button>
                    <button 
                      onClick={() => rejeitarMissao(m.id)}
                      className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      Rejeitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}