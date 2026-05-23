'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function ProfileInventory({ inventario, setInventario, setSaldo, setView, userId }: any) {
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [prazosLevantamento, setPrazosLevantamento] = useState<any[]>([]);

  // 🔥 ESTADOS DOS MODAIS PREMIUM
  const [skinParaLevantar, setSkinParaLevantar] = useState<any>(null);
  const [skinParaVender, setSkinParaVender] = useState<any>(null);

  const carregarEstadosLogistica = async () => {
    if (!userId) return;
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/admin/levantamentos');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPrazosLevantamento(data.filter((p: any) => p.userId === Number(userId)));
      }
    } catch (e) {
      console.error("Erro ao sincronizar estados de entrega");
    }
  };

  useEffect(() => {
    carregarEstadosLogistica();
  }, [userId, inventario]);

  // 🔥 1. ABRIR MODAL DE LEVANTAMENTO
  const iniciarLevantamento = (item: any) => {
    const precoReal = Number(item?.preco || item?.valor || 0);
    if (precoReal < 2.00) {
      return toast.error("VALOR MÍNIMO REQUERIDO: O império apenas faz envios de skins acima de 2.00€!");
    }
    setSkinParaLevantar(item);
  };

  // 🔥 1.1 CONFIRMAR LEVANTAMENTO NO MODAL
  const confirmarLevantamento = async () => {
    const item = skinParaLevantar;
    setSkinParaLevantar(null); // Fecha o modal

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
        toast.success('🚚 ' + data.mensagem, { id: toastId, duration: 6000 });
        carregarEstadosLogistica();
      } else {
        toast.error('❌ ' + data.mensagem, { id: toastId });
      }
    } catch (error) {
      toast.error('Erro de comunicação com o servidor.', { id: toastId });
    }
    setLoadingId(null);
  };

  // 🔥 2. CONFIRMAR VENDA NO MODAL
  const confirmarVenda = () => {
    const { item, idx } = skinParaVender;
    const precoReal = Number(item?.preco || item?.valor || 0);
    
    setSaldo((s: number) => s + precoReal);
    setInventario((inv: any) => inv.filter((_: any, i: number) => i !== idx));
    toast.success(`Vendeste a skin por ${precoReal.toFixed(2)}€!`);
    setSkinParaVender(null);
  };

  const inventarioSeguro = Array.isArray(inventario) ? inventario : [];
  const inventarioFiltrado = inventarioSeguro.filter((item: any) => {
    const nomeSeguro = item?.nome || 'Skin Misteriosa';
    return nomeSeguro.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="bg-[#1b1b1e] rounded-xl border border-white/5 p-6 animate-in fade-in relative">
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

            const registoEnvio = prazosLevantamento.find((p: any) => p.skinNome === item.nome && p.valor === item.valor);
            const estaTrancada = !!registoEnvio;
            const statusEnvio = registoEnvio?.status || "PENDENTE";

            return (
              <div 
                key={idx} 
                className={`border rounded-xl p-4 flex flex-col relative group transition-all duration-500 bg-[#121215] ${
                  estaTrancada 
                    ? 'border-blue-500/20 opacity-40 grayscale shadow-inner' 
                    : 'border-white/5 hover:bg-[#161619]'
                }`}
              >
                
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
                        onClick={() => iniciarLevantamento(item)}
                        disabled={loadingId === item?.id}
                        className={`w-full font-black text-[10px] py-2.5 rounded uppercase tracking-widest transition-colors shadow-lg ${
                          precoReal < 2.00 
                            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                            : 'bg-blue-500 hover:bg-blue-400 text-white'
                        }`}
                      >
                        {loadingId === item?.id ? 'A PROCESSAR...' : precoReal < 2.00 ? 'VALOR COMPACTO 🔒' : '🚀 LEVANTAR P/ STEAM'}
                      </button>

                      <button 
                        onClick={() => setSkinParaVender({ item, idx })}
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

      {/* ======================================================== */}
      {/* 🔥 MODAL PREMIUM DE CONFIRMAÇÃO DE LEVANTAMENTO 🔥 */}
      {/* ======================================================== */}
      {skinParaLevantar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#121215] border border-blue-500/30 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20 relative z-10">
              <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                <span className="text-blue-500 text-2xl drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">🚚</span> Logística
              </h3>
              <button onClick={() => setSkinParaLevantar(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-zinc-500 hover:text-white hover:bg-red-500/20 transition-all font-black">✕</button>
            </div>

            <div className="p-6 relative z-10">
              <div className="flex items-center gap-4 bg-black/40 border border-white/5 p-4 rounded-2xl mb-6 shadow-inner">
                <img src={skinParaLevantar.imagem || skinParaLevantar.image} className="w-16 h-16 object-contain drop-shadow-lg" alt="skin" />
                <div>
                  <p className="text-xs font-black text-white uppercase">{skinParaLevantar.nome}</p>
                  <p className="text-blue-400 font-mono font-black mt-1 text-sm">{Number(skinParaLevantar.preco || skinParaLevantar.valor || 0).toFixed(2)}€</p>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-6">
                <p className="text-xs text-blue-100 font-medium leading-relaxed">
                  <span className="font-black text-blue-400">PROCESSO MANUAL:</span> O teu pedido entrará na fila de envios. 
                  A nossa equipa enviará a proposta de troca para o teu Trade URL num prazo de <span className="font-black text-white bg-blue-500/20 px-2 py-0.5 rounded">1 a 24 horas</span>.
                </p>
              </div>

              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest text-center mb-6">Confirmar o bloqueio e envio desta skin?</p>

              <div className="flex gap-3">
                <button onClick={() => setSkinParaLevantar(null)} className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-colors">
                  Cancelar
                </button>
                <button onClick={confirmarLevantamento} className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                  Sim, Enviar Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🔥 MODAL PREMIUM DE CONFIRMAÇÃO DE VENDA 🔥 */}
      {/* ======================================================== */}
      {skinParaVender && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#121215] border border-amber-500/30 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20 relative z-10">
              <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                <span className="text-amber-500 text-2xl drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">💰</span> Vender Item
              </h3>
              <button onClick={() => setSkinParaVender(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-zinc-500 hover:text-white hover:bg-red-500/20 transition-all font-black">✕</button>
            </div>

            <div className="p-6 relative z-10 flex flex-col items-center text-center">
              <img src={skinParaVender.item.imagem || skinParaVender.item.image} className="w-24 h-24 object-contain drop-shadow-xl mb-4" alt="skin" />
              <p className="text-sm font-black text-white uppercase tracking-wider mb-2">{skinParaVender.item.nome}</p>
              
              <div className="bg-black/40 border border-white/5 px-6 py-3 rounded-xl mb-6">
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Recebes no teu saldo:</p>
                <p className="text-amber-500 font-mono font-black text-2xl">{Number(skinParaVender.item.preco || skinParaVender.item.valor || 0).toFixed(2)}€</p>
              </div>

              <div className="flex gap-3 w-full">
                <button onClick={() => setSkinParaVender(null)} className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-colors">
                  Cancelar
                </button>
                <button onClick={confirmarVenda} className="flex-1 py-4 bg-[#84c13a] hover:bg-[#96d845] text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(132,193,58,0.4)]">
                  Confirmar Venda
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}