'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function LiveChatWidget({ userId, userName }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId || !isOpen) return;

    fetch(`http://localhost:3000/suporte/livechat/${userId}`)
      .then(async res => {
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      })
      .then(data => {
        if (data && data.id) setChatId(data.id);
        if (data && data.mensagens) setMessages(data.mensagens);
      });

    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);
    newSocket.emit('entrarChat', userId);

    newSocket.on('novaMensagem', (msg: any) => { 
      setChatId(msg.chatId); // 🔥 CORREÇÃO: Memoriza o ID assim que a primeira mensagem é criada!
      setMessages(prev => [...prev, msg]); 
    });

    // 🔥 CORREÇÃO: Ouve quando o Admin ou ele próprio fecha a janela
    newSocket.on('chatEncerrado', () => {
      setMessages([]);
      setChatId(null);
    });

    return () => { newSocket.close(); };
  }, [userId, isOpen]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const enviarMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;
    socket.emit('enviarMensagem', { userId: userId, remetente: 'JOGADOR', texto: input });
    setInput('');
  };

  const encerrarConversa = () => {
    if (socket && chatId) {
      socket.emit('encerrarChat', { chatId, userId }); // 🔥 Agora envia a ordem por Socket!
    } else {
      setMessages([]);
      setChatId(null);
    }
  };

  if (!userId) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <button onClick={() => setIsOpen(!isOpen)} className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-zinc-800 rotate-90' : 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}>
        {isOpen ? <span className="text-white text-2xl">✕</span> : <span className="text-black text-2xl">💬</span>}
        {!isOpen && messages.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-black rounded-full animate-ping"></span>}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] h-[500px] bg-[#1b1b1e] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="p-4 bg-emerald-500 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center text-xl">👑</div>
              <div>
                <h3 className="text-black font-black text-xs uppercase tracking-widest">Suporte Império</h3>
                <p className="text-black/60 text-[9px] font-bold uppercase">Online • Resposta imediata</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button onClick={encerrarConversa} title="Encerrar Conversa e Iniciar Nova" className="bg-black/20 hover:bg-black/40 text-black px-3 py-1.5 rounded text-[9px] font-black uppercase transition-colors">
                Reiniciar
              </button>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-[#121215]">
            {messages.length === 0 && (
              <div className="text-center py-10 opacity-50">
                <span className="text-4xl block mb-2">👋</span>
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Nova conversa iniciada.<br/>Como podemos ajudar hoje?</p>
              </div>
            )}
            {messages.map((msg, i) => {
              const souEu = msg.remetente === 'JOGADOR';
              return (
                <div key={i} className={`flex flex-col ${souEu ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl text-xs font-medium ${souEu ? 'bg-emerald-500 text-black rounded-tr-none' : 'bg-zinc-800 text-white rounded-tl-none'}`}>
                    {msg.texto}
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={enviarMsg} className="p-3 bg-[#1b1b1e] border-t border-white/5 flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escreve aqui..." className="flex-1 bg-[#121215] border border-white/10 rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-emerald-500/50" />
            <button className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 rounded-lg"><span className="text-sm">➤</span></button>
          </form>
        </div>
      )}
    </div>
  );
}