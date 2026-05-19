'use client';

import React, { useState, useEffect } from 'react';

export default function ProfileMissions({ userId }: any) {
  const [modalMissao, setModalMissao] = useState(false);
  const [links, setLinks] = useState({ tiktok: '', instagram: '', youtube: '' });
  const [loading, setLoading] = useState<string | null>(null); 
  
  const [statusPlataformas, setStatusPlataformas] = useState<any>({
    tiktok: 'LIVRE', instagram: 'LIVRE', youtube: 'LIVRE'
  });

  // 🔥 NOVO ESTADO: Guarda os preços que vêm da Base de Dados!
  const [recompensas, setRecompensas] = useState({ social: 0.09, discord: 0.03, email: 0.03, push: 0.05 });

  // 1. PUXAR O ESTADO DAS TAREFAS (F5 Seguro)
  useEffect(() => {
    if (!userId) return;
    fetch(`https://sweet-7ifa.onrender.com/missoes/status/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.erro) setStatusPlataformas(data);
      })
      .catch(err => console.error("Erro ao puxar missões:", err));
  }, [userId]);

  // 2. 🔥 PUXAR OS PREÇOS DINÂMICOS DA ADMIN!
  useEffect(() => {
    fetch('https://sweet-7ifa.onrender.com/config')
      .then(res => res.json())
      .then(data => {
        const valoresNovos = { social: 0.09, discord: 0.03, email: 0.03, push: 0.05 };
        data.forEach((item: any) => {
          if (item.chave === 'recompensa_social') valoresNovos.social = parseFloat(item.valor);
          if (item.chave === 'recompensa_discord') valoresNovos.discord = parseFloat(item.valor);
          if (item.chave === 'recompensa_email') valoresNovos.email = parseFloat(item.valor);
        });
        setRecompensas(valoresNovos); // Atualiza os preços no ecrã!
      })
      .catch(err => console.error("Erro ao puxar preços:", err));
  }, []);

  const tarefasFeitas = Object.values(statusPlataformas).filter(s => s === 'APROVADA').length;

  // 🔥 AGORA OS PREÇOS SÃO VARIÁVEIS (recompensas.social, recompensas.discord, etc)
  const missoes = [
    { id: 'push', titulo: 'Ativar notificações push', icon: '🔔', cor: 'from-purple-600 to-fuchsia-600', recompensa: recompensas.push, feito: 0, total: 1, tipo: 'auto' },
    { id: 'email', titulo: 'Adicionar endereço de e-mail', icon: '📧', cor: 'from-red-500 to-rose-700', recompensa: recompensas.email, feito: 0, total: 1, tipo: 'auto' },
    { id: 'discord', titulo: 'Junta-te ao nosso Discord', icon: '💬', cor: 'from-indigo-500 to-blue-600', recompensa: recompensas.discord, feito: 0, total: 1, tipo: 'auto' },
    { id: 'social', titulo: 'Mostra as tuas skins ganhas', icon: '🔪', cor: 'from-blue-600 to-indigo-900', recompensa: recompensas.social, feito: tarefasFeitas, total: 3, tipo: 'social' }
  ];

  const plataformas = [
    { id: 'tiktok', nome: 'TikTok', match: 'tiktok.com' },
    { id: 'instagram', nome: 'Instagram Reels', match: 'instagram.com' },
    { id: 'youtube', nome: 'YouTube Shorts', match: 'youtube.com' }
  ];

  const handleComecarMissao = (tipo: string) => {
    if (tipo === 'social') setModalMissao(true);
    else alert('Esta missão será ativada automaticamente no futuro!');
  };

  const enviarLink = async (platId: string, urlMatch: string) => {
    const linkAtual = links[platId as keyof typeof links];

    if (!linkAtual.includes(urlMatch)) {
      return alert(`Por favor, insere um link válido do ${platId}.`);
    }

    setLoading(platId); 
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/missoes/submeter-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, link: linkAtual }) 
      });
      
      const data = await res.json();
      
      if (data.sucesso) {
        alert('✅ ' + data.mensagem);
        setStatusPlataformas((prev: any) => ({ ...prev, [platId]: 'PENDENTE' }));
      } else {
        alert('❌ Erro: ' + data.mensagem); 
      }
    } catch (error) {
      alert('Erro ao ligar ao servidor.');
    }
    setLoading(null);
  };

  return (
    <div className="animate-in fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Quadro de <span className="text-amber-500">Missões</span> 🏅</h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Completa tarefas e ganha saldo grátis para abrires caixas!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {missoes.map((missao) => (
          <div key={missao.id} className="bg-[#1b1b1e] rounded-xl border border-white/5 overflow-hidden flex flex-col group hover:border-amber-500/30 transition-colors shadow-lg">
            
            <div className={`h-32 bg-gradient-to-br ${missao.cor} flex items-center justify-center relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/20"></div>
              <span className="text-6xl drop-shadow-2xl group-hover:scale-110 transition-transform duration-500 relative z-10">{missao.icon}</span>
            </div>

            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-sm font-black text-white mb-4 leading-tight">{missao.titulo}</h3>
              
              <div className="mt-auto">
                <div className="flex justify-between text-[9px] text-zinc-400 font-black uppercase tracking-widest mb-2">
                  <span>Tarefa a completar ({missao.feito} de {missao.total})</span>
                  <span className={missao.feito === missao.total ? 'text-emerald-500' : ''}>{Math.round((missao.feito / missao.total) * 100)}%</span>
                </div>
                <div className="w-full bg-black/50 h-1.5 rounded-full mb-4 overflow-hidden border border-white/5">
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${(missao.feito / missao.total) * 100}%` }}></div>
                </div>

                <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg border border-white/5 mb-4">
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Recompensa</span>
                  {/* 🔥 PREÇO DINÂMICO AQUI */}
                  <span className="text-emerald-500 font-mono font-black">{missao.recompensa.toFixed(2)}€</span>
                </div>

                <button 
                  onClick={() => handleComecarMissao(missao.tipo)}
                  disabled={missao.feito === missao.total}
                  className={`w-full py-3 font-black text-[10px] uppercase tracking-widest rounded-lg transition-colors 
                    ${missao.feito === missao.total 
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                      : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.2)]'}`}
                >
                  {missao.feito === missao.total ? 'CONCLUÍDO ✅' : missao.tipo === 'social' ? 'COMEÇAR TAREFA' : 'OBTER RECOMPENSA'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalMissao && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#161619] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
            
            <div className="bg-gradient-to-r from-blue-600 to-indigo-900 p-6 flex gap-4 items-center relative">
              <div className="bg-black/20 w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-inner border border-white/10 backdrop-blur-md">🔪</div>
              <div>
                <h2 className="text-xl font-black text-white">Mostra as tuas skins ganhas no Império</h2>
                <p className="text-blue-200 text-xs font-bold mt-1">Grava um vídeo curto (mín. 10s). Publica-o no TikTok, YouTube Shorts ou Instagram Reels.</p>
              </div>
              <button onClick={() => setModalMissao(false)} className="absolute top-4 right-4 text-white/50 hover:text-white font-black text-xl">✕</button>
            </div>

            <div className="p-6 bg-[#161619]">
              <div className="border-b border-white/5 pb-4 mb-6 flex justify-between items-center text-xs font-black uppercase tracking-widest text-zinc-500">
                <span>Plataformas Aceites</span>
                <span>Recompensa</span>
              </div>

              <div className="space-y-6">
                {plataformas.map((plat) => {
                  const status = statusPlataformas[plat.id];

                  return (
                    <div key={plat.id} className="bg-[#121215] p-5 rounded-xl border border-white/5 flex flex-col gap-4 shadow-sm relative overflow-hidden">
                      {status === 'APROVADA' && <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>}
                      {status === 'REJEITADA' && <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>}
                      
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <h4 className="text-white font-black text-sm mb-1">Publicar vídeo no {plat.nome}</h4>
                          <p className="text-zinc-500 text-[10px] font-bold">O nome "Império" deve estar visível no título ou ecrã. Tag: <span className="text-emerald-500">#ImperioDrop</span></p>
                        </div>
                        <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 shrink-0">
                           {/* 🔥 PREÇO DINÂMICO TAMBÉM DENTRO DO MODAL */}
                           <span className="text-emerald-500 font-mono font-black text-xs">{recompensas.social.toFixed(2)}€</span>
                        </div>
                      </div>

                      <div className="relative z-10">
                        {status === 'PENDENTE' ? (
                          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 py-3 rounded-lg text-center text-[10px] font-black uppercase tracking-widest">
                            ⏳ Em Análise pela Equipa...
                          </div>
                        ) : status === 'APROVADA' ? (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 py-3 rounded-lg text-center text-[10px] font-black uppercase tracking-widest">
                            ✅ Tarefa Concluída! Saldo Adicionado.
                          </div>
                        ) : status === 'REJEITADA' ? (
                           <div className="flex flex-col gap-2">
                             <div className="bg-red-500/10 border border-red-500/20 text-red-500 py-2 rounded-lg text-center text-[10px] font-black uppercase tracking-widest">
                               ❌ Link Rejeitado! Tenta outro válido.
                             </div>
                             <div className="flex gap-2">
                               <input 
                                 type="text" 
                                 value={links[plat.id as keyof typeof links]}
                                 onChange={(e) => setLinks({ ...links, [plat.id]: e.target.value })}
                                 placeholder={`https://www.${plat.match}/...`}
                                 className="flex-1 bg-black/50 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                               />
                               <button 
                                 onClick={() => enviarLink(plat.id, plat.match)}
                                 disabled={!links[plat.id as keyof typeof links] || loading === plat.id}
                                 className="bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-6 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-colors shrink-0"
                               >
                                 REENVIAR
                               </button>
                             </div>
                           </div>
                        ) : (
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={links[plat.id as keyof typeof links]}
                              onChange={(e) => setLinks({ ...links, [plat.id]: e.target.value })}
                              placeholder={`https://www.${plat.match}/@tu/video/123...`}
                              className="flex-1 bg-black/50 border border-white/5 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                            />
                            <button 
                              onClick={() => enviarLink(plat.id, plat.match)}
                              disabled={!links[plat.id as keyof typeof links] || loading === plat.id}
                              className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black px-6 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-colors shrink-0"
                            >
                              {loading === plat.id ? 'A ENVIAR...' : 'ENVIAR LINK'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}