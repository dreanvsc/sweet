import React, { useState, useEffect } from 'react';

export default function UpgraderStore({ lojaItens, targetSkin, setTargetSkin, valorTotalApostado, precoAlvo, spinning, getPreco }: any) {
  const [lojaPage, setLojaPage] = useState(1);
  const [lojaSearch, setLojaSearch] = useState('');
  const [lojaSort, setLojaSort] = useState<'desc' | 'asc'>('asc');
  const [lojaMinPrice, setLojaMinPrice] = useState<number | string>('');
  const ITEMS_PER_PAGE = 8; 

  useEffect(() => { if (!targetSkin) setLojaPage(1); }, [targetSkin]);

  const filteredLoja = lojaItens
    .filter((item: any) => item.nome.toLowerCase().includes(lojaSearch.toLowerCase()))
    .filter((item: any) => lojaMinPrice === '' || getPreco(item) >= Number(lojaMinPrice))
    .filter((item: any) => valorTotalApostado === 0 || getPreco(item) >= (valorTotalApostado * 1.05))
    .sort((a: any, b: any) => lojaSort === 'desc' ? getPreco(b) - getPreco(a) : getPreco(a) - getPreco(b));

  const totalLojaPages = Math.max(1, Math.ceil(filteredLoja.length / ITEMS_PER_PAGE));
  const lojaPaginated = filteredLoja.slice((lojaPage - 1) * ITEMS_PER_PAGE, lojaPage * ITEMS_PER_PAGE);

  return (
    <div className="bg-[#121215] border border-white/5 rounded-3xl p-6 flex flex-col justify-between relative h-full min-h-[680px]">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Itens para Obter</h3>
          <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Alvo: {targetSkin ? precoAlvo.toFixed(2) : '0.00'}€</span>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">🔍</span>
            <input type="text" placeholder="Encontrar skin..." className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors" value={lojaSearch} onChange={(e) => { setLojaSearch(e.target.value); setLojaPage(1); }} />
          </div>
          
          <div className="flex gap-2">
            <div className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 flex-1 focus-within:border-blue-500 transition-colors">
              <span className="text-[10px] text-zinc-500 font-bold tracking-widest">€ {'>'}</span>
              <input type="number" placeholder="0.00" className="bg-transparent text-xs text-white outline-none w-full font-mono" value={lojaMinPrice} onChange={(e) => { setLojaMinPrice(e.target.value); setLojaPage(1); }} />
            </div>
            <button onClick={() => setLojaSort(s => s === 'desc' ? 'asc' : 'desc')} className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-zinc-400 hover:text-white uppercase font-bold flex items-center gap-1 transition-colors">
              Preço {lojaSort === 'desc' ? '▼' : '▲'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 content-start">
          {lojaPaginated.length > 0 ? (
            lojaPaginated.map((item: any) => (
              <div key={item.id} onClick={() => !spinning && setTargetSkin(item)} className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-2 ${targetSkin?.id === item.id ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/5 bg-black/20 hover:border-white/20'}`}>
                <img src={item.imagem || item.image} className="w-14 h-14 object-contain" alt="" />
                <span className="text-[9px] font-bold text-white text-center truncate w-full">{item.nome}</span>
                <span className="text-blue-400 font-black text-[10px]">{getPreco(item).toFixed(2)}€</span>
              </div>
            ))
          ) : (
            <div className="col-span-2 flex flex-col items-center justify-center h-full opacity-50 mt-10 text-center px-4">
              <span className="text-white font-bold text-xs mb-1">Sem resultados</span>
              {valorTotalApostado > 0 ? (
                 <span className="text-[10px] text-zinc-400">As skins alvo precisam de ser no mínimo 5% mais caras ({ (valorTotalApostado * 1.05).toFixed(2) }€).</span>
              ) : (
                 <span className="text-[10px] text-zinc-400">Tenta ajustar a pesquisa ou diminuir o preço mínimo.</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
        <button onClick={() => setLojaPage(p => Math.max(1, p - 1))} disabled={lojaPage === 1} className="bg-black/50 hover:bg-white/10 text-white disabled:opacity-30 disabled:hover:bg-black/50 px-3 py-2 rounded-lg text-xs font-bold transition-colors">◀</button>
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pág. {lojaPage} de {totalLojaPages}</span>
        <button onClick={() => setLojaPage(p => Math.min(totalLojaPages, p + 1))} disabled={lojaPage === totalLojaPages} className="bg-black/50 hover:bg-white/10 text-white disabled:opacity-30 disabled:hover:bg-black/50 px-3 py-2 rounded-lg text-xs font-bold transition-colors">▶</button>
      </div>
    </div>
  );
}