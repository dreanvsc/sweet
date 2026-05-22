'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function ProfileInventory({ inventario, setInventario, setSaldo, setView, userId }: any) {
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<number | null>(null);
  
  // 🔥 NOVO ESTADO: Guarda a lista de items que estão trancados em trânsito
  const [prazosLevantamento, setPrazosLevantamento] = useState<any[]>([]);

  // Carrega o histórico de saques para saber o estado real de cada skin
  const carregarEstadosLogistica = async () => {
    if (!userId) return;
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/admin/levantamentos');
      const data = await res.json();
      if (Array.isArray(data)) {
        // Guarda apenas os saques deste utilizador específico
        setPrazosLevantamento(data.filter((p: any) => p.userId === Number(userId)));
      }
    } catch (e) {
      console.error("Erro ao sincronizar estados de entrega");
    }
  };

  useEffect(() => {
    carregarEstadosLogistica();
  }, [userId, inventario]);

  const handleLevantar = async (item: any) => {
    const conf = window.confirm(`Queres solicitar o envio da ${item.nome} para a tua Steam?`);
    if (!conf) return;

    if (!userId) return toast.error("Erro: Sessão não encontrada.");
    
    setLoadingId(item.id);
    const toastId = toast.loading("A registar pedido na alfândega...");

    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/levantar-skin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(userId), inventarioId: item.id })
      });
      const data = await res.json();

      if (data.sucesso) {
        toast.success('🚚 ' + data.mensagem, { id: toastId, duration: 5000 });
        // Recarrega os estados para aplicar o cadeado cinzento na hora!
        carregarEstadosLogistica();
      } else {
        toast.error('❌ ' + data.mensagem, { id: toastId });
      }
    } catch (error) {
      toast.error('Erro de comunicação com o servidor.', { id: toastId });
    }
    setLoadingId(null);
  };

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

            // 🔥 ANALISADOR RADAR: Verifica se esta skin específica está pendente ou enviada
            const registoEnvio = prazosLevantamento.find((p: any) => p.skinNome === item.nome && p.valor === item.valor);
            const estaTrancada = !!registoEnvio;
            const statusEnvio = registoEnvio?.status || "PENDENTE"; // PENDENTE ou CONCLUIDO

            return (
              <div 
                key={idx} 
                className={`border rounded-xl p-4 flex flex-col relative group transition-all duration-500 bg-[#121215] ${
                  estaTrancada 
                    ? 'border-blue-500/20 opacity-40 grayscale shadow-inner' 
                    : 'border-white/5 hover:bg-[#161619]'
                }`}
              >
                
                {/* ETIQUETA EM TEMPO REAL */}
                <div className="flex justify-between items-center mb-2 z-10">
                  <span className="text-[10px] font-black text-zinc-500 tracking-widest">{item?.raridade === 'Comum' ? 'FT' : 'MW'}</span>
                  {estaTrancada ? (
                    <span className={`text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest border ${
                      statusEnvio === 'CONCLUIDO' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      {statusEnvio === 'CONCLUIDO' ? 'ENVIADA ✅' : 'PENDENTE 🚚'}
                    </span>
                  ) : (
                    <span className="text-[8px] font-black text-zinc-600 bg-zinc-800/30 px-2 py-1 rounded uppercase tracking-widest border border-white/5">DISPONÍVEL</span>
                  )}
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

                {/* MENU HOVER DO GRUPO (FICA BLOQUEADO SE JÁ TIVER SIDO ATIVADO) */}
                <div className="absolute inset-0 bg-[#121215]/95 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-2 p-4 z-20">
                  {estaTrancada ? (
                    <div className="text-center p-2">
                      <span className="text-2xl block mb-1">🔒</span>
                      <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest leading-tight">
                        Skin Trancada<br/>
                        <span className="text-blue-400">{statusEnvio === 'CONCLUIDO' ? 'Já enviada para a Steam' : 'Em processamento pela equipa'}</span>
                      </p>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleLevantar(item)}
                        disabled={loadingId === item?.id}
                        className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-black text-[10px] py-2.5 rounded uppercase tracking-widest transition-colors shadow-lg"
                      >
                        {loadingId === item?.id ? 'A PROCESSAR...' : '🚀 LEVANTAR P/ STEAM'}
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
                    </>
                  )}
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