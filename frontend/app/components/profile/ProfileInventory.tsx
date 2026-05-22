'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ProfileInventory({ inventario, setInventario, setSaldo, setView, userId }: any) {
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleLevantar = async (item: any, idx: number) => {
    const conf = window.confirm(`Queres enviar a ${item?.nome} para a tua conta Steam?`);
    if (!conf) return;

    if (!userId) return toast.error("Erro: Sessão não encontrada.");
    
    setLoadingId(item.id);
    const toastId = toast.loading("A criar encomenda de envio...");

    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/levantar-skin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(userId), inventarioId: item.id })
      });
      const data = await res.json();

      if (data.sucesso) {
        toast.success('🚚 ' + data.mensagem, { id: toastId, duration: 6000 });
        // A SKIN SAI DA MOCHILA PARA NÃO SER VENDIDA 2 VEZES!
        setInventario((inv: any) => inv.filter((_: any, i: number) => i !== idx));
      } else {
        toast.error('❌ ' + data.mensagem, { id: toastId, duration: 5000 });
      }
    } catch (error) {
      toast.error('Erro de comunicação com o servidor.', { id: toastId });
    }
    setLoadingId(null);
  };

  // 🔥 ESCUDO ANTI-CRASH: Garante que skins estragadas não partem o site
  const inventarioSeguro = Array.isArray(inventario) ? inventario : [];
  const inventarioFiltrado = inventarioSeguro.filter((item: any) => {
    const nomeSeguro = item?.nome || 'Skin Misteriosa';
    return nomeSeguro.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="bg-[#1b1b1e] rounded-xl border border-white/5 p-6 animate-in fade-in">
      <div className="flex flex-wrap gap-4 mb-6 items-center bg-[#121215] p-3 rounded-lg border border-white/5">
        <div className="flex gap-2">
          <div className="bg-[#1b1b1e] border border-white/5 rounded px-4 py-2.5 flex items-center gap-8 cursor-pointer hover:bg-white/5 transition-colors">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">TIPO DE ARMA</span><span className="text-[8px] text-zinc-600">▼</span>
          </div>
        </div>
        
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 text-xs">🔍</span>
          <input 
            type="text" placeholder="PESQUISAR" 
            className="w-full bg-[#1b1b1e] border border-white/5 rounded p-2.5 pl-9 text-[10px] font-black text-white outline-none focus:border-white/20 transition-colors tracking-widest"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {inventarioFiltrado.length > 0 ? (
          inventarioFiltrado.map((item: any, idx: number) => {
            const nomeReal = item?.nome || 'Skin Misteriosa';
            const precoReal = Number(item?.preco || item?.valor || 0);

            return (
              <div key={idx} className="bg-[#121215] border border-white/5 rounded-xl p-4 flex flex-col relative group transition-all hover:bg-[#161619]">
                
                <div className="flex justify-between items-start mb-2 z-10">
                  <span className="text-[10px] font-black text-zinc-500 tracking-widest">{item?.raridade === 'Comum' ? 'FT' : 'MW'}</span>
                  <span className="text-[8px] font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded uppercase tracking-widest border border-blue-500/20">ATUALIZAR</span>
                </div>
                
                <div className="relative h-28 flex items-center justify-center my-2">
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent blur-xl rounded-full opacity-50"></div>
                  <img src={item?.imagem || item?.image || '/skins/glock.png'} className="w-24 h-24 object-contain relative z-10 drop-shadow-xl group-hover:scale-110 transition-transform duration-300" alt={nomeReal} />
                </div>

                <div className="mt-auto pt-3 border-t border-white/5 z-10 text-center">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase truncate w-full">{nomeReal.split('|')[0] || 'Arma'}</p>
                  <p className="text-[11px] font-black text-white uppercase truncate w-full mb-3">{nomeReal.split('|')[1] || nomeReal}</p>
                  <div className="text-center text-xs font-black text-amber-500 bg-[#1b1b1e] border border-white/5 py-2 rounded">
                    {precoReal.toFixed(2)}€
                  </div>
                </div>

                <div className="absolute inset-0 bg-[#121215]/95 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-2 p-4 z-20">
                  
                  {/* 🔥 BOTÃO DE LEVANTAR REFORMULADO */}
                  <button 
                    onClick={() => handleLevantar(item, idx)}
                    disabled={loadingId === item?.id}
                    className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-black text-[10px] py-2.5 rounded uppercase tracking-widest transition-colors shadow-lg"
                  >
                    {loadingId === item?.id ? 'A PROCESSAR...' : '🚚 ENVIAR P/ STEAM'}
                  </button>

                  <button 
                    onClick={() => {
                      const conf = window.confirm(`Vender por ${precoReal.toFixed(2)}€?`);
                      if(conf) {
                        setSaldo((s: number) => s + precoReal);
                        setInventario((inv: any) => inv.filter((_: any, i: number) => i !== idx));
                      }
                    }}
                    className="w-full bg-[#84c13a] hover:bg-[#96d845] text-black font-black text-[10px] py-2.5 rounded uppercase tracking-widest transition-colors"
                  >
                    VENDER {precoReal.toFixed(2)}€
                  </button>
                  
                  <button onClick={() => setView('upgrader')} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-black text-[10px] py-2.5 rounded uppercase tracking-widest transition-colors">
                    UPGRADE
                  </button>

                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center">
            <p className="text-zinc-600 font-black uppercase tracking-[0.2em] text-sm mb-6">O TEU INVENTÁRIO ESTÁ VAZIO</p>
            <button onClick={() => setView('store')} className="border border-white/10 text-zinc-400 hover:text-white px-10 py-4 rounded-lg hover:bg-white/5 transition-colors uppercase font-black text-[11px] tracking-widest">ABRIR CAIXAS</button>
          </div>
        )}
      </div>
    </div>
  );
}