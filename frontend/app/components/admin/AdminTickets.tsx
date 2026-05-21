'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast'; // 🔥 Import adicionado

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
      })
      .catch(() => {
        toast.error('Erro ao carregar tickets.');
        setLoading(false);
      });
  };

  useEffect(() => {
    carregarTickets();
  }, []);

  const enviarResposta = async () => {
    if (!resposta.trim()) return toast.error("Escreve uma resposta antes de enviar!");

    const toastId = toast.loading("A enviar resposta...");
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
        toast.success("✅ Resposta enviada com sucesso!", { id: toastId });
        setTicketSelecionado(null); // Fecha o modal
        setResposta('');
        carregarTickets(); // Atualiza a tabela
      } else {
        toast.error("❌ Falha ao enviar resposta.", { id: toastId });
      }
    } catch (error) {
      toast.error("Erro de comunicação com o servidor.", { id: toastId });
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <span className="text-4xl mb-4">💬</span>
      <div className="text-zinc-500 font-black tracking-widest text-[10px] uppercase">A carregar comunicações...</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
      
      <div className="bg-[#121215]/80 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden shadow-xl p-6 md:p-8 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
        
        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3 relative z-10 border-b border-white/5 pb-4">
          <span className="text-2xl drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] text-emerald-400">🎫</span> Painel de Suporte
        </h2>

        <div className="overflow-x-auto custom-scrollbar relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                <th className="p-4 pl-6 rounded-tl-xl">ID</th>
                <th className="p-4">Jogador</th>
                <th className="p-4">Assunto</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-right pr-6 rounded-tr-xl">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-600 font-black uppercase text-[10px] tracking-widest">
                    Nenhum ticket pendente. O império está calmo.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket: any) => (
                  <tr key={ticket.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 pl-6 text-[10px] text-zinc-500 font-mono font-bold group-hover:text-emerald-400 transition-colors">#{ticket.id}</td>
                    <td className="p-4 text-xs font-bold text-white flex items-center gap-3">
                      <img src={ticket.user?.avatar || "/skins/glock.png"} className="w-8 h-8 rounded-lg border border-white/10 group-hover:border-emerald-500/50 transition-colors" alt="avatar"/>
                      {ticket.user?.nome || 'Desconhecido'}
                    </td>
                    <td className="p-4 text-xs font-black text-zinc-300 uppercase truncate max-w-[200px]">{ticket.assunto}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase border ${
                        ticket.status === 'ABERTO' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 
                        ticket.status === 'RESPONDIDO' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                        'bg-zinc-800 text-zinc-500 border-zinc-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button 
                        onClick={() => { setTicketSelecionado(ticket); setResposta(ticket.resposta || ''); }}
                        className="bg-black/50 hover:bg-emerald-500 hover:text-black border border-white/10 hover:border-emerald-500 text-zinc-300 text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all shadow-sm"
                      >
                        Ver / Responder
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE RESPOSTA (O COMUNICADOR) */}
      {ticketSelecionado && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#121215] border border-emerald-500/20 rounded-3xl p-6 md:p-8 w-full max-w-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="flex justify-between items-center border-b border-white/5 pb-4 relative z-10">
              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-xl flex items-center gap-3">
                  <span className="text-emerald-500">📨</span> Ticket #{ticketSelecionado.id}
                </h3>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Atendimento ao Cliente</p>
              </div>
              <button onClick={() => setTicketSelecionado(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-all font-black">✕</button>
            </div>

            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 relative z-10 shadow-inner">
              <div className="flex items-center gap-3 mb-3">
                <img src={ticketSelecionado.user?.avatar || "/skins/glock.png"} className="w-8 h-8 rounded-lg border border-white/10" alt="avatar" />
                <div>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Mensagem de {ticketSelecionado.user?.nome}</p>
                  <p className="text-xs text-zinc-400 font-bold uppercase">{ticketSelecionado.assunto}</p>
                </div>
              </div>
              <p className="text-sm text-white font-medium whitespace-pre-wrap bg-white/[0.02] p-4 rounded-xl border border-white/5 leading-relaxed">{ticketSelecionado.mensagem}</p>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              <label className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <span>👑</span> A tua resposta (Equipa Império)
              </label>
              <textarea 
                rows={5}
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                placeholder="Escreve aqui a solução para o jogador..."
                className="w-full bg-black/60 border border-emerald-500/20 rounded-xl p-4 text-sm text-white font-medium outline-none focus:border-emerald-500 transition-colors resize-none shadow-inner custom-scrollbar"
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2 relative z-10">
              <select 
                value={statusAcao} 
                onChange={(e) => setStatusAcao(e.target.value)}
                className="w-full sm:w-auto bg-black/40 border border-white/10 text-zinc-300 text-[10px] font-black uppercase tracking-widest px-4 py-4 rounded-xl outline-none focus:border-white/30 transition-colors"
              >
                <option value="RESPONDIDO">Marcar como Respondido</option>
                <option value="FECHADO">Fechar Ticket Definitivamente</option>
              </select>

              <button 
                onClick={enviarResposta}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black text-[10px] font-black uppercase tracking-widest px-10 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-[1.02]"
              >
                ENVIAR RESPOSTA
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}