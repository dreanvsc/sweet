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
    fetch(`http://localhost:3000/utilizador/${userId}`)
      .then(res => res.json())
      .then(dados => {
        if (dados) {
          setUserData(dados);
          setSaldo(dados.saldo); 
        }
      }).catch(err => console.error(err));

    // 2. Puxa a Mochila Atualizada
    fetch(`http://localhost:3000/meu-inventario/${userId}`)
      .then(res => res.json())
      .then(data => { setInventario(Array.isArray(data) ? data : []); })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (userId) atualizarTudo(); // Arranca a sincronização quando entra
  }, [userId]); 

  useEffect(() => {
    fetch('http://localhost:3000/caixas')
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

        <section className="flex-1 ml-0 lg:ml-64 p-4 sm:p-6 md:p-10 w-full lg:max-w-[calc(100%-16rem)] flex flex-col min-h-screen">
          
          {view === 'store' && (
            <div className="animate-in fade-in pb-20 w-full">
              <div className="mb-10 flex flex-col items-center justify-center text-center">
                <span className="text-5xl mb-4">🛒</span>
                <h2 className="text-3xl sm:text-4xl font-black italic uppercase text-white tracking-tighter">Loja do Império</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full max-w-7xl mx-auto">
                {caixasDaLoja.map((caixa) => (
                  <div key={caixa.id} className="bg-[#121215] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center hover:border-amber-500/50 hover:bg-[#161619] transition-all group shadow-xl relative overflow-hidden w-full">
                    <img src={caixa.imagem} alt={caixa.nome} className="w-32 h-32 sm:w-40 sm:h-40 object-contain mb-6 drop-shadow-2xl group-hover:scale-110 transition-transform duration-500 relative z-10" />
                    <h3 className="text-lg font-black uppercase text-white tracking-tighter relative z-10">{caixa.nome}</h3>
                    <div className="flex items-center gap-2 mt-2 mb-6 relative z-10">
                      <span className="text-amber-500 font-black font-mono text-lg">{caixa.preco.toFixed(2)}€</span>
                    </div>
                    <button onClick={() => { setCaixaSelecionada(caixa); setView('opening'); }} className="w-full py-3 bg-white/5 hover:bg-amber-500 text-white hover:text-black font-black uppercase tracking-widest rounded-xl transition-all relative z-10" >
                      INSPECIONAR
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'opening' && (
            <CaseOpening caixaSelecionada={caixaSelecionada} saldo={saldo} setSaldo={setSaldo} setXp={setXp} setView={setView} setInventario={setInventario} userId={userId} addDropToFeed={() => {}} />
          )}
          
          {/* 🔥 AGORA SIM, O UPGRADER ESTÁ PROTEGIDO E A RECEBER O USERID CORRETO */}
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
              atualizarTudo={atualizarTudo} // 🔥 PASSAMOS A NOVA FUNÇÃO AQUI
            />
          )}

          {view === 'coinflip' && (
            <Coinflip 
              userId={userId} 
              user={{ id: userId, nome: userData?.nome || "Jogador", avatar: userData?.avatar || "/skins/glock.png" }}
              saldo={saldo}
              inventario={inventario || []}
              atualizarTudo={atualizarTudo} // 🔥 PASSAMOS A NOVA FUNÇÃO AQUI
            />
          )}

        </section>
      </div>
    </main>
  );
}