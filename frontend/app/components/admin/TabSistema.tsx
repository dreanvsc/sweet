'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function TabSistema() {
  const [syncLoading, setSyncLoading] = useState(false);
  
  // CONFIGURAÇÕES DE RECOMPENSAS
  const [configSocial, setConfigSocial] = useState('');
  const [configDiscord, setConfigDiscord] = useState('');
  const [configEmail, setConfigEmail] = useState('');

  // PROMO CODES
  const [promoCode, setPromoCode] = useState('');
  const [promoValor, setPromoValor] = useState('');
  const [promoLimite, setPromoLimite] = useState('');

  // 🔥 NOVOS ESTADOS: EDIÇÃO DE PREÇOS DE SKINS 🔥
  const [pesquisaSkin, setPesquisaSkin] = useState('');
  const [skinsEncontradas, setSkinsEncontradas] = useState<any[]>([]);
  const [skinSelecionada, setSkinSelecionada] = useState<any>(null);
  const [novoPrecoSkin, setNovoPrecoSkin] = useState('');

  // Carregar os valores das configurações ao abrir
  useEffect(() => {
    fetch('https://sweet-7ifa.onrender.com/config')
      .then(res => res.json())
      .then(data => {
        data.forEach((item: any) => {
          if (item.chave === 'recompensa_social') setConfigSocial(item.valor);
          if (item.chave === 'recompensa_discord') setConfigDiscord(item.valor);
          if (item.chave === 'recompensa_email') setConfigEmail(item.valor);
        });
      })
      .catch(() => toast.error('Erro ao carregar configurações globais.'));
  }, []);

  // Procurar skin para editar preço
  useEffect(() => {
    if (pesquisaSkin.trim().length < 2) {
      setSkinsEncontradas([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      fetch(`https://sweet-7ifa.onrender.com/itens?search=${encodeURIComponent(pesquisaSkin)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Filtrar localmente por precaução para mostrar apenas as mais relevantes
            setSkinsEncontradas(data.slice(0, 5));
          }
        })
        .catch(() => console.error('Erro ao pesquisar skin.'));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [pesquisaSkin]);

  const atualizarConfiguracao = async (chave: string, valor: string) => {
    if (!valor) return toast.error("Insere um valor válido!");
    const toastId = toast.loading("A guardar...");
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/admin/config', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chave, valor })
      });
      const data = await res.json();
      if (data.sucesso) toast.success('✅ ' + data.mensagem, { id: toastId });
      else toast.error('❌ Erro: ' + data.mensagem, { id: toastId });
    } catch (e) { toast.error("Erro ao ligar ao servidor.", { id: toastId }); }
  };

  // 🔥 FUNÇÃO PARA GUARDAR O NOVO PREÇO DA SKIN 🔥
  const handleGuardarPrecoSkin = async () => {
    if (!skinSelecionada || !novoPrecoSkin) return toast.error("Seleciona uma skin e insere o preço!");
    const toastId = toast.loading("A atualizar preço da skin...");
    
    try {
      const res = await fetch(`https://sweet-7ifa.onrender.com/admin/item/preco`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: skinSelecionada.id, preco: parseFloat(novoPrecoSkin) })
      });
      const data = await res.json();
      
      if (res.ok || data.sucesso) {
        toast.success(`Preço de "${skinSelecionada.nome}" alterado para ${parseFloat(novoPrecoSkin).toFixed(2)}€!`, { id: toastId });
        setSkinSelecionada(null);
        setNovoPrecoSkin('');
        setPesquisaSkin('');
      } else {
        toast.error(data.message || "Falha ao atualizar preço.", { id: toastId });
      }
    } catch (e) {
      toast.error("Erro ao ligar ao servidor.", { id: toastId });
    }
  };

  const handleSincronizar = async () => {
    if(!window.confirm("⚠️ ATENÇÃO! Isto vai importar milhares de skins da base de dados global. Queres continuar?")) return;
    setSyncLoading(true);
    const toastId = toast.loading("A transferir arsenal... Isto pode demorar um bocado.");
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/sincronizar-arsenal', { method: 'POST' });
      const data = await res.json();
      toast.success(data.message || '✅ Arsenal sincronizado com sucesso!', { id: toastId });
    } catch (e) { toast.error('❌ Erro ao sincronizar o arsenal.', { id: toastId }); }
    setSyncLoading(false);
  };

  const gerarPromo = async () => {
    if(!promoCode || !promoValor || !promoLimite) return toast.error("Preenche o código, o valor e o limite de usos!");
    const toastId = toast.loading("A forjar Promo Code...");
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/admin/criar-promo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: promoCode, valor: parseFloat(promoValor), limite: parseInt(promoLimite) })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("🎫 " + data.msg, { id: toastId }); 
        setPromoCode(''); setPromoValor(''); setPromoLimite('');
      } else { toast.error("Erro: " + data.message, { id: toastId }); }
    } catch(e) { toast.error("Erro ao ligar ao servidor.", { id: toastId }); }
  };

  return (
    <div className="animate-in fade-in space-y-8">
      
      {/* 🔥 NOVO BLOCO PREMIUM: MODERADOR DE PREÇOS DE SKINS 🔥 */}
      <div className="bg-[#121215]/80 backdrop-blur-sm border border-emerald-500/20 p-8 rounded-3xl relative overflow-hidden shadow-xl hover:border-emerald-500/40 transition-colors duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
        <h3 className="text-xl font-black uppercase mb-2 text-emerald-400 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
          <span className="text-2xl">🏷️</span> Alterar Preço de Skins
        </h3>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6">Procura qualquer skin no teu sistema e define um preço personalizado.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Lado Esquerdo: Pesquisa */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">1. Procurar Arma</label>
            <input 
              type="text" 
              placeholder="Ex: Asiimov, Fade, Karambit..." 
              value={pesquisaSkin}
              onChange={(e) => setPesquisaSkin(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-emerald-500 transition-colors shadow-inner"
            />
            
            {/* Resultados Rápidos */}
            {skinsEncontradas.length > 0 && (
              <div className="bg-black/80 border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5 animate-in fade-in duration-200">
                {skinsEncontradas.map(skin => (
                  <div 
                    key={skin.id} 
                    onClick={() => { setSkinSelecionada(skin); setNovoPrecoSkin(skin.preco || skin.valor || ''); }}
                    className="p-3 flex items-center justify-between text-xs cursor-pointer hover:bg-emerald-500/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={skin.imagem} className="w-8 h-8 object-contain" alt="" />
                      <span className="font-bold text-white">{skin.nome}</span>
                    </div>
                    <span className="font-mono text-zinc-400">{(skin.preco || skin.valor)}€</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lado Direito: Editor de Preço */}
          <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[140px]">
            {skinSelecionada ? (
              <div className="space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                  <img src={skinSelecionada.imagem} className="w-10 h-10 object-contain" alt="" />
                  <div>
                    <p className="text-white text-xs font-black uppercase truncate max-w-[200px]">{skinSelecionada.nome}</p>
                    <p className="text-[9px] text-zinc-500 uppercase font-black">Preço Atual: <span className="text-zinc-300">{(skinSelecionada.preco || skinSelecionada.valor)}€</span></p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="number" step="0.01" 
                      value={novoPrecoSkin} 
                      onChange={(e) => setNovoPrecoSkin(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl p-3 pl-8 text-sm text-emerald-400 font-mono font-black outline-none focus:border-emerald-500" 
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-500">€</span>
                  </div>
                  <button 
                    onClick={handleGuardarPrecoSkin}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-black text-[10px] uppercase tracking-widest px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    Gravar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 opacity-60 text-center py-4">
                <span className="text-2xl mb-1">🎯</span>
                <p className="text-[9px] font-black uppercase tracking-widest">Seleciona uma skin na lista de pesquisa</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RECOMPENSAS */}
      <div className="bg-[#121215]/80 backdrop-blur-sm border border-amber-500/20 p-8 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full pointer-events-none"></div>
        <h3 className="text-xl font-black uppercase mb-2 text-amber-500 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
          <span className="text-2xl">⚙️</span> Configurações de Recompensas
        </h3>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6">Altera os valores pagos aos jogadores nas missões.</p>
        
        <div className="grid grid-cols-1 gap-4 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-black/40 p-5 rounded-2xl border border-white/5 hover:bg-white/[0.02] transition-colors">
            <div className="flex-1">
              <h4 className="text-white font-black text-sm uppercase">Vídeos Sociais (TikTok, Insta, YT)</h4>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Pago ao aprovar o link</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input type="number" step="0.01" value={configSocial} onChange={(e) => setConfigSocial(e.target.value)} className="w-24 bg-black border border-white/10 rounded-xl p-3 text-emerald-400 font-mono font-black text-center focus:outline-none focus:border-amber-500 transition-colors shadow-inner" />
              <button onClick={() => atualizarConfiguracao('recompensa_social', configSocial)} className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all">Guardar</button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-black/40 p-5 rounded-2xl border border-white/5 hover:bg-white/[0.02] transition-colors">
            <div className="flex-1">
              <h4 className="text-white font-black text-sm uppercase">Entrada no Discord</h4>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Pago ao ligar a conta</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input type="number" step="0.01" value={configDiscord} onChange={(e) => setConfigDiscord(e.target.value)} className="w-24 bg-black border border-white/10 rounded-xl p-3 text-emerald-400 font-mono font-black text-center focus:outline-none focus:border-amber-500 transition-colors shadow-inner" />
              <button onClick={() => atualizarConfiguracao('recompensa_discord', configDiscord)} className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all">Guardar</button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-black/40 p-5 rounded-2xl border border-white/5 hover:bg-white/[0.02] transition-colors">
            <div className="flex-1">
              <h4 className="text-white font-black text-sm uppercase">Validação de E-mail</h4>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Pago ao verificar o e-mail</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input type="number" step="0.01" value={configEmail} onChange={(e) => setConfigEmail(e.target.value)} className="w-24 bg-black border border-white/10 rounded-xl p-3 text-emerald-400 font-mono font-black text-center focus:outline-none focus:border-amber-500 transition-colors shadow-inner" />
              <button onClick={() => atualizarConfiguracao('recompensa_email', configEmail)} className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all">Guardar</button>
            </div>
          </div>
        </div>
      </div>

      {/* PROMO CODES */}
      <div className="bg-[#121215]/80 backdrop-blur-sm border border-blue-500/20 p-8 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>
        <h3 className="text-xl font-black uppercase mb-6 text-blue-500 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
          <span className="text-2xl">🎫</span> Gerador de Promo Codes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} type="text" placeholder="CÓDIGO (Ex: VIP10)" className="bg-black/60 border border-white/10 rounded-xl p-4 text-white uppercase font-black focus:border-blue-500 focus:outline-none transition-colors shadow-inner" />
          <input value={promoValor} onChange={(e) => setPromoValor(e.target.value)} type="number" step="0.01" placeholder="VALOR EM €" className="bg-black/60 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none transition-colors shadow-inner" />
          <input value={promoLimite} onChange={(e) => setPromoLimite(e.target.value)} type="number" placeholder="MÁXIMO DE USOS" className="bg-black/60 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none transition-colors shadow-inner" />
        </div>
        <button onClick={gerarPromo} className="w-full mt-4 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">FORJAR CÓDIGO</button>
      </div>

      {/* ARSENAL */}
      <div className="bg-[#121215]/80 backdrop-blur-sm border border-white/5 p-8 rounded-3xl relative overflow-hidden shadow-xl">
        <h4 className="font-black text-white mb-4 uppercase tracking-widest text-sm flex items-center gap-2"><span>🌍</span> Arsenal Global</h4>
        <button onClick={handleSincronizar} disabled={syncLoading} className="w-full py-4 bg-zinc-800 text-white font-black uppercase rounded-xl transition-all border border-white/5">{syncLoading ? 'A SINCRONIZAR...' : '⬇️ Sincronizar Base de Dados de Skins'}</button>
      </div>

    </div>
  );
}