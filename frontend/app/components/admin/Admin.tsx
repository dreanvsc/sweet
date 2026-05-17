'use client';

import React, { useState } from 'react';
import TabEstatisticas from './TabEstatisticas';
import TabSistema from './TabSistema';
import TabClientes from './TabClientes';
import TabFabrica from './TabFabrica';

export default function Admin({ userId }: any) { // 🔥 Adicionámos o userId aqui para a segurança
  const [activeTab, setActiveTab] = useState<'users' | 'boxes' | 'stats' | 'system' | 'staff'>('boxes');

  // =========================================================================
  // 🔥 ESTADOS PARA A NOVA ABA DA EQUIPA (PROMOVER JOGADORES)
  // =========================================================================
  const [alvoId, setAlvoId] = useState('');
  const [mensagem, setMensagem] = useState<{ texto: string, tipo: 'sucesso' | 'erro' } | null>(null);

  const promoverJogador = async () => {
    if (!alvoId) return setMensagem({ texto: 'Insere o ID do jogador!', tipo: 'erro' });

    try {
      const res = await fetch('http://localhost:3000/admin/promover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: userId, alvoId: alvoId })
      });
      
      const data = await res.json();
      
      if (data.sucesso) {
        setMensagem({ texto: data.mensagem, tipo: 'sucesso' });
        setAlvoId(''); // Limpa a caixa
      } else {
        setMensagem({ texto: data.erro, tipo: 'erro' });
      }
    } catch (error) {
      setMensagem({ texto: 'Erro ao ligar ao servidor.', tipo: 'erro' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in pb-20 flex gap-8 relative w-full">
      
      {/* MENU LATERAL */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-2">
        <div className="mb-6 px-4">
          <span className="text-4xl block mb-2">👑</span>
          <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">Admin</h2>
        </div>
        <button onClick={() => setActiveTab('users')} className={`p-4 rounded-xl text-left font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'users' ? 'bg-amber-500 text-black' : 'bg-[#121215] text-zinc-500 hover:text-white hover:bg-white/5'}`}>👥 Clientes</button>
        <button onClick={() => setActiveTab('stats')} className={`p-4 rounded-xl text-left font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'stats' ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-[#121215] text-zinc-500 hover:text-white hover:bg-white/5'}`}>📊 Estatísticas</button>
        <button onClick={() => setActiveTab('boxes')} className={`p-4 rounded-xl text-left font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'boxes' ? 'bg-amber-500 text-black' : 'bg-[#121215] text-zinc-500 hover:text-white hover:bg-white/5'}`}>📦 Fábrica</button>
        <button onClick={() => setActiveTab('system')} className={`p-4 rounded-xl text-left font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'system' ? 'bg-amber-500 text-black' : 'bg-[#121215] text-zinc-500 hover:text-white hover:bg-white/5'}`}>⚙️ Sistema</button>
        
        {/* 🔥 O NOVO BOTÃO DA TUA EQUIPA */}
        <button onClick={() => setActiveTab('staff')} className={`p-4 rounded-xl text-left font-black uppercase tracking-widest text-xs transition-all mt-4 border border-white/5 ${activeTab === 'staff' ? 'bg-amber-500 text-black' : 'bg-[#121215] text-zinc-500 hover:text-white hover:bg-white/5'}`}>🛡️ Equipa</button>
      </div>

      {/* ÁREA DE CONTEÚDO */}
      <div className="flex-1 bg-[#121215] p-8 rounded-3xl border border-white/5 shadow-2xl min-h-[700px] w-full">
        {activeTab === 'stats' && <TabEstatisticas />}
        {activeTab === 'system' && <TabSistema />}
        {activeTab === 'users' && <TabClientes />}
        {activeTab === 'boxes' && <TabFabrica />}

        {/* 🔥 A NOVA ABA DA EQUIPA */}
        {activeTab === 'staff' && (
          <div className="animate-in fade-in">
            <h3 className="text-2xl font-black italic uppercase text-white mb-8 border-b border-white/5 pb-4">Gestão de Equipa</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CARD: PROMOVER ADMIN */}
              <div className="bg-black/40 border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full"></div>
                
                <h3 className="text-xl font-black uppercase italic mb-2 text-white">Adicionar Admin</h3>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6">Dá permissões a um membro da equipa</p>

                <div className="flex flex-col gap-4 relative z-10">
                  <div>
                    <label className="text-zinc-400 text-[10px] uppercase font-black tracking-widest ml-2">ID da Conta do Jogador</label>
                    <input 
                      type="number" 
                      value={alvoId} 
                      onChange={(e) => setAlvoId(e.target.value)} 
                      placeholder="Ex: 5"
                      className="w-full bg-[#161619] border border-zinc-800 text-white font-mono font-bold rounded-xl p-4 mt-1 outline-none focus:border-amber-500 transition-colors" 
                    />
                  </div>

                  <button 
                    onClick={promoverJogador}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black py-4 rounded-xl font-black uppercase tracking-widest transition-transform hover:scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.2)] mt-2"
                  >
                    👑 PROMOVER A ADMIN
                  </button>

                  {/* CAIXA DE MENSAGENS */}
                  {mensagem && (
                    <div className={`p-4 rounded-xl text-center text-xs font-black uppercase tracking-widest mt-2 border ${mensagem.tipo === 'sucesso' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      {mensagem.texto}
                    </div>
                  )}
                </div>
              </div>

              {/* ESPAÇO RESERVADO PARA CÓDIGOS PROMO */}
              <div className="bg-black/40 border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col items-center justify-center text-center opacity-50">
                <span className="text-4xl mb-4">🎟️</span>
                <h3 className="text-lg font-black uppercase italic text-zinc-400">Em Breve</h3>
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-2">Gerador de Códigos Promocionais</p>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}