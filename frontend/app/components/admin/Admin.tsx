'use client';

import React, { useState } from 'react';
import TabEstatisticas from './TabEstatisticas';
import TabSistema from './TabSistema';
import TabClientes from './TabClientes';
import TabFabrica from './TabFabrica';
import AdminTickets from './AdminTickets';
import AdminLiveChat from './AdminLiveChat';
import AdminMissoes from './AdminMissoes'; 
import AdminLevantamentos from './AdminLevantamentos';

export default function Admin({ userId }: any) {
  const [activeTab, setActiveTab] = useState<'users' | 'boxes' | 'stats' | 'system' | 'staff' | 'tickets' | 'livechat' | 'missoes'| 'withdraws'>('boxes');

  // =========================================================================
  // 🔥 ESTADOS PARA A EQUIPA (PROMOVER E REMOVER)
  // =========================================================================
  const [alvoIdPromover, setAlvoIdPromover] = useState('');
  const [msgPromover, setMsgPromover] = useState<{ texto: string, tipo: 'sucesso' | 'erro' } | null>(null);

  const [alvoIdRemover, setAlvoIdRemover] = useState('');
  const [msgRemover, setMsgRemover] = useState<{ texto: string, tipo: 'sucesso' | 'erro' } | null>(null);

  const promoverJogador = async () => {
    if (!alvoIdPromover) return setMsgPromover({ texto: 'Insere o ID do jogador!', tipo: 'erro' });

    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/admin/promover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: userId, alvoId: alvoIdPromover })
      });
      
      const data = await res.json();
      
      if (data.sucesso) {
        setMsgPromover({ texto: data.mensagem, tipo: 'sucesso' });
        setAlvoIdPromover('');
      } else {
        setMsgPromover({ texto: data.erro, tipo: 'erro' });
      }
    } catch (error) {
      setMsgPromover({ texto: 'Erro ao ligar ao servidor.', tipo: 'erro' });
    }
  };

  const despromoverJogador = async () => {
    if (!alvoIdRemover) return setMsgRemover({ texto: 'Insere o ID do jogador!', tipo: 'erro' });

    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/admin/despromover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: userId, alvoId: alvoIdRemover })
      });
      
      const data = await res.json();
      
      if (data.sucesso) {
        setMsgRemover({ texto: data.mensagem, tipo: 'sucesso' });
        setAlvoIdRemover('');
      } else {
        setMsgRemover({ texto: data.erro, tipo: 'erro' });
      }
    } catch (error) {
      setMsgRemover({ texto: 'Erro ao ligar ao servidor.', tipo: 'erro' });
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-in fade-in pb-20 pt-4 flex flex-col md:flex-row gap-8 relative">
      
      {/* ================================================= */}
      {/* MENU LATERAL (DASHBOARD PREMIUM) */}
      {/* ================================================= */}
      <div className="w-full md:w-72 flex-shrink-0 flex flex-col gap-2">
        
        {/* CABEÇALHO DO MENU */}
        <div className="mb-6 px-4 py-6 bg-black/20 rounded-2xl border border-white/5 backdrop-blur-sm shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
             <span className="text-2xl drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">👑</span>
          </div>
          <div>
            <h2 className="text-xl font-black italic uppercase text-white tracking-tighter drop-shadow-md">Admin</h2>
            <p className="text-zinc-500 text-[9px] font-black tracking-widest uppercase mt-0.5">Centro de Comando</p>
          </div>
        </div>
        
        {/* BOTÕES PRINCIPAIS */}
        <div className="flex flex-col gap-1.5 mb-4">
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest px-4 mb-2">Gestão Principal</p>
          
          <button 
            onClick={() => setActiveTab('stats')} 
            className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-300 ${activeTab === 'stats' ? 'bg-gradient-to-r from-amber-500/20 to-transparent border-l-4 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.1)] translate-x-2' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 hover:translate-x-1'}`}
          >
            <span className="text-lg w-6 text-center drop-shadow-md">📊</span> 
            <span className="text-xs font-bold uppercase tracking-widest">Estatísticas</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('users')} 
            className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-300 ${activeTab === 'users' ? 'bg-gradient-to-r from-amber-500/20 to-transparent border-l-4 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.1)] translate-x-2' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 hover:translate-x-1'}`}
          >
            <span className="text-lg w-6 text-center drop-shadow-md">👥</span> 
            <span className="text-xs font-bold uppercase tracking-widest">Clientes</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('boxes')} 
            className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-300 ${activeTab === 'boxes' ? 'bg-gradient-to-r from-amber-500/20 to-transparent border-l-4 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.1)] translate-x-2' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 hover:translate-x-1'}`}
          >
            <span className="text-lg w-6 text-center drop-shadow-md">📦</span> 
            <span className="text-xs font-bold uppercase tracking-widest">Fábrica de Caixas</span>
          </button>

          <button 
            onClick={() => setActiveTab('withdraws')} 
            className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-300 ${activeTab === 'withdraws' ? 'bg-gradient-to-r from-amber-500/20 to-transparent border-l-4 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.1)] translate-x-2' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 hover:translate-x-1'}`}
          >
            <span className="text-lg w-6 text-center drop-shadow-md">📦</span> 
            <span className="text-xs font-bold uppercase tracking-widest">Logística (Saques)</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('system')} 
            className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-300 ${activeTab === 'system' ? 'bg-gradient-to-r from-amber-500/20 to-transparent border-l-4 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.1)] translate-x-2' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 hover:translate-x-1'}`}
          >
            <span className="text-lg w-6 text-center drop-shadow-md">⚙️</span> 
            <span className="text-xs font-bold uppercase tracking-widest">Sistema / API</span>
          </button>
        </div>

        <div className="w-full h-px bg-white/5 my-2"></div>

        {/* SUPORTE E SEGURANÇA */}
        <div className="flex flex-col gap-1.5 mt-2 mb-4">
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest px-4 mb-2">Suporte & Segurança</p>

          <button 
            onClick={() => setActiveTab('livechat')} 
            className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-300 ${activeTab === 'livechat' ? 'bg-gradient-to-r from-emerald-500/20 to-transparent border-l-4 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)] translate-x-2' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 hover:translate-x-1'}`}
          >
            <span className="text-lg w-6 text-center drop-shadow-md">⚡</span> 
            <span className="text-xs font-bold uppercase tracking-widest">Chat ao Vivo</span>
          </button>

          <button 
            onClick={() => setActiveTab('tickets')} 
            className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-300 ${activeTab === 'tickets' ? 'bg-gradient-to-r from-blue-500/20 to-transparent border-l-4 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)] translate-x-2' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 hover:translate-x-1'}`}
          >
            <span className="text-lg w-6 text-center drop-shadow-md">🎫</span> 
            <span className="text-xs font-bold uppercase tracking-widest">Tickets</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('missoes')} 
            className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-300 ${activeTab === 'missoes' ? 'bg-gradient-to-r from-purple-500/20 to-transparent border-l-4 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)] translate-x-2' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 hover:translate-x-1'}`}
          >
            <span className="text-lg w-6 text-center drop-shadow-md">📹</span> 
            <span className="text-xs font-bold uppercase tracking-widest">Moderação</span>
          </button>
        </div>

        {/* GESTÃO DE EQUIPA (DESTACADO) */}
        <button 
          onClick={() => setActiveTab('staff')} 
          className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-300 mt-auto border ${activeTab === 'staff' ? 'bg-gradient-to-r from-red-500/20 to-red-500/5 border-red-500/50 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-[#161619] border-white/5 text-zinc-400 hover:text-white hover:border-red-500/30'}`}
        >
          <span className="text-lg w-6 text-center drop-shadow-md">🛡️</span> 
          <span className="text-xs font-black uppercase tracking-widest">A Minha Equipa</span>
        </button>
      </div>

      {/* ================================================= */}
      {/* ÁREA DE CONTEÚDO (O PALCO PRINCIPAL) */}
      {/* ================================================= */}
      <div className="flex-1 bg-black/40 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/5 shadow-2xl min-h-[700px] w-full relative overflow-hidden">
        
        {/* LUZ DE FUNDO GERAL */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 w-full h-full">
          {activeTab === 'stats' && <TabEstatisticas />}
          {activeTab === 'system' && <TabSistema />}
          {activeTab === 'users' && <TabClientes />}
          {activeTab === 'boxes' && <TabFabrica />}
          {/* 🔥 A LINHA MÁGICA FOI INSERIDA AQUI: */}
          {activeTab === 'withdraws' && <AdminLevantamentos />}
          {activeTab === 'tickets' && <AdminTickets />}
          {activeTab === 'livechat' && <AdminLiveChat />}
          {activeTab === 'missoes' && <AdminMissoes />}

          {/* ABA DA EQUIPA (GESTÃO) - VISUAL RENOVADO */}
          {activeTab === 'staff' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              
              {/* TÍTULO DA ABA */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                   <span className="text-2xl">🛡️</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">Gestão de Equipa</h3>
                  <p className="text-zinc-400 text-[10px] font-bold tracking-widest uppercase mt-1">Atribui ou remove poderes imperiais</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* CARD: PROMOVER ADMIN */}
                <div className="bg-[#161619]/80 backdrop-blur-sm border border-amber-500/10 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.05)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full group-hover:bg-amber-500/10 transition-colors"></div>
                  
                  <div className="flex items-center gap-3 mb-2 relative z-10">
                     <span className="text-xl">👑</span>
                     <h3 className="text-xl font-black uppercase italic text-white drop-shadow-md">Promover a Admin</h3>
                  </div>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-8 relative z-10">Dá acesso total ao painel de controlo</p>

                  <div className="flex flex-col gap-4 relative z-10">
                    <div>
                      <label className="text-zinc-400 text-[9px] uppercase font-black tracking-widest ml-2 block mb-2">ID do Jogador na Base de Dados</label>
                      <input 
                        type="number" 
                        value={alvoIdPromover} 
                        onChange={(e) => setAlvoIdPromover(e.target.value)} 
                        placeholder="Ex: 5"
                        className="w-full bg-black/50 border border-white/10 text-white font-mono font-black text-xl rounded-xl p-4 outline-none focus:border-amber-500 transition-colors shadow-inner text-center placeholder:text-zinc-700" 
                      />
                    </div>

                    <button 
                      onClick={promoverJogador}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black py-4 rounded-xl font-black uppercase tracking-widest transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] mt-2 flex items-center justify-center gap-2"
                    >
                      <span>ATRIBUIR PODERES</span>
                    </button>

                    {msgPromover && (
                      <div className={`p-4 rounded-xl text-center text-[10px] font-black uppercase tracking-widest mt-2 border flex items-center justify-center gap-2 animate-in fade-in ${msgPromover.tipo === 'sucesso' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {msgPromover.tipo === 'sucesso' ? '✅' : '❌'} {msgPromover.texto}
                      </div>
                    )}
                  </div>
                </div>

                {/* CARD: REMOVER ADMIN */}
                <div className="bg-[#161619]/80 backdrop-blur-sm border border-red-500/10 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden group hover:border-red-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.05)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full group-hover:bg-red-500/10 transition-colors"></div>
                  
                  <div className="flex items-center gap-3 mb-2 relative z-10">
                     <span className="text-xl">⚔️</span>
                     <h3 className="text-xl font-black uppercase italic text-red-500 drop-shadow-md">Despromover Admin</h3>
                  </div>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-8 relative z-10">Rebaixa um membro a jogador comum</p>

                  <div className="flex flex-col gap-4 relative z-10">
                    <div>
                      <label className="text-zinc-400 text-[9px] uppercase font-black tracking-widest ml-2 block mb-2">ID do Jogador na Base de Dados</label>
                      <input 
                        type="number" 
                        value={alvoIdRemover} 
                        onChange={(e) => setAlvoIdRemover(e.target.value)} 
                        placeholder="Ex: 5"
                        className="w-full bg-black/50 border border-white/10 text-white font-mono font-black text-xl rounded-xl p-4 outline-none focus:border-red-500 transition-colors shadow-inner text-center placeholder:text-zinc-700" 
                      />
                    </div>

                    <button 
                      onClick={despromoverJogador}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] mt-2 flex items-center justify-center gap-2"
                    >
                      <span>REMOVER PERMISSÕES</span>
                    </button>

                    {msgRemover && (
                      <div className={`p-4 rounded-xl text-center text-[10px] font-black uppercase tracking-widest mt-2 border flex items-center justify-center gap-2 animate-in fade-in ${msgRemover.tipo === 'sucesso' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {msgRemover.tipo === 'sucesso' ? '✅' : '❌'} {msgRemover.texto}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}