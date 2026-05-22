import React, { useState } from 'react';

export default function ProfileInventory({ inventario, setInventario, setSaldo, setView }: any) {
  const [search, setSearch] = useState('');

  return (
    <div className="bg-[#1b1b1e] rounded-xl border border-white/5 p-6 animate-in fade-in">
      <div className="flex flex-wrap gap-4 mb-6 items-center bg-[#121215] p-3 rounded-lg border border-white/5">
        <div className="flex gap-2">
          <div className="bg-[#1b1b1e] border border-white/5 rounded px-4 py-2.5 flex items-center gap-8 cursor-pointer hover:bg-white/5 transition-colors">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">TIPO DE ARMA</span><span className="text-[8px] text-zinc-600">▼</span>
          </div>
        </div>
        
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 text-xs">🔍</span>
          <input 
            type="text" placeholder="PESQUISAR" 
            className="w-full bg-[#1b1b1e] border border-white/5 rounded p-2.5 pl-9 text-[10px] font-black text-white outline-none focus:border-white/20 transition-colors tracking-widest"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {inventario?.length > 0 ? (
          inventario.filter((item: any) => item.nome.toLowerCase().includes(search.toLowerCase())).map((item: any, idx: number) => (
          <div key={idx} className="bg-[#121215] border border-white/5 rounded-xl p-4 flex flex-col relative group transition-all hover:bg-[#161619]">
            
            <div className="flex justify-between items-start mb-2 z-10">
              <span className="text-[10px] font-black text-zinc-500 tracking-widest">{item.raridade === 'Comum' ? 'FT' : 'MW'}</span>
              <span className="text-[8px] font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded uppercase tracking-widest border border-blue-500/20">ATUALIZAR</span>
            </div>
            
            <div className="relative h-28 flex items-center justify-center my-2">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent blur-xl rounded-full opacity-50"></div>
              <img src={item.imagem || item.image || '/skins/glock.png'} className="w-24 h-24 object-contain relative z-10 drop-shadow-xl group-hover:scale-110 transition-transform duration-300" alt={item.nome} />
            </div>

            <div className="mt-auto pt-3 border-t border-white/5 z-10 text-center">
              <p className="text-[10px] font-bold text-zinc-500 uppercase truncate w-full">{item.nome.split('|')[0] || 'Item'}</p>
              <p className="text-[11px] font-black text-white uppercase truncate w-full mb-3">{item.nome.split('|')[1] || item.nome}</p>
              <div className="text-center text-xs font-black text-amber-500 bg-[#1b1b1e] border border-white/5 py-2 rounded">
                {(item.preco || item.valor || 0).toFixed(2)}€
              </div>
            </div>

            <div className="absolute inset-0 bg-[#121215]/95 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-2 p-4 z-20">
              <button 
                onClick={() => {
                  const conf = window.confirm(`Vender por ${(item.preco || item.valor).toFixed(2)}€?`);
                  if(conf) {
                    setSaldo((s: number) => s + Number(item.preco || item.valor));
                    setInventario((inv: any) => inv.filter((_: any, i: number) => i !== idx));
                  }
                }}
                className="w-full bg-[#84c13a] hover:bg-[#96d845] text-black font-black text-[10px] py-3 rounded uppercase tracking-widest transition-colors shadow-lg"
              >
                VENDER {(item.preco || item.valor || 0).toFixed(2)}€
              </button>
              <button onClick={() => setView('upgrader')} className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black text-[10px] py-3 rounded uppercase tracking-widest transition-colors">
                Fazer Upgrade
              </button>
            </div>
          </div>
        ))
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center">
            <p className="text-zinc-600 font-black uppercase tracking-[0.2em] text-sm mb-6">O TEU INVENTÁRIO ESTÁ VAZIO</p>
            <button onClick={() => setView('store')} className="border border-white/10 text-zinc-400 hover:text-white px-10 py-4 rounded-lg hover:bg-white/5 transition-colors uppercase font-black text-[11px] tracking-widest">ABRIR CAIXAS</button>
          </div>
        )}
      </div>
    </div>
  );
}