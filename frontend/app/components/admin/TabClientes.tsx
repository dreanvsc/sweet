'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast'; // 🔥 Import adicionado

export default function TabClientes() {
  const [users, setUsers] = useState<any[]>([]);
  const [editSaldo, setEditSaldo] = useState<{ [key: string]: string }>({});
  const [userEspiado, setUserEspiado] = useState<any>(null);

  useEffect(() => {
    fetch('https://sweet-7ifa.onrender.com/admin/utilizadores')
      .then(res => res.json())
      .then(setUsers)
      .catch(() => toast.error('Erro ao carregar clientes.'));
  }, []);

  const handleAtualizarSaldo = async (userId: number) => {
    const novoSaldo = editSaldo[userId];
    if (!novoSaldo) return toast.error("Insere um valor válido!");

    const toastId = toast.loading("A atualizar saldo...");
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/admin/utilizador/saldo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, novoSaldo: parseFloat(novoSaldo) })
      });
      if (res.ok) {
        toast.success('💰 Saldo atualizado com sucesso!', { id: toastId });
        setUsers(users.map(u => u.id === userId ? { ...u, saldo: parseFloat(novoSaldo) } : u));
        setEditSaldo({ ...editSaldo, [userId]: '' });
      } else {
        toast.error('❌ Falha ao atualizar saldo.', { id: toastId });
      }
    } catch (e) { toast.error('❌ Erro de ligação ao servidor.', { id: toastId }); }
  };

  const getInventarioProcessado = (inv: any) => {
    let skins = [];
    if (typeof inv === 'string') { try { skins = JSON.parse(inv); } catch { skins = []; } } else if (Array.isArray(inv)) { skins = inv; }
    const valorTotal = skins.reduce((acc: number, skin: any) => acc + (parseFloat(skin.preco || skin.valor) || 0), 0);
    return { skins, valorTotal };
  };

  return (
    <div className="animate-in fade-in relative space-y-6">
      <div className="bg-[#121215]/80 backdrop-blur-sm border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>
        
        <h3 className="text-xl font-black uppercase mb-6 text-white border-b border-white/5 pb-4 flex items-center gap-3 relative z-10">
          <span className="text-2xl drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">👥</span> Gestão de Clientes
        </h3>
        
        <div className="overflow-x-auto custom-scrollbar relative z-10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-zinc-500 uppercase tracking-widest text-[10px] border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 rounded-tl-xl font-black">ID</th>
                <th className="p-4 font-black">Jogador</th>
                <th className="p-4 font-black">Inventário</th>
                <th className="p-4 font-black">Ações</th>
                <th className="p-4 font-black">Saldo Atual</th>
                <th className="p-4 rounded-tr-xl font-black">Injetar Saldo</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const { skins } = getInventarioProcessado(user.inventario);
                return (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 font-mono text-zinc-500 font-bold group-hover:text-blue-400 transition-colors">#{user.id}</td>
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      <img src={user.avatar || '/skins/glock.png'} className="w-8 h-8 rounded-lg border border-white/10 group-hover:border-blue-500/50 transition-colors" alt="avatar" />
                      {user.nome}
                    </td>
                    <td className="p-4 text-zinc-400">
                      <span className="bg-black/50 border border-white/5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">{skins.length} skins</span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => setUserEspiado(user)} className="bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-[0_0_10px_rgba(37,99,235,0.1)] hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                        👁️ Inspecionar
                      </button>
                    </td>
                    <td className="p-4 font-mono text-emerald-400 font-black drop-shadow-md">{user.saldo.toFixed(2)}€</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <input type="number" placeholder="Novo valor..." className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 w-28 text-xs text-white focus:border-emerald-500 outline-none transition-colors shadow-inner" value={editSaldo[user.id] || ''} onChange={e => setEditSaldo({ ...editSaldo, [user.id]: e.target.value })} />
                        <button onClick={() => handleAtualizarSaldo(user.id)} className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-transform hover:scale-105 shadow-[0_0_10px_rgba(16,185,129,0.3)]">SET</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DO SPY MODE (O DOSSIER) */}
      {userEspiado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#121215] border border-blue-500/30 rounded-3xl w-full max-w-5xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40 relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={userEspiado.avatar || '/skins/glock.png'} className="w-16 h-16 rounded-xl border-2 border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]" alt="avatar" />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[#121215] text-[10px]">🕵️</div>
                </div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter drop-shadow-md">
                    Dossier: <span className="text-blue-400">{userEspiado.nome}</span>
                  </h3>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">ID Cliente: #{userEspiado.id}</p>
                </div>
              </div>
              <button onClick={() => setUserEspiado(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-all font-black">✕</button>
            </div>

            <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white/[0.02] border border-emerald-500/20 rounded-2xl p-6 flex flex-col justify-center items-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-2">Saldo em Conta</span>
                  <span className="text-4xl font-mono text-emerald-400 font-black drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">{userEspiado.saldo.toFixed(2)}€</span>
                </div>
                <div className="bg-white/[0.02] border border-blue-500/20 rounded-2xl p-6 flex flex-col justify-center items-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-2">Valor do Inventário</span>
                  <span className="text-4xl font-mono text-blue-400 font-black drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    {getInventarioProcessado(userEspiado.inventario).valorTotal.toFixed(2)}€
                  </span>
                </div>
              </div>

              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <span>🎒</span> Mochila do Jogador <span className="text-zinc-500">({getInventarioProcessado(userEspiado.inventario).skins.length} itens)</span>
              </h4>
              
              {getInventarioProcessado(userEspiado.inventario).skins.length === 0 ? (
                <div className="text-center py-12 bg-black/40 rounded-2xl border border-dashed border-white/10 mb-8">
                  <span className="text-4xl opacity-30 block mb-3">🕸️</span>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">O inventário está limpo.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-8">
                  {getInventarioProcessado(userEspiado.inventario).skins.map((skin: any, idx: number) => (
                    <div key={idx} className="bg-black/60 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center relative group hover:border-blue-500/50 transition-colors">
                      <div className="absolute top-2 right-2 text-[8px] font-black px-1.5 py-0.5 rounded bg-white/10 text-white uppercase backdrop-blur-md z-10">
                        {skin.raridade || 'Comum'}
                      </div>
                      <img src={skin.imagem || skin.image} className="w-12 h-12 object-contain mb-3 drop-shadow-md group-hover:scale-110 transition-transform" alt="skin" />
                      <p className="text-[9px] font-bold text-zinc-300 truncate w-full group-hover:text-white transition-colors">{skin.nome}</p>
                      <p className="text-[10px] font-mono text-emerald-400 font-black mt-1">{parseFloat(skin.preco || skin.valor).toFixed(2)}€</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-white/10 pt-8">
                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="text-amber-500">📜</span> Registo de Atividades
                </h4>
                {userEspiado.historicoJogo && userEspiado.historicoJogo.length > 0 ? (
                  <div className="bg-black/60 border border-white/5 rounded-2xl overflow-hidden shadow-inner">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.02]">
                        <tr className="text-zinc-500 uppercase tracking-widest text-[9px] border-b border-white/5">
                          <th className="p-4 pl-6 font-black">Data</th>
                          <th className="p-4 font-black">Local</th>
                          <th className="p-4 font-black">Detalhe da Jogada</th>
                          <th className="p-4 font-black text-right pr-6">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {userEspiado.historicoJogo.map((jogada: any) => (
                          <tr key={jogada.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 pl-6 text-zinc-500 font-mono text-[10px]">
                              {new Date(jogada.data).toLocaleDateString('pt-PT')} <br/>
                              <span className="text-zinc-600">{new Date(jogada.data).toLocaleTimeString('pt-PT', {hour: '2-digit', minute:'2-digit'})}</span>
                            </td>
                            <td className="p-4 font-black text-white uppercase tracking-widest text-[10px]">{jogada.acao}</td>
                            <td className="p-4 text-zinc-400 text-[10px]">{jogada.detalhe}</td>
                            <td className={`p-4 font-mono font-black text-right pr-6 text-sm ${jogada.tipo === 'GANHO' ? 'text-emerald-400' : 'text-red-500'}`}>
                              {jogada.tipo === 'GANHO' ? '+' : '-'}{jogada.valor.toFixed(2)}€
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-black/40 rounded-2xl border border-dashed border-white/10 text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                    Ainda não há registos de atividade.
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}