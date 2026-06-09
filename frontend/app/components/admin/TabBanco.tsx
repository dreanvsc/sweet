'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function TabBanco() {
  const [alvoId, setAlvoId] = useState('');
  const [valorDepositado, setValorDepositado] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [historico, setHistorico] = useState<any[]>([]);
  const [operacao, setOperacao] = useState<'adicionar' | 'remover'>('adicionar');

  // Valores rápidos
  const valoresRapidos = [5, 10, 25, 50, 100, 250];

  // Busca info do jogador ao digitar o ID
  useEffect(() => {
    if (!alvoId || alvoId.length < 1) { setUserInfo(null); return; }
    const delay = setTimeout(async () => {
      setLoadingUser(true);
      try {
        const res = await fetch(`https://sweet-7ifa.onrender.com/utilizador/${alvoId}`);
        const data = await res.json();
        if (data?.id) setUserInfo(data);
        else setUserInfo(null);
      } catch { setUserInfo(null); }
      setLoadingUser(false);
    }, 500);
    return () => clearTimeout(delay);
  }, [alvoId]);

  const injetarSaldo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alvoId || !valorDepositado) return toast.error('Preenche todos os campos!');
    if (parseFloat(valorDepositado) <= 0) return toast.error('O valor tem de ser positivo!');

    setLoading(true);
    try {
      const valorFinal = operacao === 'remover' 
        ? -Math.abs(parseFloat(valorDepositado))
        : Math.abs(parseFloat(valorDepositado));

      const res = await fetch('https://sweet-7ifa.onrender.com/admin/injetar-saldo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: localStorage.getItem('userId'),
          alvoId,
          valor: valorFinal
        })
      });
      
      const data = await res.json();
      
      if (data.sucesso) {
        const emoji = operacao === 'adicionar' ? '💰' : '💸';
        const acao = operacao === 'adicionar' ? 'adicionaste' : 'removeste';
        toast.success(`${emoji} SUCESSO! ${acao} ${Math.abs(parseFloat(valorDepositado)).toFixed(2)}€ na conta de ${userInfo?.nome || `Jogador #${alvoId}`}`);
        
        // Adiciona ao histórico local
        setHistorico(prev => [{
          id: Date.now(),
          nome: userInfo?.nome || `Jogador #${alvoId}`,
          avatar: userInfo?.avatar,
          valor: valorFinal,
          hora: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
        }, ...prev].slice(0, 5));

        setValorDepositado('');
        // Atualiza info do user
        if (userInfo) setUserInfo({ ...userInfo, saldo: data.novoSaldo });
      } else {
        toast.error(data.erro || 'Erro ao modificar saldo.');
      }
    } catch (err) {
      toast.error('Erro de ligação ao servidor.');
    }
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 w-full">
      
      {/* CABEÇALHO */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <span className="text-3xl">🏦</span>
        </div>
        <div>
          <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">Banco Central</h3>
          <p className="text-emerald-500 text-[10px] font-bold tracking-widest uppercase mt-1">Gestão Manual de Saldos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* PAINEL ESQUERDO: FORMULÁRIO */}
        <div className="bg-[#0e0e11] border border-white/5 rounded-3xl p-6 flex flex-col gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>

          {/* Operação: Adicionar / Remover */}
          <div>
            <label className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-3 block">Operação</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOperacao('adicionar')}
                className={`py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${operacao === 'adicionar' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-black/30 border-white/5 text-zinc-500 hover:border-white/20'}`}
              >
                ➕ Adicionar
              </button>
              <button
                onClick={() => setOperacao('remover')}
                className={`py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${operacao === 'remover' ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-black/30 border-white/5 text-zinc-500 hover:border-white/20'}`}
              >
                ➖ Remover
              </button>
            </div>
          </div>

          {/* ID do Jogador */}
          <div>
            <label className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-2 block">ID do Jogador</label>
            <input 
              type="number" 
              value={alvoId} 
              onChange={(e) => setAlvoId(e.target.value)} 
              placeholder="Ex: 5"
              className="w-full bg-black/50 border border-white/10 text-white font-mono font-black text-lg rounded-xl p-4 outline-none focus:border-emerald-500 transition-colors shadow-inner placeholder:text-zinc-700" 
            />
          </div>

          {/* Preview do jogador */}
          <div className={`rounded-xl border p-3 transition-all min-h-[60px] flex items-center ${userInfo ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-black/20 border-white/5'}`}>
            {loadingUser ? (
              <div className="flex items-center gap-2 w-full">
                <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse"></div>
                <div className="h-3 bg-white/5 rounded animate-pulse flex-1"></div>
              </div>
            ) : userInfo ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <img src={userInfo.avatar} className="w-9 h-9 rounded-lg border border-white/10" alt="" onError={(e: any) => { e.currentTarget.src = '/skins/glock.png'; }} />
                  <div>
                    <p className="text-white text-xs font-black">{userInfo.nome}</p>
                    <p className="text-zinc-500 text-[10px] font-bold">ID #{userInfo.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Saldo atual</p>
                  <p className="text-emerald-400 font-black text-sm font-mono">{Number(userInfo.saldo).toFixed(2)}€</p>
                </div>
              </div>
            ) : (
              <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest w-full text-center">
                {alvoId ? 'Jogador não encontrado' : 'Insere o ID para ver o jogador'}
              </p>
            )}
          </div>

          {/* Valor */}
          <div>
            <label className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-2 block">Valor (€)</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {valoresRapidos.map(v => (
                <button
                  key={v}
                  onClick={() => setValorDepositado(v.toString())}
                  className={`py-2 rounded-lg text-xs font-black uppercase transition-all border ${valorDepositado === v.toString() ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-black/30 border-white/5 text-zinc-500 hover:border-white/20 hover:text-white'}`}
                >
                  {v}€
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-lg">€</span>
              <input 
                type="number" 
                step="0.01"
                value={valorDepositado} 
                onChange={(e) => setValorDepositado(e.target.value)} 
                placeholder="0.00"
                className="w-full bg-black/50 border border-white/10 text-emerald-400 font-black text-xl rounded-xl p-4 pl-10 outline-none focus:border-emerald-500 transition-colors shadow-inner placeholder:text-zinc-700" 
              />
            </div>
          </div>

          {/* Botão */}
          <button 
            onClick={injetarSaldo}
            disabled={loading || !userInfo || !valorDepositado}
            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed ${
              operacao === 'adicionar' 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
            }`}
          >
            {loading ? 'A PROCESSAR...' : operacao === 'adicionar' ? `💰 ADICIONAR ${valorDepositado ? parseFloat(valorDepositado).toFixed(2) : '0.00'}€` : `💸 REMOVER ${valorDepositado ? parseFloat(valorDepositado).toFixed(2) : '0.00'}€`}
          </button>
        </div>

        {/* PAINEL DIREITO: HISTÓRICO */}
        <div className="bg-[#0e0e11] border border-white/5 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 bg-amber-500/5 blur-3xl rounded-full pointer-events-none"></div>
          
          <h4 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2 relative z-10">
            <span>📋</span> Histórico desta Sessão
          </h4>

          {historico.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 border-2 border-dashed border-white/5 rounded-2xl py-12">
              <span className="text-4xl mb-3 opacity-30">🏦</span>
              <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma operação ainda</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 relative z-10">
              {historico.map((op) => (
                <div key={op.id} className={`flex items-center justify-between p-3 rounded-xl border ${op.valor > 0 ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                  <div className="flex items-center gap-3">
                    <img src={op.avatar} className="w-8 h-8 rounded-lg border border-white/10" alt="" onError={(e: any) => { e.currentTarget.src = '/skins/glock.png'; }} />
                    <div>
                      <p className="text-white text-xs font-black">{op.nome}</p>
                      <p className="text-zinc-600 text-[9px] font-bold">{op.hora}</p>
                    </div>
                  </div>
                  <span className={`font-black text-sm font-mono ${op.valor > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {op.valor > 0 ? '+' : ''}{op.valor.toFixed(2)}€
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Dica */}
          <div className="mt-auto bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 relative z-10">
            <p className="text-[10px] text-amber-500/70 font-bold uppercase tracking-widest mb-1">⚠️ Atenção</p>
            <p className="text-[10px] text-zinc-500">Todas as operações são registadas no histórico do jogador. Usa com responsabilidade.</p>
          </div>
        </div>
      </div>
    </div>
  );
}