// @ts-nocheck
'use client';
/* eslint-disable */
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LiveDrops from './components/LiveDrops';
import Sidebar from './components/Sidebar';
import CaseOpening from './components/case-opening/CaseOpening';
import Upgrader from './components/upgrader/Upgrader';
import Profile from './components/profile/Profile';
import Admin from './components/admin/Admin';
import CaseBattles from './components/battles/CaseBattles';
import Coinflip from './components/coinflip/Coinflip'; 
import Giveaways from './components/Giveaways';

function HomeContent() {
  const [view, setView] = useState<'store' | 'opening' | 'upgrader' | 'daily' | 'profile'| 'admin' | 'battles' | 'coinflip' | 'giveaways'>('store');
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

  // 🔥 BANNER DINÂMICO
  const [banner, setBanner] = useState({
    imagem: 'https://cdn.cloudflare.steamstatic.com/apps/csgo/images/csgo_react/social/cs2.jpg',
    titulo: 'HIGH RISK ZONE',
    descricao: 'Abre as caixas exclusivas deste evento e aumenta as tuas probabilidades de sacar facas lendárias. Termina em breve!',
    ativo: true
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  const nivel = Math.floor(xp / 100) + 1;
  const progressoNivel = xp % 100;

  // 🔥 BUSCA O BANNER DA BD
  useEffect(() => {
    fetch('https://sweet-7ifa.onrender.com/admin/banner')
      .then(res => res.json())
      .then(data => { if (data?.titulo) setBanner(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const caixaIdNoLink = searchParams.get('caixa');
    if (caixaIdNoLink && caixasDaLoja.length > 0) {
      const caixaParaAbrir = caixasDaLoja.find((c: any) => c.id === Number(caixaIdNoLink));
      if (caixaParaAbrir) {
        setCaixaSelecionada(caixaParaAbrir);
        setView('opening');
      }
    }
  },
   [searchParams, caixasDaLoja]);

  useEffect(() => {
    if (view !== 'opening') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('caixa')) {
        url.searchParams.delete('caixa');
        window.history.replaceState({}, document.title, url.toString());
      }
    }
  }, [view]); 


  useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const tokenGuardado = token || localStorage.getItem('token');

  if (tokenGuardado) {
    localStorage.setItem('token', tokenGuardado);
    // Busca o userId a partir do token
    fetch('https://sweet-7ifa.onrender.com/auth/me', {
      headers: { 'Authorization': `Bearer ${tokenGuardado}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data?.id) {
          setUserId(String(data.id));
          setUserData(data);
          setSaldo(data.saldo);
        }
      });
    if (token) window.history.replaceState({}, document.title, window.location.pathname);
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

  useEffect(() => {
    const ping = () => fetch('https://sweet-7ifa.onrender.com/config').catch(() => {});
    ping();
    const intervalo = setInterval(ping, 10 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, []);

  const caixasEvento = caixasDaLoja.filter((c: any) => c.isEvento === true);
  const caixasNormais = caixasDaLoja.filter((c: any) => c.isEvento !== true);

  return (
    <main className="min-h-screen bg-[#0b0b0d] text-zinc-200 font-sans flex flex-col overflow-x-hidden w-full max-w-[100vw]">
      <LiveDrops drops={liveDrops} />

      <div className="flex flex-1 relative w-full">
        <Sidebar view={view} setView={setView} nivel={nivel} progressoNivel={progressoNivel} saldo={saldo} userId={userId} userData={userData} />

        <section className="flex-1 ml-0 lg:ml-56 p-4 sm:p-6 md:p-8 w-full lg:max-w-[calc(100%-14rem)] flex flex-col min-h-screen">
          
          {view === 'store' && (
            <div className="w-full max-w-[1500px] mx-auto animate-in fade-in pb-16">
              
              {/* 🔥 BANNER DINÂMICO */}
              {banner.ativo && (
                <div className="w-full relative rounded-2xl overflow-hidden mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group border border-white/5 cursor-pointer mt-2">
                  <img 
                    src={banner.imagem}
                    alt="Banner Evento" 
                    className="w-full h-[200px] md:h-[300px] lg:h-[350px] object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d] via-black/40 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-10">
                    <div className="bg-yellow-500 text-black text-[10px] md:text-xs font-black px-2 py-1 rounded-sm uppercase tracking-widest w-max mb-3">
                      Evento Limitado
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg">
                      {banner.titulo}
                    </h1>
                    <p className="hidden md:block text-zinc-300 font-medium mt-2 max-w-lg text-sm">
                      {banner.descricao}
                    </p>
                  </div>
                </div>
              )}

              {/* CAIXAS DO EVENTO */}
              <div className="mb-16">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  {caixasEvento.map((c: any, i: number) => (
                    <div 
                      key={c.id || i} 
                      onClick={() => {
                        router.push(`/?caixa=${c.id}`, { scroll: false });
                        setCaixaSelecionada(c);
                        setView('opening');
                      }}
                      className="relative h-40 sm:h-48 md:h-56 bg-[#1a1a21] border border-yellow-500/40 rounded-xl group hover:-translate-y-1 hover:border-yellow-400 hover:shadow-[0_8px_25px_rgba(234,179,8,0.3)] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-end"
                    >
                      <div className="absolute top-0 left-0 bg-yellow-500 text-black text-[9px] font-black px-2 py-1 rounded-br-lg uppercase z-20">
                        EVENTO
                      </div>
                      {c.imagem && (
                        <img 
                          src={c.imagem} 
                          alt={c.nome} 
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 z-0" 
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d]/50 to-transparent z-10"></div>
                      <div className="relative z-20 w-full p-3 flex flex-col items-center">
                        <span className="text-zinc-100 text-[11px] sm:text-xs font-black uppercase tracking-widest truncate w-full text-center drop-shadow-md">
                          {c.nome}
                        </span>
                        <div className="w-6 h-[2px] bg-yellow-500/80 my-2 rounded-full"></div>
                        <div className="bg-black/60 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-md flex items-center justify-center gap-1.5 w-max">
                          <span className="text-yellow-500 text-[10px] font-black">€</span>
                          <span className="text-white font-bold text-xs sm:text-sm">
                            {Number(c.preco).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RESTO DA LOJA */}
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
                        onClick={() => {
                          router.push(`/?caixa=${c.id}`, { scroll: false });
                          setCaixaSelecionada(c);
                          setView('opening');
                        }}
                        className="relative h-40 sm:h-48 md:h-56 bg-[#1a1a21] border border-white/10 rounded-xl group hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-[0_8px_25px_rgba(16,185,129,0.2)] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-end"
                      >
                        {c.imagem && (
                          <img 
                            src={c.imagem} 
                            alt={c.nome} 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 z-0" 
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d]/50 to-transparent z-10"></div>
                        <div className="relative z-20 w-full p-3 flex flex-col items-center">
                          <span className="text-zinc-100 text-[11px] sm:text-xs font-black uppercase tracking-widest truncate w-full text-center drop-shadow-md">
                            {c.nome}
                          </span>
                          <div className="w-6 h-[2px] bg-emerald-500/80 my-2 rounded-full"></div>
                          <div className="bg-black/60 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-md flex items-center justify-center gap-1.5 w-max group-hover:bg-emerald-500/10 transition-colors">
                            <span className="text-emerald-500 text-[10px] font-black">€</span>
                            <span className="text-white font-bold text-xs sm:text-sm">
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
            <CaseOpening 
              caixaSelecionada={caixaSelecionada} 
              saldo={saldo} 
              setSaldo={setSaldo} 
              setXp={setXp} 
              setView={setView} 
              setInventario={setInventario} 
              userId={userId} 
              addDropToFeed={() => {}} 
            />
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

          {view === 'admin' && <Admin userId={userId} />}

          {view === 'battles' && (
            <CaseBattles userId={userId} user={{ id: userId, nome: userData?.nome || "Jogador", avatar: userData?.avatar || "/skins/glock.png" }} saldo={saldo} caixas={caixasDaLoja} setView={setView} atualizarTudo={atualizarTudo} />
          )}

          {view === 'coinflip' && (
            <Coinflip userId={userId} user={{ id: userId, nome: userData?.nome || "Jogador", avatar: userData?.avatar || "/skins/glock.png" }} saldo={saldo} inventario={inventario || []} atualizarTudo={atualizarTudo} />
          )}

          {view === 'giveaways' && <Giveaways userId={userId} setView={setView} />}

        </section>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}