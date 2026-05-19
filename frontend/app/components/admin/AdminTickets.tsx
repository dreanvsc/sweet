'use client';

import React, { useEffect, useState } from 'react';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketSelecionado, setTicketSelecionado] = useState<any>(null);
  const [resposta, setResposta] = useState('');
  const [statusAcao, setStatusAcao] = useState('RESPONDIDO');

  const carregarTickets = () => {
    setLoading(true);
    fetch('https://sweet-7ifa.onrender.com/admin/tickets')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTickets(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    carregarTickets();
  }, []);

  const enviarResposta = async () => {
    if (!resposta.trim()) return alert("Escreve uma resposta!");
    
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/admin/ticket/responder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ticketId: ticketSelecionado.id, 
          resposta: resposta, 
          status: statusAcao 
        })
      });
      const data = await res.json();
      if (data.sucesso) {
        alert("✅ Resposta enviada com sucesso!");
        setTicketSelecionado(null); // Fecha o modal
        setResposta('');
        carregarTickets(); // Atualiza a tabela
      }
    } catch (error) {
      alert("Erro ao enviar resposta.");
    }
  };

  if (loading) return <div className="text-white text-center py-10">A carregar tickets...</div>;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-black text-white uppercase tracking-widest">Painel de Suporte</h2>

      <div className="bg-[#1b1b1e] rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/20 text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
              <th className="p-4 pl-6">ID</th>
              <th className="p-4">Jogador</th>
              <th className="p-4">Assunto</th>
              <th className="p-4 text-center">Estado</th>
              <th className="p-4 text-right pr-6">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {tickets.map((ticket: any) => (
              <tr key={ticket.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 pl-6 text-xs text-zinc-500 font-mono">#{ticket.id}</td>
                <td className="p-4 text-xs font-bold text-white flex items-center gap-2">
                  <img src={ticket.user?.avatar || "/default-avatar.png"} className="w-6 h-6 rounded-full" />
                  {ticket.user?.nome || 'Desconhecido'}
                </td>
                <td className="p-4 text-xs font-black text-zinc-300 uppercase">{ticket.assunto}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-[9px] font-black tracking-widest uppercase border ${
                    ticket.status === 'ABERTO' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                    ticket.status === 'RESPONDIDO' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                    'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="p-4 text-right pr-6">
                  <button 
                    onClick={() => { setTicketSelecionado(ticket); setResposta(ticket.resposta || ''); }}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase px-4 py-2 rounded transition-colors"
                  >
                    Ver / Responder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE RESPOSTA */}
      {ticketSelecionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1b1b1e] border border-white/10 rounded-xl p-6 w-full max-w-2xl shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white font-black uppercase tracking-widest text-lg">Ticket #{ticketSelecionado.id}</h3>
              <button onClick={() => setTicketSelecionado(null)} className="text-zinc-500 hover:text-white font-black">X</button>
            </div>

            <div className="bg-black/20 p-4 rounded-lg border border-white/5">
              <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Mensagem de {ticketSelecionado.user?.nome}:</p>
              <p className="text-sm text-zinc-300 font-medium">{ticketSelecionado.mensagem}</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-zinc-500 text-[10px] font-black uppercase">A tua resposta (Admin):</label>
              <textarea 
                rows={5}
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                placeholder="Escreve aqui a solução para o jogador..."
                className="w-full bg-[#121215] border border-white/5 rounded-lg p-4 text-sm text-white font-medium outline-none focus:border-emerald-500/50 resize-none"
              ></textarea>
            </div>

            <div className="flex justify-between items-center mt-2">
              <select 
                value={statusAcao} 
                onChange={(e) => setStatusAcao(e.target.value)}
                className="bg-[#121215] border border-white/5 text-zinc-300 text-[10px] font-black uppercase px-4 py-3 rounded-lg outline-none"
              >
                <option value="RESPONDIDO">Marcar como Respondido</option>
                <option value="FECHADO">Fechar Ticket</option>
              </select>

              <button 
                onClick={enviarResposta}
                className="bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase px-8 py-3 rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                Enviar Resposta
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}