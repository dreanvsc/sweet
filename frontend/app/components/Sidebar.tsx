'use client';

import React, { useState } from 'react';
import ModalDeposito from './ModalDeposito'; 
import LiveChatWidget from './support/LiveChatWidget';

export default function Sidebar({ view, setView, saldo, userId, userData }: any) {
  const [modalAberto, setModalAberto] = useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('deposito');
    const txId = params.get('tx');

    if (status === 'sucesso' && txId) {
      fetch(`https://sweet-7ifa.onrender.com/confirmar-deposito/${txId}`)
        .then(res => res.json())
        .then(data => {
          if (data.sucesso) {
            alert(`🎉 PAGAMENTO CONFIRMADO! Foram adicionados ${data.valorDepositado}€ à tua conta!`);
            window.history.replaceState(null, '', window.location.pathname);
            window.location.reload(); 
          }
        });
    } else if (status === 'cancelado') {
      alert("❌ O pagamento foi cancelado.");
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const currentLevel = userData?.level || 1;
  const currentXp = userData?.xp || 0;
  const xpTotalNecessario = currentLevel * 100; 
  const percentagemProgresso = Math.min(Math.round((currentXp / xpTotalNecessario) * 100), 100);

  return (
    <>
      {/* 🔥 LARGURA REDUZIDA PARA w-56 e paddings para p-4 */}
      <aside className="w-56 bg-black/40 backdrop-blur-2xl border-r border-white/10 p-4 flex flex-col gap-2 fixed inset-y-0 left-0 h-screen overflow-y-auto custom-scrollbar pt-8 pb-4 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.4)] transition-all">
        <div className="mb-6 px-2">
          {/* Título mais compacto */}
          <h1 className="text-xl font-black italic text-emerald-400 tracking-tighter drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
            SWEET DROP
          </h1>
          
          {userId && (
            <div className="mt-4 bg-black/30 backdrop-blur-md p-2.5 rounded-xl border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/10 blur-xl rounded-full"></div>
              
              <div className="flex justify-between items-center mb-1 relative z-10">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">
                  Nível {currentLevel}
                </span>
                <span className="text-[9px] font-black text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
                  {percentagemProgresso}%
                </span>
              </div>
              
              <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden relative z-10 border border-white/5 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all duration-1000 ease-out relative" 
                  style={{ width: `${percentagemProgresso}%` }}
                >
                  <div className="absolute top-0 right-0 w-2 h-full bg-white/50 blur-[1px]"></div>
                </div>
              </div>
              
              <p className="text-[7px] text-zinc-500 font-mono mt-1 text-right font-bold uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
                {currentXp} / {xpTotalNecessario} XP
              </p>
            </div>
          )}
        </div>
        
        {/* 🔥 BOTÕES COM PADDING REDUZIDO (p-3 em vez de p-4) */}
        <button onClick={() => setView('store')} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${view === 'store' || view === 'opening' ? 'bg-gradient-to-r from-emerald-500/20 to-transparent border-l-4 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-zinc-400 hover:text-white hover:bg-white/5 hover:translate-x-1'}`}>
          <span className="text-lg drop-shadow-md">🛒</span> <span className="text-[10px] font-bold uppercase tracking-widest">Store</span>
        </button>
        
        <button onClick={() => setView('upgrader')} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${view === 'upgrader' ? 'bg-gradient-to-r from-emerald-500/20 to-transparent border-l-4 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-zinc-400 hover:text-white hover:bg-white/5 hover:translate-x-1'}`}>
          <span className="text-lg drop-shadow-md">⚖️</span> <span className="text-[10px] font-bold uppercase tracking-widest">Upgrader</span>
        </button>

        <button onClick={() => setView('battles')} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${view === 'battles' ? 'bg-gradient-to-r from-red-500/20 to-transparent border-l-4 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'text-zinc-400 hover:text-white hover:bg-white/5 hover:translate-x-1'}`}>
          <span className="text-lg drop-shadow-md">⚔️</span> <span className="text-[10px] font-bold uppercase tracking-widest">Battles</span>
        </button>

        <button onClick={() => setView('coinflip')} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${view === 'coinflip' ? 'bg-gradient-to-r from-amber-500/20 to-transparent border-l-4 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'text-zinc-400 hover:text-white hover:bg-white/5 hover:translate-x-1'}`}>
          <span className="text-lg drop-shadow-md">🪙</span> <span className="text-[10px] font-bold uppercase tracking-widest">Coinflip</span>
        </button>

        {(userData?.role === 'admin' || userData?.role === 'ADMIN' || userData?.isAdmin === true || String(userId) === '1') && (
          <button onClick={() => setView('admin')} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 mt-2 border border-amber-500/20 ${view === 'admin' ? 'bg-gradient-to-r from-amber-500/30 to-amber-500/5 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 hover:translate-x-1'}`}>
            <span className="text-lg drop-shadow-md">👑</span> <span className="text-[10px] font-black uppercase tracking-widest">Admin</span>
          </button>
        )}

        <div className="mt-auto pt-4">
          {userId ? (
            <div className="bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex flex-col items-center shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-emerald-500/20 blur-2xl rounded-full"></div>

              <div 
                onClick={() => setView('profile')}
                className="flex items-center gap-2 w-full bg-white/5 p-2 rounded-xl mb-3 border border-white/5 overflow-hidden cursor-pointer hover:bg-white/10 hover:border-emerald-500/50 transition-all group relative z-10"
              >
                <div className="relative">
                  <img 
                    src={userData?.avatar || "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg"} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-lg border border-emerald-500/50 shrink-0 group-hover:scale-105 transition-transform" 
                  />
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0b0b0d] rounded-full"></span>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-bold text-white truncate">{userData?.nome || "A carregar..."}</span>
                  <span className="text-[8px] text-emerald-400 uppercase tracking-widest flex items-center gap-1 group-hover:text-emerald-300">
                    Ver Perfil
                  </span>
                </div>
              </div>

              <p className="text-[9px] font-bold text-zinc-500 uppercase mb-0.5 relative z-10">O Teu Saldo</p>
              <p className="text-xl font-black text-white tracking-tighter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] relative z-10">
                {Number(saldo).toFixed(2)}<span className="text-emerald-500">€</span>
              </p>
              
              <div className="flex gap-2 w-full mt-3 relative z-10">
                <button 
                  onClick={() => setModalAberto(true)} 
                  className="flex-1 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 transition-all text-black text-[9px] font-black rounded-md uppercase shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:-translate-y-0.5"
                >
                  Depositar
                </button>

                <button 
                  onClick={() => { localStorage.removeItem('userId'); window.location.reload(); }} 
                  className="px-2 py-1.5 bg-white/5 hover:bg-red-500/20 hover:border-red-500/50 transition-all text-zinc-400 hover:text-red-400 text-[9px] font-black rounded-md uppercase border border-white/5 hover:-translate-y-0.5"
                  title="Terminar Sessão"
                >
                  Sair
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => window.location.href = 'https://sweet-7ifa.onrender.com/auth/steam'}
              className="w-full py-4 px-3 bg-gradient-to-br from-[#171a21] to-[#0a0c10] hover:from-[#2a303c] hover:to-[#171a21] transition-all rounded-2xl border border-white/10 flex flex-col items-center gap-2 group shadow-[0_0_20px_rgba(23,26,33,0.8)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <svg className="w-8 h-8 fill-current text-white/80 group-hover:text-white group-hover:scale-110 transition-all duration-300 drop-shadow-lg relative z-10" viewBox="0 0 496 512">
                <path d="M248 8C111.03 8 0 119.03 0 256c0 136.97 111.03 248 248 248s248-111.03 248-248C496 119.03 384.97 8 248 8zm-82.59 361.35c-43.14 0-78.22-35.08-78.22-78.22s35.08-78.22 78.22-78.22 78.22 35.08 78.22 78.22-35.08 78.22-78.22 78.22zm219.05-87.1l-146.43 43.5c-4.28-7.7-10.7-14.12-18.4-18.4l43.5-146.43c22.18 5.48 40.85 19.38 52.47 37.38 11.62 18 14.88 39.58 8.86 60.45z"/>
              </svg>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/80 group-hover:text-white relative z-10 drop-shadow-md">Login Steam</span>
            </button>
          )}
        </div>
      </aside>

      {modalAberto && (
        <ModalDeposito 
          userId={userId} 
          onClose={() => setModalAberto(false)} 
        />
      )}
      
      <LiveChatWidget userId={userId} userName={userData?.nome} />
    </>
  );
}