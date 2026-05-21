'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast'; // 🔥 Import adicionado

export default function AdminLiveChat() {
  const [chats, setChats] = useState<any[]>([]);
  const [chatAtivo, setChatAtivo] = useState<any>(null);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Carrega apenas os chats abertos do servidor
  const carregarChats = () => {
    fetch('https://sweet-7ifa.onrender.com/admin/livechats')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setChats(data);
      });
  };

  useEffect(() => {
    carregarChats();
    const newSocket = io('https://sweet-7ifa.onrender.com');
    setSocket(newSocket);

    // Ouve mensagens novas do jogador
    newSocket.on('novaMensagem', (msg: any) => {
      // 1. Atualiza a lista da esquerda
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id === msg.chatId) {
          return { ...chat, mensagens: [...(chat.mensagens || []), msg] };
        }
        return chat;
      }));

      // 2. Atualiza o chat ativo apenas se for a mesma sessão de chat
      setChatAtivo((prevAtivo: any) => {
        if (prevAtivo && prevAtivo.id === msg.chatId) {
          return { ...prevAtivo, mensagens: [...(prevAtivo.mensagens || []), msg] };
        }
        return prevAtivo;
      });
    });

    // Ouve quando deve atualizar a lista completa
    newSocket.on('atualizarListaAdmin', () => {
      carregarChats();
    });

    // Ouve o encerramento do chat e limpa a memória na hora!
    newSocket.on('chatEncerrado', (chatIdFechado: number) => {
      setChatAtivo((prevAtivo: any) => {
        if (prevAtivo && prevAtivo.id === chatIdFechado) {
          toast("Sessão encerrada pelo utilizador.", { icon: 'ℹ️' });
          return null;
        }
        return prevAtivo;
      });
      // Remove imediatamente da lista da esquerda
      setChats((prevChats) => prevChats.filter(chat => chat.id !== chatIdFechado));
    });

    return () => { newSocket.close(); };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatAtivo?.mensagens]);

  const enviarMsgAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !chatAtivo) return;

    socket.emit('enviarMensagem', {
      userId: chatAtivo.userId,
      remetente: 'EQUIPA',
      texto: input
    });
    setInput('');
  };

  // O Admin clica em fechar a sessão
  const encerrarConversaAdmin = () => {
    if (!chatAtivo || !socket) return;
    
    // Dispara o evento para o servidor fechar o ID correto
    socket.emit('encerrarChat', { chatId: chatAtivo.id, userId: chatAtivo.userId });
    
    // Limpa logo os estados locais
    setChats((prevChats) => prevChats.filter(chat => chat.id !== chatAtivo.id));
    setChatAtivo(null); 
    toast.success("Sessão de Live Chat encerrada."); // 🔥
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[750px] font-sans animate-in fade-in">
      
      {/* COLUNA ESQUERDA: LISTA DE CHATS ATIVOS */}
      <div className="w-full md:w-1/3 bg-[#121215]/80 backdrop-blur-sm border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-xl relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none"></div>
        
        <div className="p-5 bg-black/40 border-b border-white/5 relative z-10">
          <h3 className="text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            Conversas em Direto <span className="text-zinc-500">({chats.length})</span>
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 custom-scrollbar relative z-10">
          {chats.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 opacity-50 p-6 text-center">
              <span className="text-4xl mb-2">🎧</span>
              <p className="font-black text-[10px] uppercase tracking-widest">Nenhuma conversa ativa no momento.</p>
            </div>
          ) : (
            chats.map(chat => {
              const ultimaMsg = chat.mensagens?.[chat.mensagens.length - 1];
              return (
                <div 
                  key={chat.id} 
                  onClick={() => setChatAtivo(chat)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border shadow-sm group ${
                    chatAtivo?.id === chat.id 
                      ? 'bg-emerald-500/10 border-emerald-500/30 translate-x-1' 
                      : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={chat.user?.avatar || '/skins/glock.png'} className={`w-10 h-10 rounded-lg border transition-colors ${chatAtivo?.id === chat.id ? 'border-emerald-500/50' : 'border-white/10 group-hover:border-white/30'}`} />
                    <div className="flex-1 overflow-hidden">
                      <p className={`font-black text-[10px] uppercase tracking-widest mb-0.5 truncate transition-colors ${chatAtivo?.id === chat.id ? 'text-emerald-400' : 'text-white group-hover:text-zinc-200'}`}>
                        {chat.user?.nome || 'Desconhecido'}
                      </p>
                      <p className="text-[10px] text-zinc-500 truncate font-medium">{ultimaMsg?.texto || 'Nova conversa iniciada...'}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* COLUNA DIREITA: CONTEÚDO DO CHAT SELECIONADO */}
      <div className="flex-1 bg-[#121215]/80 backdrop-blur-sm border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-xl relative">
        {chatAtivo ? (
          <>
            <div className="p-5 bg-black/40 border-b border-white/5 flex items-center justify-between relative z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <img src={chatAtivo.user?.avatar || '/skins/glock.png'} className="w-12 h-12 rounded-xl border border-white/10 shadow-md" />
                <div>
                  <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                    {chatAtivo.user?.nome} <span className="bg-emerald-500/20 text-emerald-400 text-[8px] px-2 py-0.5 rounded-full border border-emerald-500/30">ONLINE</span>
                  </h3>
                  <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest mt-0.5">ID DA CONTA: #{chatAtivo.user?.id}</p>
                </div>
              </div>
              <button 
                onClick={encerrarConversaAdmin}
                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                Encerrar Chat
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-black/20 custom-scrollbar relative z-10 shadow-inner">
              {chatAtivo.mensagens?.map((msg: any) => {
                const souEu = msg.remetente === 'EQUIPA';
                return (
                  <div key={msg.id} className={`flex flex-col max-w-[80%] ${souEu ? 'self-end items-end' : 'self-start items-start'}`}>
                    <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1.5 px-1">
                      {souEu ? '👑 Tu (Equipa)' : `👤 ${chatAtivo.user?.nome}`}
                    </span>
                    <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-md ${
                      souEu 
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-black rounded-tr-sm' 
                        : 'bg-[#1b1b1e] border border-white/5 text-zinc-300 rounded-tl-sm'
                    }`}>
                      {msg.texto}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={enviarMsgAdmin} className="p-4 bg-black/40 border-t border-white/5 flex gap-3 relative z-10">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escreve a tua resposta para o jogador..."
                className="flex-1 bg-[#0b0b0d] border border-white/10 rounded-xl px-5 py-4 text-xs text-white outline-none focus:border-emerald-500/50 transition-colors shadow-inner"
              />
              <button disabled={!input.trim()} className="bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 disabled:opacity-50 disabled:grayscale text-black font-black uppercase tracking-widest px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                Enviar
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 relative z-10">
            <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <span className="text-6xl opacity-50">💬</span>
            </div>
            <h3 className="text-white font-black uppercase tracking-widest text-lg mb-2">Centro de Comunicações</h3>
            <p className="font-bold uppercase tracking-widest text-[10px]">Seleciona uma conversa ativa na lista ao lado.</p>
          </div>
        )}
      </div>
    </div>
  );
}