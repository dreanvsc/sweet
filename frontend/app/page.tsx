'use client';

import { useState, useEffect } from 'react';
import LiveDrops from './components/LiveDrops';
import Sidebar from './components/Sidebar';
import CaseOpening from './components/case-opening/CaseOpening';
import Upgrader from './components/upgrader/Upgrader';
import Profile from './components/profile/Profile';
import Admin from './components/admin/Admin';
import CaseBattles from './components/battles/CaseBattles';
import Coinflip from './components/coinflip/Coinflip'; 

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

  const atualizarTudo = () => {
    if (!userId) return;
    
    fetch(`https://sweet-7ifa.onrender.com/utilizador/${userId}`)
      .then(res => res.json())
      .then(dados => {
        if (dados) {
          setUserData(dados);
          setSaldo(dados.saldo); 
        }
      }).catch(err => console.error(err));

    fetch(`https://sweet-7ifa.onrender.com/meu-inventario/${userId}`)
      .then(res => res.json())
      .then(data => { setInventario(Array.isArray(data) ? data : []); })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (userId) atualizarTudo(); 
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

  // Divisão das caixas para o Layout (Evento vs Normais)
  const caixasEvento = caixasDaLoja.slice(0, 6);
  const caixasNormais = caixasDaLoja.slice(6);

  return (
    <main className="min-h-screen bg-[#0b0b0d] text-zinc-200 font-sans flex flex-col overflow-x-hidden w-full max-w-[100vw]">
      <LiveDrops drops={liveDrops} />

      <div className="flex flex-1 relative w-full">
        <Sidebar view={view} setView={setView} nivel={nivel} progressoNivel={progressoNivel} saldo={saldo} userId={userId} userData={userData} />

        <section className="flex-1 ml-0 lg:ml-56 p-4 sm:p-6 md:p-8 w-full lg:max-w-[calc(100%-14rem)] flex flex-col min-h-screen">
          
          {view === 'store' && (
            <div className="w-full max-w-[1500px] mx-auto animate-in fade-in pb-16">
              
              {/* ================================================================================= */}
              {/* 1. BANNER DO EVENTO (Key-Drop Style) */}
              {/* ================================================================================= */}
              <div className="w-full relative rounded-2xl overflow-hidden mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group border border-white/5 cursor-pointer mt-2">
                <img 
                  src="https://steamuserimages-a.akamaihd.net/ugc/2002452336336332152/9F614489DEFC1FDE2E8DF18D80BEAF64C592CBEB/" 
                  alt="Banner Evento" 
                  className="w-full h-[200px] md:h-[300px] lg:h-[350px] object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d] via-black/40 to-transparent"></div>
                
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-10">
                  <div className="bg-yellow-500 text-black text-[10px] md:text-xs font-black px-2 py-1 rounded-sm uppercase tracking-widest w-max mb-3">
                    Evento Limitado
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg">
                    High Risk Zone
                  </h1>
                  <p className="hidden md:block text-zinc-300 font-medium mt-2 max-w-lg text-sm">
                    Abre as caixas exclusivas deste evento e aumenta as tuas probabilidades de sacar facas lendárias. Termina em breve!
                  </p>
                </div>
              </div>

              {/* ================================================================================= */}
              {/* 2. CAIXAS DO EVENTO (Grelha 6 Colunas) */}
              {/* ================================================================================= */}
              <div className="mb-16">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  {caixasEvento.map((c: any, i: number) => (
                    <div 
                      key={c.id || i} 
                      onClick={() => { setCaixaSelecionada(c); setView('opening'); }}
                      className="relative bg-[#1a1a21] border border-yellow-500/30 rounded flex flex-col group hover:-translate-y-1 hover:border-yellow-400 hover:shadow-[0_8px_25px_rgba(234,179,8,0.2)] transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 bg-yellow-500 text-black text-[8px] font-black px-2 py-0.5 rounded-br uppercase z-20">
                        EVENTO
                      </div>

                      <div className="w-full flex-1 flex items-center justify-center p-2 relative mt-4 min-h-[100px]">
                        <div className="absolute inset-0 bg-yellow-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <img src={c.imagem} alt={c.nome} className="max-h-[75px] sm:max-h-[85px] object-contain relative z-10 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300" />
                      </div>

                      <div className="w-full flex flex-col items-center px-2 pb-2 z-10 mt-2">
                        <span className="text-zinc-400 text-[10px] sm:text-[11px] font-medium truncate w-full text-center group-hover:text-white transition-colors">{c.nome}</span>
                        <div className="w-4 h-[2px] bg-yellow-500/50 group-hover:bg-yellow-400 transition-colors my-1.5 rounded-full"></div>
                      </div>

                      <div className="w-full bg-[#131317] py-2 flex items-center justify-center gap-1 border-t border-white/5 mt-auto z-10">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-[#131317] text-[8px] font-black shadow-sm">€</div>
                          <span className="text-zinc-100 font-bold text-[11px] sm:text-[12px] group-hover:text-yellow-400 transition-colors">
                            {Number(c.preco).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ================================================================================= */}
              {/* 3. RESTO DA LOJA */}
              {/* ================================================================================= */}
              {caixasNormais.length > 0 && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-zinc-300">Todas as Caixas</h2>
                    <div className="h-px flex-1 bg-white/5"></div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                    {caixasNormais.map((c: any, i: number) => (
                      <div 
                        key={c.id || i} 
                        onClick={() => { setCaixaSelecionada(c); setView('opening'); }}
                        className="relative bg-[#1a1a21] border border-white/5 rounded flex flex-col group hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-[0_8px_20px_rgba(0,0,0,0.6)] transition-all duration-300 cursor-pointer overflow-hidden"
                      >
                        <div className="w-full flex-1 flex items-center justify-center p-2 relative mt-4 min-h-[100px]">
                          <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <img src={c.imagem} alt={c.nome} className="max-h-[75px] sm:max-h-[85px] object-contain relative z-10 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300" />
                        </div>

                        <div className="w-full flex flex-col items-center px-2 pb-2 z-10 mt-2">
                          <span className="text-zinc-400 text-[10px] sm:text-[11px] font-medium truncate w-full text-center group-hover:text-white transition-colors">{c.nome}</span>
                          <div className="w-4 h-[2px] bg-indigo-500/40 group-hover:bg-indigo-400 transition-colors my-1.5 rounded-full"></div>
                        </div>

                        <div className="w-full bg-[#131317] py-2 flex items-center justify-center gap-1 border-t border-white/5 mt-auto z-10">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-[#131317] text-[8px] font-black shadow-sm">€</div>
                            <span className="text-zinc-100 font-bold text-[11px] sm:text-[12px] group-hover:text-white transition-colors">
                              {Number(c.preco).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

            </div>
          )}

          {view === 'opening' && (
            <CaseOpening caixaSelecionada={caixaSelecionada} saldo={saldo} setSaldo={setSaldo} setXp={setXp} setView={setView} setInventario={setInventario} userId={userId} addDropToFeed={() => {}} />
          )}
          
          {view === 'upgrader' && (
            <Upgrader userId={userId} inventario={inventario} setSaldo={setSaldo} setInventario={setInventario} setView={setView} atualizarTudo={atualizarTudo} />
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
            <CaseBattles userId={userId} user={{ id: userId, nome: userData?.nome || "Jogador", avatar: userData?.avatar || "/skins/glock.png" }} saldo={saldo} caixas={caixasDaLoja} setView={setView} atualizarTudo={atualizarTudo} />
          )}

          {view === 'coinflip' && (
            <Coinflip userId={userId} user={{ id: userId, nome: userData?.nome || "Jogador", avatar: userData?.avatar || "/skins/glock.png" }} saldo={saldo} inventario={inventario || []} atualizarTudo={atualizarTudo} />
          )}

        </section>
      </div>
    </main>
  );
}