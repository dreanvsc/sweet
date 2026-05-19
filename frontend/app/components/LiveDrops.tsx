import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// 📡 LIGAÇÃO À TORRE DE CONTROLO DO TEU SERVIDOR
const socket = io('https://sweet-7ifa.onrender.com');

export default function LiveDrops() {
  // O estado agora é gerido internamente pelo próprio componente
  const [drops, setDrops] = useState<any[]>([]);

  useEffect(() => {
    // 🎧 Fica à escuta na rádio. Sempre que sai um drop, põe-no no início da fila
    socket.on('novo_drop', (drop) => {
      setDrops(prev => {
        const novos = [drop, ...prev];
        return novos.slice(0, 15); // Guarda só os últimos 15 para não pesar na memória
      });
    });

    return () => { socket.off('novo_drop'); }; // Desliga o rádio se saíres da página
  }, []);

  return (
    <div className="w-full bg-[#0d0d0f] border-b border-white/5 h-20 flex items-center overflow-hidden relative group">
      
      {/* Etiqueta LIVE */}
      <div className="absolute left-0 top-0 bottom-0 bg-red-600 px-3 flex items-center z-20 shadow-[5px_0_15px_rgba(220,38,38,0.3)]">
        <span className="text-[10px] font-black text-white uppercase animate-pulse">LIVE</span>
      </div>

      {drops.length === 0 ? (
        <div className="pl-24 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
          📡 À espera das próximas aberturas...
        </div>
      ) : (
        <div className="flex gap-2 px-14 animate-scroll whitespace-nowrap">
          {/* LISTA ORIGINAL */}
          {drops.map((drop, i) => (
            <div key={i} className="inline-flex items-center gap-3 bg-white/5 border border-white/5 p-2 rounded-xl min-w-[200px] hover:bg-white/10 transition-all cursor-pointer group/item">
              
              {/* Foto do Jogador que ganhou (O Segredo do FOMO!) */}
              <img src={drop.userFoto || '/skins/glock.png'} className="w-8 h-8 rounded-lg border border-white/10 opacity-70" alt="User" />

              <div className="relative w-12 h-12">
                 <div className={`absolute inset-0 blur-lg rounded-full opacity-20 ${
                   drop.raridade === 'Lendário' ? 'bg-amber-500' : 
                   drop.raridade === 'Raro' ? 'bg-purple-500' : 'bg-blue-500'
                 }`}></div>
                 <img src={drop.imagem} className="w-full h-full object-contain relative z-10" alt={drop.nome} />
              </div>
              
              <div className="flex flex-col overflow-hidden max-w-[120px]">
                <span className="text-[10px] font-black text-white truncate uppercase">{drop.nome}</span>
                {/* Agora mostramos o preço para dar ainda mais inveja aos outros jogadores! */}
                <span className="text-[10px] font-mono font-black text-emerald-500">{drop.valor.toFixed(2)}€</span>
              </div>
            </div>
          ))}

          {/* CLONE DA LISTA PARA O LOOP INFINITO NÃO QUEBRAR (A tua brilhante ideia mantida!) */}
          {drops.map((drop, i) => (
            <div key={`dup-${i}`} className="inline-flex items-center gap-3 bg-white/5 border border-white/5 p-2 rounded-xl min-w-[200px]">
              <img src={drop.userFoto || '/skins/glock.png'} className="w-8 h-8 rounded-lg border border-white/10 opacity-70" alt="User" />
              <div className="relative w-12 h-12">
                 <img src={drop.imagem} className="w-full h-full object-contain relative z-10" alt={drop.nome} />
              </div>
              <div className="flex flex-col overflow-hidden max-w-[120px]">
                <span className="text-[10px] font-black text-white truncate uppercase">{drop.nome}</span>
                <span className="text-[10px] font-mono font-black text-emerald-500">{drop.valor.toFixed(2)}€</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* A tua animação CSS */}
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}