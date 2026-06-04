import React from 'react';

export default function Store({ CAIXAS, setCaixaSelecionada, setView }: any) {
  // Para o efeito "Evento", vamos fingir que as primeiras 6 caixas são as do evento especial.
  // Podes depois alterar o .slice(0, 6) para filtrares por uma "tag" específica se quiseres.
  const caixasEvento = CAIXAS.slice(0, 6);
  const caixasNormais = CAIXAS.slice(6); // As restantes caixas

  return (
    <div className="w-full max-w-[1500px] mx-auto animate-in fade-in pb-16 px-4 md:px-8">
      
      {/* ================================================================================= */}
      {/* 1. BANNER DO EVENTO (Estilo Key-Drop) */}
      {/* ================================================================================= */}
      <div className="w-full relative rounded-2xl overflow-hidden mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group border border-white/10 cursor-pointer mt-4">
        {/* Podes trocar este link 'src' pela imagem do teu evento! */}
        <img 
          src="https://steamuserimages-a.akamaihd.net/ugc/2002452336336332152/9F614489DEFC1FDE2E8DF18D80BEAF64C592CBEB/" 
          alt="Banner Evento" 
          className="w-full h-[200px] md:h-[300px] lg:h-[350px] object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        
        {/* Sombra escura por cima da imagem para o texto ler-se bem */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131317] via-black/40 to-transparent"></div>
        
        {/* Texto do Banner */}
        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-10">
          <div className="bg-yellow-500 text-black text-[10px] md:text-xs font-black px-2 py-1 rounded-sm uppercase tracking-widest w-max mb-3">
            Evento Limitado
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg">
            High Risk Zone
          </h1>
          <p className="hidden md:block text-zinc-300 font-medium mt-2 max-w-lg text-sm">
            Abre as caixas exclusivas deste evento e aumenta as tuas probabilidades de sacar facas lendárias. Termina em breve!
          </p>
        </div>
      </div>

      {/* ================================================================================= */}
      {/* 2. AS 6 CAIXAS DO EVENTO */}
      {/* ================================================================================= */}
      <div className="mb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {caixasEvento.map((c: any, i: number) => (
            <div 
              key={i} 
              onClick={() => { setCaixaSelecionada(c); setView('opening'); }}
              className="relative bg-[#1a1a21] border border-yellow-500/30 rounded flex flex-col group hover:-translate-y-1 hover:border-yellow-400 hover:shadow-[0_8px_25px_rgba(234,179,8,0.2)] transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Etiqueta Evento */}
              <div className="absolute top-0 left-0 bg-yellow-500 text-black text-[8px] font-black px-2 py-0.5 rounded-br uppercase z-20">
                EVENTO
              </div>

              {/* IMAGEM DA CAIXA */}
              <div className="w-full flex-1 flex items-center justify-center p-2 relative mt-4 min-h-[100px]">
                <div className="absolute inset-0 bg-yellow-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {c.imagem || c.image ? (
                  <img src={c.imagem || c.image} alt={c.nome} className="max-h-[75px] sm:max-h-[85px] object-contain relative z-10 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <span className="text-4xl relative z-10">📦</span>
                )}
              </div>

              {/* NOME DA CAIXA */}
              <div className="w-full flex flex-col items-center px-2 pb-2 z-10 mt-2">
                <span className="text-zinc-400 text-[10px] sm:text-[11px] font-medium truncate w-full text-center group-hover:text-white transition-colors">{c.nome}</span>
                <div className="w-4 h-[2px] bg-yellow-500/50 group-hover:bg-yellow-400 transition-colors my-1.5 rounded-full"></div>
              </div>

              {/* PREÇO */}
              <div className="w-full bg-[#131317] py-2 flex items-center justify-center gap-1 border-t border-white/5 mt-auto z-10">
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-[#131317] text-[8px] font-black">€</div>
                  <span className="text-zinc-100 font-bold text-[11px] sm:text-[12px] group-hover:text-yellow-400 transition-colors">
                    {Number(c.preco).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================================= */}
      {/* 3. RESTO DA LOJA (Todas as Caixas) */}
      {/* ================================================================================= */}
      {caixasNormais.length > 0 && (
        <>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-zinc-300">Todas as Caixas</h2>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {caixasNormais.map((c: any, i: number) => (
              <div 
                key={i} 
                onClick={() => { setCaixaSelecionada(c); setView('opening'); }}
                className="relative bg-[#1a1a21] border border-white/5 rounded flex flex-col group hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-[0_8px_20px_rgba(0,0,0,0.6)] transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="w-full flex-1 flex items-center justify-center p-2 relative mt-4 min-h-[100px]">
                  <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {c.imagem || c.image ? (
                    <img src={c.imagem || c.image} alt={c.nome} className="max-h-[75px] sm:max-h-[85px] object-contain relative z-10 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <span className="text-4xl relative z-10">📦</span>
                  )}
                </div>

                <div className="w-full flex flex-col items-center px-2 pb-2 z-10 mt-2">
                  <span className="text-zinc-400 text-[10px] sm:text-[11px] font-medium truncate w-full text-center group-hover:text-white transition-colors">{c.nome}</span>
                  <div className="w-4 h-[2px] bg-indigo-500/40 group-hover:bg-indigo-400 transition-colors my-1.5 rounded-full"></div>
                </div>

                <div className="w-full bg-[#131317] py-2 flex items-center justify-center gap-1 border-t border-white/5 mt-auto z-10">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-[#131317] text-[8px] font-black">€</div>
                    <span className="text-zinc-100 font-bold text-[11px] sm:text-[12px] group-hover:text-white transition-colors">
                      {Number(c.preco).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}