import React from 'react';

export default function Store({ CAIXAS, setCaixaSelecionada, setView }: any) {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in pb-16">
      
      {/* TÍTULO */}
      <div className="flex items-center gap-4 mb-10 px-4 md:px-8">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Explorar Caixas</h2>
        <div className="h-px flex-1 bg-white/5"></div>
      </div>
      
      {/* A GRELHA COMPACTA (Forçada a 6 colunas em ecrãs grandes com pouco espaço entre elas) */}
      <div className="px-4 md:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          
          {CAIXAS.map((c: any, i: number) => (
            <div 
              key={i} 
              onClick={() => { setCaixaSelecionada(c); setView('opening'); }}
              // 🔥 O novo fundo estilo Hunt.gg: Sem paddings laterais gigantes e com overflow-hidden para a barra de preço colar ao fundo
              className="relative bg-[#1c1c21] border border-white/5 rounded-lg flex flex-col group hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 cursor-pointer overflow-hidden"
            >
              
              {/* ETIQUETA / ÍCONE TOP RIGHT (Estilo Estrela do Hunt.gg ou a tua Tag HOT) */}
              {(c.tag || c.preco > 50) && (
                <div className="absolute top-2 right-2 text-zinc-400 text-xs z-20 group-hover:text-orange-400 transition-colors">
                  ★
                </div>
              )}

              {/* 🔥 ÁREA DA IMAGEM (Muito mais compacta) */}
              <div className="w-full flex-1 flex items-center justify-center p-4 min-h-[110px] md:min-h-[130px] relative mt-2">
                {/* Brilho de fundo */}
                <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {c.imagem || c.image ? (
                  <img 
                    src={c.imagem || c.image} 
                    alt={c.nome} 
                    // Imagem bem menor (max-w-[80px]) para não inchar a caixa
                    className="max-w-[75px] max-h-[75px] md:max-w-[90px] md:max-h-[90px] object-contain relative z-10 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300" 
                  />
                ) : (
                  <span className="text-4xl md:text-5xl relative z-10 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300">📦</span>
                )}
              </div>

              {/* 🔥 ÁREA DO NOME E LINHA */}
              <div className="w-full flex flex-col items-center px-2 pb-3 z-10">
                <span className="text-zinc-300 text-[11px] md:text-xs font-medium truncate w-full text-center group-hover:text-white transition-colors">
                  {c.nome}
                </span>
                {/* A famosa linhazinha colorida do Hunt.gg debaixo do nome */}
                <div className="w-6 h-[2px] bg-indigo-500 group-hover:bg-emerald-400 transition-colors my-1.5 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
              </div>

              {/* 🔥 BARRA DO PREÇO NO FUNDO (Exatamente como na tua imagem 2) */}
              <div className="w-full bg-[#131317] py-2 flex items-center justify-center gap-1.5 border-t border-white/5 group-hover:bg-[#16161b] transition-colors mt-auto z-10">
                {/* Ícone de moeda (opcional, meti o símbolo € a dourado/verde para condizer com o preço) */}
                <div className="flex items-center justify-center gap-1">
                  <span className="text-[#10b981] text-[10px] md:text-[11px] font-black opacity-80">€</span>
                  <span className="text-white font-bold text-[12px] md:text-[13px] tracking-wide">
                    {Number(c.preco).toFixed(2)}
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