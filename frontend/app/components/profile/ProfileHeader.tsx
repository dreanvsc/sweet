import React, { useState } from 'react';

export default function ProfileHeader({ nome, avatar, userData, userId, tradeUrl, saldo, setSaldo, setView }: any) {
  
  // 🔥 ESTADOS DO CÓDIGO PROMOCIONAL
  const [codigo, setCodigo] = useState('');
  const [msgPromo, setMsgPromo] = useState<{ texto: string, tipo: 'sucesso' | 'erro' } | null>(null);
  const [loadingPromo, setLoadingPromo] = useState(false);

  // ==========================================
  // 🔥 LÓGICA DE XP E RANKS DINÂMICOS
  // ==========================================
  const currentLevel = userData?.level || 1;
  const currentXp = userData?.xp || 0;
  
  const xpTotalNecessario = currentLevel * 100; 
  const percentagemProgresso = Math.min(Math.round((currentXp / xpTotalNecessario) * 100), 100);

  const getRankName = (level: number) => {
    if (level < 5) return 'SILVER I';
    if (level < 10) return 'SILVER III';
    if (level < 15) return 'SILVER ELITE';
    if (level < 20) return 'GOLD NOVA I';
    if (level < 30) return 'GOLD NOVA MASTER';
    if (level < 40) return 'MASTER GUARDIAN';
    if (level < 60) return 'LEGENDARY EAGLE';
    if (level < 80) return 'SUPREME MASTER';
    return 'GLOBAL ELITE';
  };

  const currentRank = getRankName(currentLevel);

  // ==========================================
  // 🔥 FUNÇÃO PARA RESGATAR O CÓDIGO
  // ==========================================
  const resgatarCodigo = async () => {
    if (!codigo.trim()) return;
    setLoadingPromo(true);
    setMsgPromo(null);

    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/codigos/resgatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(userId), codigo: codigo.toUpperCase() })
      });
      
      const data = await res.json();
      
      if (data.sucesso || data.valor) {
        setMsgPromo({ texto: `+${Number(data.valor).toFixed(2)}€ ADICIONADOS!`, tipo: 'sucesso' });
        if (setSaldo) setSaldo((prev: number) => prev + Number(data.valor));
        setCodigo(''); // Limpa a caixa
      } else {
        setMsgPromo({ texto: data.erro || 'Código inválido.', tipo: 'erro' });
      }
    } catch (error) {
      setMsgPromo({ texto: 'Erro de ligação.', tipo: 'erro' });
    }
    setLoadingPromo(false);
  };

  return (
    <div className="bg-[#1b1b1e] border border-white/5 rounded-xl p-6 mb-6 shadow-2xl relative">
      <div className="flex flex-col xl:flex-row gap-8 items-center lg:items-start">
        
        {/* FOTO E NÍVEL */}
        <div className="relative group flex-shrink-0">
          <div className="w-32 h-32 rounded-lg overflow-hidden border border-zinc-700 relative bg-[#121215]">
            <img src={avatar || "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg"} className="w-full h-full object-cover opacity-90" alt="Avatar" />
            <div className="absolute bottom-0 w-full bg-black/80 py-1 text-center border-t border-white/10 backdrop-blur-sm">
              <span className="text-[11px] font-black text-white">{currentLevel} NÍVEL</span>
            </div>
          </div>
        </div>

        {/* NOME E RANK */}
        <div className="flex-1 text-center lg:text-left mt-2 lg:mt-0">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
            <h1 className="text-2xl font-black text-white uppercase">{nome || "Carregando..."}</h1>
            <span className="text-white bg-[#121215] rounded-full px-3 py-1 text-[10px] font-bold border border-white/10 cursor-pointer hover:bg-white/10 transition-colors flex items-center gap-1">
              Steam 🔗
            </span>
          </div>
          
          <div className="bg-transparent lg:bg-[#161619] rounded-lg p-0 lg:p-4 inline-block lg:border border-white/5 min-w-[260px] w-full lg:w-auto">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                <span className="text-zinc-400 text-sm">⛨</span> O SEU RANQUE
              </span>
              <span className="text-xs font-black text-amber-500 uppercase italic drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">
                {currentRank}
              </span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2 shadow-inner border border-black">
              <div 
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)] transition-all duration-1000 ease-out" 
                style={{ width: `${percentagemProgresso}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">XP Atual: {currentXp}</p>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Próximo Nível: {xpTotalNecessario}</p>
            </div>
          </div>
        </div>

        {/* TRADE URL, CARTEIRAS E PROMO CODE */}
        <div className="flex flex-col gap-4 w-full lg:w-auto mt-4 lg:mt-0">
          
          <div className="relative w-full lg:w-[450px]">
            <input type="text" value={tradeUrl || "https://steamcommunity.com/tradeoffer/new/?partner=..."} className="w-full bg-[#121215] border border-white/5 rounded-lg p-3 pr-20 text-[10px] text-zinc-500 font-mono outline-none" readOnly />
            <button className="absolute right-1 top-1 bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white text-[9px] font-black uppercase px-4 py-2 rounded transition-colors flex items-center gap-1">
              EDITAR ✏️
            </button>
          </div>

          <div className="flex gap-2">
            <div className="bg-[#241c14] border border-[#3d2e1c] rounded-lg px-4 py-2 flex items-center gap-3 flex-1 cursor-not-allowed opacity-50 hover:opacity-100 transition-opacity" title="Em breve">
              <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-black text-xs font-black">G</div>
              <div><p className="text-[13px] font-black text-[#dca34b] leading-tight">0</p><p className="text-[8px] text-[#8a6833] font-black uppercase">MOEDAS</p></div>
            </div>
            
            <div className="bg-[#13241d] border border-[#1b362c] rounded-lg px-4 py-2 flex items-center gap-3 flex-1 cursor-not-allowed opacity-50 hover:opacity-100 transition-opacity" title="Em breve">
              <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-black text-xs font-black">E</div>
              <div><p className="text-[13px] font-black text-[#2eb386] leading-tight">0</p><p className="text-[8px] text-[#227a5d] font-black uppercase">PONTOS</p></div>
            </div>
            
            <div className="bg-[#202d1d] border border-[#2d4227] rounded-lg pl-4 pr-1 py-1 flex items-center gap-3 flex-1 relative group cursor-pointer" onClick={() => setView('deposit')}>
              <div className="w-6 h-6 rounded-full bg-[#84c13a] flex items-center justify-center text-black text-xs font-black">€</div>
              <div className="flex-1 py-1.5"><p className="text-[13px] font-black text-[#84c13a] leading-tight">{Number(saldo).toFixed(2)}€</p><p className="text-[8px] text-[#557c26] font-black uppercase">SALDO</p></div>
              <div className="w-8 h-8 bg-[#84c13a] hover:bg-[#96d845] rounded flex items-center justify-center text-black font-black text-lg transition-colors">+</div>
            </div>
          </div>

          {/* 🔥 NOVO: ÁREA DE CÓDIGO PROMOCIONAL */}
          <div className="flex flex-col gap-2 mt-1 relative w-full lg:w-[450px]">
            <div className="flex gap-2 w-full h-11">
              <input 
                type="text" 
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Tens um código promocional?" 
                className="flex-1 bg-[#121215] border border-white/5 rounded-lg px-4 text-xs text-white font-black uppercase tracking-widest outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-700" 
                onKeyDown={(e) => e.key === 'Enter' && resgatarCodigo()}
              />
              <button 
                onClick={resgatarCodigo}
                disabled={loadingPromo || !codigo.trim()}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black text-[10px] font-black uppercase px-6 rounded-lg transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                {loadingPromo ? '...' : 'RESGATAR'}
              </button>
            </div>
            
            {/* Mensagem de Feedback */}
            {msgPromo && (
              <div className={`text-[10px] font-black uppercase tracking-widest px-2 ${msgPromo.tipo === 'sucesso' ? 'text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]' : 'text-red-500'}`}>
                {msgPromo.tipo === 'sucesso' ? '✅ ' : '❌ '}{msgPromo.texto}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}