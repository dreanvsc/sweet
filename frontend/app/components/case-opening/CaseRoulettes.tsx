import React from 'react';

export default function CaseRoulettes({ roletas, quantidade, isSpinning, fastOpen, itemSorteado }: any) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-5xl mb-4">
      {roletas.slice(0, quantidade).map((roleta: any[], i: number) => (
        <div key={i} className="w-full h-28 sm:h-36 bg-[#121215] border border-white/10 rounded-2xl overflow-hidden relative shadow-xl">
           <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-amber-500 z-20 -translate-x-1/2 shadow-[0_0_15px_rgba(245,158,11,1)]"></div>
           
           <div 
             className="flex h-full items-center"
             style={{ 
               transform: isSpinning ? `translateX(calc(-40 * 160px + 50% - 80px))` : 'translateX(0)',
               transition: isSpinning 
                  ? (fastOpen ? `transform 0.4s cubic-bezier(0.1, 0.9, 0.2, 1) ${i * 0.05}s` : `transform 5s cubic-bezier(0.15, 0.8, 0.1, 1) ${i * 0.1}s`) 
                  : 'none'
             }}
           >
              {roleta.map((item, index) => (
                <div key={index} className={`w-[160px] flex-shrink-0 flex flex-col items-center justify-center p-2 transition-all duration-300 ${index === 40 && !isSpinning && itemSorteado ? 'scale-110 z-10' : 'opacity-80'}`}>
                  <img src={item?.imagem || item?.image || '/skins/glock.png'} className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-lg" alt="skin" />
                </div>
              ))}
           </div>
        </div>
      ))}
    </div>
  );
}