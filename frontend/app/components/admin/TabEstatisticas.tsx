import React, { useState, useEffect } from 'react';

export default function TabEstatisticas() {
  const [stats, setStats] = useState({ totalUsers: 0, saldoEmCirculacao: 0, armasEmCirculacao: 0, totalCaixasCriadas: 0 });

  useEffect(() => {
    fetch('http://localhost:3000/admin/estatisticas')
      .then(res => res.json())
      .then(setStats)
      .catch(console.log);
  }, []);

  return (
    <div className="animate-in fade-in">
      <h3 className="text-xl font-black uppercase mb-8 text-white border-b border-white/10 pb-4 flex items-center gap-2">
        <span className="text-2xl">📊</span> Visão Global do Império
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#161619] border border-amber-500/20 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full group-hover:bg-amber-500/10 transition-colors"></div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">💰</span>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">Saldo em Circulação</h4>
          </div>
          <p className="text-5xl font-black font-mono text-amber-500 tracking-tighter">
            {stats.saldoEmCirculacao.toLocaleString('pt-PT')}€
          </p>
        </div>

        <div className="bg-[#161619] border border-purple-500/20 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full group-hover:bg-purple-500/10 transition-colors"></div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">🔫</span>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">Arsenal Global</h4>
          </div>
          <p className="text-5xl font-black font-mono text-purple-500 tracking-tighter">{stats.armasEmCirculacao}</p>
        </div>

        <div className="bg-[#161619] border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full group-hover:bg-blue-500/10 transition-colors"></div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">👥</span>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">Clientes Totais</h4>
          </div>
          <p className="text-5xl font-black font-mono text-blue-500 tracking-tighter">{stats.totalUsers}</p>
        </div>

        <div className="bg-[#161619] border border-emerald-500/20 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full group-hover:bg-emerald-500/10 transition-colors"></div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">📦</span>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">Caixas Fabricadas</h4>
          </div>
          <p className="text-5xl font-black font-mono text-emerald-500 tracking-tighter">{stats.totalCaixasCriadas}</p>
        </div>
      </div>
    </div>
  );
}