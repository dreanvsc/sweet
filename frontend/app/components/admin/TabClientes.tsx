import React, { useState, useEffect } from 'react';

export default function TabClientes() {
  const [users, setUsers] = useState<any[]>([]);
  const [editSaldo, setEditSaldo] = useState<{ [key: string]: string }>({});
  const [userEspiado, setUserEspiado] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:3000/admin/utilizadores')
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  const handleAtualizarSaldo = async (userId: number) => {
    const novoSaldo = editSaldo[userId];
    if (!novoSaldo) return;
    try {
      const res = await fetch('http://localhost:3000/admin/utilizador/saldo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, novoSaldo: parseFloat(novoSaldo) })
      });
      if (res.ok) {
        alert('💰 Saldo atualizado!');
        setUsers(users.map(u => u.id === userId ? { ...u, saldo: parseFloat(novoSaldo) } : u));
        setEditSaldo({ ...editSaldo, [userId]: '' });
      }
    } catch (e) { alert('❌ Erro.'); }
  };

  const getInventarioProcessado = (inv: any) => {
    let skins = [];
    if (typeof inv === 'string') { try { skins = JSON.parse(inv); } catch { skins = []; } } else if (Array.isArray(inv)) { skins = inv; }
    const valorTotal = skins.reduce((acc: number, skin: any) => acc + (parseFloat(skin.preco || skin.valor) || 0), 0);
    return { skins, valorTotal };
  };

  return (
    <div className="animate-in fade-in relative">
      <h3 className="text-xl font-black uppercase mb-6 text-white border-b border-white/10 pb-4">Gestão de Clientes</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-zinc-500 uppercase tracking-widest text-[10px] border-b border-white/5">
              <th className="pb-3 font-black">ID</th>
              <th className="pb-3 font-black">Jogador</th>
              <th className="pb-3 font-black">Inventário</th>
              <th className="pb-3 font-black">Ações</th>
              <th className="pb-3 font-black">Saldo Atual</th>
              <th className="pb-3 font-black">Injetar Saldo</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const { skins } = getInventarioProcessado(user.inventario);
              return (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 font-mono text-zinc-500">#{user.id}</td>
                  <td className="py-4 font-bold text-white flex items-center gap-3">
                    <img src={user.avatar || '/skins/glock.png'} className="w-8 h-8 rounded-full border border-white/10" alt="avatar" />
                    {user.nome}
                  </td>
                  <td className="py-4 text-zinc-400">
                    <span className="bg-zinc-800 px-2 py-1 rounded text-xs font-bold">{skins.length} skins</span>
                  </td>
                  <td className="py-4">
                    <button onClick={() => setUserEspiado(user)} className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-lg text-xs font-black uppercase transition-colors flex items-center gap-1">
                      👁️ Inspecionar
                    </button>
                  </td>
                  <td className="py-4 font-mono text-emerald-500 font-bold">{user.saldo.toFixed(2)}€</td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <input type="number" placeholder="Novo valor..." className="bg-black/50 border border-white/10 rounded-lg px-3 py-1 w-28 text-xs text-white focus:border-emerald-500 outline-none" value={editSaldo[user.id] || ''} onChange={e => setEditSaldo({ ...editSaldo, [user.id]: e.target.value })} />
                      <button onClick={() => handleAtualizarSaldo(user.id)} className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1 rounded-lg text-xs font-black uppercase transition-colors">SET</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL DO SPY MODE */}
      {userEspiado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121215] border border-blue-500/30 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#161619]">
              <div className="flex items-center gap-4">
                <img src={userEspiado.avatar || '/skins/glock.png'} className="w-16 h-16 rounded-xl border-2 border-blue-500/50" alt="avatar" />
                <div>
                  <h3 className="text-2xl font-black italic uppercase text-white flex items-center gap-2">
                    🕵️ Dossier: {userEspiado.nome}
                  </h3>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">ID Cliente: #{userEspiado.id}</p>
                </div>
              </div>
              <button onClick={() => setUserEspiado(null)} className="text-zinc-500 hover:text-white p-2 text-2xl transition-colors">✕</button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-black/50 border border-white/5 rounded-2xl p-4">
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-1">Saldo em Conta</span>
                  <span className="text-2xl font-mono text-emerald-500 font-black">{userEspiado.saldo.toFixed(2)}€</span>
                </div>
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
                  <span className="text-[10px] text-blue-400 uppercase font-black tracking-widest block mb-1">Valor do Inventário</span>
                  <span className="text-2xl font-mono text-blue-500 font-black">
                    {getInventarioProcessado(userEspiado.inventario).valorTotal.toFixed(2)}€
                  </span>
                </div>
              </div>

              <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Mochila do Jogador ({getInventarioProcessado(userEspiado.inventario).skins.length} itens)</h4>
              
              {getInventarioProcessado(userEspiado.inventario).skins.length === 0 ? (
                <div className="text-center py-10 bg-black/20 rounded-2xl border border-dashed border-white/5">
                  <span className="text-4xl opacity-50 block mb-2">🕸️</span>
                  <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">O inventário está totalmente limpo.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {getInventarioProcessado(userEspiado.inventario).skins.map((skin: any, idx: number) => (
                    <div key={idx} className="bg-black/50 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center relative group">
                      <div className="absolute top-2 right-2 text-[8px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">
                        {skin.raridade || 'Comum'}
                      </div>
                      <img src={skin.imagem || skin.image} className="w-16 h-16 object-contain mb-3 drop-shadow-lg group-hover:scale-110 transition-transform" alt="skin" />
                      <p className="text-[10px] font-bold text-white truncate w-full">{skin.nome}</p>
                      <p className="text-xs font-mono text-emerald-500 font-black mt-1">{parseFloat(skin.preco || skin.valor).toFixed(2)}€</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-10 border-t border-white/5 pt-6">
                <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span>📜</span> Registo de Atividades
                </h4>
                {userEspiado.historicoJogo && userEspiado.historicoJogo.length > 0 ? (
                  <div className="bg-black/50 border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5">
                        <tr className="text-zinc-500 uppercase tracking-widest text-[10px]">
                          <th className="p-4 font-black">Data</th>
                          <th className="p-4 font-black">Local</th>
                          <th className="p-4 font-black">Detalhe da Jogada</th>
                          <th className="p-4 font-black text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {userEspiado.historicoJogo.map((jogada: any) => (
                          <tr key={jogada.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 text-zinc-500 font-mono">
                              {new Date(jogada.data).toLocaleDateString('pt-PT')} {new Date(jogada.data).toLocaleTimeString('pt-PT', {hour: '2-digit', minute:'2-digit'})}
                            </td>
                            <td className="p-4 font-bold text-white uppercase">{jogada.acao}</td>
                            <td className="p-4 text-zinc-400">{jogada.detalhe}</td>
                            <td className={`p-4 font-mono font-black text-right ${jogada.tipo === 'GANHO' ? 'text-emerald-500' : 'text-red-500'}`}>
                              {jogada.tipo === 'GANHO' ? '+' : '-'}{jogada.valor.toFixed(2)}€
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-black/20 rounded-2xl border border-dashed border-white/5 text-zinc-600 text-xs font-bold uppercase tracking-widest">
                    Ainda não há registos.
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