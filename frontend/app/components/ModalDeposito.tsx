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
        toast.success("✅ Pedido guardado!");
        setInventario([]);
        setSkinsSelecionadas([]);
        setInfoPagamento({ metodo: 'skins', valor: valorTotalSkins.toFixed(2) });
      } else {
        toast.error(data.mensagem || "Erro ao criar pedido.");
      }
    } catch (e) {
      toast.error("Erro ao ligar ao servidor.");
    }
    setDepositando(false);
  };

  // 🔥 OPÇÕES DE VALORES COM BÓNUS MARKETING
  const pacotesValor = [
    { v: 5, bonus: 0 }, { v: 10, bonus: 0 }, { v: 25, bonus: 3 }, { v: 50, bonus: 5 }, { v: 100, bonus: 10 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* CONTAINER PRINCIPAL */}
      <div className="bg-[#0b0c10] border border-white/10 rounded-2xl w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* CABEÇALHO PREMIUM */}
        <div className="px-8 py-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <span className="text-emerald-400 font-black text-xl">€</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Adicionar Fundos</h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Saldo disponível na hora</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-colors">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
          {!infoPagamento ? (
            <div className="flex flex-col md:flex-row gap-10">
              
              {/* LADO ESQUERDO - MÉTODOS DE PAGAMENTO COM LOGOS */}
              <div className="w-full md:w-1/3">
                <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">1. Escolher Método</h3>
                <div className="flex flex-col gap-3">
                  
                  {/* BOTÃO MB WAY */}
                  <button onClick={() => setMetodo('mbway')} className={`relative overflow-hidden p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 ${metodo === 'mbway' ? 'bg-[#00a8e8]/10 border-[#00a8e8] shadow-[0_0_20px_rgba(0,168,232,0.15)] scale-[1.02]' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}>
                    {metodo === 'mbway' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00a8e8] shadow-[0_0_10px_#00a8e8]"></div>}
                    
                    {/* LOGO MB WAY DESENHADO EM CÓDIGO (NUNCA QUEBRA!) */}
                    <div className="w-14 h-8 bg-white rounded flex items-center justify-center shadow-inner gap-1">
                      <div className="grid grid-cols-3 gap-[1.5px]">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className="w-[3px] h-[3px] bg-[#00a8e8] rounded-sm"></div>
                        ))}
                      </div>
                      <span className="text-[#00a8e8] font-black text-[9px] tracking-tighter leading-none mt-0.5">MB<br/>WAY</span>
                    </div>

                    <span className={`font-black uppercase tracking-wide text-sm ${metodo === 'mbway' ? 'text-white' : 'text-zinc-400'}`}>MB Way</span>
                  </button>

                  {/* BOTÃO CARTÃO */}
                  <button onClick={() => setMetodo('cartao')} className={`relative overflow-hidden p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 ${metodo === 'cartao' ? 'bg-purple-500/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)] scale-[1.02]' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}>
                    {metodo === 'cartao' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 shadow-[0_0_10px_purple]"></div>}
                    
                    {/* LOGOS VISA E MASTERCARD (SIMPLE ICONS CDN) */}
                    <div className="w-14 h-8 bg-white rounded flex items-center justify-center shadow-inner gap-1.5 px-1">
                      <img src="https://cdn.simpleicons.org/visa/1434CB" alt="Visa" className="h-2.5 object-contain" />
                      <img src="https://cdn.simpleicons.org/mastercard/EB001B" alt="Mastercard" className="h-4 object-contain" />
                    </div>

                    <span className={`font-black uppercase tracking-wide text-sm ${metodo === 'cartao' ? 'text-white' : 'text-zinc-400'}`}>Cartão</span>
                  </button>

                  {/* BOTÃO CRYPTO */}
                  <button onClick={() => setMetodo('crypto')} className={`relative overflow-hidden p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 ${metodo === 'crypto' ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] scale-[1.02]' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}>
                    {metodo === 'crypto' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 shadow-[0_0_10px_orange]"></div>}
                    <div className="w-14 h-8 flex items-center justify-center gap-1.5 bg-black/40 rounded shadow-inner border border-white/5">
                      <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=029" alt="Bitcoin" className="h-5 w-5 object-contain drop-shadow-md" />
                      <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029" alt="Ethereum" className="h-5 w-5 object-contain drop-shadow-md opacity-80" />
                    </div>
                    <span className={`font-black uppercase tracking-wide text-sm ${metodo === 'crypto' ? 'text-white' : 'text-zinc-400'}`}>Crypto</span>
                  </button>

                  {/* BOTÃO SKINS */}
                  <button onClick={() => setMetodo('skins')} className={`relative overflow-hidden p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 ${metodo === 'skins' ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-[1.02]' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}>
                    {metodo === 'skins' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>}
                    <div className="w-14 h-8 flex items-center justify-center bg-black/40 rounded shadow-inner border border-white/5">
                      {/* Logo CS oficial via Icons8 */}
                      <img src="https://img.icons8.com/color/48/counter-strike-global-offensive.png" alt="CS2" className="h-6 w-6 object-contain drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className={`font-black uppercase tracking-wide text-sm ${metodo === 'skins' ? 'text-white' : 'text-zinc-400'}`}>Skins CS2</span>
                      <span className="text-[9px] text-emerald-500 font-bold uppercase">+10% Bónus</span>
                    </div>
                  </button>

                </div>
              </div>

              {/* LADO DIREITO - DETALHES E CHECKOUT */}
              <div className="w-full md:w-2/3 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-10">
                
                {metodo === 'skins' ? (
                  <div className="animate-in fade-in zoom-in-95 duration-300">
                    <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">2. Selecionar Armamento</h3>
                    
                    {!tradeUrl ? (
                      <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                        <label className="text-[10px] font-black text-white uppercase tracking-widest mb-3 block">Trade URL (Link de Troca)</label>
                        <div className="flex gap-2">
                          <input type="text" value={tradeUrl} onChange={e => setTradeUrl(e.target.value)} placeholder="https://steamcommunity.com/tradeoffer/new/..." className="flex-1 bg-black border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-emerald-500 transition-colors" />
                          <button onClick={buscarInventario} disabled={loadingInventario} className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all disabled:opacity-50">
                            {loadingInventario ? '...' : 'CARREGAR'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-end mb-4">
                          <div className="flex gap-4">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Skins: <span className="text-white">{inventario.length}</span></span>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sel: <span className="text-emerald-400">{skinsSelecionadas.length}</span></span>
                          </div>
                          <span className="text-sm font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">{valorTotalSkins.toFixed(2)}€</span>
                        </div>

                        {loadingInventario ? (
                          <div className="h-48 flex items-center justify-center border border-white/5 rounded-2xl bg-white/[0.02]">
                            <span className="animate-pulse text-zinc-500 text-xs font-black uppercase tracking-widest">A sincronizar Steam...</span>
                          </div>
                        ) : inventario.length === 0 ? (
                           <div className="h-48 flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-white/[0.02] gap-2">
                             <span className="text-3xl grayscale opacity-50">🕸️</span>
                             <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Inventário Vazio ou Privado</span>
                           </div>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar mb-6">
                            {inventario.map((skin: any) => {
                              const selecionada = skinsSelecionadas.find(s => s.item_id === skin.item_id);
                              const preco = getPreco(skin);
                              return (
                                <div key={skin.item_id} onClick={() => toggleSkin(skin)} className={`relative cursor-pointer bg-black/40 border rounded-xl p-3 flex flex-col items-center justify-center transition-all group ${selecionada ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-white/5 hover:border-white/20'}`}>
                                  {selecionada && <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]"></div>}
                                  <img src={`https://community.cloudflare.steamstatic.com/economy/image/${skin.image}`} className="w-12 h-12 object-contain drop-shadow-lg group-hover:scale-110 transition-transform" alt="skin" onError={(e:any)=>e.currentTarget.src='/skins/glock.png'} />
                                  <span className="text-[8px] text-zinc-400 font-bold text-center mt-2 truncate w-full">{skin.name}</span>
                                  <span className={`text-[10px] font-black mt-1 ${preco > 0 ? 'text-white' : 'text-zinc-600'}`}>{preco > 0 ? `${preco.toFixed(2)}€` : 'N/A'}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <button onClick={depositarSkins} disabled={depositando || skinsSelecionadas.length === 0 || valorTotalSkins < 0.5} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:opacity-50 flex items-center justify-center gap-2">
                          {depositando ? 'A PREPARAR...' : skinsSelecionadas.length === 0 ? 'SELECIONA SKINS ACIMA' : `DEPOSITAR ${valorTotalSkins.toFixed(2)}€ AGORA`}
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">2. Escolher Montante</h3>
                    
                    {/* BOTÕES DE VALOR COM BÓNUS */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {pacotesValor.map(p => (
                        <button key={p.v} onClick={() => setValor(p.v.toString())} className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${valor === p.v.toString() ? 'bg-white/10 border-white text-white scale-105' : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5 hover:border-white/20'}`}>
                          {p.bonus > 0 && <span className="absolute -top-2.5 bg-emerald-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]">+{p.bonus}% BÓNUS</span>}
                          <span className="text-xl font-black">{p.v}€</span>
                        </button>
                      ))}
                    </div>

                    <div className="relative mb-6">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-black text-lg">€</span>
                      <input type="number" value={valor} onChange={e => setValor(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white font-black text-xl outline-none focus:border-white transition-colors text-right" placeholder="0.00" />
                    </div>

                    {metodo === 'mbway' && (
                      <div className="mb-6 animate-in slide-in-from-top-2">
                        <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 block">3. Número de Telemóvel</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-black">+351</span>
                          <input type="tel" value={telemovel} onChange={e => setTelemovel(e.target.value)} maxLength={9} placeholder="912345678" className="w-full bg-black border border-white/10 rounded-xl py-4 pl-16 pr-4 text-white font-black outline-none focus:border-[#00a8e8] transition-colors" />
                        </div>
                      </div>
                    )}

                    <button onClick={handlePagar} disabled={loading} className={`w-full py-5 rounded-xl font-black text-sm uppercase tracking-widest transition-all text-black flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 ${
                        metodo === 'mbway' ? 'bg-[#00a8e8] hover:bg-[#0090c7] shadow-[0_0_25px_rgba(0,168,232,0.3)]' :
                        metodo === 'cartao' ? 'bg-purple-500 hover:bg-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.3)]' :
                        'bg-amber-500 hover:bg-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
                      }`}>
                      {loading ? 'A PROCESSAR...' : `PAGAR ${valor}€ AGORA`}
                    </button>
                    <p className="text-center text-zinc-600 text-[9px] font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-1.5">
                      <span className="text-emerald-500 text-xs">🔒</span> Pagamento Seguro e Encriptado
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            
            /* ECRÃ DE SUCESSO (ESTILO PREMIUM) */
            <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)] mb-6">
                <span className="text-4xl">{infoPagamento.metodo === 'skins' ? '🔫' : infoPagamento.metodo === 'cartao' ? '💳' : '📱'}</span>
              </div>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">
                {infoPagamento.metodo === 'skins' ? 'Quase lá!' : 'Troca Enviada!'}
              </h2>
              
              {infoPagamento.metodo === 'skins' && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6 mb-4 flex flex-col items-center w-full max-w-md mx-auto">
                  <p className="text-sm text-zinc-300 text-center mb-6">
                    Para completares o depósito, envia as skins que selecionaste para o Bot do Império. O teu saldo de <span className="text-orange-400 font-black">{infoPagamento.valor}€</span> será creditado assim que recebermos a troca!
                  </p>
                  <a 
                    href="https://steamcommunity.com/tradeoffer/new/?partner=1156810616&token=Svsz7Gfu" 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-orange-500 hover:bg-orange-400 text-black px-6 py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-105 transition-all w-full text-center flex items-center justify-center gap-2"
                  >
                    <span>📤</span> ENVIAR SKINS NA STEAM
                  </a>
                </div>
              )}
              
              {infoPagamento.metodo === 'cartao' && (
                <>
                  <p className="text-zinc-400 max-w-sm mx-auto mb-8">Foste redirecionado para o ambiente seguro do Stripe para finalizar o pagamento.</p>
                  <a href={infoPagamento.url} target="_blank" className="bg-purple-500 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_25px_rgba(168,85,247,0.4)]">
                    ABRIR PORTAL STRIPE
                  </a>
                </>
              )}

              {infoPagamento.metodo === 'mbway' && (
                <div className="bg-[#00a8e8]/10 border border-[#00a8e8]/30 px-8 py-6 rounded-2xl max-w-sm mx-auto">
                  <p className="text-white font-black text-lg mb-2">Verifica o teu telemóvel</p>
                  <p className="text-[#00a8e8] font-bold text-sm">Aceita o pagamento de {valor}€ na app do MB WAY.</p>
                </div>
              )}

              <p className="text-[10px] text-zinc-500 uppercase font-bold mt-8 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                O teu saldo será atualizado automaticamente.
              </p>

              <button onClick={onClose} className="mt-8 text-zinc-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors border border-zinc-800 hover:border-zinc-600 px-6 py-2 rounded-lg">Voltar à Loja</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}