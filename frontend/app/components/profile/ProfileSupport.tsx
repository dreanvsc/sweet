'use client';

import React, { useEffect, useState } from 'react';

export default function ProfileSupport({ userId }: any) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Controlo de ecrãs: Lista, Criar, ou Ver Detalhes
  const [abaCriar, setAbaCriar] = useState(false);
  const [ticketVisualizar, setTicketVisualizar] = useState<any>(null);

  // Campos do formulário
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  const carregarTickets = () => {
    if (!userId) return;
    setLoading(true);
    fetch(`https://sweet-7ifa.onrender.com/suporte/tickets/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTickets(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    carregarTickets();
  }, [userId]);

  const submeterTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assunto.trim() || !mensagem.trim()) return;
    setEnviando(true);

    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/suporte/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, assunto, message: mensagem })
      });
      const data = await res.json();
      
      if (data.sucesso || res.ok) {
        alert("✅ Ticket criado com sucesso!");
        setAssunto('');
        setMensagem('');
        setAbaCriar(false);
        carregarTickets();
      } else {
        alert("❌ Erro ao criar ticket.");
      }
    } catch (error) {
      alert("❌ Erro de ligação ao servidor.");
    }
    setEnviando(false);
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-zinc-500 font-black tracking-widest text-xs uppercase animate-pulse">
        ⏳ A carregar os seus pedidos de suporte...
      </div>
    );
  }

  return (
    <div className="bg-[#1b1b1e] border border-white/5 rounded-xl overflow-hidden shadow-2xl animate-in fade-in">
      
      {/* CABEÇALHO DO PAINEL */}
      <div className="p-6 border-b border-white/5 bg-black/10 flex justify-between items-center">
        <div>
          <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
            <span>💬</span> 
            {ticketVisualizar ? `Visualizar Ticket #${ticketVisualizar.id}` : 'Central de Tickets Pessoais'}
          </h3>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-1">
            {ticketVisualizar ? 'Detalhes da tua conversa com a equipa' : 'Gere e acompanha os teus pedidos de ajuda'}
          </p>
        </div>

        {/* Botões de Ação */}
        {ticketVisualizar ? (
          <button
            onClick={() => setTicketVisualizar(null)}
            className="px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors bg-zinc-800 text-zinc-400 hover:text-white"
          >
            ◀ Voltar aos Tickets
          </button>
        ) : (
          <button
            onClick={() => setAbaCriar(!abaCriar)}
            className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
              abaCriar 
                ? 'bg-zinc-800 text-zinc-400 hover:text-white' 
                : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.2)]'
            }`}
          >
            {abaCriar ? '◀ Voltar aos Tickets' : '+ Abrir Novo Ticket'}
          </button>
        )}
      </div>

      {/* RENDERIZAÇÃO: LER TICKET (NOVO) */}
      {ticketVisualizar ? (
        <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h2 className="text-xl font-black uppercase text-white">{ticketVisualizar.assunto}</h2>
            <span className={`px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase border ${
              ticketVisualizar.status === 'RESPONDIDO' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
              ticketVisualizar.status === 'ABERTO' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
              'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}>
              {ticketVisualizar.status}
            </span>
          </div>

          {/* MENSAGEM DO JOGADOR */}
          <div className="bg-[#121215] border border-white/5 p-5 rounded-xl">
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="text-lg">👤</span> A Tua Mensagem
            </p>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap">{ticketVisualizar.mensagem}</p>
          </div>

          {/* RESPOSTA DO ADMIN */}
          <div className={`p-5 rounded-xl border relative overflow-hidden ${
            ticketVisualizar.resposta 
              ? 'bg-emerald-500/5 border-emerald-500/20' 
              : 'bg-amber-500/5 border-amber-500/20'
          }`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2 ${
              ticketVisualizar.resposta ? 'text-emerald-500' : 'text-amber-500'
            }`}>
              <span className="text-lg">👑</span> Resposta da Equipa Império
            </p>
            
            {ticketVisualizar.resposta ? (
              <p className="text-sm text-white whitespace-pre-wrap">{ticketVisualizar.resposta}</p>
            ) : (
              <p className="text-sm text-amber-500/70 italic font-medium">A aguardar resposta de um moderador. Por favor, aguarde...</p>
            )}
          </div>
        </div>

      ) : abaCriar ? (
        /* RENDERIZAÇÃO: CRIAR TICKET */
        <form onSubmit={submeterTicket} className="p-6 max-w-2xl mx-auto flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-300">
          <div>
            <label className="text-zinc-500 text-[9px] font-black uppercase tracking-widest block mb-2">Qual é o assunto?</label>
            <input 
              type="text"
              placeholder="EX: PROBLEMA COM DEPÓSITO, ERRO..."
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              className="w-full bg-[#121215] border border-white/5 rounded-lg px-4 py-3 text-xs text-white font-black uppercase tracking-wider outline-none focus:border-amber-500/50 transition-colors placeholder:text-zinc-700"
              required
            />
          </div>

          <div>
            <label className="text-zinc-500 text-[9px] font-black uppercase tracking-widest block mb-2">Explicação Detalhada</label>
            <textarea 
              rows={5}
              placeholder="DIGITE A SUA MENSAGEM PARA OS MODERADORES..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="w-full bg-[#121215] border border-white/5 rounded-lg px-4 py-3 text-xs text-white font-medium outline-none focus:border-amber-500/50 transition-colors placeholder:text-zinc-700 resize-none"
              required
            ></textarea>
          </div>

          <button 
            type="submit"
            disabled={enviando}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-[10px] font-black uppercase py-4 rounded-lg tracking-widest transition-colors"
          >
            {enviando ? 'A ENVIAR...' : 'ENVIAR PEDIDO DE SUPORTE'}
          </button>
        </form>

      ) : (
        /* RENDERIZAÇÃO: TABELA DE TICKETS */
        <div className="overflow-x-auto">
          {tickets.length === 0 ? (
            <div className="p-20 text-center text-zinc-600">
              <span className="text-4xl block mb-4 opacity-20">✉️</span>
              <p className="font-black uppercase tracking-widest text-[10px]">Não tens nenhum ticket ativo de momento.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-black/20 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Assunto</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-right pr-6">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {tickets.map((ticket: any) => {
                  const isAberto = ticket.status === 'ABERTO';
                  const isRespondido = ticket.status === 'RESPONDIDO';

                  return (
                    <tr key={ticket.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 pl-6 text-xs font-mono font-black text-zinc-500">#{ticket.id}</td>
                      <td className="p-4 text-xs font-black text-white uppercase tracking-wide">{ticket.assunto}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-3 py-0.5 rounded text-[9px] font-black tracking-widest uppercase border ${
                          isRespondido 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                            : isAberto
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                            : 'bg-zinc-800 text-zinc-500 border-zinc-700/50'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button 
                          onClick={() => setTicketVisualizar(ticket)}
                          className="bg-[#121215] hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded border border-white/5 transition-colors"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
}