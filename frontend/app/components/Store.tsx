import React from 'react';

export default function Store({ CAIXAS, setCaixaSelecionada, setView }: any) {
  return (
    // 🔥 Alargámos o limite máximo da página para as 6 caixas respirarem melhor
    <div className="w-full max-w-[1500px] mx-auto animate-in fade-in pb-16">
      
      {/* TÍTULO */}
      <div className="flex items-center gap-4 mb-8 px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">Explorar Caixas</h2>
        <div className="h-px flex-1 bg-white/5"></div>
      </div>
      
      {/* 🔥 O SEGREDO: lg:grid-cols-6 obriga a espremer 6 caixas a partir de ecrãs normais! */}
      <div className="px-4 md:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-8 gap-3 md:gap-4">
          
          {CAIXAS.map((c: any, i: number) => (
            <div 
              key={i} 
              onClick={() => { setCaixaSelecionada(c); setView('opening'); }}
              // 🔥 CAIXA MAIS ESGUIA: Fundo escuro igual ao Hunt, sem borders grossos
              className="relative bg-[#1a1a21] border border-white/5 rounded flex flex-col group hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-[0_8px_20px_rgba(0,0,0,0.6)] transition-all duration-300 cursor-pointer overflow-hidden"
            >
              
              {/* ESTRELINHA (Canto superior esquerdo como no Hunt) */}
              <div className="absolute top-2 left-2 text-zinc-600 text-[10px] z-20 group-hover:text-zinc-300 transition-colors">
                ★
              </div>

              {/* IMAGEM DA CAIXA: Altura máxima estrangulada a 80px/90px para ficar pequenina */}
              <div className="w-full flex-1 flex items-center justify-center p-2 relative mt-4 min-h-[100px]">
                <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {c.imagem || c.image ? (
                  <img 
                    src={c.imagem || c.image} 
                    alt={c.nome} 
                    className="max-h-[75px] sm:max-h-[85px] object-contain relative z-10 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300" 
                  />
                ) : (
                  <span className="text-4xl relative z-10 drop-shadow-md group-hover:scale-110 transition-transform duration-300">📦</span>
                )}
              </div>

              {/* NOME DA CAIXA (Letra mais pequena) */}
              <div className="w-full flex flex-col items-center px-2 pb-2 z-10 mt-2">
                <span className="text-zinc-400 text-[10px] sm:text-[11px] font-medium truncate w-full text-center group-hover:text-white transition-colors">
                  {c.nome}
                </span>
                {/* Linha de separação colorida estilo Hunt */}
                <div className="w-4 h-[2px] bg-indigo-500/40 group-hover:bg-indigo-400 transition-colors my-1.5 rounded-full"></div>
              </div>

              {/* BARRA DO PREÇO NO FUNDO */}
              <div className="w-full bg-[#131317] py-2 flex items-center justify-center gap-1 border-t border-white/5 mt-auto z-10">
                <div className="flex items-center justify-center gap-1.5">
                  {/* Moedinha amarela C estilo Hunt.gg */}
                  <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-[#131317] text-[8px] font-black shadow-sm">
                    €
                  </div>
                  <span className="text-zinc-100 font-bold text-[11px] sm:text-[12px] tracking-wide group-hover:text-white transition-colors">
                    {Number(c.preco).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              
            </div>
          ))}

        </div>
      </div>
      
    </div>
  );
}