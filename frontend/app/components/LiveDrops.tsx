import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://sweet-7ifa.onrender.com');

// 🤖 NOMES E AVATARES DOS BOTS
const NOMES_BOTS = [
  'xX_Sniper_Xx', 'ProPlayer99', 'CS_King', 'NightWolf', 'ShadowBlade',
  'DragonSlayer', 'CryptoKing', 'EliteForce', 'DarkMatter', 'IronFist',
  'GhostRider', 'BlazeFire', 'StormBreaker', 'VoidWalker', 'NeonKnight',
  'SilverBullet', 'ThunderBolt', 'PhantomX', 'CrimsonFox', 'ArcticWolf'
];

const AVATARES_BOTS = [
  'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
  'https://avatars.steamstatic.com/b5bd56c1aa4644a474a2e4972be27ef9e82e517e_full.jpg',
  'https://avatars.steamstatic.com/8b5a8b6b3b6e6e2e6b6e6e2e6b6e6e2e6b6e6e2e_full.jpg',
  'https://avatars.steamstatic.com/c5d56c1aa4644a474a2e4972be27ef9e82e517e_full.jpg',
  'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
];

// 🎮 DROPS FALSOS DOS BOTS
const DROPS_BOTS = [
  { nome: 'AK-47 | Asiimov', imagem: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I4oY0353CK9CH7sVp2rSOEFjCJhHYQ2VQgfmVxNmDr3GpNGNimlFzIlIYa7CrJT5n0vbNe0xwkKTYA4eAxaWkIO_Tx2nHv9Cp3T7vrYj3i1Hh_UZkZmr3JYOddA33wFM', raridade: 'Raro', valor: 45.50 },
  { nome: 'M4A4 | Howl', imagem: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I4oY0353CK9CH7sVp2rSOEFjCJhHYQ2VQgfmVxNmDr3GpNGNimlFzIlIYa7CrJT5n0vbNe0xwkKTYA4eAxaWkIO_Tx2nHv9Cp3T7vrYj3i1Hh_UZkZmr3JYOddA33wFM', raridade: 'Lendário', valor: 1200.00 },
  { nome: 'AWP | Dragon Lore', imagem: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I4oY0353CK9CH7sVp2rSOEFjCJhHYQ2VQgfmVxNmDr3GpNGNimlFzIlIYa7CrJT5n0vbNe0xwkKTYA4eAxaWkIO_Tx2nHv9Cp3T7vrYj3i1Hh_UZkZmr3JYOddA33wFM', raridade: 'Lendário', valor: 4500.00 },
  { nome: 'Glock-18 | Fade', imagem: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I4oY0353CK9CH7sVp2rSOEFjCJhHYQ2VQgfmVxNmDr3GpNGNimlFzIlIYa7CrJT5n0vbNe0xwkKTYA4eAxaWkIO_Tx2nHv9Cp3T7vrYj3i1Hh_UZkZmr3JYOddA33wFM', raridade: 'Raro', valor: 180.00 },
  { nome: 'USP-S | Kill Confirmed', imagem: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I4oY0353CK9CH7sVp2rSOEFjCJhHYQ2VQgfmVxNmDr3GpNGNimlFzIlIYa7CrJT5n0vbNe0xwkKTYA4eAxaWkIO_Tx2nHv9Cp3T7vrYj3i1Hh_UZkZmr3JYOddA33wFM', raridade: 'Raro', valor: 65.00 },
  { nome: 'Karambit | Doppler', imagem: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I4oY0353CK9CH7sVp2rSOEFjCJhHYQ2VQgfmVxNmDr3GpNGNimlFzIlIYa7CrJT5n0vbNe0xwkKTYA4eAxaWkIO_Tx2nHv9Cp3T7vrYj3i1Hh_UZkZmr3JYOddA33wFM', raridade: 'Lendário', valor: 850.00 },
  { nome: 'Desert Eagle | Blaze', imagem: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I4oY0353CK9CH7sVp2rSOEFjCJhHYQ2VQgfmVxNmDr3GpNGNimlFzIlIYa7CrJT5n0vbNe0xwkKTYA4eAxaWkIO_Tx2nHv9Cp3T7vrYj3i1Hh_UZkZmr3JYOddA33wFM', raridade: 'Raro', valor: 95.00 },
  { nome: 'M4A1-S | Printstream', imagem: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I4oY0353CK9CH7sVp2rSOEFjCJhHYQ2VQgfmVxNmDr3GpNGNimlFzIlIYa7CrJT5n0vbNe0xwkKTYA4eAxaWkIO_Tx2nHv9Cp3T7vrYj3i1Hh_UZkZmr3JYOddA33wFM', raridade: 'Lendário', valor: 320.00 },
  { nome: 'AK-47 | Fire Serpent', imagem: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I4oY0353CK9CH7sVp2rSOEFjCJhHYQ2VQgfmVxNmDr3GpNGNimlFzIlIYa7CrJT5n0vbNe0xwkKTYA4eAxaWkIO_Tx2nHv9Cp3T7vrYj3i1Hh_UZkZmr3JYOddA33wFM', raridade: 'Lendário', valor: 750.00 },
  { nome: 'Butterfly Knife | Fade', imagem: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I4oY0353CK9CH7sVp2rSOEFjCJhHYQ2VQgfmVxNmDr3GpNGNimlFzIlIYa7CrJT5n0vbNe0xwkKTYA4eAxaWkIO_Tx2nHv9Cp3T7vrYj3i1Hh_UZkZmr3JYOddA33wFM', raridade: 'Lendário', valor: 2100.00 },
];

const gerarDropBot = () => {
  const drop = DROPS_BOTS[Math.floor(Math.random() * DROPS_BOTS.length)];
  const nome = NOMES_BOTS[Math.floor(Math.random() * NOMES_BOTS.length)];
  const avatar = AVATARES_BOTS[Math.floor(Math.random() * AVATARES_BOTS.length)];
  return { ...drop, userNome: nome, userFoto: avatar, isBot: true };
};

export default function LiveDrops() {
  const [drops, setDrops] = useState<any[]>([]);

  // 🤖 POPULA COM DROPS DE BOTS NO ARRANQUE
  useEffect(() => {
    const dropsIniciais = Array.from({ length: 8 }, gerarDropBot);
    setDrops(dropsIniciais);
  }, []);

  // 📡 DROPS REAIS VIA SOCKET
  useEffect(() => {
    socket.on('novo_drop', (drop) => {
      setDrops(prev => [drop, ...prev].slice(0, 15));
    });
    return () => { socket.off('novo_drop'); };
  }, []);

  // 🤖 ADICIONA UM DROP DE BOT A CADA 8-15 SEGUNDOS
  useEffect(() => {
    const intervalo = () => {
      const tempo = 8000 + Math.random() * 7000; // entre 8s e 15s
      return setTimeout(() => {
        setDrops(prev => [gerarDropBot(), ...prev].slice(0, 15));
        timer = intervalo(); // reagenda
      }, tempo);
    };

    let timer = intervalo();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full bg-[#0d0d0f] border-b border-white/5 h-20 flex items-center overflow-hidden relative group">
      
      <div className="absolute left-0 top-0 bottom-0 bg-red-600 px-3 flex items-center z-20 shadow-[5px_0_15px_rgba(220,38,38,0.3)]">
        <span className="text-[10px] font-black text-white uppercase animate-pulse">LIVE</span>
      </div>

      <div className="flex gap-2 px-14 animate-scroll whitespace-nowrap">
        {drops.map((drop, i) => (
          <div key={i} className="inline-flex items-center gap-3 bg-white/5 border border-white/5 p-2 rounded-xl min-w-[200px] hover:bg-white/10 transition-all cursor-pointer">
            <img src={drop.userFoto || '/skins/glock.png'} className="w-8 h-8 rounded-lg border border-white/10 opacity-70" alt="User" />
            <div className="relative w-12 h-12">
               <div className={`absolute inset-0 blur-lg rounded-full opacity-20 ${
                 drop.raridade === 'Lendário' ? 'bg-amber-500' : 
                 drop.raridade === 'Raro' ? 'bg-purple-500' : 'bg-blue-500'
               }`}></div>
               <img src={drop.imagem} className="w-full h-full object-contain relative z-10" alt={drop.nome} onError={(e: any) => { e.currentTarget.src = '/skins/glock.png'; }} />
            </div>
            <div className="flex flex-col overflow-hidden max-w-[120px]">
              <span className="text-[10px] font-black text-white truncate uppercase">{drop.nome}</span>
              <span className="text-[10px] font-mono font-black text-emerald-500">{Number(drop.valor).toFixed(2)}€</span>
            </div>
          </div>
        ))}

        {/* Clone para loop infinito */}
        {drops.map((drop, i) => (
          <div key={`dup-${i}`} className="inline-flex items-center gap-3 bg-white/5 border border-white/5 p-2 rounded-xl min-w-[200px]">
            <img src={drop.userFoto || '/skins/glock.png'} className="w-8 h-8 rounded-lg border border-white/10 opacity-70" alt="User" />
            <div className="relative w-12 h-12">
               <img src={drop.imagem} className="w-full h-full object-contain relative z-10" alt={drop.nome} onError={(e: any) => { e.currentTarget.src = '/skins/glock.png'; }} />
            </div>
            <div className="flex flex-col overflow-hidden max-w-[120px]">
              <span className="text-[10px] font-black text-white truncate uppercase">{drop.nome}</span>
              <span className="text-[10px] font-mono font-black text-emerald-500">{Number(drop.valor).toFixed(2)}€</span>
            </div>
          </div>
        ))}
      </div>

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