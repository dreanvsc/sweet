'use client';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function TabBanco() {
  const [alvoId, setAlvoId] = useState('');
  const [valorDepositado, setValorDepositado] = useState('');
  const [loading, setLoading] = useState(false);

  const injetarSaldo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alvoId || !valorDepositado) return toast.error('Preenche todos os campos!');
    
    setLoading(true);
    try {
      // 🔥 O link do teu backend que vamos criar a seguir!
      const res = await fetch('https://sweet-7ifa.onrender.com/admin/injetar-saldo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: localStorage.getItem('userId'), // Confirma que és tu
          alvoId: alvoId,
          valor: parseFloat(valorDepositado)
        })
      });
      
      const data = await res.json();
      
      if (data.sucesso) {
        toast.success(`💰 SUCESSO! Injetaste ${valorDepositado}€ na conta do Jogador #${alvoId}`);
        setAlvoId('');
        setValorDepositado('');
      } else {
        toast.error(data.erro || 'Erro ao adicionar saldo.');
      }
    } catch (err) {
      toast.error('Erro de ligação ao servidor.');
    }
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <span className="text-2xl">🏦</span>
        </div>
        <div>
          <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">Banco Central</h3>
          <p className="text-emerald-500 text-[10px] font-bold tracking-widest uppercase mt-1">Injeção Manual de Capital (Depósito de Skins)</p>
        </div>
      </div>

      <div className="w-full max-w-md bg-[#161619]/80 backdrop-blur-sm border border-emerald-500/10 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
        
        <form onSubmit={injetarSaldo} className="flex flex-col gap-5 relative z-10">
          <div>
            <label className="text-zinc-400 text-[10px] uppercase font-black tracking-widest ml-2 block mb-2">ID do Jogador (Copiado da Steam)</label>
            <input 
              type="number" 
              value={alvoId} 
              onChange={(e) => setAlvoId(e.target.value)} 
              placeholder="Ex: 5"
              className="w-full bg-black/50 border border-white/10 text-white font-mono font-black text-xl rounded-xl p-4 outline-none focus:border-emerald-500 transition-colors shadow-inner placeholder:text-zinc-700" 
            />
          </div>

          <div>
            <label className="text-zinc-400 text-[10px] uppercase font-black tracking-widest ml-2 block mb-2">Valor a Injetar (€)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-xl">€</span>
              <input 
                type="number" 
                step="0.01"
                value={valorDepositado} 
                onChange={(e) => setValorDepositado(e.target.value)} 
                placeholder="Ex: 15.50"
                className="w-full bg-black/50 border border-white/10 text-emerald-400 font-black text-xl rounded-xl p-4 pl-10 outline-none focus:border-emerald-500 transition-colors shadow-inner placeholder:text-zinc-700" 
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black py-4 rounded-xl font-black uppercase tracking-widest transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] mt-2"
          >
            {loading ? 'A PROCESSAR...' : 'ENVIAR DINHEIRO'}
          </button>
        </form>
      </div>
    </div>
  );
}