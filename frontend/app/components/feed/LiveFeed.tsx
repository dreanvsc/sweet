import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Ligação Direta à Torre de Controlo do teu Backend
const socket = io('http://localhost:3000'); 

export default function LiveFeed() {
  const [drops, setDrops] = useState<any[]>([]);

  useEffect(() => {
    // Fica à escuta da rádio no canal 'novo_drop'
    socket.on('novo_drop', (drop) => {
      setDrops(prev => {
        // Põe a arma nova no início da lista e guarda só as últimas 15 para o site não ficar lento
        const novos = [drop, ...prev];
        return novos.slice(0, 15); 
      });
    });

    return () => { socket.off('novo_drop'); }; // Desliga o rádio se saíres da página
  }, []);

  return (
    <div className="w-full bg-[#0a0a0c] border-b border-white/5 h-20 overflow-hidden relative z-40 flex items-center shadow-2xl">
      {/* Etiqueta fixa à esquerda */}
      <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 border-r border-emerald-500/20 px-6 flex items-center justify-center z-10 backdrop-blur-md">
        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> LIVE DROPS
        </span>
      </div>

      {/* Passadeira de Skins */}
      <div className="flex items-center gap-3 pl-44 pr-8 animate-in slide-in-from-left w-full overflow-x-auto custom-scrollbar no-scrollbar">
        {drops.length === 0 && <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">À espera da próxima abertura...</span>}
        
        {drops.map((drop, idx) => (
          <div key={idx} className="flex-shrink-0 flex items-center bg-[#161619] border border-white/5 rounded-xl pr-4 pl-1 py-1 gap-3 hover:bg-white/5 transition-colors cursor-pointer group">
            {/* Foto do Jogador */}
            <img src={drop.userFoto} className="w-8 h-8 rounded-lg border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity" alt="user" />
            
            {/* Foto da Arma */}
            <div className="w-12 h-12 flex items-center justify-center relative">
               <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <img src={drop.imagem} className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform" alt="skin" />
            </div>

            {/* Nome e Preço */}
            <div className="flex flex-col max-w-[120px]">
              <span className="text-[9px] font-bold text-zinc-400 truncate">{drop.nome}</span>
              <span className="text-[10px] font-mono font-black text-emerald-500">{drop.valor.toFixed(2)}€</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}