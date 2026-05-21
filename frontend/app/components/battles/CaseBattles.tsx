'use client';

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import BattleArena from './BattleArena';
import { toast } from 'react-hot-toast';

const socket = io('https://sweet-7ifa.onrender.com');

export default function CaseBattles({ userId, user, saldo, caixas, setView, atualizarTudo }: any) {
  const [batalhas, setBatalhas] = useState<any[]>([]);
  const [modalCriar, setModalCriar] = useState(false);
  const [batalhaAtiva, setBatalhaAtiva] = useState<any>(null);
  
  const [filaCaixas, setFilaCaixas] = useState<any[]>([]);
  const [numJogadores, setNumJogadores] = useState(2);

  useEffect(() => {
    socket.emit('pedir_batalhas');
    socket.on('batalhas_atualizadas', (lista) => setBatalhas(lista));
    socket.on('batalha_comecou', (batalha) => setBatalhaAtiva(batalha));

    return () => {
      socket.off('batalhas_atualizadas');
      socket.off('batalha_comecou');
    };
  }, []);

  const addCaixa = (caixa: any) => {
    if (filaCaixas.length >= 10) return toast.error("Máximo de 10 caixas por batalha!");
    setFilaCaixas([...filaCaixas, caixa]);
  };

  const removerCaixa = (index: number) => {
    setFilaCaixas(prev => prev.filter((_, i) => i !== index));
  };

  const valorTotalFila = filaCaixas.reduce((acc, c) => acc + parseFloat(c.preco), 0);

  const criarBatalha = () => {
    if (filaCaixas.length === 0) return toast.error("Adiciona pelo menos 1 caixa!");
    if (saldo < valorTotalFila) return toast.error("Saldo insuficiente!");
    
    socket.emit('criar_batalha', {
      userId: user.id, userNome: user.nome || 'Jogador 1', userFoto: user.avatar || '/skins/glock.png',
      caixas: filaCaixas,
      maxJogadores: numJogadores
    });
    setFilaCaixas([]);
    setModalCriar(false);
    toast.success("Batalha criada com sucesso!");

    // 🔥 ATUALIZA SALDO APÓS GASTAR
    setTimeout(() => { if (typeof atualizarTudo === 'function') atualizarTudo(); }, 500);
  };

  const entrarBatalha = (batalha: any) => {
    if (saldo < batalha.precoTotal) return toast.error("Saldo insuficiente para entrar!");
    socket.emit('entrar_batalha', { batalhaId: batalha.id, userId: user.id, userNome: user.nome || 'Jogador', userFoto: user.avatar || '/skins/glock.png' });
    toast.success("Entraste na batalha!");

    // 🔥 ATUALIZA SALDO APÓS GASTAR
    setTimeout(() => { if (typeof atualizarTudo === 'function') atualizarTudo(); }, 500);
  };

  if (batalhaAtiva) {
    return (
      <BattleArena 
        batalha={batalhaAtiva} 
        userId={userId} 
        onLeave={() => { 
          setBatalhaAtiva(null); 
          socket.emit('pedir_batalhas'); 
          // 🔥 ATUALIZA O INVENTÁRIO SE GANHOU A BATALHA
          if (typeof atualizarTudo === 'function') atualizarTudo();
        }} 
      />
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-in fade-in pb-20 pt-4">
      
      {/* HEADER PANORÂMICO */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-black/20 p-6 rounded-2xl border border-white/5 backdrop-blur-sm shadow-lg">
         <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
               <span className="text-3xl">⚔️</span>
            </div>
            <div className="text-left">
               <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-white tracking-tighter drop-shadow-md">
                 Case <span className="text-red-500">Battles</span>
               </h2>
               <p className="text-zinc-400 text-xs sm:text-sm font-bold tracking-widest uppercase mt-1">O Vencedor Leva Tudo</p>
            </div>
         </div>
         
         <button 
           onClick={() => setModalCriar(true)} 
           className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:-translate-y-1"
         >
           Criar Batalha
         </button>
      </div>

      <div className="flex flex-col gap-4">
        {batalhas.length === 0 ? (
          /* EMPTY STATE PANORÂMICO LIGADO */
          <div className="w-full border border-dashed border-white/10 rounded-2xl p-16 flex flex-col items-center justify-center bg-gradient-to-b from-white/[0.02] to-transparent group hover:border-red-500/30 transition-colors">
            <div className="w-24 h-24 bg-red-500/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 relative">
               <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <span className="text-5xl relative z-10 opacity-50 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">🛡️</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-widest mb-3 drop-shadow-md">A Arena está Silenciosa</h3>
            <p className="text-zinc-500 text-sm max-w-lg text-center leading-relaxed">
              Nenhuma batalha a decorrer neste momento. Sê o primeiro a desafiar o Império, cria a tua própria sala e aniquila a concorrência!
            </p>
          </div>
        ) : (
          batalhas.map((b) => {
            const estouNaSala = b.jogadores.find((j: any) => String(j.id) === String(user.id));
            
            return (
            <div key={b.id} className="bg-[#121215]/80 backdrop-blur-sm border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between hover:border-red-500/30 transition-all duration-300 gap-6 shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:-translate-y-1">
              
              <div className="flex items-center gap-2 w-full md:w-1/3 flex-wrap">
                {b.caixas.slice(0, 5).map((c: any, i: number) => (
                   <img key={i} src={c.imagem} className="w-10 h-10 object-contain drop-shadow-lg" title={c.nome} alt="caixa" />
                ))}
                {b.caixas.length > 5 && <span className="text-zinc-500 text-xs font-black">+{b.caixas.length - 5}</span>}
              </div>

              <div className="flex items-center gap-3 w-full md:w-1/3 justify-center bg-black/40 p-2 rounded-xl border border-white/5">
                {Array.from({ length: b.maxJogadores }).map((_, idx) => {
                  const j = b.jogadores[idx];
                  return j ? (
                    <img key={idx} src={j.foto} className="w-10 h-10 rounded-lg border-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" alt="p" title={j.nome} />
                  ) : (
                    <div key={idx} className="w-10 h-10 rounded-lg border-2 border-dashed border-zinc-700 bg-black/50 flex items-center justify-center animate-pulse">
                      <span className="text-zinc-500 text-xs">?</span>
                    </div>
                  );
                })}
              </div>

              <div className="w-full md:w-1/3 flex items-center justify-end gap-6">
                <div className="text-right">
                   <p className="text-emerald-400 font-mono font-black text-lg drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]">{b.precoTotal.toFixed(2)}€</p>
                   <p className="text-zinc-500 text-[9px] uppercase font-black tracking-widest">{b.jogadores.length}/{b.maxJogadores} Jogadores</p>
                </div>
                
                {b.estado === 'espera' ? (
                  estouNaSala ? (
                    <button onClick={() => socket.emit('chamar_bot', { batalhaId: b.id })} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                      🤖 +1 BOT
                    </button>
                  ) : (
                    <button onClick={() => entrarBatalha(b)} className="bg-white/10 border border-white/20 hover:bg-white text-zinc-300 hover:text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                      ENTRAR
                    </button>
                  )
                ) : (
                  <button className="bg-red-500/10 text-red-500 border border-red-500/30 px-8 py-3 rounded-xl font-black uppercase tracking-widest cursor-not-allowed">A DECORRER</button>
                )}
              </div>
            </div>
            )
          })
        )}
      </div>

      {modalCriar && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#121215] border border-white/10 p-8 rounded-3xl max-w-4xl w-full flex flex-col h-[85vh] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                 <span className="text-2xl drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">⚙️</span>
                 <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Construir Batalha</h3>
              </div>
              <button onClick={() => setModalCriar(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/5 hover:border-red-500/50 rounded-xl transition-all">X</button>
            </div>
            
            <div className="flex bg-black/50 p-1.5 rounded-xl mb-4 border border-white/5">
              {[2, 3, 4].map(n => (
                <button 
                  key={n} 
                  onClick={() => setNumJogadores(n)} 
                  className={`flex-1 py-3 rounded-lg font-black uppercase text-xs tracking-widest transition-all ${numJogadores === n ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                >
                  {n} Jogadores
                </button>
              ))}
            </div>

            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 min-h-[100px] mb-6 flex flex-col justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-2xl rounded-full"></div>
               <div className="flex items-center gap-2 overflow-x-auto pb-2 relative z-10 custom-scrollbar">
                 {filaCaixas.length === 0 ? (
                   <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs w-full text-center">Nenhuma caixa selecionada</p>
                 ) : (
                   filaCaixas.map((c, i) => (
                     <div key={i} onClick={() => removerCaixa(i)} className="relative group cursor-pointer flex-shrink-0">
                        <img src={c.imagem} className="w-16 h-16 object-contain bg-black/60 rounded-xl border border-white/10 p-1.5 group-hover:border-red-500 transition-colors" alt="caixa" />
                        <div className="absolute inset-0 bg-red-500/90 hidden group-hover:flex items-center justify-center rounded-xl backdrop-blur-sm transition-all">
                          <span className="text-white font-black text-[10px] tracking-widest uppercase">Remover</span>
                        </div>
                     </div>
                   ))
                 )}
               </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 custom-scrollbar">
              {caixas?.map((c: any) => (
                <div key={c.id} onClick={() => addCaixa(c)} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all duration-300 group hover:-translate-y-1">
                  <img src={c.imagem} className="w-14 h-14 object-contain mb-3 group-hover:scale-110 transition-transform duration-500 drop-shadow-lg" alt={c.nome} />
                  <p className="text-[10px] text-zinc-300 font-black text-center truncate w-full uppercase tracking-widest">{c.nome}</p>
                  <p className="text-emerald-400 font-mono text-xs font-black mt-1 drop-shadow-md">{c.preco.toFixed(2)}€</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center bg-[#121215]">
              <div>
                 <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Custo Total</p>
                 <p className="text-3xl font-mono font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{valorTotalFila.toFixed(2)}<span className="text-emerald-500">€</span></p>
              </div>
              <button 
                onClick={criarBatalha}
                disabled={filaCaixas.length === 0}
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black px-10 py-4 rounded-xl font-black uppercase tracking-widest transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
              >
                Criar Sala ({numJogadores}P)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}