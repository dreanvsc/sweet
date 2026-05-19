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

  // ==========================================
  // 🔥 LÓGICA DE PROGRESSÃO DO NÍVEL
  // ==========================================
  const currentLevel = userData?.level || 1;
  const currentXp = userData?.xp || 0;
  
  // A fórmula que usaste no Backend: Cada nível pede Nível * 100 XP
  const xpTotalNecessario = currentLevel * 100; 
  
  // Calcula a percentagem para a largura da barra
  const percentagemProgresso = Math.min(Math.round((currentXp / xpTotalNecessario) * 100), 100);

  return (
    <>
      <aside className="w-64 bg-[#121215] border-r border-white/5 p-6 flex flex-col gap-2 fixed inset-y-0 left-0 h-screen overflow-y-auto custom-scrollbar pt-10 pb-6 z-40">
        <div className="mb-8">
          <h1 className="text-2xl font-black italic text-emerald-500 tracking-tighter">IMPÉRIO</h1>
          
          {/* 🔥 BARRA DE NÍVEL DINÂMICA */}
          {userId && (
            <div className="mt-4 bg-black/40 p-3 rounded-xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-xl rounded-full"></div>
              
              <div className="flex justify-between items-center mb-1 relative z-10">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">
                  Nível {currentLevel}
                </span>
                <span className="text-[10px] font-black text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
                  {percentagemProgresso}%
                </span>
              </div>
              
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden relative z-10 border border-black shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all duration-1000 ease-out" 
                  style={{ width: `${percentagemProgresso}%` }}
                ></div>
              </div>
              
              {/* O texto mostra o XP exato em relação ao objetivo total */}
              <p className="text-[8px] text-zinc-600 font-mono mt-1.5 text-right font-bold uppercase tracking-wider group-hover:text-zinc-400 transition-colors">
                {currentXp} / {xpTotalNecessario} XP
              </p>
            </div>
          )}
        </div>
        
        <button onClick={() => setView('store')} className={`flex items-center gap-4 p-4 rounded-xl transition-all ${view === 'store' || view === 'opening' ? 'bg-emerald-500 text-black font-bold' : 'hover:bg-white/5'}`}>
          🛒 <span className="text-xs font-bold uppercase tracking-widest">Loja de Caixas</span>
        </button>
        
        <button onClick={() => setView('upgrader')} className={`flex items-center gap-4 p-4 rounded-xl transition-all ${view === 'upgrader' ? 'bg-emerald-500 text-black font-bold' : 'hover:bg-white/5'}`}>
          ⚖️ <span className="text-xs font-bold uppercase tracking-widest">Upgrader</span>
        </button>

        <button 
            onClick={() => setView('battles')} 
            className={`flex items-center gap-3 w-full p-4 rounded-xl font-black uppercase tracking-widest transition-colors ${view === 'battles' ? 'text-red-500 bg-red-500/10' : 'text-zinc-500 hover:text-white'}`}
          >
            <span className="text-xl">⚔️</span> CASE BATTLES
        </button>

        <button onClick={() => setView('coinflip')} className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 font-black tracking-widest text-sm uppercase ${view === 'coinflip' ? 'text-white bg-amber-500/10 border-r-4 border-amber-500' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
          <span className="text-xl w-6">🪙</span> COINFLIP
        </button>

        {/* 🔥 ESCUDO DE SEGURANÇA: Só mostra a Aba Admin aos Chefes! */}
        {(userData?.role === 'admin' || userData?.role === 'ADMIN' || userData?.isAdmin === true || String(userId) === '1') && (
          <button onClick={() => setView('admin')} className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 font-black tracking-widest text-sm uppercase ${view === 'admin' ? 'text-white bg-amber-500/10 border-r-4 border-amber-500' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
            <span className="text-xl w-6">👑</span> PAINEL ADMIN
          </button>
        )}

        
        <div className="mt-auto pt-6">
          {userId ? (
            <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 flex flex-col items-center animate-in fade-in shadow-lg shrink-0">
              
              <div 
                onClick={() => setView('profile')}
                className="flex items-center gap-3 w-full bg-black/40 p-2 rounded-xl mb-3 border border-white/5 overflow-hidden cursor-pointer hover:bg-white/10 hover:border-emerald-500/50 transition-all group"
              >
                <img 
                  src={userData?.avatar || "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg"} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-lg border border-emerald-500/50 shrink-0 group-hover:scale-105 transition-transform" 
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[11px] font-bold text-white truncate">{userData?.nome || "A carregar..."}</span>
                  <span className="text-[9px] text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Ver Perfil
                  </span>
                </div>
              </div>

              <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">O Teu Saldo</p>
              <p className="text-2xl font-black text-emerald-400 tracking-tighter">{Number(saldo).toFixed(2)}€</p>
              <div className="flex gap-2 w-full mt-2">
                
                <button 
                  onClick={() => setModalAberto(true)} 
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 transition-colors text-black text-[10px] font-black rounded-lg uppercase"
                >
                  Depositar
                </button>

                <button 
                  onClick={() => { localStorage.removeItem('userId'); window.location.reload(); }} 
                  className="px-3 py-2 bg-zinc-800 hover:bg-red-500 hover:border-red-500 transition-colors text-zinc-400 hover:text-white text-[10px] font-black rounded-lg uppercase border border-white/5"
                  title="Terminar Sessão"
                >
                  Sair
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => window.location.href = 'https://sweet-7ifa.onrender.com/auth/steam'}
              className="w-full py-5 px-4 bg-[#171a21] hover:bg-[#2a303c] transition-all rounded-2xl border border-white/10 flex flex-col items-center gap-3 group shadow-[0_0_15px_rgba(23,26,33,0.5)]"
            >
              <svg className="w-10 h-10 fill-current text-white/80 group-hover:text-white group-hover:scale-110 transition-all duration-300" viewBox="0 0 496 512">
                <path d="M248 8C111.03 8 0 119.03 0 256c0 136.97 111.03 248 248 248s248-111.03 248-248C496 119.03 384.97 8 248 8zm-82.59 361.35c-43.14 0-78.22-35.08-78.22-78.22s35.08-78.22 78.22-78.22 78.22 35.08 78.22 78.22-35.08 78.22-78.22 78.22zm219.05-87.1l-146.43 43.5c-4.28-7.7-10.7-14.12-18.4-18.4l43.5-146.43c22.18 5.48 40.85 19.38 52.47 37.38 11.62 18 14.88 39.58 8.86 60.45z"/>
              </svg>
              <span className="text-[11px] font-black uppercase tracking-widest text-white/80 group-hover:text-white">Login Steam</span>
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
      
      {/* 🔥 WIDGET DE CHAT INJETADO AQUI */}
      <LiveChatWidget userId={userId} userName={userData?.nome} />
    </>
  );
}