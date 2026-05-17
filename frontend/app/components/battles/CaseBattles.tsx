'use client';

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import BattleArena from './BattleArena';

const socket = io('http://localhost:3000');

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
    if (filaCaixas.length >= 10) return alert("Máximo de 10 caixas por batalha!");
    setFilaCaixas([...filaCaixas, caixa]);
  };

  const removerCaixa = (index: number) => {
    setFilaCaixas(prev => prev.filter((_, i) => i !== index));
  };

  const valorTotalFila = filaCaixas.reduce((acc, c) => acc + parseFloat(c.preco), 0);

  const criarBatalha = () => {
    if (filaCaixas.length === 0) return alert("Adiciona pelo menos 1 caixa!");
    if (saldo < valorTotalFila) return alert("Saldo insuficiente!");
    
    socket.emit('criar_batalha', {
      userId: user.id, userNome: user.nome || 'Jogador 1', userFoto: user.avatar || '/skins/glock.png',
      caixas: filaCaixas,
      maxJogadores: numJogadores
    });
    setFilaCaixas([]);
    setModalCriar(false);

    // 🔥 ATUALIZA SALDO APÓS GASTAR
    setTimeout(() => { if (typeof atualizarTudo === 'function') atualizarTudo(); }, 500);
  };

  const entrarBatalha = (batalha: any) => {
    if (saldo < batalha.precoTotal) return alert("Saldo insuficiente para entrar!");
    socket.emit('entrar_batalha', { batalhaId: batalha.id, userId: user.id, userNome: user.nome || 'Jogador', userFoto: user.avatar || '/skins/glock.png' });

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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in pb-20">
      <div className="flex justify-between items-end mb-10 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter">CASE <span className="text-red-500">BATTLES</span> ⚔️</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">O vencedor leva tudo</p>
        </div>
        <button onClick={() => setModalCriar(true)} className="bg-red-500 hover:bg-red-400 text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest transition-transform hover:scale-105 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
          CRIAR BATALHA
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {batalhas.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-black/20">
            <p className="text-zinc-500 font-bold uppercase tracking-widest">Nenhuma batalha a decorrer. Cria tu a primeira!</p>
          </div>
        ) : (
          batalhas.map((b) => {
            const estouNaSala = b.jogadores.find((j: any) => String(j.id) === String(user.id));
            
            return (
            <div key={b.id} className="bg-[#121215] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between hover:border-red-500/30 transition-colors gap-6">
              
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
                   <p className="text-emerald-500 font-mono font-black text-lg">{b.precoTotal.toFixed(2)}€</p>
                   <p className="text-zinc-500 text-[9px] uppercase font-black tracking-widest">{b.jogadores.length}/{b.maxJogadores} Jogadores</p>
                </div>
                
                {b.estado === 'espera' ? (
                  estouNaSala ? (
                    <button onClick={() => socket.emit('chamar_bot', { batalhaId: b.id })} className="bg-gradient-to-r from-amber-500 to-orange-600 text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                      🤖 +1 BOT
                    </button>
                  ) : (
                    <button onClick={() => entrarBatalha(b)} className="bg-zinc-800 hover:bg-white text-white hover:text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest transition-colors">
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
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#121215] border border-white/10 p-8 rounded-3xl max-w-4xl w-full flex flex-col h-[85vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-white italic uppercase">Construir Batalha</h3>
              <button onClick={() => setModalCriar(false)} className="text-zinc-500 hover:text-white font-bold">X</button>
            </div>
            
            <div className="flex bg-black/50 p-1 rounded-xl mb-4 border border-white/5">
              {[2, 3, 4].map(n => (
                <button 
                  key={n} 
                  onClick={() => setNumJogadores(n)} 
                  className={`flex-1 py-3 rounded-lg font-black uppercase text-xs tracking-widest transition-colors ${numJogadores === n ? 'bg-red-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                >
                  {n} Jogadores
                </button>
              ))}
            </div>

            <div className="bg-black/50 border border-white/5 rounded-2xl p-4 min-h-[100px] mb-6 flex flex-col justify-center">
               <div className="flex items-center gap-2 overflow-x-auto pb-2">
                 {filaCaixas.length === 0 ? (
                   <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs w-full text-center">Nenhuma caixa selecionada</p>
                 ) : (
                   filaCaixas.map((c, i) => (
                     <div key={i} onClick={() => removerCaixa(i)} className="relative group cursor-pointer flex-shrink-0">
                        <img src={c.imagem} className="w-16 h-16 object-contain bg-zinc-900 rounded-xl border border-white/10 p-1 group-hover:border-red-500 transition-colors" alt="caixa" />
                        <div className="absolute inset-0 bg-red-500/80 hidden group-hover:flex items-center justify-center rounded-xl backdrop-blur-sm">
                          <span className="text-white font-black text-xs">REMOVER</span>
                        </div>
                     </div>
                   ))
                 )}
               </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-3 sm:grid-cols-5 gap-4">
              {caixas?.map((c: any) => (
                <div key={c.id} onClick={() => addCaixa(c)} className="bg-[#161619] border border-white/5 p-4 rounded-2xl flex flex-col items-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/10 transition-colors group">
                  <img src={c.imagem} className="w-14 h-14 object-contain mb-2 group-hover:scale-110 transition-transform" alt={c.nome} />
                  <p className="text-[9px] text-zinc-400 font-black text-center truncate w-full uppercase">{c.nome}</p>
                  <p className="text-emerald-500 font-mono text-xs font-black mt-1">{c.preco.toFixed(2)}€</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
              <div>
                 <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Custo Total</p>
                 <p className="text-3xl font-mono font-black text-white">{valorTotalFila.toFixed(2)}€</p>
              </div>
              <button 
                onClick={criarBatalha}
                disabled={filaCaixas.length === 0}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-10 py-4 rounded-xl font-black uppercase tracking-widest transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                CRIAR SALA ({numJogadores}P)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}