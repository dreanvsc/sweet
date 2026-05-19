'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

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

    // Ouve quando deve atualizar a lista completa (ex: novo utilizador mandou mensagem)
    newSocket.on('atualizarListaAdmin', () => {
      carregarChats();
    });

    // 🔥 CORREÇÃO CRÍTICA: Ouve o encerramento do chat e limpa a memória na hora!
    newSocket.on('chatEncerrado', (chatIdFechado: number) => {
      setChatAtivo((prevAtivo: any) => {
        // Se o chat que fechou for o que está aberto na tela, limpa o ecrã
        if (prevAtivo && prevAtivo.id === chatIdFechado) return null;
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
    
    // 🔥 Limpa logo os estados locais para evitar acumular lixo na memória do ecrã
    setChats((prevChats) => prevChats.filter(chat => chat.id !== chatAtivo.id));
    setChatAtivo(null); 
  };

  return (
    <div className="flex gap-6 h-[700px] font-sans">
      
      {/* COLUNA ESQUERDA: LISTA DE CHATS ATIVOS */}
      <div className="w-1/3 bg-[#1b1b1e] border border-white/5 rounded-xl flex flex-col overflow-hidden shadow-xl">
        <div className="p-4 bg-black/20 border-b border-white/5">
          <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Conversas em Direto
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
          {chats.map(chat => {
            const ultimaMsg = chat.mensagens?.[chat.mensagens.length - 1];
            return (
              <div 
                key={chat.id} 
                onClick={() => setChatAtivo(chat)} // Ao clicar, carrega os dados novos daquela sessão limpa
                className={`p-3 rounded-lg cursor-pointer transition-colors border ${chatAtivo?.id === chat.id ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#121215] border-white/5 hover:border-white/20'}`}
              >
                <div className="flex items-center gap-3">
                  <img src={chat.user?.avatar || '/default-avatar.png'} className="w-8 h-8 rounded-full" />
                  <div className="flex-1 overflow-hidden">
                    <p className={`font-bold text-xs uppercase ${chatAtivo?.id === chat.id ? 'text-emerald-500' : 'text-white'}`}>{chat.user?.nome}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{ultimaMsg?.texto || 'Nova conversa...'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COLUNA DIREITA: CONTEÚDO DO CHAT SELECIONADO */}
      <div className="flex-1 bg-[#1b1b1e] border border-white/5 rounded-xl flex flex-col overflow-hidden shadow-xl">
        {chatAtivo ? (
          <>
            <div className="p-4 bg-black/20 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={chatAtivo.user?.avatar || '/default-avatar.png'} className="w-10 h-10 rounded-full" />
                <div>
                  <h3 className="text-white font-black uppercase tracking-widest text-sm">{chatAtivo.user?.nome}</h3>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold">ID DA CONTA: #{chatAtivo.user?.id}</p>
                </div>
              </div>
              <button 
                onClick={encerrarConversaAdmin}
                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg"
              >
                Encerrar Conversa
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-[#121215]">
              {chatAtivo.mensagens?.map((msg: any) => {
                const souEu = msg.remetente === 'EQUIPA';
                return (
                  <div key={msg.id} className={`flex flex-col ${souEu ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">
                      {souEu ? 'TU (ADMIN)' : 'JOGADOR'}
                    </span>
                    <div className={`max-w-[70%] p-3 rounded-xl text-sm font-medium ${souEu ? 'bg-emerald-500 text-black rounded-tr-none' : 'bg-zinc-800 text-white rounded-tl-none'}`}>
                      {msg.texto}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={enviarMsgAdmin} className="p-4 bg-black/20 border-t border-white/5 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escreve a tua resposta ao vivo..."
                className="flex-1 bg-[#121215] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
              />
              <button disabled={!input.trim()} className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black uppercase tracking-widest px-6 rounded-lg transition-colors">
                Enviar
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
            <span className="text-6xl opacity-20 mb-4">💬</span>
            <p className="font-black uppercase tracking-widest text-xs">Seleciona uma conversa para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}