'use client';

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://sweet-7ifa.onrender.com');

// =========================================================================
// 🔥 COMPONENTE DA LINHA DE JOGO (Animação 3D de Elite)
// =========================================================================
function CoinflipRow({ jogo, user, chamarBot, entrarJogo, atualizarTudo }: any) {
  const [fase, setFase] = useState<'espera' | 'girando' | 'terminado'>(jogo.estado === 'espera' ? 'espera' : 'girando');

  useEffect(() => {
    if (typeof document !== 'undefined') {
        const idStyle = 'css-coinflip-premium';
        if (!document.getElementById(idStyle)) {
            const style = document.createElement('style');
            style.id = idStyle;
            style.innerHTML = `
                @keyframes beautifulCoinSpin {
                    0% { transform: perspective(1000px) rotateY(0deg); }
                    10% { transform: perspective(1000px) rotateY(180deg) translateY(-20px); }
                    20% { transform: perspective(1000px) rotateY(360deg) translateY(-35px); }
                    40% { transform: perspective(1000px) rotateY(720deg) translateY(-40px); }
                    60% { transform: perspective(1000px) rotateY(1080deg) translateY(-35px); }
                    80% { transform: perspective(1000px) rotateY(1440deg) translateY(-20px); }
                    100% { transform: perspective(1000px) rotateY(1800deg) translateY(0px); }
                }
                .coin-premium {
                    transform-style: preserve-3d;
                    transition: transform 0.5s ease-out;
                }
                .coin-premium.spinning {
                    animation: beautifulCoinSpin 1s cubic-bezier(0.15, 0.85, 0.35, 1) infinite;
                }
                .coin-premium .face {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 4px solid #f59e0b;
                    background: radial-gradient(circle, #0b0b0d 10%, #161619 80%);
                    box-shadow: inset 0 0 15px rgba(0,0,0,0.8), 0 0 15px rgba(245,158,11,0.2);
                }
                .coin-premium .face-back {
                    transform: rotateY(180deg);
                }
            `;
            document.head.appendChild(style);
        }
    }
  }, []);

  useEffect(() => {
    if (jogo.estado === 'jogando') {
      setFase('girando');
      const timer = setTimeout(() => {
        setFase('terminado');
        if (typeof atualizarTudo === 'function') {
           setTimeout(() => atualizarTudo(), 500); 
        }
      }, 4000); 
      return () => clearTimeout(timer);
    }
  }, [jogo.estado]);

  return (
    <div className={`bg-[#121215]/80 backdrop-blur-sm border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:-translate-y-1 transition-all duration-500 ${fase === 'terminado' ? 'border-amber-500/30 bg-amber-500/10' : ''}`}>
      
      {/* JOGADOR 1 (CRIADOR) */}
      <div className={`flex items-center gap-4 w-full md:w-1/3 z-10 transition-all duration-700 ${fase === 'terminado' && jogo.resultado?.vencedorId === jogo.criador.id ? 'opacity-100 scale-105' : fase !== 'espera' ? 'opacity-30 grayscale' : ''}`}>
        <img src={jogo.criador.foto} className="w-12 h-12 rounded-xl border-2 border-zinc-700 object-cover shadow-xl" alt="p1" />
        <div className="flex flex-col">
          <span className="text-white font-black uppercase text-sm">{jogo.criador.nome}</span>
          <span className={`text-[10px] font-black tracking-widest ${jogo.criador.lado === 'CT' ? 'text-blue-500' : 'text-orange-500'}`}>{jogo.criador.lado}</span>
        </div>
      </div>

      {/* O CENTRO (A MOEDA DINÂMICA) */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/3 z-10 min-h-[100px] perspective-1000">
        {fase === 'espera' ? (
          <div className="text-center animate-in zoom-in">
            <p className="text-amber-500 font-mono font-black text-3xl drop-shadow-md">{jogo.valorTotal.toFixed(2)}€</p>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1 bg-white/5 px-3 py-1 rounded-full inline-block border border-white/5">{jogo.tipo === 'saldo' ? 'Saldo' : 'Skins'}</p>
          </div>
        ) : fase === 'girando' ? (
          <div className="relative w-20 h-20 animate-in zoom-in duration-300">
             <div className="w-full h-full coin-premium spinning relative z-10">
                <div className="face face-front">
                   <span className="text-3xl font-black text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">CT</span>
                </div>
                <div className="face face-back">
                   <span className="text-3xl font-black text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]">T</span>
                </div>
             </div>
             <div className="absolute top-full left-1/2 -translate-x-1/2 w-16 h-3 bg-black/60 rounded-full blur-md animate-pulse mt-2 z-0"></div>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-in zoom-in duration-500">
            <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)] ${jogo.resultado?.ladoVencedor === 'CT' ? 'border-blue-500 bg-blue-500/20' : 'border-orange-500 bg-orange-500/20'}`}>
              <span className={`text-4xl font-black ${jogo.resultado?.ladoVencedor === 'CT' ? 'text-blue-500' : 'text-orange-500'}`}>{jogo.resultado?.ladoVencedor}</span>
            </div>
            <p className="text-zinc-400 font-black uppercase mt-3 tracking-widest text-[9px]">Caiu em</p>
          </div>
        )}
      </div>

      {/* JOGADOR 2 / BOTÕES */}
      <div className={`flex items-center justify-end gap-4 w-full md:w-1/3 z-10 transition-all duration-700 ${fase === 'terminado' && jogo.resultado?.vencedorId === jogo.adversario?.id ? 'opacity-100 scale-105' : fase !== 'espera' ? 'opacity-30 grayscale' : ''}`}>
        {jogo.adversario ? (
          <>
            <div className="flex flex-col items-end">
              <span className="text-white font-black uppercase text-sm">{jogo.adversario.nome}</span>
              <span className={`text-[10px] font-black tracking-widest ${jogo.adversario.lado === 'CT' ? 'text-blue-500' : 'text-orange-500'}`}>{jogo.adversario.lado}</span>
            </div>
            <img src={jogo.adversario.foto} className="w-12 h-12 rounded-xl border-2 border-zinc-700 object-cover shadow-xl" alt="p2" />
          </>
        ) : (
          <div className="flex gap-2">
            {String(jogo.criador.id) === String(user.id) ? (
              <button onClick={() => chamarBot(jogo.id)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-transform hover:scale-105 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                🤖 Bot
              </button>
            ) : (
              <button onClick={() => entrarJogo(jogo)} className="bg-white/10 border border-white/20 hover:bg-white text-zinc-300 hover:text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] text-xs">
                ENTRAR
              </button>
            )}
          </div>
        )}
      </div>

      {/* OVERLAY DE VENCEDOR */}
      {fase === 'terminado' && jogo.resultado && (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-20 animate-in fade-in zoom-in-95 duration-500 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] mb-2 bg-white/5 inline-block px-4 py-1 rounded-full border border-white/5">
              Caiu em {jogo.resultado.ladoVencedor}!
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-amber-500 uppercase italic drop-shadow-[0_0_30px_rgba(245,158,11,0.6)] tracking-tighter">
              {jogo.resultado.vencedorId === jogo.criador.id ? jogo.criador.nome : jogo.adversario?.nome} GANHOU!
            </h2>
            <p className="text-emerald-500 font-mono font-black mt-4 text-3xl bg-emerald-500/10 inline-block px-8 py-2 rounded-xl border border-emerald-500/20 shadow-inner">
              +{(jogo.valorTotal).toFixed(2)}€
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


// =========================================================================
// 🔥 COMPONENTE PRINCIPAL (O Lobby)
// =========================================================================
export default function Coinflip({ userId, user, saldo, inventario, atualizarTudo }: any) {
  const [jogos, setJogos] = useState<any[]>([]);
  const [modalCriar, setModalCriar] = useState(false);
  
  const [tipoAposta, setTipoAposta] = useState<'saldo' | 'skins'>('saldo');
  const [ladoSelecionado, setLadoSelecionado] = useState<'CT' | 'T'>('CT');
  const [valorApostaSaldo, setValorApostaSaldo] = useState(1.0);
  const [skinsApostadas, setSkinsApostadas] = useState<any[]>([]);

  const [modalEntrarSkins, setModalEntrarSkins] = useState<any>(null);
  const [skinsParaEntrar, setSkinsParaEntrar] = useState<any[]>([]);

  useEffect(() => {
    socket.emit('pedir_coinflips');
    socket.on('coinflips_atualizados', (lista) => setJogos(lista));
    return () => { socket.off('coinflips_atualizados'); };
  }, []);

  const toggleSkin = (skin: any, index: number) => {
    const jaSelecionada = skinsApostadas.some(s => s.ui_index === index);
    if (jaSelecionada) {
      setSkinsApostadas(prev => prev.filter(s => s.ui_index !== index));
    } else {
      if (skinsApostadas.length >= 10) return alert('Máximo 10 skins!');
      setSkinsApostadas(prev => [...prev, { ...skin, ui_index: index }]);
    }
  };

  const valorSkins = skinsApostadas.reduce((acc, s) => acc + parseFloat(s.preco || s.valor), 0);

  const criarJogo = () => {
    if (tipoAposta === 'saldo' && saldo < valorApostaSaldo) return alert('Saldo insuficiente!');
    if (tipoAposta === 'skins' && skinsApostadas.length === 0) return alert('Seleciona pelo menos 1 skin!');

    socket.emit('criar_coinflip', {
      userId: user.id,
      tipo: tipoAposta,
      valor: valorApostaSaldo,
      skins: skinsApostadas,
      lado: ladoSelecionado
    });
    
    setModalCriar(false);
    setSkinsApostadas([]);

    setTimeout(() => { if (typeof atualizarTudo === 'function') atualizarTudo(); }, 500);
  };

  const chamarBot = (jogoId: string) => { socket.emit('chamar_bot_coinflip', { jogoId }); };

  const entrarJogo = (jogo: any) => {
    if (jogo.tipo === 'saldo') {
      if (saldo < jogo.valorTotal) return alert('Saldo insuficiente!');
      socket.emit('entrar_coinflip', { jogoId: jogo.id, userId: user.id });
      setTimeout(() => { if (typeof atualizarTudo === 'function') atualizarTudo(); }, 500);
    } else {
      setSkinsParaEntrar([]);
      setModalEntrarSkins(jogo);
    }
  };

  const toggleSkinEntrar = (skin: any, index: number) => {
    const jaSelecionada = skinsParaEntrar.some(s => s.ui_index === index);
    if (jaSelecionada) {
      setSkinsParaEntrar(prev => prev.filter(s => s.ui_index !== index));
    } else {
      if (skinsParaEntrar.length >= 10) return alert('Máximo 10 skins!');
      setSkinsParaEntrar(prev => [...prev, { ...skin, ui_index: index }]);
    }
  };

  const valorSkinsEntrar = skinsParaEntrar.reduce((acc, s) => acc + parseFloat(s.preco || s.valor), 0);

  const confirmarEntradaSkins = () => {
    if (skinsParaEntrar.length === 0) return alert("Seleciona skins primeiro!");

    const alvo = modalEntrarSkins.valorTotal;
    const margem = alvo * 0.10; 
    const min = alvo - margem;
    const max = alvo + margem;

    if (valorSkinsEntrar < min || valorSkinsEntrar > max) {
      return alert(`O valor das tuas skins (${valorSkinsEntrar.toFixed(2)}€) tem de estar entre ${min.toFixed(2)}€ e ${max.toFixed(2)}€ para ser justo!`);
    }

    socket.emit('entrar_coinflip', { 
      jogoId: modalEntrarSkins.id, 
      userId: user.id,
      skins: skinsParaEntrar 
    });

    setModalEntrarSkins(null);
    setSkinsParaEntrar([]);
    setTimeout(() => { if (typeof atualizarTudo === 'function') atualizarTudo(); }, 500);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-in fade-in pb-20 pt-4">
      
      {/* HEADER PANORÂMICO */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-black/20 p-6 rounded-2xl border border-white/5 backdrop-blur-sm shadow-lg">
         <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
               <span className="text-3xl">🪙</span>
            </div>
            <div className="text-left">
               <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-white tracking-tighter drop-shadow-md">
                 Coin<span className="text-amber-500">flip</span>
               </h2>
               <p className="text-zinc-400 text-xs sm:text-sm font-bold tracking-widest uppercase mt-1">A Sorte Favorece os Audazes</p>
            </div>
         </div>
         
         <button 
           onClick={() => setModalCriar(true)}
           className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:-translate-y-1 text-xs sm:text-sm"
         >
           Criar Aposta
         </button>
      </div>

      {/* LOBBY DOS JOGOS */}
      <div className="flex flex-col gap-4">
        {jogos.length === 0 ? (
          /* EMPTY STATE PANORÂMICO */
          <div className="w-full border border-dashed border-white/10 rounded-2xl p-16 flex flex-col items-center justify-center bg-gradient-to-b from-white/[0.02] to-transparent group hover:border-amber-500/30 transition-colors">
              <div className="w-24 h-24 bg-amber-500/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 relative">
                 <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <span className="text-5xl relative z-10 opacity-50 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]">💰</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-widest mb-3 drop-shadow-md">A Mesa está Vazia</h3>
              <p className="text-zinc-500 text-sm max-w-lg text-center leading-relaxed">
                Ninguém atirou a moeda ao ar ainda. Escolhe o teu lado, entra na disputa e dobra o teu inventário num piscar de olhos!
              </p>
          </div>
        ) : (
          jogos.map((jogo) => (
             <CoinflipRow key={jogo.id} jogo={jogo} user={user} chamarBot={chamarBot} entrarJogo={entrarJogo} atualizarTudo={atualizarTudo} />
          ))
        )}
      </div>

      {/* MODAL CRIAR APOSTA */}
      {modalCriar && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#121215] border border-white/10 p-8 rounded-3xl max-w-2xl w-full flex flex-col h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <div className="flex items-center gap-3">
                 <span className="text-2xl drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">⚙️</span>
                 <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Criar Coinflip</h3>
              </div>
              <button onClick={() => setModalCriar(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 border border-white/5 hover:border-amber-500/50 rounded-xl transition-all">X</button>
            </div>
            
            {/* TIPO DE APOSTA */}
            <div className="flex bg-black/50 p-1.5 rounded-xl mb-6 border border-white/5 flex-shrink-0">
              <button onClick={() => setTipoAposta('saldo')} className={`flex-1 py-3 rounded-lg font-black uppercase text-xs tracking-widest transition-all ${tipoAposta === 'saldo' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>Apostar Saldo</button>
              <button onClick={() => setTipoAposta('skins')} className={`flex-1 py-3 rounded-lg font-black uppercase text-xs tracking-widest transition-all ${tipoAposta === 'skins' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>Apostar Skins</button>
            </div>

            {/* ESCOLHER LADO */}
            <div className="mb-6 flex-shrink-0">
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-3 text-center">Escolhe o teu lado</p>
              <div className="flex justify-center gap-6">
                <button onClick={() => setLadoSelecionado('CT')} className={`w-28 h-28 rounded-3xl flex items-center justify-center border-4 transition-all ${ladoSelecionado === 'CT' ? 'border-blue-500 bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105' : 'border-zinc-800 bg-black/50 hover:border-zinc-600 hover:bg-black'}`}>
                   <span className="text-blue-500 font-black text-4xl">CT</span>
                </button>
                <button onClick={() => setLadoSelecionado('T')} className={`w-28 h-28 rounded-3xl flex items-center justify-center border-4 transition-all ${ladoSelecionado === 'T' ? 'border-orange-500 bg-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.3)] scale-105' : 'border-zinc-800 bg-black/50 hover:border-zinc-600 hover:bg-black'}`}>
                   <span className="text-orange-500 font-black text-4xl">T</span>
                </button>
              </div>
            </div>

            {/* SELEÇÃO DE VALOR / SKINS */}
            <div className="flex-1 bg-black/30 border border-white/5 rounded-2xl p-6 mb-6 overflow-hidden relative">
              {tipoAposta === 'saldo' ? (
                <div className="flex flex-col items-center justify-center h-full py-4">
                  <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-4">Valor a Apostar</p>
                  <div className="relative group">
                    <input type="number" value={valorApostaSaldo} onChange={(e) => setValorApostaSaldo(parseFloat(e.target.value) || 0)} className="bg-[#161619] border border-zinc-700 text-center text-4xl font-mono font-black text-amber-500 rounded-2xl p-4 w-64 outline-none focus:border-amber-500 transition-all shadow-inner group-hover:border-amber-500/50" />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-black text-zinc-600">€</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full overflow-hidden">
                   <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-4">A tua Mochila (Selecione até 10)</p>
                   {inventario.length === 0 ? (
                     <div className="flex-1 flex items-center justify-center text-zinc-600 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-white/5 rounded-2xl bg-black/20">Inventário Vazio</div>
                   ) : (
                     <div className="flex-1 overflow-y-auto grid grid-cols-4 sm:grid-cols-5 gap-2 pr-2 custom-scrollbar">
                       {inventario.map((skin: any, i: number) => {
                         const selecionada = skinsApostadas.some(s => s.ui_index === i);
                         return (
                           <div key={i} onClick={() => toggleSkin(skin, i)} className={`bg-white/[0.03] border-2 rounded-xl p-2 cursor-pointer transition-all flex flex-col items-center group ${selecionada ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'border-white/5 hover:border-zinc-500'}`}>
                             <img src={skin.imagem || skin.image} className="w-10 h-10 object-contain mb-2 group-hover:scale-110 transition-transform" alt="" />
                             <p className="text-emerald-400 font-mono text-[9px] font-black">{parseFloat(skin.preco || skin.valor).toFixed(2)}€</p>
                           </div>
                         )
                       })}
                     </div>
                   )}
                </div>
              )}
            </div>

            <button onClick={criarJogo} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black py-4 rounded-xl font-black uppercase tracking-widest transition-transform hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.3)] flex-shrink-0">
               CONFIRMAR APOSTA ({tipoAposta === 'saldo' ? valorApostaSaldo.toFixed(2) : valorSkins.toFixed(2)}€)
            </button>
          </div>
        </div>
      )}

      {/* MODAL ENTRAR COM SKINS */}
      {modalEntrarSkins && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#121215] border border-white/10 p-8 rounded-3xl max-w-2xl w-full flex flex-col h-[85vh] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <div className="flex items-center gap-3">
                 <span className="text-2xl drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">🛡️</span>
                 <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Cobrir Aposta</h3>
              </div>
              <button onClick={() => { setModalEntrarSkins(null); setSkinsParaEntrar([]); }} className="text-zinc-500 hover:text-white font-bold bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all">X</button>
            </div>

            <div className="bg-black/40 border border-white/5 p-5 rounded-2xl mb-4 flex justify-between items-center flex-shrink-0 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-2xl rounded-full"></div>
               <div>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Valor do Adversário</p>
                  <p className="text-amber-500 font-mono font-black text-3xl drop-shadow-md">{modalEntrarSkins.valorTotal.toFixed(2)}€</p>
               </div>
               <div className="text-right">
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">A tua Seleção</p>
                  <p className={`${valorSkinsEntrar >= (modalEntrarSkins.valorTotal * 0.9) && valorSkinsEntrar <= (modalEntrarSkins.valorTotal * 1.1) ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'text-red-500'} font-mono font-black text-3xl transition-colors`}>
                    {valorSkinsEntrar.toFixed(2)}€
                  </p>
               </div>
            </div>
            
            <p className="text-zinc-500 text-[10px] text-center uppercase font-bold tracking-widest mb-6 flex-shrink-0">
              Margem justa: <span className="text-white">{(modalEntrarSkins.valorTotal * 0.9).toFixed(2)}€</span> a <span className="text-white">{(modalEntrarSkins.valorTotal * 1.1).toFixed(2)}€</span>
            </p>

            <div className="flex-1 bg-black/30 border border-white/5 rounded-2xl p-4 mb-6 overflow-hidden flex flex-col">
               <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-4">A tua Mochila (Selecione até 10)</p>
               {inventario.length === 0 ? (
                 <div className="flex-1 flex items-center justify-center text-zinc-600 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-white/5 rounded-2xl bg-black/20">Inventário Vazio</div>
               ) : (
                 <div className="flex-1 overflow-y-auto grid grid-cols-4 sm:grid-cols-5 gap-2 pr-2 custom-scrollbar">
                   {inventario.map((skin: any, i: number) => {
                     const selecionada = skinsParaEntrar.some(s => s.ui_index === i);
                     return (
                       <div key={i} onClick={() => toggleSkinEntrar(skin, i)} className={`bg-white/[0.03] border-2 rounded-xl p-2 cursor-pointer transition-all flex flex-col items-center group ${selecionada ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'border-white/5 hover:border-zinc-500'}`}>
                         <img src={skin.imagem || skin.image} className="w-10 h-10 object-contain mb-2 group-hover:scale-110 transition-transform" alt="" />
                         <p className="text-emerald-400 font-mono text-[9px] font-black">{parseFloat(skin.preco || skin.valor).toFixed(2)}€</p>
                       </div>
                     )
                   })}
                 </div>
               )}
            </div>

            <button 
              onClick={confirmarEntradaSkins} 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-transform hover:scale-[1.02] shadow-[0_0_20px_rgba(37,99,235,0.4)] flex-shrink-0"
            >
               ENTRAR NA APOSTA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}