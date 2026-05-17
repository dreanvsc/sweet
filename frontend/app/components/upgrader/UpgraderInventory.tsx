import React, { useState, useEffect } from 'react';

export default function UpgraderInventory({ inventarioUnico, userSkins, toggleUserSkin, limparSelecao, valorTotalApostado, spinning, setView, getPreco }: any) {
  const [invPage, setInvPage] = useState(1);
  const [invSearch, setInvSearch] = useState('');
  const [invSort, setInvSort] = useState<'desc' | 'asc'>('desc');
  const ITEMS_PER_PAGE = 8; 

  // Reset página quando as skins apostadas forem limpas (após um jogo)
  useEffect(() => { if (userSkins.length === 0) setInvPage(1); }, [userSkins.length]);

  const filteredInv = inventarioUnico
    .filter((item: any) => item.nome.toLowerCase().includes(invSearch.toLowerCase()))
    .sort((a: any, b: any) => invSort === 'desc' ? getPreco(b) - getPreco(a) : getPreco(a) - getPreco(b));

  const totalInvPages = Math.max(1, Math.ceil(filteredInv.length / ITEMS_PER_PAGE));
  const invPaginated = filteredInv.slice((invPage - 1) * ITEMS_PER_PAGE, invPage * ITEMS_PER_PAGE);

  return (
    <div className="bg-[#121215] border border-white/5 rounded-3xl p-6 flex flex-col justify-between relative h-full min-h-[680px]">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Itens para Upgrade</h3>
          <div className="flex items-center gap-2">
            {userSkins.length > 0 && (
              <button onClick={limparSelecao} disabled={spinning} className="text-[9px] text-red-500 hover:text-red-400 uppercase font-black transition-colors">Limpar ✕</button>
            )}
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">{valorTotalApostado.toFixed(2)}€</span>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">🔍</span>
            <input type="text" placeholder="Encontrar skin..." className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-colors" value={invSearch} onChange={(e) => { setInvSearch(e.target.value); setInvPage(1); }} />
          </div>
          <button onClick={() => setInvSort(s => s === 'desc' ? 'asc' : 'desc')} className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-zinc-400 hover:text-white uppercase font-bold flex items-center gap-1 transition-colors">
            Preço {invSort === 'desc' ? '▼' : '▲'}
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 content-start">
          {invPaginated.length > 0 ? (
            invPaginated.map((item: any) => {
              const selecionada = userSkins.some((s: any) => s.uniqueClickId === item.uniqueClickId);
              return (
                <div key={item.uniqueClickId} onClick={() => toggleUserSkin(item)} className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-2 ${selecionada ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-white/5 bg-black/20 hover:border-white/20'}`}>
                  <img src={item.imagem || item.image} className="w-14 h-14 object-contain" alt="" />
                  <span className="text-[9px] font-bold text-white text-center truncate w-full">{item.nome}</span>
                  <span className="text-emerald-500 font-black text-[10px]">{getPreco(item).toFixed(2)}€</span>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 flex flex-col items-center justify-center h-full opacity-80 mt-16">
              <span className="text-white font-bold text-sm mb-4">Não tem nenhuma skin</span>
              <button onClick={() => setView('store')} className="px-6 py-2 border border-white/20 rounded-lg text-xs font-bold hover:bg-white/5 transition-colors text-white uppercase tracking-widest">Abrir Caixas</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
        <button onClick={() => setInvPage(p => Math.max(1, p - 1))} disabled={invPage === 1} className="bg-black/50 hover:bg-white/10 text-white disabled:opacity-30 disabled:hover:bg-black/50 px-3 py-2 rounded-lg text-xs font-bold transition-colors">◀</button>
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pág. {invPage} de {totalInvPages}</span>
        <button onClick={() => setInvPage(p => Math.min(totalInvPages, p + 1))} disabled={invPage === totalInvPages} className="bg-black/50 hover:bg-white/10 text-white disabled:opacity-30 disabled:hover:bg-black/50 px-3 py-2 rounded-lg text-xs font-bold transition-colors">▶</button>
      </div>
    </div>
  );
}