'use client';

import React, { useState, useEffect } from 'react';

export default function TabEstatisticas() {
  const [stats, setStats] = useState({ totalUsers: 0, saldoEmCirculacao: 0, armasEmCirculacao: 0, totalCaixasCriadas: 0 });

  useEffect(() => {
    fetch('https://sweet-7ifa.onrender.com/admin/estatisticas')
      .then(res => res.json())
      .then(setStats)
      .catch(console.log);
  }, []);

  return (
    <div className="animate-in fade-in">
      <h3 className="text-2xl font-black uppercase italic mb-8 text-white border-b border-white/5 pb-4 flex items-center gap-3">
        <span className="text-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">📊</span> Visão Global do Império
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD SALDO */}
        <div className="bg-[#121215]/80 backdrop-blur-sm border border-amber-500/20 hover:border-amber-500/40 rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-bl-full group-hover:bg-amber-500/10 transition-colors blur-xl"></div>
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <span className="text-4xl drop-shadow-md">💰</span>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Saldo em Circulação</h4>
          </div>
          <p className="text-5xl sm:text-6xl font-black font-mono text-amber-500 tracking-tighter drop-shadow-[0_0_15px_rgba(245,158,11,0.4)] relative z-10">
            {stats.saldoEmCirculacao.toLocaleString('pt-PT')}€
          </p>
        </div>

        {/* CARD ARSENAL */}
        <div className="bg-[#121215]/80 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-bl-full group-hover:bg-purple-500/10 transition-colors blur-xl"></div>
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <span className="text-4xl drop-shadow-md">🔫</span>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Arsenal Global</h4>
          </div>
          <p className="text-5xl sm:text-6xl font-black font-mono text-purple-400 tracking-tighter drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] relative z-10">
            {stats.armasEmCirculacao.toLocaleString('pt-PT')}
          </p>
        </div>

        {/* CARD CLIENTES */}
        <div className="bg-[#121215]/80 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-bl-full group-hover:bg-blue-500/10 transition-colors blur-xl"></div>
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <span className="text-4xl drop-shadow-md">👥</span>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Clientes Totais</h4>
          </div>
          <p className="text-5xl sm:text-6xl font-black font-mono text-blue-400 tracking-tighter drop-shadow-[0_0_15px_rgba(59,130,246,0.4)] relative z-10">
            {stats.totalUsers.toLocaleString('pt-PT')}
          </p>
        </div>

        {/* CARD CAIXAS */}
        <div className="bg-[#121215]/80 backdrop-blur-sm border border-emerald-500/20 hover:border-emerald-500/40 rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-bl-full group-hover:bg-emerald-500/10 transition-colors blur-xl"></div>
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <span className="text-4xl drop-shadow-md">📦</span>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Caixas Fabricadas</h4>
          </div>
          <p className="text-5xl sm:text-6xl font-black font-mono text-emerald-400 tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.4)] relative z-10">
            {stats.totalCaixasCriadas.toLocaleString('pt-PT')}
          </p>
        </div>

      </div>
    </div>
  );
}