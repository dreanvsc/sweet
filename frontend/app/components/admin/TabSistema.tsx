'use client';

import React, { useState, useEffect } from 'react';

export default function TabSistema() {
  const [syncLoading, setSyncLoading] = useState(false);
  
  // 🔥 ESTADOS PARA O COFRE DE CONFIGURAÇÕES
  const [configSocial, setConfigSocial] = useState('');
  const [configDiscord, setConfigDiscord] = useState('');
  const [configEmail, setConfigEmail] = useState('');

  // 1. CARREGAR OS VALORES ATUAIS DA BASE DE DADOS AO ABRIR A ABA
  useEffect(() => {
    fetch('http://localhost:3000/config')
      .then(res => res.json())
      .then(data => {
        data.forEach((item: any) => {
          if (item.chave === 'recompensa_social') setConfigSocial(item.valor);
          if (item.chave === 'recompensa_discord') setConfigDiscord(item.valor);
          if (item.chave === 'recompensa_email') setConfigEmail(item.valor);
        });
      })
      .catch(() => console.error('Erro ao carregar configurações globais.'));
  }, []);

  // 2. FUNÇÃO PARA GUARDAR UM VALOR NOVO
  const atualizarConfiguracao = async (chave: string, valor: string) => {
    if (!valor) return alert("Insere um valor válido!");

    try {
      const res = await fetch('http://localhost:3000/admin/config', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chave, valor })
      });
      const data = await res.json();
      
      if (data.sucesso) alert('✅ ' + data.mensagem);
      else alert('❌ Erro: ' + data.mensagem);
    } catch (e) { 
      alert("Erro ao ligar ao servidor."); 
    }
  };

  const handleSincronizar = async () => {
    if(!window.confirm("Atenção! Isto vai importar milhares de skins. Queres continuar?")) return;
    setSyncLoading(true);
    try {
      const res = await fetch('http://localhost:3000/sincronizar-arsenal', { method: 'POST' });
      const data = await res.json();
      alert(data.message || '✅ Sincronizado!');
    } catch (e) { 
      alert('❌ Erro ao sincronizar.'); 
    }
    setSyncLoading(false);
  };

  const gerarPromo = async () => {
    const codigo = (document.getElementById('pcodigo') as HTMLInputElement).value;
    const valor = (document.getElementById('pvalor') as HTMLInputElement).value;
    const limite = (document.getElementById('plimite') as HTMLInputElement).value;
    
    if(!codigo || !valor || !limite) return alert("Preenche o código, o valor e o limite de usos!");

    try {
      const res = await fetch('http://localhost:3000/admin/criar-promo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, valor: parseFloat(valor), limite: parseInt(limite) })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.msg); 
        (document.getElementById('pcodigo') as HTMLInputElement).value = '';
        (document.getElementById('pvalor') as HTMLInputElement).value = '';
        (document.getElementById('plimite') as HTMLInputElement).value = '';
      } else {
        alert("Erro: " + data.message);
      }
    } catch(e) { alert("Erro ao ligar ao servidor."); }
  };

  return (
    <div className="animate-in fade-in space-y-8">
      
      {/* 🔥 NOVO BLOCO: CONFIGURAÇÕES GLOBAIS (O COFRE) */}
      <div className="bg-[#161619] border border-amber-500/20 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full pointer-events-none"></div>
        <h3 className="text-xl font-black uppercase mb-2 text-amber-500 flex items-center gap-2">
          <span className="text-2xl">⚙️</span> Configurações de Recompensas
        </h3>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6">Altera os valores pagos aos jogadores nas missões.</p>
        
        <div className="grid grid-cols-1 gap-4 relative z-10">
          {/* Missões Sociais */}
          <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="flex-1">
              <h4 className="text-white font-black text-sm uppercase">Vídeos Sociais (TikTok, Insta, YT)</h4>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Pago ao aprovar o link</p>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="number" step="0.01" 
                value={configSocial} onChange={(e) => setConfigSocial(e.target.value)} 
                className="w-24 bg-black/50 border border-white/10 rounded-lg p-3 text-emerald-500 font-mono font-black text-center focus:outline-none focus:border-amber-500" 
              />
              <button 
                onClick={() => atualizarConfiguracao('recompensa_social', configSocial)}
                className="bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] uppercase tracking-widest px-4 py-3 rounded-lg transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>

          {/* Missão Discord */}
          <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="flex-1">
              <h4 className="text-white font-black text-sm uppercase">Entrada no Discord</h4>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Pago ao ligar a conta</p>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="number" step="0.01" 
                value={configDiscord} onChange={(e) => setConfigDiscord(e.target.value)} 
                className="w-24 bg-black/50 border border-white/10 rounded-lg p-3 text-emerald-500 font-mono font-black text-center focus:outline-none focus:border-amber-500" 
              />
              <button 
                onClick={() => atualizarConfiguracao('recompensa_discord', configDiscord)}
                className="bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] uppercase tracking-widest px-4 py-3 rounded-lg transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>

          {/* Missão Email */}
          <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="flex-1">
              <h4 className="text-white font-black text-sm uppercase">Validação de E-mail</h4>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Pago ao verificar o e-mail</p>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="number" step="0.01" 
                value={configEmail} onChange={(e) => setConfigEmail(e.target.value)} 
                className="w-24 bg-black/50 border border-white/10 rounded-lg p-3 text-emerald-500 font-mono font-black text-center focus:outline-none focus:border-amber-500" 
              />
              <button 
                onClick={() => atualizarConfiguracao('recompensa_email', configEmail)}
                className="bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] uppercase tracking-widest px-4 py-3 rounded-lg transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BLOCO GERADOR DE PROMO CODES */}
      <div className="bg-[#161619] border border-white/5 p-8 rounded-3xl">
        <h3 className="text-xl font-black uppercase mb-6 text-blue-500 flex items-center gap-2">
          <span className="text-2xl">🎫</span> Gerador de Promo Codes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input id="pcodigo" type="text" placeholder="CÓDIGO (Ex: VIP10)" className="bg-black/50 border border-white/10 rounded-xl p-4 text-white uppercase font-black focus:border-blue-500 focus:outline-none transition-colors" />
          <input id="pvalor" type="number" step="0.01" placeholder="VALOR EM €" className="bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none transition-colors" />
          <input id="plimite" type="number" placeholder="MÁXIMO DE USOS" className="bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none transition-colors" />
        </div>
        <button onClick={gerarPromo} className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]">
          GERAR CÓDIGO
        </button>
      </div>

      {/* BLOCO ARSENAL */}
      <div className="bg-blue-500/5 border border-blue-500/20 p-8 rounded-3xl">
        <h4 className="font-bold text-white mb-2 uppercase text-xs">Arsenal Global</h4>
        <button onClick={handleSincronizar} disabled={syncLoading} className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase rounded-xl transition-all">
          {syncLoading ? 'A processar...' : '⬇️ Sincronizar Base de Dados de Skins'}
        </button>
      </div>

    </div>
  );
}