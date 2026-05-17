import React from 'react';

export default function CaseContents({ caixaSelecionada }: any) {
  return (
    <div className="w-full max-w-5xl border-t border-white/5 pt-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col items-center mb-8">
        <h3 className="text-xl font-black uppercase text-white tracking-widest flex items-center gap-3">
          <span>🎁</span> Conteúdo desta Caixa
        </h3>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">Sistema "Provably Fair" - Sorteio 100% justo</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {(typeof caixaSelecionada.skins === 'string' ? JSON.parse(caixaSelecionada.skins) : (caixaSelecionada.skins || caixaSelecionada.itens || []))
          .sort((a: any, b: any) => (b.preco || b.valor) - (a.preco || a.valor))
          .map((item: any, idx: number) => (
          <div key={idx} className="bg-[#161619] border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center relative hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-colors group">
            <div className="absolute top-3 right-3 bg-black/60 border border-white/10 px-2 py-1 rounded text-[10px] font-mono text-zinc-400 font-bold group-hover:text-emerald-400 group-hover:border-emerald-500/50 transition-colors">
              {parseFloat(item.probabilidade || 0).toFixed(2)}%
            </div>
            <img src={item.imagem || item.image || '/skins/glock.png'} className="w-20 h-20 object-contain mb-4 drop-shadow-lg group-hover:scale-110 transition-transform" alt={item.nome} />
            <p className="text-[10px] font-bold text-white truncate w-full mb-1">{item.nome}</p>
            <p className="text-xs font-mono text-emerald-500 font-black">{Number(item.preco || item.valor || 0).toFixed(2)}€</p>
          </div>
        ))}
      </div>
    </div>
  );
}