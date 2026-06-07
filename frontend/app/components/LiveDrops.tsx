import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://sweet-7ifa.onrender.com');

const NOMES_BOTS = [
  'xX_Sniper_Xx', 'ProPlayer99', 'CS_King', 'NightWolf', 'ShadowBlade',
  'DragonSlayer', 'CryptoKing', 'EliteForce', 'DarkMatter', 'IronFist',
  'GhostRider', 'BlazeFire', 'StormBreaker', 'VoidWalker', 'NeonKnight',
  'SilverBullet', 'ThunderBolt', 'PhantomX', 'CrimsonFox', 'ArcticWolf'
];

const DROPS_BOTS_BASE = [
  { nome: 'AK-47 | Asiimov', raridade: 'Raro', valor: 45.50 },
  { nome: 'M4A4 | Howl', raridade: 'Lendário', valor: 1200.00 },
  { nome: 'AWP | Dragon Lore', raridade: 'Lendário', valor: 4500.00 },
  { nome: 'Glock-18 | Fade', raridade: 'Raro', valor: 180.00 },
  { nome: 'USP-S | Kill Confirmed', raridade: 'Raro', valor: 65.00 },
  { nome: 'Karambit | Doppler', raridade: 'Lendário', valor: 850.00 },
  { nome: 'Desert Eagle | Blaze', raridade: 'Raro', valor: 95.00 },
  { nome: 'M4A1-S | Printstream', raridade: 'Lendário', valor: 320.00 },
  { nome: 'AK-47 | Fire Serpent', raridade: 'Lendário', valor: 750.00 },
  { nome: 'Butterfly Knife | Fade', raridade: 'Lendário', valor: 2100.00 },
];

const getAvatar = (nome: string) => {
  const seed = nome.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const id = (seed % 70) + 1; // números de 1 a 70
  const genero = seed % 2 === 0 ? 'men' : 'women';
  return `https://randomuser.me/api/portraits/${genero}/${id}.jpg`;
};

const gerarDropBot = (skins: any[]) => {
  const nome = NOMES_BOTS[Math.floor(Math.random() * NOMES_BOTS.length)];
  const dropBase = DROPS_BOTS_BASE[Math.floor(Math.random() * DROPS_BOTS_BASE.length)];

  let imagemSkin = '/skins/glock.png';
  if (skins.length > 0) {
    const skinMatch = skins.find((s: any) =>
      s.nome?.toLowerCase().includes(dropBase.nome.split('|')[0].trim().toLowerCase())
    );
    const skinAleatoria = skins[Math.floor(Math.random() * Math.min(skins.length, 200))];
    const skinEscolhida = skinMatch || skinAleatoria;
    if (skinEscolhida?.imagem) {
      imagemSkin = skinEscolhida.imagem.includes('steam')
        ? `https://wsrv.nl/?url=${encodeURIComponent(skinEscolhida.imagem)}`
        : skinEscolhida.imagem;
    }
  }

  return { ...dropBase, imagem: imagemSkin, userNome: nome, userFoto: getAvatar(nome), isBot: true };
};

function DropCard({ drop }: { drop: any }) {
  const corRaridade = drop.raridade === 'Lendário' ? 'bg-amber-500' :
                      drop.raridade === 'Raro' ? 'bg-purple-500' : 'bg-blue-500';
  const corBorda = drop.raridade === 'Lendário' ? 'border-amber-500/30' :
                   drop.raridade === 'Raro' ? 'border-purple-500/30' : 'border-blue-500/20';

  return (
    <div className={`inline-flex items-center gap-3 bg-white/5 border ${corBorda} p-2 rounded-xl min-w-[210px] hover:bg-white/10 transition-all cursor-pointer`}>
      <img
        src={drop.userFoto || getAvatar(drop.userNome || 'player')}
        className="w-8 h-8 rounded-lg border border-white/10 bg-black/40 shrink-0"
        alt="User"
        onError={(e: any) => { e.currentTarget.src = '/skins/glock.png'; }}
      />
      <div className="relative w-12 h-12 shrink-0">
        <div className={`absolute inset-0 blur-lg rounded-full opacity-30 ${corRaridade}`}></div>
        <img
          src={drop.imagem}
          className="w-full h-full object-contain relative z-10 drop-shadow-lg"
          alt={drop.nome}
          onError={(e: any) => { e.currentTarget.src = '/skins/glock.png'; }}
        />
      </div>
      <div className="flex flex-col overflow-hidden max-w-[110px]">
        <span className="text-[9px] font-bold text-zinc-400 truncate">{drop.userNome || 'Jogador'}</span>
        <span className="text-[10px] font-black text-white truncate uppercase">{drop.nome}</span>
        <span className="text-[10px] font-mono font-black text-emerald-500">{Number(drop.valor).toFixed(2)}€</span>
      </div>
    </div>
  );
}

export default function LiveDrops() {
  const [drops, setDrops] = useState<any[]>([]);
  const [skinsDaBD, setSkinsDaBD] = useState<any[]>([]);

  useEffect(() => {
    fetch('https://sweet-7ifa.onrender.com/itens')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setSkinsDaBD(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (skinsDaBD.length === 0) return;
    setDrops(Array.from({ length: 10 }, () => gerarDropBot(skinsDaBD)));
  }, [skinsDaBD]);

  useEffect(() => {
    socket.on('novo_drop', (drop) => {
      setDrops(prev => [drop, ...prev].slice(0, 15));
    });
    return () => { socket.off('novo_drop'); };
  }, []);

  useEffect(() => {
    if (skinsDaBD.length === 0) return;
    const agendar = (): ReturnType<typeof setTimeout> => {
      const tempo = 8000 + Math.random() * 7000;
      return setTimeout(() => {
        setDrops(prev => [gerarDropBot(skinsDaBD), ...prev].slice(0, 15));
        timer = agendar();
      }, tempo);
    };
    let timer = agendar();
    return () => clearTimeout(timer);
  }, [skinsDaBD]);

  return (
    <div className="w-full bg-[#0d0d0f] border-b border-white/5 h-20 flex items-center overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 bg-red-600 px-3 flex items-center z-20 shadow-[5px_0_15px_rgba(220,38,38,0.3)]">
        <span className="text-[10px] font-black text-white uppercase animate-pulse">LIVE</span>
      </div>

      {drops.length === 0 ? (
        <div className="pl-24 text-zinc-600 text-[10px] font-bold uppercase tracking-widest animate-pulse">
          📡 À espera das próximas aberturas...
        </div>
      ) : (
        <div className="flex gap-2 px-14 animate-scroll whitespace-nowrap">
          {drops.map((drop, i) => <DropCard key={i} drop={drop} />)}
          {drops.map((drop, i) => <DropCard key={`dup-${i}`} drop={drop} />)}
        </div>
      )}

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll { animation: scroll 35s linear infinite; }
        .animate-scroll:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}