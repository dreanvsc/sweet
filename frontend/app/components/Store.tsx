import React from 'react';

export default function Store({ CAIXAS, setCaixaSelecionada, setView }: any) {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Explorar Caixas</h2>
        <div className="h-px flex-1 bg-white/5"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {CAIXAS.map((c: any, i: number) => (
          <div key={i} onClick={() => { setCaixaSelecionada(c); setView('opening'); }}
            className="bg-[#121215] p-1 rounded-[40px] border border-white/5 hover:border-emerald-500/50 transition-all cursor-pointer group relative overflow-hidden">
            <div className="p-10 flex flex-col items-center">
              <span className="absolute top-6 right-6 bg-white/5 px-3 py-1 rounded-full text-[8px] font-black tracking-widest">{c.tag}</span>
              <div className={`w-32 h-32 bg-gradient-to-br ${c.cor} opacity-10 blur-[50px] absolute`}></div>
              <span className="text-7xl mb-6 group-hover:scale-110 transition-transform">📦</span>
              <h3 className="font-black text-sm uppercase tracking-widest mb-1">{c.nome}</h3>
              <span className="text-emerald-500 font-mono font-black text-xl">{c.preco.toFixed(2)}€</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}