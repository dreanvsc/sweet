'use client';

import { useState, useEffect } from 'react';
import LiveDrops from './components/LiveDrops';
import Sidebar from './components/Sidebar';
import CaseOpening from './components/case-opening/CaseOpening';
import Upgrader from './components/upgrader/Upgrader';
import Profile from './components/profile/Profile';
import Admin from './components/admin/Admin';
import CaseBattles from './components/battles/CaseBattles';
import Coinflip from './components/coinflip/Coinflip'; // <-- Adicionado

export default function Home() {
  const [view, setView] = useState<'store' | 'opening' | 'upgrader' | 'daily' | 'profile'| 'admin' | 'battles' | 'coinflip'>('store');
  const [saldo, setSaldo] = useState(0.0); 
  const [xp, setXp] = useState(0);
  const [inventario, setInventario] = useState<any[]>([]); 
  const [liveDrops, setLiveDrops] = useState<any[]>([
    { name: 'AK-47', img: '/skins/ak47.png', rarity: 'Raro' },
    { name: 'Glock-18', img: '/skins/glock.png', rarity: 'Comum' }
  ]);
  const [caixaSelecionada, setCaixaSelecionada] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null); 
  const [caixasDaLoja, setCaixasDaLoja] = useState<any[]>([]);

  const nivel = Math.floor(xp / 100) + 1;
  const progressoNivel = xp % 100;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idDaSteam = urlParams.get('userId');
    const idAtivo = idDaSteam || localStorage.getItem('userId');
    
    if (idAtivo) {
      setUserId(idAtivo);
      localStorage.setItem('userId', idAtivo); 
      if (idDaSteam) window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // ====================================================================
  // 🔥 A MÁQUINA DE SINCRONIZAÇÃO (Atualiza Saldo e Skins de uma vez)
  // ====================================================================
  const atualizarTudo = () => {
    if (!userId) return;
    
    // 1. Puxa o Saldo Atualizado
    fetch(`https://sweet-7ifa.onrender.com/utilizador/${userId}`)
      .then(res => res.json())
      .then(dados => {
        if (dados) {
          setUserData(dados);
          setSaldo(dados.saldo); 
        }
      }).catch(err => console.error(err));

    // 2. Puxa a Mochila Atualizada
    fetch(`https://sweet-7ifa.onrender.com/meu-inventario/${userId}`)
      .then(res => res.json())
      .then(data => { setInventario(Array.isArray(data) ? data : []); })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (userId) atualizarTudo(); // Arranca a sincronização quando entra
  }, [userId]); 

  useEffect(() => {
    fetch('https://sweet-7ifa.onrender.com/caixas')
      .then(res => res.json())
      .then(data => {
        const caixasProntas = Array.isArray(data) ? data.map((caixa: any) => ({
          ...caixa, skins: typeof caixa.itens === 'string' ? JSON.parse(caixa.itens) : []
        })) : [];
        setCaixasDaLoja(caixasProntas);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0b0d] text-zinc-200 font-sans flex flex-col overflow-x-hidden w-full max-w-[100vw]">
      <LiveDrops drops={liveDrops} />

      <div className="flex flex-1 relative w-full">
        <Sidebar view={view} setView={setView} nivel={nivel} progressoNivel={progressoNivel} saldo={saldo} userId={userId} userData={userData} />

        <section className="flex-1 ml-0 lg:ml-56 p-4 sm:p-6 md:p-10 w-full lg:max-w-[calc(100%-14rem)] flex flex-col min-h-screen">
          
          {view === 'store' && (
            <div className="animate-in fade-in pb-20 w-full">
              <div className="mb-10 flex flex-col items-center justify-center text-center">
                <span className="text-5xl mb-4">🛒</span>
                <h2 className="text-3xl sm:text-4xl font-black italic uppercase text-white tracking-tighter">Loja do Império</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full max-w-7xl mx-auto">
                {caixasDaLoja.map((caixa) => (
  <div 
    key={caixa.id} 
    onClick={() => { setCaixaSelecionada(caixa); setView('opening'); }}
    className="relative h-72 sm:h-80 rounded-2xl overflow-hidden cursor-pointer group border border-white/10 hover:border-emerald-500/50 shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 hover:-translate-y-2"
  >
    {/* Imagem a Ocupar TUDO (object-cover estica a imagem para preencher o cartão) */}
    <img 
      src={caixa.imagem} 
      alt={caixa.nome} 
      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
    />

    {/* Sombra de Fundo (Gradient) para que o texto e os botões se leiam perfeitamente */}
    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d] via-black/30 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500"></div>

    {/* Preço (Canto Superior Direito, igual à tua referência) */}
    <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-lg z-10">
      <span className="text-white font-black text-xs sm:text-sm drop-shadow-md">
        {caixa.preco.toFixed(2)}€
      </span>
    </div>

    {/* Área de Texto e Botão (No fundo da carta) */}
    <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col items-center justify-end z-10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
      
      {/* Título da Caixa */}
      <h3 className="text-sm font-black uppercase text-white tracking-widest mb-3 drop-shadow-lg text-center">
        {caixa.nome}
      </h3>
      
      {/* Botão que acende quando o rato passa */}
      <div className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 backdrop-blur-sm border border-white/20 text-zinc-300 font-black text-[10px] uppercase tracking-widest rounded-lg transition-all duration-300 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-black group-hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]">
        Inspecionar
      </div>

    </div>
  </div>
))}
              </div>
            </div>
          )}

          {view === 'opening' && (
            <CaseOpening caixaSelecionada={caixaSelecionada} saldo={saldo} setSaldo={setSaldo} setXp={setXp} setView={setView} setInventario={setInventario} userId={userId} addDropToFeed={() => {}} />
          )}
          
          {/*  AGORA SIM, O UPGRADER ESTÁ PROTEGIDO E A RECEBER O USERID CORRETO */}
          {view === 'upgrader' && (
            <Upgrader 
              userId={userId} 
              inventario={inventario} 
              setSaldo={setSaldo} 
              setInventario={setInventario} 
              setView={setView} 
              atualizarTudo={atualizarTudo}  
            />
          )}

          {view === 'daily' && (
             <div className="max-w-4xl mx-auto w-full text-center">
                 <h2 className="text-4xl font-black italic uppercase">Bónus Diário</h2>
             </div>
          )}
          {view === 'profile' && (
            <Profile user={userData} nome={userData?.nome || userData?.username || "Patrão"} avatar={userData?.avatar || userData?.imagem || "/skins/glock.png"} inventario={inventario} saldo={saldo} setSaldo={setSaldo} nivel={nivel} xp={xp} setInventario={setInventario} userId={userId} setView={setView} />
          )}
          {view === 'admin' && ( <Admin userId={userId} /> )}

          {view === 'battles' && (
            <CaseBattles 
              userId={userId} 
              user={{ id: userId, nome: userData?.nome || "Jogador", avatar: userData?.avatar || "/skins/glock.png" }}
              saldo={saldo}
              caixas={caixasDaLoja}
              setView={setView}
              atualizarTudo={atualizarTudo} 
            />
          )}

          {view === 'coinflip' && (
            <Coinflip 
              userId={userId} 
              user={{ id: userId, nome: userData?.nome || "Jogador", avatar: userData?.avatar || "/skins/glock.png" }}
              saldo={saldo}
              inventario={inventario || []}
              atualizarTudo={atualizarTudo} 
            />
          )}

        </section>
      </div>
    </main>
  );
}