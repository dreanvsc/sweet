import React from 'react';

export default function CaseVictoryModal({ itemSorteado, setItemSorteado, setView }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in p-4">
       <div className={`bg-[#161619] border border-emerald-500/30 p-6 sm:p-10 rounded-3xl flex flex-col items-center text-center w-full shadow-[0_0_50px_rgba(16,185,129,0.1)] transform animate-in zoom-in-95 ${itemSorteado.itensSorteados.length > 2 ? 'max-w-4xl' : 'max-w-xl'}`}>
         <h3 className="text-2xl sm:text-3xl font-black italic uppercase text-white mb-2">
            {itemSorteado.itensSorteados.length > 1 ? 'Múltiplos Drops!' : 'Drop Épico!'}
         </h3>
         
         <div className={`grid gap-4 w-full my-6 ${itemSorteado.itensSorteados.length >= 4 ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-5' : itemSorteado.itensSorteados.length === 3 ? 'grid-cols-3' : itemSorteado.itensSorteados.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
           {itemSorteado.itensSorteados.map((item: any, idx: number) => (
             <div key={idx} className="flex flex-col items-center bg-black/40 border border-white/5 p-4 rounded-2xl relative">
                <div className="absolute inset-0 bg-emerald-500/5 blur-xl rounded-full"></div>
                <img src={item.imageUrl} className="w-24 h-24 sm:w-28 sm:h-28 object-contain relative z-10 drop-shadow-2xl hover:scale-110 transition-transform" alt="win" />
                <p className="text-[10px] sm:text-xs font-bold text-white mt-4 truncate w-full">{item.nome}</p>
                <p className="text-emerald-500 font-mono text-sm sm:text-base font-black">{item.valor}€</p>
             </div>
           ))}
         </div>
         
         {itemSorteado.itensSorteados.length > 1 && (
            <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Valor Total</span>
              <span className="text-2xl font-black text-emerald-500 font-mono">{itemSorteado.valorTotal}€</span>
            </div>
         )}
         
         <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md mx-auto">
            <button onClick={() => setItemSorteado(null)} className="flex-1 py-3 sm:py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors text-xs sm:text-sm uppercase tracking-widest">GIRAR OUTRA VEZ</button>
            <button onClick={() => setView('profile')} className="flex-1 py-3 sm:py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg text-xs sm:text-sm">IR PARA PERFIL</button>
         </div>
       </div>
    </div>
  );
}