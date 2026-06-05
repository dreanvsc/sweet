'use client';

import React, { useState, useEffect } from 'react';

interface Skin {
  id: number;
  nome: string;
  imagem: string;
  preco: number;
}

interface Giveaway {
  id: number;
  premioNome: string;
  premioImagem: string;
  valor: number;
  depositoMinimo: number;
  diasDeposito: number;
  terminaEm: string;
  status: string;
  _count?: { participantes: number };
}

export default function TabGiveaways() {
  const [skins, setSkins] = useState<Skin[]>([]);
  const [selectedSkinId, setSelectedSkinId] = useState<string>('');
  const [formData, setFormData] = useState({
    premioNome: '',
    premioImagem: '',
    valor: 0,
    depositoMinimo: 0,
    diasDeposito: 0,
    terminaEm: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);

  // Carregar skins disponíveis
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

  // Carregar sorteios ativos (igual ao que já tinhas)
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

  // Quando seleciona uma skin, preenche o formulário automaticamente
  const handleSkinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const skinId = Number(e.target.value);
    const skin = skins.find(s => s.id === skinId);
    if (skin) {
      setFormData({
        ...formData,
        premioNome: skin.nome,
        premioImagem: skin.imagem,
        valor: skin.preco,
      });
      setSelectedSkinId(e.target.value);
    }
  };

  const handleCreateGiveaway = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!formData.premioNome || !formData.premioImagem || formData.valor <= 0 || !formData.terminaEm) {
      setMessage({ type: 'error', text: 'Preenche todos os campos obrigatórios.' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://sweet-7ifa.onrender.com/giveaways/admin/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          premioNome: formData.premioNome,
          premioImagem: formData.premioImagem,
          valor: Number(formData.valor),
          depositoMinimo: Number(formData.depositoMinimo),
          diasDeposito: Number(formData.diasDeposito),
          terminaEm: new Date(formData.terminaEm).toISOString(),
        }),
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

      {/* Formulário de criação */}
      <div className="bg-[#1E1E24] rounded-xl border border-white/5 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">📦 Criar Novo Sorteio</h3>
        <form onSubmit={handleCreateGiveaway} className="space-y-4">
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

          {/* Pré-visualização da skin selecionada */}
          {selectedSkinId && formData.premioImagem && (
            <div className="flex items-center gap-4 p-3 bg-black/30 rounded-lg border border-white/5">
              <img src={formData.premioImagem} alt={formData.premioNome} className="w-12 h-12 rounded object-cover" />
              <div>
                <p className="text-white font-bold">{formData.premioNome}</p>
                <p className="text-amber-400 text-sm">{formData.valor}€</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Data de Término *</label>
              <input
                type="datetime-local"
                value={formData.terminaEm}
                onChange={(e) => setFormData({ ...formData, terminaEm: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold py-3 rounded-lg hover:from-amber-500 hover:to-amber-400 transition-all disabled:opacity-50"
          >
            {loading ? 'A Criar...' : '🎲 Criar Sorteio'}
          </button>
        </form>
      </div>

      {/* Lista de sorteios ativos */}
      <div className="bg-[#1E1E24] rounded-xl border border-white/5 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">⚔️ Sorteios Ativos</h3>
        {giveaways.length === 0 ? (
          <div className="text-center text-zinc-500 py-8">Nenhum sorteio ativo no momento.</div>
        ) : (
          <div className="space-y-4">
            {giveaways.map((giveaway) => (
              <div key={giveaway.id} className="bg-black/30 rounded-lg p-4 border border-white/5 hover:border-amber-500/30 transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <img src={giveaway.premioImagem} alt={giveaway.premioNome} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold text-white">{giveaway.premioNome}</h4>
                      <p className="text-sm text-zinc-400">💎 Valor: {giveaway.valor}€ | 👥 Participantes: {giveaway._count?.participantes || 0}</p>
                      <p className="text-xs text-zinc-500">Termina: {new Date(giveaway.terminaEm).toLocaleString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFinalizeGiveaway(giveaway.id, giveaway.premioNome)}
                    className="px-4 py-2 bg-red-500/20 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                  >
                    🏆 Finalizar Sorteio
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}