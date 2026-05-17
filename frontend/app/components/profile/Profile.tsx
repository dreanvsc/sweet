import React, { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileInventory from './ProfileInventory';

export default function Profile({ 
  userId, saldo = 0, setSaldo, xp = 0, inventario = [], setInventario, setView, nome, avatar, user 
}: any) {
  
  const [activeTab, setActiveTab] = useState('INVENTÁRIO');
  
  const nomeFinal = nome || user?.nome || "Drean";
  const avatarFinal = avatar || user?.avatar || user?.imagem || "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/b5/b5bd56c1aa4644a474a2e4972be27ef9e82e517e_full.jpg";
  const tradeUrl = user?.tradeUrl || "https://steamcommunity.com/tradeoffer/new/?partner=1156810616&token=...";

  const nivel = Math.floor(xp / 1000) + 1;
  const xpParaProximo = 1000 - (xp % 1000);
  const progresso = ((xp % 1000) / 1000) * 100;

  const abas = [
    { nome: 'INVENTÁRIO', icon: '🔫' },
    { nome: 'MISSÕES', icon: '🏅' },
    { nome: 'CARREGAR', icon: '➕' },
    { nome: 'SISTEMA DE AFILIADOS', icon: '👥' },
    { nome: 'SUPORTE', icon: '💬' },
    { nome: 'HISTÓRICO DA CONTA', icon: '🕒' },
    { nome: 'CONFIGURAÇÕES', icon: '⚙️' }
  ];

  return (
    <div className="max-w-[1400px] mx-auto p-4 animate-in fade-in pb-20">
      
      <ProfileHeader 
        nome={nomeFinal} 
        avatar={avatarFinal} 
        nivel={nivel} 
        progresso={progresso} 
        xpParaProximo={xpParaProximo} 
        tradeUrl={tradeUrl} 
        saldo={saldo} 
        setView={setView} 
      />

      {/* Tabs de Navegação */}
      <div className="flex flex-wrap gap-x-2 gap-y-2 mb-6 border-b border-white/5 pb-0">
        {abas.map((aba) => (
          <button
            key={aba.nome}
            onClick={() => setActiveTab(aba.nome)}
            className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative
              ${activeTab === aba.nome ? 'text-[#84c13a]' : 'text-zinc-500 hover:text-white hover:bg-white/5 rounded-t-lg'}`}
          >
            <span className="text-sm grayscale opacity-70">{aba.icon}</span> {aba.nome}
            {activeTab === aba.nome && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#84c13a] shadow-[0_0_10px_rgba(132,193,58,0.5)]"></div>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'INVENTÁRIO' && (
        <ProfileInventory 
          inventario={inventario} 
          setInventario={setInventario} 
          setSaldo={setSaldo} 
          setView={setView} 
        />
      )}

      {activeTab !== 'INVENTÁRIO' && (
        <div className="bg-[#1b1b1e] rounded-xl border border-white/5 p-24 text-center animate-in fade-in">
          <span className="text-5xl block mb-6 opacity-30 grayscale">{abas.find(a => a.nome === activeTab)?.icon}</span>
          <h3 className="text-white font-black uppercase tracking-widest mb-2 text-lg">{activeTab}</h3>
          <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">Página em construção</p>
        </div>
      )}

    </div>
  );
}