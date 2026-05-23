'use client';

import React, { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileInventory from './ProfileInventory';
import ProfileSettings from './ProfileSettings';
import ProfileHistory from './ProfileHistory';
import ProfileSupport from './ProfileSupport';
import ProfileMissions from './ProfileMissions'; // 🔥 IMPORTA A NOVA ABA

export default function Profile({ 
  userId, saldo = 0, setSaldo, xp = 0, inventario = [], setInventario, setView, nome, avatar, user 
}: any) {
  
  const [activeTab, setActiveTab] = useState('INVENTÁRIO');
  
  const nomeFinal = nome || user?.nome || "Drean";
  const avatarFinal = avatar || user?.avatar || user?.imagem || "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/b5/b5bd56c1aa4644a474a2e4972be27ef9e82e517e_full.jpg";
  const tradeUrl = user?.tradeUrl || "https://steamcommunity.com/tradeoffer/new/?partner=1156810616&token=...";

  const abas = [
    { nome: 'INVENTÁRIO', icon: '🔫' },
    { nome: 'MISSÕES', icon: '🏅' },
    { nome: 'SUPORTE', icon: '💬' },
    { nome: 'HISTÓRICO DA CONTA', icon: '🕒' },
    { nome: 'CONFIGURAÇÕES', icon: '⚙️' }
  ];

  return (
    <div className="max-w-[1400px] mx-auto p-4 animate-in fade-in pb-20">
      
      <ProfileHeader 
        nome={nomeFinal} 
        avatar={avatarFinal} 
        userData={user} 
        userId={userId}
        tradeUrl={tradeUrl} 
        saldo={saldo} 
        setSaldo={setSaldo}
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

      {/* 🔥 Alterado: Adicionada a propriedade userData={user} para sincronizar estados com o inventário */}
      {activeTab === 'INVENTÁRIO' && <ProfileInventory inventario={inventario} setInventario={setInventario} setSaldo={setSaldo} setView={setView} userId={userId} userData={user} />}
      {activeTab === 'CONFIGURAÇÕES' && <ProfileSettings userData={user} userId={userId} />}
      {activeTab === 'HISTÓRICO DA CONTA' && <ProfileHistory userId={userId} />}
      {activeTab === 'SUPORTE' && <ProfileSupport userId={userId} />}
      
      {/* 🔥 CHAMA O NOSSO COMPONENTE LIMPO AQUI */}
      {activeTab === 'MISSÕES' && <ProfileMissions userId={userId} />}

    </div>
  );
}