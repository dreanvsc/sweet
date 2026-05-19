'use client';

import React, { useEffect, useState } from 'react';

export default function ProfileHistory({ userId }: any) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ESTADOS DA PAGINAÇÃO
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8;

  useEffect(() => {
    if (!userId) return;

    fetch(`https://sweet-7ifa.onrender.com/utilizador/historico/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setHistorico(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  const getIconAcao = (acao: string) => {
    if (acao.includes('Caixa')) return '📦';
    if (acao.includes('Upgrader')) return '⚖️';
    if (acao.includes('Battle')) return '⚔️';
    if (acao.includes('Coinflip')) return '🪙';
    return '💰';
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-zinc-500 font-black tracking-widest text-xs uppercase animate-pulse">
        ⏳ A carregar histórico do Império...
      </div>
    );
  }

  if (historico.length === 0) {
    return (
      <div className="bg-[#1b1b1e] rounded-xl border border-white/5 p-20 text-center animate-in fade-in">
        <span className="text-5xl block mb-6 opacity-20 grayscale">🕒</span>
        <h3 className="text-white font-black uppercase tracking-widest mb-2">Nenhum registo encontrado</h3>
        <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">Ainda não tens atividade registada nesta conta.</p>
      </div>
    );
  }

  // MATEMÁTICA DA PAGINAÇÃO
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const itensDaPaginaAtual = historico.slice(indicePrimeiroItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(historico.length / itensPorPagina);

  return (
    <div className="bg-[#1b1b1e] border border-white/5 rounded-xl overflow-hidden shadow-2xl animate-in fade-in flex flex-col justify-between min-h-[500px]">
      <div>
        <div className="p-6 border-b border-white/5 bg-black/10">
          <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
            <span>🕒</span> Histórico de Atividade
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-black/20 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                <th className="p-4 pl-6">Ação</th>
                <th className="p-4">Detalhes do Jogo</th>
                <th className="p-4 text-right">Valor</th>
                <th className="p-4 text-center">Resultado</th>
                <th className="p-4 text-right pr-6">Data e Hora Exata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {itensDaPaginaAtual.map((item: any) => {
                const IsGanho = item.tipo === 'GANHO' || item.tipo === 'DEPOSITO';
                
                // 🔥 DATA, HORA E SEGUNDO EXATOS DO PRISMA
                const dataObjeto = item.createdAt ? new Date(item.createdAt) : new Date();
                const dataFormatada = dataObjeto.toLocaleString('pt-PT', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });

                return (
                  <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="p-3 pl-6 text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="bg-black/40 w-7 h-7 rounded-lg flex items-center justify-center border border-white/5 shadow-inner text-sm">
                        {getIconAcao(item.acao)}
                      </span>
                      {item.acao}
                    </td>
                    <td className="p-3 text-xs font-bold text-zinc-400">{item.detalhe}</td>
                    <td className="p-3 text-xs font-mono font-black text-right text-zinc-300">{Number(item.valor).toFixed(2)}€</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-3 py-0.5 rounded text-[9px] font-black tracking-widest uppercase border ${
                        IsGanho ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {item.tipo}
                      </span>
                    </td>
                    {/* 🔥 EXIBIÇÃO COMPLETA DA DATA NA TABELA */}
                    <td className="p-3 text-right text-[10px] font-mono font-bold text-zinc-500 group-hover:text-emerald-400 transition-colors pr-6">
                      {dataFormatada}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONTROLOS DE PAGINAÇÃO */}
      <div className="p-4 border-t border-white/5 bg-black/10 flex justify-between items-center px-6">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
          Página <span className="text-white">{paginaAtual}</span> de <span className="text-zinc-400">{totalPaginas}</span>
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
            disabled={paginaAtual === 1}
            className="px-4 py-2 bg-[#121215] border border-white/5 rounded-lg text-[10px] font-black text-white hover:bg-white/5 uppercase tracking-widest transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ◀ Anterior
          </button>
          <button
            onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
            disabled={paginaAtual === totalPaginas}
            className="px-4 py-2 bg-[#121215] border border-white/5 rounded-lg text-[10px] font-black text-white hover:bg-white/5 uppercase tracking-widest transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Próxima ▶
          </button>
        </div>
      </div>

    </div>
  );
}