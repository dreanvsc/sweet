'use client';

import React, { useState, useEffect } from 'react';

interface Skin {
  id: number;
  nome: string;
  imagem: string;
  valor: number;
  // outros campos que existirem...
}

interface Giveaway {
  id: number;
  premioNome: string;
  premioImagem: string;
  valor: number;
  depositoMinimo: number;
  diasDeposito: number;
  terminaEm: string;
  status: 'ATIVO' | 'TERMINADO';
  _count?: { participantes: number };
}

export default function TabGiveaways() {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [skins, setSkins] = useState<Skin[]>([]);
  const [loadingSkins, setLoadingSkins] = useState(true);
  const [loadingGiveaways, setLoadingGiveaways] = useState(true);
  const [manualMode, setManualMode] = useState(false); // Modo manual ativado?
  const [formData, setFormData] = useState({
    skinId: '',           // ID da skin selecionada (modo automático)
    premioNome: '',
    premioImagem: '',
    valor: 0,
    depositoMinimo: 0,
    diasDeposito: 0,
    terminaEm: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar lista de skins disponíveis
  const fetchSkins = async () => {
    try {
      setLoadingSkins(true);
      const response = await fetch('https://sweet-7ifa.onrender.com/items'); // Ajusta o endpoint se necessário
      if (!response.ok) throw new Error('Erro ao carregar skins');
      const data = await response.json();
      setSkins(data);
    } catch (error) {
      console.error('Erro ao carregar skins:', error);
      setMessage({ type: 'error', text: 'Falha ao carregar lista de skins. Usa o modo manual.' });
      setManualMode(true);
    } finally {
      setLoadingSkins(false);
    }
  };

  // Buscar sorteios ativos
  const fetchGiveaways = async () => {
    try {
      setLoadingGiveaways(true);
      const response = await fetch('https://sweet-7ifa.onrender.com/giveaways/ativos');
      if (!response.ok) throw new Error('Erro ao carregar sorteios');
      const data = await response.json();
      setGiveaways(data);
    } catch (error) {
      console.error('Erro ao carregar sorteios:', error);
      setMessage({ type: 'error', text: 'Falha ao carregar sorteios ativos.' });
    } finally {
      setLoadingGiveaways(false);
    }
  };

  useEffect(() => {
    fetchSkins();
    fetchGiveaways();
  }, []);

  // Quando uma skin é selecionada, preenche os campos automaticamente
  const handleSkinSelect = (skinId: string) => {
    const selectedSkin = skins.find(skin => skin.id.toString() === skinId);
    if (selectedSkin) {
      setFormData({
        ...formData,
        skinId,
        premioNome: selectedSkin.nome,
        premioImagem: selectedSkin.imagem,
        valor: selectedSkin.valor,   // opcional: usar valor da skin
      });
    }
  };

  // Criar sorteio
  const handleCreateGiveaway = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // Validação
    if (!formData.premioNome || !formData.premioImagem || formData.valor <= 0 || !formData.terminaEm) {
      setMessage({ type: 'error', text: 'Preenche todos os campos obrigatórios corretamente.' });
      setIsSubmitting(false);
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
        skinId: '',
        premioNome: '',
        premioImagem: '',
        valor: 0,
        depositoMinimo: 0,
        diasDeposito: 0,
        terminaEm: '',
      });
      setManualMode(false);
      fetchGiveaways(); // recarregar lista
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao criar sorteio.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forçar finalização
  const handleFinalizeGiveaway = async (id: number, nome: string) => {
    if (!confirm(`Tens a certeza que queres finalizar o sorteio "${nome}" agora?`)) return;

    try {
      const response = await fetch(`https://sweet-7ifa.onrender.com/giveaways/admin/finalizar/${id}`, {
        method: 'POST',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao finalizar sorteio');

      setMessage({ type: 'success', text: `Sorteio "${nome}" finalizado!` });
      fetchGiveaways();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao finalizar sorteio.' });
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">📦 Criar Novo Sorteio</h3>
          <button
            type="button"
            onClick={() => setManualMode(!manualMode)}
            className="text-xs text-amber-400 hover:text-amber-300 underline"
          >
            {manualMode ? '← Voltar à seleção automática' : '✍️ Inserir manualmente'}
          </button>
        </div>

        <form onSubmit={handleCreateGiveaway} className="space-y-4">
          {!manualMode ? (
            // MODO AUTOMÁTICO: selecionar skin do catálogo
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Escolher Skin *</label>
                {loadingSkins ? (
                  <div className="text-zinc-400">A carregar skins...</div>
                ) : (
                  <select
                    value={formData.skinId}
                    onChange={(e) => handleSkinSelect(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500"
                    required
                  >
                    <option value="">-- Seleciona uma skin --</option>
                    {skins.map((skin) => (
                      <option key={skin.id} value={skin.id}>
                        {skin.nome} - {skin.valor}€
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Pré-visualização da skin selecionada */}
              {formData.skinId && formData.premioImagem && (
                <div className="flex items-center gap-4 p-3 bg-black/30 rounded-lg border border-white/5">
                  <img src={formData.premioImagem} alt={formData.premioNome} className="w-12 h-12 rounded object-cover" />
                  <div>
                    <p className="text-white font-bold">{formData.premioNome}</p>
                    <p className="text-amber-400 text-sm">{formData.valor}€</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            // MODO MANUAL: campos de texto tradicionais
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Nome do Prémio *</label>
                  <input
                    type="text"
                    value={formData.premioNome}
                    onChange={(e) => setFormData({ ...formData, premioNome: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white"
                    placeholder="Ex: Dragon Lore AWP"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">URL da Imagem *</label>
                  <input
                    type="text"
                    value={formData.premioImagem}
                    onChange={(e) => setFormData({ ...formData, premioImagem: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white"
                    placeholder="https://exemplo.com/imagem.png"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Campos comuns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Valor (€) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white"
                placeholder="Ex: 250.00"
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
                placeholder="Ex: 10.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Dias para Depósito</label>
              <input
                type="number"
                value={formData.diasDeposito}
                onChange={(e) => setFormData({ ...formData, diasDeposito: parseInt(e.target.value) })}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white"
                placeholder="Ex: 7"
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
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold py-3 rounded-lg hover:from-amber-500 hover:to-amber-400 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'A Criar...' : '🎲 Criar Sorteio'}
          </button>
        </form>
      </div>

      {/* Lista de sorteios ativos */}
      <div className="bg-[#1E1E24] rounded-xl border border-white/5 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">⚔️ Sorteios Ativos</h3>
        {loadingGiveaways ? (
          <div className="text-center text-zinc-400 py-8">A carregar sorteios...</div>
        ) : giveaways.length === 0 ? (
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