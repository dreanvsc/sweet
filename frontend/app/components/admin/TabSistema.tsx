'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast'; // 🔥 Import adicionado

export default function TabSistema() {
  const [syncLoading, setSyncLoading] = useState(false);
  
  // 🔥 ESTADOS PARA O COFRE DE CONFIGURAÇÕES
  const [configSocial, setConfigSocial] = useState('');
  const [configDiscord, setConfigDiscord] = useState('');
  const [configEmail, setConfigEmail] = useState('');

  // 🔥 ESTADOS PARA GERAR PROMO CODES (Mais seguro que document.getElementById)
  const [promoCode, setPromoCode] = useState('');
  const [promoValor, setPromoValor] = useState('');
  const [promoLimite, setPromoLimite] = useState('');

  // 1. CARREGAR OS VALORES ATUAIS DA BASE DE DADOS AO ABRIR A ABA
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

  // 2. FUNÇÃO PARA GUARDAR UM VALOR NOVO
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
    } catch (e) { 
      toast.error('❌ Erro ao sincronizar o arsenal.', { id: toastId }); 
    }
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
        setPromoCode('');
        setPromoValor('');
        setPromoLimite('');
      } else {
        toast.error("Erro: " + data.message, { id: toastId });
      }
    } catch(e) { 
      toast.error("Erro ao ligar ao servidor.", { id: toastId }); 
    }
  };

  return (
    <div className="animate-in fade-in space-y-8">
      
      {/* 🔥 BLOCO: CONFIGURAÇÕES GLOBAIS (O COFRE) */}
      <div className="bg-[#121215]/80 backdrop-blur-sm border border-amber-500/20 p-8 rounded-3xl relative overflow-hidden shadow-xl hover:border-amber-500/40 transition-colors duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full pointer-events-none"></div>
        <h3 className="text-xl font-black uppercase mb-2 text-amber-500 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
          <span className="text-2xl">⚙️</span> Configurações de Recompensas
        </h3>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6">Altera os valores pagos aos jogadores nas missões.</p>
        
        <div className="grid grid-cols-1 gap-4 relative z-10">
          {/* Missões Sociais */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-black/40 p-5 rounded-2xl border border-white/5 hover:bg-white/[0.02] transition-colors">
            <div className="flex-1">
              <h4 className="text-white font-black text-sm uppercase">Vídeos Sociais (TikTok, Insta, YT)</h4>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Pago ao aprovar o link</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input 
                type="number" step="0.01" 
                value={configSocial} onChange={(e) => setConfigSocial(e.target.value)} 
                className="w-24 bg-black border border-white/10 rounded-xl p-3 text-emerald-400 font-mono font-black text-center focus:outline-none focus:border-amber-500 transition-colors shadow-inner" 
              />
              <button 
                onClick={() => atualizarConfiguracao('recompensa_social', configSocial)}
                className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              >
                Guardar
              </button>
            </div>
          </div>

          {/* Missão Discord */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-black/40 p-5 rounded-2xl border border-white/5 hover:bg-white/[0.02] transition-colors">
            <div className="flex-1">
              <h4 className="text-white font-black text-sm uppercase">Entrada no Discord</h4>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Pago ao ligar a conta</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input 
                type="number" step="0.01" 
                value={configDiscord} onChange={(e) => setConfigDiscord(e.target.value)} 
                className="w-24 bg-black border border-white/10 rounded-xl p-3 text-emerald-400 font-mono font-black text-center focus:outline-none focus:border-amber-500 transition-colors shadow-inner" 
              />
              <button 
                onClick={() => atualizarConfiguracao('recompensa_discord', configDiscord)}
                className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              >
                Guardar
              </button>
            </div>
          </div>

          {/* Missão Email */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-black/40 p-5 rounded-2xl border border-white/5 hover:bg-white/[0.02] transition-colors">
            <div className="flex-1">
              <h4 className="text-white font-black text-sm uppercase">Validação de E-mail</h4>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Pago ao verificar o e-mail</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input 
                type="number" step="0.01" 
                value={configEmail} onChange={(e) => setConfigEmail(e.target.value)} 
                className="w-24 bg-black border border-white/10 rounded-xl p-3 text-emerald-400 font-mono font-black text-center focus:outline-none focus:border-amber-500 transition-colors shadow-inner" 
              />
              <button 
                onClick={() => atualizarConfiguracao('recompensa_email', configEmail)}
                className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BLOCO GERADOR DE PROMO CODES */}
      <div className="bg-[#121215]/80 backdrop-blur-sm border border-blue-500/20 p-8 rounded-3xl relative overflow-hidden shadow-xl hover:border-blue-500/40 transition-colors duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>
        <h3 className="text-xl font-black uppercase mb-6 text-blue-500 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] relative z-10">
          <span className="text-2xl">🎫</span> Gerador de Promo Codes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <input 
            value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            type="text" placeholder="CÓDIGO (Ex: VIP10)" 
            className="bg-black/60 border border-white/10 rounded-xl p-4 text-white uppercase font-black focus:border-blue-500 focus:outline-none transition-colors shadow-inner" 
          />
          <input 
            value={promoValor} onChange={(e) => setPromoValor(e.target.value)}
            type="number" step="0.01" placeholder="VALOR EM €" 
            className="bg-black/60 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none transition-colors shadow-inner" 
          />
          <input 
            value={promoLimite} onChange={(e) => setPromoLimite(e.target.value)}
            type="number" placeholder="MÁXIMO DE USOS" 
            className="bg-black/60 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none transition-colors shadow-inner" 
          />
        </div>
        <button 
          onClick={gerarPromo} 
          className="w-full mt-4 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:scale-[1.01] relative z-10"
        >
          FORJAR CÓDIGO
        </button>
      </div>

      {/* BLOCO ARSENAL */}
      <div className="bg-[#121215]/80 backdrop-blur-sm border border-white/5 p-8 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full pointer-events-none"></div>
        <h4 className="font-black text-white mb-4 uppercase tracking-widest text-sm relative z-10 flex items-center gap-2">
          <span>🌍</span> Arsenal Global
        </h4>
        <button 
          onClick={handleSincronizar} 
          disabled={syncLoading} 
          className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-black uppercase rounded-xl transition-all border border-white/5 hover:border-white/20 relative z-10"
        >
          {syncLoading ? 'A SINCRONIZAR COM O SERVIDOR MÃE...' : '⬇️ Sincronizar Base de Dados de Skins'}
        </button>
      </div>

    </div>
  );
}