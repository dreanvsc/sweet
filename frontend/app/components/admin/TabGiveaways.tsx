'use client';

import React, { useState, useEffect } from 'react';

interface Skin {
  id: number;
  nome: string;
  imagem: string;
  preco: number;
}

interface Participante {
  id: number;
  giveawayId: number;
  userId: number;
  createdAt: string;
  user: {
    id: number;
    nome?: string;
    email?: string;
  };
}

interface Giveaway {
  id: number;
  premioNome: string;
  premioImagem: string;
  valor: number;
  depositoMinimo: number;
  diasDeposito: number;
  terminaEm: string | null;      // pode ser null no modo META (enquanto aguarda)
  status: string;                // "AGUARDANDO", "ATIVO", "TERMINADO"
  minimoParticipantes?: number;  // só para modo META
  duracaoEmHoras?: number;       // só para modo META
  _count?: { participantes: number };
  participantes?: Participante[];
}

export default function TabGiveaways() {
  // ==================== ESTADOS EXISTENTES ====================
  const [skins, setSkins] = useState<Skin[]>([]);
  const [selectedSkinId, setSelectedSkinId] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);

  // Paginação e participantes
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [expandedGiveawayId, setExpandedGiveawayId] = useState<number | null>(null);
  const [loadingParticipants, setLoadingParticipants] = useState<number | null>(null);

  // ==================== NOVOS ESTADOS (MODO DE SORTEIO) ====================
  const [tipoSorteio, setTipoSorteio] = useState<'data' | 'meta'>('data');

  // Formulário unificado
  const [formData, setFormData] = useState({
    premioNome: '',
    premioImagem: '',
    valor: 0,
    depositoMinimo: 0,
    diasDeposito: 0,
    // Modo DATA
    terminaEm: '',
    // Modo META
    participantesMinimos: 25,
    horasContagem: 24,
  });

  // ==================== BUSCA DE SKINS ====================
  useEffect(() => {
    fetch('https://sweet-7ifa.onrender.com/skins-disponiveis')
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar skins');
        return res.json();
      })
      .then(data => setSkins(data))
      .catch(err => {
        console.error(err);
        setMessage({ type: 'error', text: 'Não consegui carregar as skins da base de dados.' });
      });
  }, []);

  // ==================== BUSCA DE GIVEAWAYS ATIVOS ====================
  const fetchGiveaways = async () => {
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/giveaways/ativos');
      const data = await res.json();
      setGiveaways(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGiveaways();
  }, []);

  // ==================== PARTICIPANTES ====================
  const fetchParticipantes = async (giveawayId: number) => {
    setLoadingParticipants(giveawayId);
    try {
      const res = await fetch(`https://sweet-7ifa.onrender.com/giveaways/${giveawayId}/participantes`);
      const data = await res.json();
      setGiveaways(prev =>
        prev.map(g => (g.id === giveawayId ? { ...g, participantes: data } : g))
      );
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erro ao carregar participantes.' });
    } finally {
      setLoadingParticipants(null);
    }
  };

  const toggleParticipantes = (giveawayId: number) => {
    if (expandedGiveawayId === giveawayId) {
      setExpandedGiveawayId(null);
    } else {
      setExpandedGiveawayId(giveawayId);
      const giveaway = giveaways.find(g => g.id === giveawayId);
      if (!giveaway?.participantes) {
        fetchParticipantes(giveawayId);
      }
    }
  };

  // ==================== EVENTOS DO FORMULÁRIO ====================
  const handleSkinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const skinId = Number(e.target.value);
    const skin = skins.find(s => s.id === skinId);
    if (skin) {
      setFormData(prev => ({
        ...prev,
        premioNome: skin.nome,
        premioImagem: skin.imagem,
        valor: skin.preco,
      }));
      setSelectedSkinId(e.target.value);
    }
  };

  const handleCreateGiveaway = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validações gerais
    if (!formData.premioNome || !formData.premioImagem || formData.valor <= 0) {
      setMessage({ type: 'error', text: 'Preenche todos os campos obrigatórios (skin, valor).' });
      setLoading(false);
      return;
    }

    // Validações específicas do modo escolhido
    if (tipoSorteio === 'data' && !formData.terminaEm) {
      setMessage({ type: 'error', text: 'Define uma data de término para o modo Clássico.' });
      setLoading(false);
      return;
    }
    if (tipoSorteio === 'meta' && formData.participantesMinimos <= 0) {
      setMessage({ type: 'error', text: 'O mínimo de participantes tem de ser maior que zero.' });
      setLoading(false);
      return;
    }

    try {
      // Construir payload conforme o tipo de sorteio
      const payload: any = {
        premioNome: formData.premioNome,
        premioImagem: formData.premioImagem,
        valor: Number(formData.valor),
        depositoMinimo: Number(formData.depositoMinimo),
        diasDeposito: Number(formData.diasDeposito),
      };

      if (tipoSorteio === 'data') {
        payload.terminaEm = new Date(formData.terminaEm).toISOString();
        payload.minimoParticipantes = 0;      // zero significa que não usa meta
        payload.duracaoEmHoras = 0;
      } else {
        // Modo META: envia os campos específicos
        payload.minimoParticipantes = Number(formData.participantesMinimos);
        payload.duracaoEmHoras = Number(formData.horasContagem);
        payload.terminaEm = null;             // será calculado quando atingir a meta
      }

      const response = await fetch('https://sweet-7ifa.onrender.com/giveaways/admin/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao criar sorteio');

      setMessage({ type: 'success', text: `Sorteio "${formData.premioNome}" criado!` });
      // Limpar formulário
      setFormData({
        premioNome: '',
        premioImagem: '',
        valor: 0,
        depositoMinimo: 0,
        diasDeposito: 0,
        terminaEm: '',
        participantesMinimos: 25,
        horasContagem: 24,
      });
      setSelectedSkinId('');
      fetchGiveaways();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeGiveaway = async (id: number, nome: string) => {
    if (!confirm(`Finalizar sorteio "${nome}"?`)) return;
    try {
      const res = await fetch(`https://sweet-7ifa.onrender.com/giveaways/admin/finalizar/${id}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage({ type: 'success', text: `Sorteio "${nome}" finalizado!` });
      fetchGiveaways();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  // ==================== PAGINAÇÃO ====================
  const totalPages = Math.ceil(giveaways.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGiveaways = giveaways.slice(startIndex, startIndex + itemsPerPage);

  // ==================== RENDER ====================
  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">🎁 Sorteios Imperiais</h2>
        <p className="text-zinc-400 mt-1">Cria e gere sorteios com provably fair.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400' : 'bg-red-500/20 border border-red-500 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* ==================== FORMULÁRIO DE CRIAÇÃO (MODO CLÁSSICO / META) ==================== */}
      <div className="bg-[#1E1E24] rounded-xl border border-white/5 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">📦 Criar Novo Sorteio</h3>
        <form onSubmit={handleCreateGiveaway} className="space-y-4">
          {/* SWITCHER MODO */}
          <div className="flex bg-black/50 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setTipoSorteio('data')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
                tipoSorteio === 'data'
                  ? 'bg-emerald-500 text-black shadow-lg'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              ⏰ Clássico (Data Fixa)
            </button>
            <button
              type="button"
              onClick={() => setTipoSorteio('meta')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
                tipoSorteio === 'meta'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              👥 Hype (Meta de Pessoas)
            </button>
          </div>

          {/* SELECIONAR SKIN */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Escolher Skin *</label>
            <select
              value={selectedSkinId}
              onChange={handleSkinChange}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500"
              required
            >
              <option value="">-- Seleciona uma skin --</option>
              {skins.map((skin) => (
                <option key={skin.id} value={skin.id}>
                  {skin.nome} - {skin.preco}€
                </option>
              ))}
            </select>
          </div>

          {/* PRÉ-VISUALIZAÇÃO */}
          {selectedSkinId && formData.premioImagem && (
            <div className="flex items-center gap-4 p-3 bg-black/30 rounded-lg border border-white/5">
              <img src={formData.premioImagem} alt={formData.premioNome} className="w-12 h-12 rounded object-cover" />
              <div>
                <p className="text-white font-bold">{formData.premioNome}</p>
                <p className="text-amber-400 text-sm">{formData.valor}€</p>
              </div>
            </div>
          )}

          {/* CAMPOS COMUNS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Valor (€) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Depósito Mínimo (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.depositoMinimo}
                onChange={(e) => setFormData({ ...formData, depositoMinimo: parseFloat(e.target.value) })}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Dias para Depósito</label>
              <input
                type="number"
                value={formData.diasDeposito}
                onChange={(e) => setFormData({ ...formData, diasDeposito: parseInt(e.target.value) })}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white"
              />
            </div>
          </div>

          {/* MODO CLÁSSICO: DATA DE TÉRMINO */}
          {tipoSorteio === 'data' && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl animate-in fade-in zoom-in-95 duration-300">
              <label className="block text-sm font-medium text-emerald-400 mb-1">Data de Término *</label>
              <input
                type="datetime-local"
                value={formData.terminaEm}
                onChange={(e) => setFormData({ ...formData, terminaEm: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                required={tipoSorteio === 'data'}
              />
            </div>
          )}

          {/* MODO HYPE: META DE PARTICIPANTES + DURAÇÃO */}
          {tipoSorteio === 'meta' && (
            <div className="grid grid-cols-2 gap-4 bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl animate-in fade-in zoom-in-95 duration-300">
              <div>
                <label className="block text-sm font-medium text-purple-400 mb-1">Participantes Mínimos</label>
                <input
                  type="number"
                  min="1"
                  value={formData.participantesMinimos}
                  onChange={(e) => setFormData({ ...formData, participantesMinimos: parseInt(e.target.value) })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                  required={tipoSorteio === 'meta'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-400 mb-1">Horas Após Atingir Meta</label>
                <input
                  type="number"
                  min="1"
                  value={formData.horasContagem}
                  onChange={(e) => setFormData({ ...formData, horasContagem: parseInt(e.target.value) })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                  required={tipoSorteio === 'meta'}
                />
              </div>
              <p className="col-span-2 text-xs text-zinc-500 italic">
                O sorteio só fica ativo após atingir {formData.participantesMinimos} participantes. 
                Depois decorrerá durante {formData.horasContagem}h.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-black uppercase tracking-widest py-4 rounded-xl transition-all ${
              tipoSorteio === 'data'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-purple-500 hover:bg-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
            }`}
          >
            {loading ? 'A CRIAR...' : 'LANÇAR SORTEIO NO SITE'}
          </button>
        </form>
      </div>

      {/* ==================== LISTAGEM DE GIVEAWAYS ATIVOS (COM PAGINAÇÃO E PARTICIPANTES) ==================== */}
      <div className="bg-[#1E1E24] rounded-xl border border-white/5 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">⚔️ Sorteios Ativos</h3>
        {giveaways.length === 0 ? (
          <div className="text-center text-zinc-500 py-8">Nenhum sorteio ativo no momento.</div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedGiveaways.map((giveaway) => (
                <div key={giveaway.id} className="bg-black/30 rounded-lg border border-white/5 hover:border-amber-500/30 transition-all">
                  <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <img src={giveaway.premioImagem} alt={giveaway.premioNome} className="w-16 h-16 rounded-lg object-cover" />
                      <div>
                        <h4 className="font-bold text-white">{giveaway.premioNome}</h4>
                        <p className="text-sm text-zinc-400">
                          💎 Valor: {giveaway.valor}€ | 👥 Participantes: {giveaway._count?.participantes || 0}
                        </p>
                        {/* Exibe informações específicas do tipo de sorteio */}
                        {giveaway.minimoParticipantes && giveaway.minimoParticipantes > 0 ? (
                          // Modo META
                          <>
                            <p className="text-xs text-purple-400">
                              🎯 Meta: {giveaway.minimoParticipantes} participantes
                              {giveaway.status === 'AGUARDANDO' && ` (faltam ${Math.max(0, giveaway.minimoParticipantes - (giveaway._count?.participantes || 0))})`}
                            </p>
                            {giveaway.status === 'ATIVO' && giveaway.terminaEm && (
                              <p className="text-xs text-zinc-500">
                                ⏳ Termina: {new Date(giveaway.terminaEm).toLocaleString()}
                              </p>
                            )}
                            {giveaway.status === 'AGUARDANDO' && (
                              <p className="text-xs text-yellow-500">🔒 A aguardar participantes mínimos para iniciar contagem</p>
                            )}
                          </>
                        ) : (
                          // Modo DATA
                          giveaway.terminaEm && (
                            <p className="text-xs text-zinc-500">⏰ Termina: {new Date(giveaway.terminaEm).toLocaleString()}</p>
                          )
                        )}
                        {/* Badge de status */}
                        <div className="flex gap-2 mt-1">
                          {giveaway.status === 'AGUARDANDO' && (
                            <span className="text-yellow-400 text-[10px] bg-yellow-500/20 px-2 py-0.5 rounded-full">⏳ Aguardando</span>
                          )}
                          {giveaway.status === 'ATIVO' && (
                            <span className="text-green-400 text-[10px] bg-green-500/20 px-2 py-0.5 rounded-full">🎲 Ativo</span>
                          )}
                          {giveaway.status === 'TERMINADO' && (
                            <span className="text-red-400 text-[10px] bg-red-500/20 px-2 py-0.5 rounded-full">🏆 Terminado</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleParticipantes(giveaway.id)}
                        className="px-3 py-1.5 bg-blue-500/20 border border-blue-500 text-blue-400 rounded-lg hover:bg-blue-500/30 text-sm transition-all"
                      >
                        {expandedGiveawayId === giveaway.id ? '👁️ Ocultar' : '👥 Ver participantes'}
                      </button>
                      <button
                        onClick={() => handleFinalizeGiveaway(giveaway.id, giveaway.premioNome)}
                        className="px-3 py-1.5 bg-red-500/20 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/30 text-sm transition-all"
                      >
                        🏆 Finalizar
                      </button>
                    </div>
                  </div>

                  {/* EXPANSÃO DE PARTICIPANTES */}
                  {expandedGiveawayId === giveaway.id && (
                    <div className="border-t border-white/10 p-4 bg-black/20">
                      <h5 className="text-sm font-semibold text-white mb-3">
                        📋 Participantes ({giveaway._count?.participantes || 0})
                      </h5>
                      {loadingParticipants === giveaway.id ? (
                        <div className="text-center text-zinc-400 py-4">A carregar participantes...</div>
                      ) : giveaway.participantes && giveaway.participantes.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="text-zinc-500 border-b border-white/10">
                              <tr>
                                <th className="text-left py-2">ID</th>
                                <th className="text-left py-2">Nome</th>
                                <th className="text-left py-2">Email</th>
                                <th className="text-left py-2">Data de entrada</th>
                              </tr>
                            </thead>
                            <tbody>
                              {giveaway.participantes.map((p) => (
                                <tr key={p.id} className="border-b border-white/5">
                                  <td className="py-2 text-zinc-300">{p.userId}</td>
                                  <td className="py-2 text-white">{p.user?.nome || '—'}</td>
                                  <td className="py-2 text-zinc-300">{p.user?.email || '—'}</td>
                                  <td className="py-2 text-zinc-400">{new Date(p.createdAt).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-zinc-500 py-4">Nenhum participante ainda.</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* PAGINAÇÃO */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-zinc-300">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}