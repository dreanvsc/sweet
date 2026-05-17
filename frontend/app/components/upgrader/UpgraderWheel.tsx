import React from 'react';

export default function UpgraderWheel({ chance, rotation, spinning, loading, isDowngrade, userSkins, targetSkin, handleUpgrade }: any) {
  return (
    <div className="flex flex-col items-center justify-center relative py-10">
      <div className="relative w-72 h-72 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="144" cy="144" r="130" fill="transparent" stroke="#ef4444" strokeWidth="12" />
          <circle 
            cx="144" cy="144" r="130" fill="transparent" stroke="#10b981" strokeWidth="12" 
            strokeDasharray={`${(Number(chance) * 8.16)} 816`} 
            className="transition-all duration-500"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center upgrader-wheel" style={{ transform: `rotate(${rotation}deg)` }}>
          <div className="w-1 h-32 bg-white rounded-full shadow-[0_0_15px_white] -translate-y-16"></div>
        </div>

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