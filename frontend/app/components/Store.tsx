import React from 'react';

export default function Store({ CAIXAS, setCaixaSelecionada, setView }: any) {
  return (
    // Voltámos ao teu max-w-7xl original para não estragar as margens do site!
    <div className="max-w-7xl mx-auto animate-in fade-in pb-16">
      
      {/* TÍTULO */}
      <div className="flex items-center gap-4 mb-10 px-4 md:px-8">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Explorar Caixas</h2>
        <div className="h-px flex-1 bg-white/5"></div>
      </div>
      
      <div className="px-4 md:px-8">
        {/* 🔥 GRELHA: Reduzimos o "gap" (espaço entre elas) de gap-6 para gap-4 para ganharmos espaço */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          
          {CAIXAS.map((c: any, i: number) => (
            <div 
              key={i} 
              onClick={() => { setCaixaSelecionada(c); setView('opening'); }}
              // 🔥 CAIXA: Reduzimos o padding (p-4 em vez de p-6) para a caixa ser mais "fit"
              className="relative bg-[#161619] border border-white/5 rounded-2xl p-3 md:p-4 flex flex-col items-center justify-center group hover:-translate-y-1.5 hover:bg-[#1b1b1e] hover:border-white/20 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer"
            >
              {/* ETIQUETA */}
              {(c.tag || c.preco > 50) && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[8px] md:text-[9px] font-black px-2 py-1 rounded-sm uppercase tracking-widest shadow-lg z-20">
                  {c.tag || 'HOT'}
                </div>
              )}

              {/* 🔥 IMAGEM: Reduzimos de w-36 para w-24 para caberem confortavelmente as 6 na fila */}
              <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center my-3 relative">
                <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {c.imagem || c.image ? (
                  <img 
                    src={c.imagem || c.image} 
                    alt={c.nome} 
                    className="max-w-full max-h-full object-contain relative z-10 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300" 
                  />
                ) : (
                  <span className="text-5xl md:text-6xl relative z-10 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300">📦</span>
                )}
              </div>

              {/* INFORMAÇÃO */}
              <div className="text-center mt-auto w-full">
                {/* O texto também ficou um nadinha mais pequeno para não cortar nomes grandes como "PRESTIGE" */}
                <h3 className="text-white font-black uppercase text-[11px] md:text-[12px] tracking-[0.1em] truncate w-full text-zinc-300 group-hover:text-white transition-colors">
                  {c.nome}
                </h3>
                
                <div className="mt-2 flex items-center justify-center gap-1 text-[#10b981] font-black text-xs md:text-sm">
                  <span className="text-[9px] md:text-[10px] opacity-70">€</span> 
                  {Number(c.preco).toFixed(2)}
                </div>
              </div>
              
            </div>
          ))}

        </div>
      </div>
      
    </div>
  );
}