'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast'; 

export default function ModalDeposito({ onClose, userId }: { onClose: () => void, userId: string }) {
  const [metodo, setMetodo] = useState<'mbway' | 'cartao' | 'crypto' | 'skins'>('mbway');
  const [valor, setValor] = useState<string>('10');
  const [telemovel, setTelemovel] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoPagamento, setInfoPagamento] = useState<any>(null);

  // 🎮 SKINS
  const [tradeUrl, setTradeUrl] = useState('');
  const [inventario, setInventario] = useState<any[]>([]);
  const [skinsSelecionadas, setSkinsSelecionadas] = useState<any[]>([]);
  const [loadingInventario, setLoadingInventario] = useState(false);
  const [depositando, setDepositando] = useState(false);

  // 🔥 Pré-preenche o Trade URL com o que está guardado no perfil
  useEffect(() => {
    if (userId) {
      fetch(`https://sweet-7ifa.onrender.com/utilizador/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data?.tradeUrl) setTradeUrl(data.tradeUrl);
        })
        .catch(() => {});
    }
  }, [userId]);

  const handlePagar = async () => {
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
        if (data.metodo === 'crypto' && data.url) {
          toast.success("Redirecionando para a Gateway...");
          setTimeout(() => { window.location.href = data.url; }, 800);
          return;
        }
        setInfoPagamento(data); 
        toast.success("Pedido de depósito gerado com sucesso!");
      } else {
        toast.error(data.message || "Erro a processar pagamento.");
      }
    } catch(e) { 
      toast.error("Erro ao ligar ao servidor."); 
    }
    setLoading(false);
  };

  // 🔥 BUSCAR INVENTÁRIO STEAM
  const buscarInventario = async () => {
    setLoadingInventario(true);
    setSkinsSelecionadas([]);
    try {
      const res = await fetch(`https://sweet-7ifa.onrender.com/deposito-skins/inventario/${userId}?tradeUrl=${encodeURIComponent(tradeUrl)}`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setInventario(data.items);
        toast.success(`${data.items.length} skins encontradas!`);
      } else {
        setInventario([]);
        toast.error("Nenhuma skin encontrada no inventário.");
      }
    } catch (e) {
      toast.error("Erro ao carregar inventário.");
    }
    setLoadingInventario(false);
  };

  // 🔥 Carrega inventário automaticamente quando muda para skins e já tem trade URL
  useEffect(() => {
    if (metodo === 'skins' && tradeUrl && inventario.length === 0) {
      buscarInventario();
    }
  }, [metodo, tradeUrl]);

  const toggleSkin = (skin: any) => {
    setSkinsSelecionadas(prev => {
      const existe = prev.find(s => s.item_id === skin.item_id);
      if (existe) return prev.filter(s => s.item_id !== skin.item_id);
      return [...prev, skin];
    });
  };

  // 🔥 Preço em euros (o backend já devolve em cents/1000)
  const getPreco = (skin: any) => {
    if (!skin.price || skin.price === 0) return 0;
    return skin.price / 1000;
  };

  const valorTotalSkins = skinsSelecionadas.reduce((acc, s) => acc + getPreco(s), 0);

  // 🔥 DEPOSITAR SKINS
  const depositarSkins = async () => {
    if (skinsSelecionadas.length === 0) return toast.error("Seleciona pelo menos uma skin!");
    if (valorTotalSkins < 0.5) return toast.error("Valor mínimo de depósito é 0.50€.");

    setDepositando(true);
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/deposito-skins/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          tradeUrl,
          items: skinsSelecionadas.map(s => ({ item_id: s.item_id, price: s.price, name: s.name }))
        })
      });
      const data = await res.json();
      if (data.sucesso) {
        toast.success("✅ Oferta de troca enviada! Aceita no Steam.");
        setInventario([]);
        setSkinsSelecionadas([]);
        setInfoPagamento({ metodo: 'skins', valor: valorTotalSkins.toFixed(2) });
      } else {
        toast.error(data.mensagem || "Erro ao criar troca.");
      }
    } catch (e) {
      toast.error("Erro ao ligar ao servidor.");
    }
    setDepositando(false);
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
              <div className="grid grid-cols-4 gap-2 mb-6">
                <button onClick={() => setMetodo('mbway')} className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-300 ${metodo === 'mbway' ? 'bg-blue-500/10 border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)] scale-105' : 'bg-black/40 border-white/5 text-zinc-500 hover:border-white/20 hover:bg-black/60'}`}>
                  <span className="text-xl">📱</span><span className="text-[9px] font-black uppercase">MB Way</span>
                </button>
                <button onClick={() => setMetodo('cartao')} className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-300 ${metodo === 'cartao' ? 'bg-purple-500/10 border-purple-500 text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)] scale-105' : 'bg-black/40 border-white/5 text-zinc-500 hover:border-white/20 hover:bg-black/60'}`}>
                  <span className="text-xl">💳</span><span className="text-[9px] font-black uppercase">Cartão</span>
                </button>
                <button onClick={() => setMetodo('crypto')} className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-300 ${metodo === 'crypto' ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] scale-105' : 'bg-black/40 border-white/5 text-zinc-500 hover:border-white/20 hover:bg-black/60'}`}>
                  <span className="text-xl">₿</span><span className="text-[9px] font-black uppercase">Crypto</span>
                </button>
                <button onClick={() => setMetodo('skins')} className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-300 ${metodo === 'skins' ? 'bg-orange-500/10 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)] scale-105' : 'bg-black/40 border-white/5 text-zinc-500 hover:border-white/20 hover:bg-black/60'}`}>
                  <span className="text-xl">🔫</span><span className="text-[9px] font-black uppercase">Skins</span>
                </button>
              </div>

              {/* MÉTODO SKINS */}
              {metodo === 'skins' ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-4">
                    <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest mb-1">💡 Como funciona</p>
                    <p className="text-[10px] text-zinc-400">Seleciona as tuas skins CS2 e recebe o saldo equivalente automaticamente.</p>
                  </div>

                  {/* Trade URL — só mostra se não tiver */}
                  {!tradeUrl ? (
                    <div className="mb-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">O teu Trade URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tradeUrl}
                          onChange={e => setTradeUrl(e.target.value)}
                          placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
                          className="flex-1 bg-black/60 border border-white/10 rounded-xl p-3 text-white text-[11px] outline-none focus:border-orange-500 transition-colors"
                        />
                        <button
                          onClick={buscarInventario}
                          disabled={loadingInventario}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-black text-[10px] uppercase rounded-xl transition-all disabled:opacity-50 shrink-0"
                        >
                          {loadingInventario ? '...' : 'CARREGAR'}
                        </button>
                      </div>
                      <a href="https://steamcommunity.com/my/tradeoffers/privacy" target="_blank" className="text-[9px] text-orange-400 hover:text-orange-300 mt-1 block">
                        Onde encontrar o meu Trade URL? →
                      </a>
                    </div>
                  ) : loadingInventario ? (
                    <div className="flex items-center justify-center py-8 gap-3">
                      <span className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
                      <span className="text-[11px] text-zinc-400 font-black uppercase">A carregar inventário...</span>
                    </div>
                  ) : null}

                  {/* Inventário */}
                  {inventario.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                          {inventario.length} skins disponíveis
                        </label>
                        <span className="text-[10px] text-orange-400 font-black">
                          {skinsSelecionadas.length} selecionadas · {valorTotalSkins.toFixed(2)}€
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar mb-4">
                        {inventario.map((skin: any) => {
                          const selecionada = skinsSelecionadas.find(s => s.item_id === skin.item_id);
                          const preco = getPreco(skin);
                          return (
                            <div
                              key={skin.item_id}
                              onClick={() => toggleSkin(skin)}
                              className={`relative bg-black/60 border rounded-xl p-2 cursor-pointer flex flex-col items-center transition-all ${selecionada ? 'border-orange-500 bg-orange-500/10' : 'border-white/5 hover:border-white/20'}`}
                            >
                              {selecionada && (
                                <div className="absolute top-1 right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                  <span className="text-[8px] text-black font-black">✓</span>
                                </div>
                              )}
                              <img
                                src={`https://community.cloudflare.steamstatic.com/economy/image/${skin.image}`}
                                className="w-12 h-12 object-contain"
                                alt={skin.name}
                                onError={(e: any) => { e.currentTarget.src = '/skins/glock.png'; }}
                              />
                              <span className="text-[8px] text-zinc-300 font-bold text-center truncate w-full mt-1">{skin.name}</span>
                              <span className={`text-[9px] font-black ${preco > 0 ? 'text-emerald-400' : 'text-zinc-600'}`}>
                                {preco > 0 ? `${preco.toFixed(2)}€` : 'Sem preço'}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={depositarSkins}
                        disabled={depositando || skinsSelecionadas.length === 0 || valorTotalSkins < 0.5}
                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:opacity-50"
                      >
                        {depositando ? 'A ENVIAR TROCA...' : skinsSelecionadas.length === 0 ? 'SELECIONA SKINS' : `DEPOSITAR ${valorTotalSkins.toFixed(2)}€ EM SKINS`}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
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

                  {metodo === 'mbway' && (
                    <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
                      <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">3. O teu telemóvel MB WAY</h3>
                      <input type="tel" placeholder="Ex: 912345678" value={telemovel} onChange={e => setTelemovel(e.target.value)} maxLength={9} className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-blue-500 transition-colors shadow-inner" />
                    </div>
                  )}

                  <button onClick={handlePagar} disabled={loading} className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-[1.02] disabled:opacity-50 disabled:scale-100">
                    {loading ? 'A processar...' : `PAGAR ${valor}€ AGORA`}
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-in fade-in zoom-in-95">
              <span className="text-6xl block mb-6 animate-bounce">
                {infoPagamento.metodo === 'mbway' ? '📱' : infoPagamento.metodo === 'skins' ? '🔫' : '💳'}
              </span>
              <h2 className="text-2xl font-black text-white mb-2">
                {infoPagamento.metodo === 'skins' ? 'Troca Enviada!' : infoPagamento.msg}
              </h2>
              
              {infoPagamento.metodo === 'skins' && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-4">
                  <p className="text-sm text-zinc-300">Aceita a proposta de troca no Steam.<br/>O teu saldo de <span className="text-orange-400 font-black">{infoPagamento.valor}€</span> será creditado automaticamente.</p>
                </div>
              )}
              {infoPagamento.metodo === 'mbway' && <p className="text-sm text-zinc-400 bg-white/5 p-4 rounded-xl border border-white/5">Abre a tua app do banco e confirma o pagamento.</p>}
              {infoPagamento.metodo === 'cartao' && (
                <a href={infoPagamento.url} target="_blank" className="mt-6 inline-block bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-8 py-4 rounded-xl font-black uppercase text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105 transition-all">
                  Abrir Checkout Stripe
                </a>
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