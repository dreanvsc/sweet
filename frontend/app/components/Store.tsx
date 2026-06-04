import React from 'react';

export default function Store({ CAIXAS, setCaixaSelecionada, setView }: any) {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in pb-16">
      
      {/* TÍTULO */}
      <div className="flex items-center gap-4 mb-10 px-4 md:px-8">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Explorar Caixas</h2>
        <div className="h-px flex-1 bg-white/5"></div>
      </div>
      
      {/* A GRELHA (Agora com xl:grid-cols-6 para teres as 6 caixas por fila!) */}
      <div className="px-4 md:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          
          {CAIXAS.map((c: any, i: number) => (
            <div 
              key={i} 
              // A TUA LÓGICA DE ABRIR A CAIXA INTATA
              onClick={() => { setCaixaSelecionada(c); setView('opening'); }}
              className="relative bg-[#161619] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center group hover:-translate-y-1.5 hover:bg-[#1b1b1e] hover:border-white/20 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer"
            >
              {/* ETIQUETA (Hot, Nova, etc - Se existir a tag ou for cara) */}
              {(c.tag || c.preco > 50) && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-black px-2.5 py-1 rounded-sm uppercase tracking-widest shadow-lg z-20">
                  {c.tag || 'HOT'}
                </div>
              )}

              {/* IMAGEM DA CAIXA (Tamanho grande, centrada e com sombra) */}
              <div className="w-32 h-32 md:w-36 md:h-36 flex items-center justify-center my-4 relative">
                {/* Brilho de fundo subtil que aparece ao passar o rato */}
                <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Mostra a imagem real da DB. Se falhar, usa o teu emoji! */}
                {c.imagem || c.image ? (
                  <img 
                    src={c.imagem || c.image} 
                    alt={c.nome} 
                    className="max-w-full max-h-full object-contain relative z-10 drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300" 
                  />
                ) : (
                  <span className="text-7xl relative z-10 drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300">📦</span>
                )}
              </div>

              {/* INFORMAÇÃO (Nome em cima, Preço destacado em baixo) */}
              <div className="text-center mt-auto w-full">
                <h3 className="text-white font-black uppercase text-[13px] md:text-sm tracking-[0.15em] truncate w-full text-zinc-300 group-hover:text-white transition-colors">
                  {c.nome}
                </h3>
                
                {/* Preço com o verde estilo casino */}
                <div className="mt-3 flex items-center justify-center gap-1 text-[#10b981] font-black text-sm md:text-base">
                  <span className="text-[10px] md:text-xs opacity-70">€</span> 
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