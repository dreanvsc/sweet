'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast'; // 🔥 Import do Motor de Notificações Premium adicionado!

export default function ModalDeposito({ onClose, userId }: { onClose: () => void, userId: string }) {
  const [metodo, setMetodo] = useState<'mbway' | 'cartao' | 'crypto'>('mbway');
  const [valor, setValor] = useState<string>('10');
  const [telemovel, setTelemovel] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoPagamento, setInfoPagamento] = useState<any>(null);

  const handlePagar = async () => {
    // 🔥 Toasts em vez de Alerts
    if (!userId) return toast.error("Erro de sessão.");
    if (Number(valor) < 5) return toast.error("Depósito mínimo de 5€.");
    if (metodo === 'mbway' && telemovel.length < 9) return toast.error("Número de telemóvel inválido.");

    setLoading(true);
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/depositar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(userId), metodo, valor: Number(valor), telemovel })
      });
      const data = await res.json();
      
      if (res.ok) {
        setInfoPagamento(data); // Mostra o resultado (link da stripe, ou morada cripto)
        toast.success("Pedido de depósito gerado com sucesso!"); // 🔥
      } else {
        toast.error(data.message || "Erro a processar pagamento."); // 🔥
      }
    } catch(e) { 
      toast.error("Erro ao ligar ao servidor."); // 🔥
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#121215] border border-white/10 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
          <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
            <span className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">💳</span> Adicionar Fundos
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all font-black">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {!infoPagamento ? (
            <>
              {/* Escolher Método */}
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">1. Método de Pagamento</h3>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button onClick={() => setMetodo('mbway')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 ${metodo === 'mbway' ? 'bg-blue-500/10 border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)] scale-105' : 'bg-black/40 border-white/5 text-zinc-500 hover:border-white/20 hover:bg-black/60'}`}>
                  <span className="text-2xl drop-shadow-md">📱</span><span className="text-[10px] font-black uppercase">MB Way</span>
                </button>
                <button onClick={() => setMetodo('cartao')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 ${metodo === 'cartao' ? 'bg-purple-500/10 border-purple-500 text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)] scale-105' : 'bg-black/40 border-white/5 text-zinc-500 hover:border-white/20 hover:bg-black/60'}`}>
                  <span className="text-2xl drop-shadow-md">💳</span><span className="text-[10px] font-black uppercase">Cartão</span>
                </button>
                <button onClick={() => setMetodo('crypto')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 ${metodo === 'crypto' ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] scale-105' : 'bg-black/40 border-white/5 text-zinc-500 hover:border-white/20 hover:bg-black/60'}`}>
                  <span className="text-2xl drop-shadow-md">₿</span><span className="text-[10px] font-black uppercase">Crypto</span>
                </button>
              </div>

              {/* Escolher Valor */}
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">2. Montante (€)</h3>
              <div className="flex gap-2 mb-6">
                {[5, 10, 25, 50, 100].map(v => (
                  <button key={v} onClick={() => setValor(v.toString())} className={`flex-1 py-2 rounded-lg border text-xs font-black transition-all duration-300 ${valor === v.toString() ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-black/40 border-white/5 text-zinc-400 hover:border-white/20 hover:text-white'}`}>
                    {v}€
                  </button>
                ))}
              </div>
              
              <div className="relative mb-6">
                <input type="number" value={valor} onChange={e => setValor(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl p-4 pl-12 text-white font-black text-xl outline-none focus:border-emerald-500 transition-colors shadow-inner" />
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-xl">€</span>
              </div>

              {/* Input Dinâmico (Telemóvel só para MB WAY) */}
              {metodo === 'mbway' && (
                <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">3. O teu telemóvel MB WAY</h3>
                  <input type="tel" placeholder="Ex: 912345678" value={telemovel} onChange={e => setTelemovel(e.target.value)} maxLength={9} className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-blue-500 transition-colors shadow-inner" />
                </div>
              )}

              {/* Botão Pagar */}
              <button onClick={handlePagar} disabled={loading} className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-[1.02] disabled:opacity-50 disabled:scale-100">
                {loading ? 'A processar...' : `PAGAR ${valor}€ AGORA`}
              </button>
            </>
          ) : (
            /* ECRÃ DE SUCESSO (Instruções após clique) */
            <div className="text-center py-8 animate-in fade-in zoom-in-95">
              <span className="text-6xl block mb-6 animate-bounce drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{infoPagamento.metodo === 'mbway' ? '📱' : infoPagamento.metodo === 'cartao' ? '💳' : '₿'}</span>
              <h2 className="text-2xl font-black text-white mb-2">{infoPagamento.msg}</h2>
              
              {infoPagamento.metodo === 'mbway' && <p className="text-sm text-zinc-400 bg-white/5 p-4 rounded-xl border border-white/5">Abre a tua app do banco e confirma o pagamento.</p>}
              
              {infoPagamento.metodo === 'cartao' && (
                <a href={infoPagamento.url} target="_blank" className="mt-6 inline-block bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-8 py-4 rounded-xl font-black uppercase text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105 transition-all">
                  Abrir Checkout Stripe
                </a>
              )}
              
              {infoPagamento.metodo === 'crypto' && (
                <div className="mt-4 bg-black/60 border border-amber-500/20 p-5 rounded-xl inline-block text-left w-full shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-xl rounded-full"></div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1 relative z-10">Envia exatamente:</p>
                  <p className="text-emerald-400 font-mono font-black text-2xl mb-4 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] relative z-10">{infoPagamento.valorCripto} {infoPagamento.moeda}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1 relative z-10">Para o endereço:</p>
                  <p className="text-amber-400 font-mono text-xs break-all bg-white/5 p-3 rounded-lg border border-white/5 relative z-10 selection:bg-amber-500 selection:text-black">{infoPagamento.carteira}</p>
                </div>
              )}

              <p className="text-[10px] text-zinc-500 uppercase font-bold mt-8 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                O teu saldo será atualizado automaticamente.
              </p>
              <button onClick={onClose} className="mt-6 px-6 py-2 rounded-lg text-sm text-zinc-400 font-bold hover:text-white hover:bg-white/5 transition-all">Fechar Janela</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}