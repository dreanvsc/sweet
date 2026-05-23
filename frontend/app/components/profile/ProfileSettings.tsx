'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function ProfileSettings({ userData, userId }: any) {
  const [tradeUrl, setTradeUrl] = useState(userData?.tradeUrl || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [newsletter, setNewsletter] = useState(userData?.newsletter || false);
  const [emailVerificado, setEmailVerificado] = useState(userData?.emailVerificado || false);
  
  // 🔥 A animação guarda no LocalStorage para o site se lembrar!
  const [animacao, setAnimacao] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('animacaoNivel') !== 'false';
    }
    return true;
  });

  const [savingTrade, setSavingTrade] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingNews, setSavingNews] = useState(false);
  const [verificando, setVerificando] = useState(false);

  // Guarda preferência de animação
  useEffect(() => {
    localStorage.setItem('animacaoNivel', String(animacao));
  }, [animacao]);

  const guardarConfiguracao = async (campo: string, valor: any, setLoader: any) => {
    if (!userId) return toast.error("Erro: ID do jogador não encontrado.");
    setLoader(true);
    
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/utilizador/configuracoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(userId), [campo]: valor })
      });
      const data = await res.json();
      if (data.sucesso) {
        toast.success(`✅ Alteração guardada!`);
        // Se ele mudar o e-mail, perde a verificação por segurança!
        if (campo === 'email') setEmailVerificado(false);
      } else {
        toast.error('❌ Erro ao guardar.');
      }
    } catch (error) {
      toast.error('❌ Erro de conexão ao servidor.');
    }
    setLoader(false);
  };

  // 🔥 O BOTÃO DE VERIFICAR E-MAIL
  const handleVerificarEmail = async () => {
    if (!email.includes('@')) return toast.error("Guarda um e-mail válido primeiro!");
    setVerificando(true);
    const toastId = toast.loading("A enviar pedido de verificação...");

    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/utilizador/verificar-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(userId) })
      });
      const data = await res.json();
      
      if (data.sucesso) {
        toast.success("📧 E-mail verificado! Já podes levantar skins.", { id: toastId });
        setEmailVerificado(true);
      }
    } catch (error) {
      toast.error("Erro ao verificar.", { id: toastId });
    }
    setVerificando(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
      
      {/* ================= COLUNA ESQUERDA ================= */}
      <div className="flex flex-col gap-6">
        
        {/* BLOCO 1: STEAM */}
        <div className="bg-[#1b1b1e] border border-white/5 rounded-xl p-6 shadow-xl">
          <h3 className="text-white font-black uppercase tracking-widest text-sm mb-4">Configurações do Steam</h3>
          <p className="text-zinc-400 text-[10px] mb-3 uppercase tracking-widest">
            <a href="https://steamcommunity.com/id/me/tradeoffers/privacy#trade_offer_access_url" target="_blank" rel="noreferrer" className="text-emerald-500 cursor-pointer hover:underline font-bold">Clique aqui</a> para encontrar seu url de troca do steam
          </p>
          <div className="flex gap-2 w-full">
            <input 
              type="text" 
              value={tradeUrl}
              onChange={(e) => setTradeUrl(e.target.value)}
              placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
              className="flex-1 bg-[#121215] border border-white/5 rounded-lg px-4 py-3 text-[10px] text-zinc-400 font-mono outline-none focus:border-emerald-500/50 transition-colors"
            />
            <button 
              onClick={() => guardarConfiguracao('tradeUrl', tradeUrl, setSavingTrade)}
              disabled={savingTrade}
              className="bg-[#121215] hover:bg-emerald-500/20 hover:text-emerald-500 border border-white/5 rounded-lg px-6 text-[10px] text-white font-black uppercase tracking-widest transition-colors flex items-center gap-2 disabled:opacity-50 shrink-0"
            >
              {savingTrade ? '⏳...' : '✎ Editar'}
            </button>
          </div>
        </div>

        {/* BLOCO 2: EMAIL COM VERIFICAÇÃO 🔥 */}
        <div className={`border rounded-xl p-6 shadow-xl transition-colors ${emailVerificado ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-[#1b1b1e] border-white/5'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-black uppercase tracking-widest text-sm">Endereço de E-mail</h3>
            {emailVerificado ? (
              <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                VERIFICADO ✅
              </span>
            ) : (
              <span className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                NÃO VERIFICADO ❌
              </span>
            )}
          </div>

          <div className="flex gap-2 w-full mb-3">
            <input 
              type="email" 
              placeholder="DIGITE SEU E-MAIL..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-[#121215] border border-white/5 rounded-lg px-4 py-3 text-[10px] text-white font-black uppercase outline-none focus:border-amber-500/50 transition-colors placeholder:text-zinc-600"
            />
            <button 
              onClick={() => guardarConfiguracao('email', email, setSavingEmail)}
              disabled={savingEmail}
              className="bg-[#121215] hover:bg-amber-500/20 hover:text-amber-500 border border-white/5 rounded-lg px-6 text-[10px] text-white font-black uppercase tracking-widest transition-colors flex items-center gap-2 disabled:opacity-50 shrink-0"
            >
              {savingEmail ? '⏳...' : '✎ Editar'}
            </button>
          </div>
          
          {!emailVerificado && email && (
            <button 
              onClick={handleVerificarEmail}
              disabled={verificando}
              className="w-full mt-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-[10px] py-3 rounded-lg uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2"
            >
              {verificando ? 'A VERIFICAR...' : '✉️ REQUISITAR VERIFICAÇÃO PARA LEVANTAR SKINS'}
            </button>
          )}
        </div>

        {/* BLOCO 3: NEWSLETTER */}
        <div className="bg-[#1b1b1e] border border-white/5 rounded-xl p-6 shadow-xl">
          <h3 className="text-white font-black uppercase tracking-widest text-sm mb-4">Boletim de Notícias</h3>
          <p className="text-zinc-500 text-[10px] mb-4 uppercase tracking-widest">Subscrever a nossa newsletter para se manter atualizado com as melhores ofertas</p>
          
          <label className="flex items-start gap-3 cursor-pointer mb-4 group w-fit" onClick={() => setNewsletter(!newsletter)}>
            <div className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${newsletter ? 'bg-emerald-500 border-emerald-500' : 'bg-[#121215] border-white/10 group-hover:border-white/30'}`}>
              {newsletter && <span className="text-black text-xs font-black">✓</span>}
            </div>
            <span className="text-zinc-400 text-[10px] leading-relaxed select-none">Aceito receber por via eletrónica boletins informativos e de promoção do Império</span>
          </label>

          <button 
            onClick={() => guardarConfiguracao('newsletter', newsletter, setSavingNews)}
            disabled={savingNews}
            className="bg-[#121215] hover:bg-white/10 hover:text-white border border-white/5 rounded-lg px-6 py-3 text-[10px] text-zinc-400 font-black uppercase tracking-widest transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {savingNews ? '⏳...' : '✉ Guardar Preferência'}
          </button>
        </div>

      </div>

      {/* ================= COLUNA DIREITA ================= */}
      <div className="flex flex-col gap-6">
        
        {/* BLOCO 4: REGIONAIS (Estéticos, Desativados) */}
        <div className="bg-[#1b1b1e] border border-white/5 rounded-xl p-6 shadow-xl opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
          <h3 className="text-white font-black uppercase tracking-widest text-sm mb-6 flex justify-between items-center">
            Configurações Regionais <span className="text-[8px] font-black tracking-widest text-zinc-500 bg-black/50 px-2 py-1 rounded border border-white/5">EM BREVE</span>
          </h3>
          
          <div className="flex flex-col gap-4 pointer-events-none">
            <div>
              <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-2">Escolha um país</label>
              <div className="w-full bg-[#121215] border border-white/5 rounded-lg p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🇵🇹</span>
                  <span className="text-xs text-white font-bold">Portugal</span>
                </div>
                <span className="text-zinc-500 text-xs">▼</span>
              </div>
            </div>

            <div>
              <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-2">Escolher Idioma</label>
              <div className="w-full bg-[#121215] border border-white/5 rounded-lg p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🇵🇹</span>
                  <span className="text-xs text-zinc-400">Portuguese (Português)</span>
                </div>
                <span className="text-zinc-500 text-xs">▼</span>
              </div>
            </div>

            <div>
              <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-2">Escolha a moeda</label>
              <div className="w-full bg-[#121215] border border-white/5 rounded-lg p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white font-black bg-white/10 rounded w-5 h-5 flex items-center justify-center">€</span>
                  <span className="text-xs text-zinc-400">EUR</span>
                </div>
                <span className="text-zinc-500 text-xs">▼</span>
              </div>
            </div>
          </div>
        </div>

        {/* BLOCO 5: OPÇÕES (TOGGLE FUNCIONAL) */}
        <div className="bg-[#1b1b1e] border border-white/5 rounded-xl p-6 shadow-xl">
          <h3 className="text-white font-black uppercase tracking-widest text-sm mb-6">Opções do Sistema</h3>
          
          <div className="flex items-center justify-between bg-[#121215] p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-xl drop-shadow-md">🎉</span>
              <span className="text-[10px] text-white font-black uppercase tracking-widest">Animação de Subida de Nível</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`text-[9px] font-black uppercase tracking-widest ${!animacao ? 'text-zinc-400' : 'text-zinc-600'}`}>Off</span>
              
              <div 
                onClick={() => setAnimacao(!animacao)}
                className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors duration-300 shadow-inner ${animacao ? 'bg-emerald-500' : 'bg-zinc-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-md ${animacao ? 'left-7' : 'left-1'}`}></div>
              </div>

              <span className={`text-[9px] font-black uppercase tracking-widest ${animacao ? 'text-emerald-500' : 'text-zinc-600'}`}>On</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}