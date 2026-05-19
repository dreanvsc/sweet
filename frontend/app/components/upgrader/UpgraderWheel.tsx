import React from 'react';

export default function UpgraderWheel({ chance, rotation, spinning, loading, isDowngrade, userSkins, targetSkin, handleUpgrade, lado, setLado }: any) {
  
  // 🔥 MAGIA DO SVG: Se for 'over' (Direita), desenhamos a parte verde no fim do círculo!
  const strokeDash = Number(chance) * 8.16;
  const strokeOffset = lado === 'over' ? - (816 - strokeDash) : 0;

  return (
    <div className="flex flex-col items-center justify-center relative py-10">
      
      {/* 🔥 BOTÕES DE ESCOLHER LADO */}
      <div className="flex bg-black/40 p-1 rounded-xl mb-8 border border-white/5 w-full max-w-[250px]">
        <button 
          disabled={spinning}
          onClick={() => setLado('under')} 
          className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${lado === 'under' ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
        >
          Esquerda
        </button>
        <button 
          disabled={spinning}
          onClick={() => setLado('over')} 
          className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${lado === 'over' ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
        >
          Direita
        </button>
      </div>

      <div className="relative w-72 h-72 flex items-center justify-center">
        {/* A Roda Base (Vermelha) */}
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="144" cy="144" r="130" fill="transparent" stroke="#ef4444" strokeWidth="12" />
          
          {/* A Zona de Vitória (Verde) que muda de sítio */}
          <circle 
            cx="144" cy="144" r="130" fill="transparent" stroke="#10b981" strokeWidth="12" 
            strokeDasharray={`${strokeDash} 816`} 
            strokeDashoffset={strokeOffset}
            className="transition-all duration-500"
          />
        </svg>

        {/* O Ponteiro / Agulha que roda */}
        <div className="absolute inset-0 flex items-center justify-center upgrader-wheel transition-transform" 
             style={{ transform: `rotate(${rotation}deg)`, transitionDuration: spinning ? '5s' : '0s', transitionTimingFunction: 'cubic-bezier(0.15, 0.85, 0.3, 1)' }}>
          <div className="w-1 h-32 bg-white rounded-full shadow-[0_0_15px_white] -translate-y-16"></div>
        </div>

        {/* O Centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121215] w-48 h-48 m-auto rounded-full border border-white/5 shadow-inner">
           <span className="text-4xl font-black text-white">{chance}%</span>
           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Chance</span>
        </div>
      </div>

      <button 
        onClick={handleUpgrade}
        disabled={userSkins.length === 0 || !targetSkin || loading || spinning || isDowngrade}
        className={`mt-10 w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all 
          ${(userSkins.length === 0 || !targetSkin) ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 
            isDowngrade ? 'bg-red-500/20 text-red-500 border border-red-500 cursor-not-allowed' : 
            'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105'}`}
      >
        {spinning ? 'A RODAR...' : isDowngrade ? 'ALVO MUITO BARATO' : 'TENTAR UPGRADE'}
      </button>
    </div>
  );
}