import React, { useState } from 'react';

export default function ModalDeposito({ onClose, userId }: { onClose: () => void, userId: string }) {
  const [metodo, setMetodo] = useState<'mbway' | 'cartao' | 'crypto'>('mbway');
  const [valor, setValor] = useState<string>('10');
  const [telemovel, setTelemovel] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoPagamento, setInfoPagamento] = useState<any>(null);

  const handlePagar = async () => {
    if (!userId) return alert("Erro de sessão.");
    if (Number(valor) < 5) return alert("Depósito mínimo de 5€.");
    if (metodo === 'mbway' && telemovel.length < 9) return alert("Número de telemóvel inválido.");

    setLoading(true);
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/depositar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(userId), metodo, valor: Number(valor), telemovel })
      });
      const data = await res.json();
      
      if (res.ok) {
        setInfoPagamento(data); // Mostra o resultado (link da stripe, ou morada cripto)
      } else {
        alert(data.message);
      }
    } catch(e) { alert("Erro ao ligar ao servidor."); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#121215] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
          <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
            <span className="text-emerald-500">💳</span> Adicionar Fundos
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-xl font-black">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto">
          {!infoPagamento ? (
            <>
              {/* Escolher Método */}
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">1. Método de Pagamento</h3>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button onClick={() => setMetodo('mbway')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${metodo === 'mbway' ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-black/40 border-white/5 text-zinc-500 hover:border-white/20'}`}>
                  <span className="text-2xl">📱</span><span className="text-[10px] font-black uppercase">MB Way</span>
                </button>
                <button onClick={() => setMetodo('cartao')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${metodo === 'cartao' ? 'bg-purple-500/10 border-purple-500 text-purple-500' : 'bg-black/40 border-white/5 text-zinc-500 hover:border-white/20'}`}>
                  <span className="text-2xl">💳</span><span className="text-[10px] font-black uppercase">Cartão</span>
                </button>
                <button onClick={() => setMetodo('crypto')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${metodo === 'crypto' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-black/40 border-white/5 text-zinc-500 hover:border-white/20'}`}>
                  <span className="text-2xl">₿</span><span className="text-[10px] font-black uppercase">Crypto</span>
                </button>
              </div>

              {/* Escolher Valor */}
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">2. Montante (€)</h3>
              <div className="flex gap-2 mb-6">
                {[5, 10, 25, 50, 100].map(v => (
                  <button key={v} onClick={() => setValor(v.toString())} className={`flex-1 py-2 rounded-lg border text-xs font-black transition-all ${valor === v.toString() ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-black/40 border-white/5 text-zinc-400 hover:border-white/20'}`}>
                    {v}€
                  </button>
                ))}
              </div>
              
              <div className="relative mb-6">
                <input type="number" value={valor} onChange={e => setValor(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl p-4 pl-12 text-white font-black text-xl outline-none focus:border-emerald-500 transition-colors" />
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-xl">€</span>
              </div>

              {/* Input Dinâmico (Telemóvel só para MB WAY) */}
              {metodo === 'mbway' && (
                <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">3. O teu telemóvel MB WAY</h3>
                  <input type="tel" placeholder="Ex: 912345678" value={telemovel} onChange={e => setTelemovel(e.target.value)} maxLength={9} className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-blue-500" />
                </div>
              )}

              {/* Botão Pagar */}
              <button onClick={handlePagar} disabled={loading} className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                {loading ? 'A processar...' : `PAGAR ${valor}€ AGORA`}
              </button>
            </>
          ) : (
            /* ECRÃ DE SUCESSO (Instruções após clique) */
            <div className="text-center py-8 animate-in fade-in">
              <span className="text-6xl block mb-6 animate-bounce">{infoPagamento.metodo === 'mbway' ? '📱' : infoPagamento.metodo === 'cartao' ? '💳' : '₿'}</span>
              <h2 className="text-2xl font-black text-white mb-2">{infoPagamento.msg}</h2>
              
              {infoPagamento.metodo === 'mbway' && <p className="text-sm text-zinc-400">Abre a tua app do banco e confirma o pagamento.</p>}
              
              {infoPagamento.metodo === 'cartao' && (
                <a href={infoPagamento.url} target="_blank" className="mt-6 inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-black uppercase text-sm">
                  Abrir Checkout Stripe
                </a>
              )}
              
              {infoPagamento.metodo === 'crypto' && (
                <div className="mt-4 bg-black border border-white/10 p-4 rounded-xl inline-block text-left w-full">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Envia exatamente:</p>
                  <p className="text-emerald-500 font-mono font-black text-lg mb-4">{infoPagamento.valorCripto} {infoPagamento.moeda}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Para o endereço:</p>
                  <p className="text-white font-mono text-xs break-all bg-white/5 p-2 rounded">{infoPagamento.carteira}</p>
                </div>
              )}

              <p className="text-[10px] text-zinc-500 uppercase font-bold mt-8">O teu saldo será atualizado automaticamente.</p>
              <button onClick={onClose} className="mt-4 text-sm text-emerald-500 font-bold hover:underline">Fechar Janela</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}