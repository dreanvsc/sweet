import React, { useState, useEffect } from 'react';

export default function TabFabrica() {
  const [todosItens, setTodosItens] = useState<any[]>([]);
  const [pesquisa, setPesquisa] = useState('');
  const [nomeCaixa, setNomeCaixa] = useState('');
  const [precoCaixa, setPrecoCaixa] = useState('');
  const [imagemCaixa, setImagemCaixa] = useState('');
  const [ordemCaixa, setOrdemCaixa] = useState('');
  const [itensCaixa, setItensCaixa] = useState<any[]>([]); 
  const [caixasCriadas, setCaixasCriadas] = useState<any[]>([]);
  const [caixaEmEdicaoId, setCaixaEmEdicaoId] = useState<number | null>(null);

  // ESTADOS MODO IMPORTAÇÃO
  const [mostrarImportacao, setMostrarImportacao] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/itens').then(res => res.json()).then(setTodosItens).catch(console.error);
    carregarCaixas();
  }, []);

  const carregarCaixas = () => fetch('http://localhost:3000/caixas').then(res => res.json()).then(setCaixasCriadas);

  // 🔥 ESCUDO ANTI-BLOQUEIO DE IMAGENS 🔥
  const getImagemSegura = (url: string) => {
    if (!url) return '/skins/glock.png';
    if (url.includes('steam') && !url.includes('wsrv.nl')) {
      return `https://wsrv.nl/?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const adicionarItemACaixa = (item: any) => {
    if (!itensCaixa.find(i => i.id === item.id)) {
      setItensCaixa([...itensCaixa, { ...item, imagem: getImagemSegura(item.imagem), probabilidade: 0 }]);
    }
  };

  const setProbabilidadeItem = (id: number, prob: string) => {
    setItensCaixa(itensCaixa.map(i => i.id === id ? { ...i, probabilidade: parseFloat(prob) || 0 } : i));
  };

  const removerItemDaCaixa = (id: number) => setItensCaixa(itensCaixa.filter(i => i.id !== id));

  const somaProbabilidades = itensCaixa.reduce((acc, item) => acc + (parseFloat(item.probabilidade) || 0), 0);

  // 🔥 MOTOR DE IMPORTAÇÃO INTELIGENTE 🔥
  const importarJSON = () => {
    try {
      const dadosParseados = JSON.parse(jsonInput);
      if (!Array.isArray(dadosParseados)) return alert("O JSON tem de ser uma lista [ ... ]");

      const itensMapeados = dadosParseados.map((item, index) => {
        const skinOficial = todosItens.find(dbItem => dbItem.nome.toLowerCase() === item.nome.toLowerCase());
        let imagemCrua = skinOficial ? skinOficial.imagem : (item.imagem || item.image || '/skins/glock.png');

        return {
          id: skinOficial ? skinOficial.id : Date.now() + index,
          nome: item.nome,
          imagem: getImagemSegura(imagemCrua),
          preco: item.preco || (skinOficial ? skinOficial.preco : 0),
          raridade: skinOficial ? skinOficial.raridade : (item.raridade || 'Comum'),
          probabilidade: item.probabilidade || 0
        };
      });

      setItensCaixa(prev => [...prev, ...itensMapeados]);
      setJsonInput('');
      setMostrarImportacao(false);
      alert("✅ Caixa Importada com Sucesso!");
    } catch (e) { alert("❌ Erro de Sintaxe JSON."); }
  };

  const handleGuardarCaixa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itensCaixa.length === 0) return alert("A caixa precisa de ter armas!");
    if (Math.abs(somaProbabilidades - 100) > 0.1) {
      if(!window.confirm(`Atenção: As probabilidades somam ${somaProbabilidades.toFixed(2)}%. Gravar na mesma?`)) return;
    }
    
    const url = caixaEmEdicaoId ? `http://localhost:3000/admin/caixa/${caixaEmEdicaoId}` : 'http://localhost:3000/admin/caixa';
    const metodo = caixaEmEdicaoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: metodo, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomeCaixa, preco: parseFloat(precoCaixa), imagem: imagemCaixa, itens: itensCaixa, ordem: parseInt(ordemCaixa) || 0 })
      });
      if (res.ok) {
        alert(caixaEmEdicaoId ? '📦 Caixa Atualizada!' : '📦 Caixa Fabricada!');
        cancelarEdicao(); carregarCaixas();
      }
    } catch (e) { alert('❌ Erro ao guardar caixa.'); }
  };

  const iniciarEdicaoCaixa = (caixa: any) => {
    setCaixaEmEdicaoId(caixa.id); setNomeCaixa(caixa.nome); setPrecoCaixa(caixa.preco.toString()); setImagemCaixa(caixa.imagem); setOrdemCaixa(caixa.ordem?.toString() || '0');
    try {
      const itensParseados = JSON.parse(caixa.itens);
      const itensComProb = itensParseados.map((i: any) => ({...i, imagem: getImagemSegura(i.imagem || i.image), probabilidade: i.probabilidade || 0}));
      setItensCaixa(itensComProb);
    } catch (e) { setItensCaixa([]); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicao = () => {
    setCaixaEmEdicaoId(null); setNomeCaixa(''); setPrecoCaixa(''); setImagemCaixa(''); setOrdemCaixa(''); setItensCaixa([]);
  };

  const apagarCaixa = async (id: number) => {
    if (!window.confirm("⚠️ Apagar esta caixa da loja?")) return;
    try {
      const res = await fetch(`http://localhost:3000/admin/caixa/${id}`, { method: 'DELETE' });
      if (res.ok) carregarCaixas();
    } catch(e) { alert('Erro ao apagar'); }
  };

  const itensFiltrados = todosItens.filter(i => i.nome.toLowerCase().includes(pesquisa.toLowerCase())).slice(0, 12);

  return (
    <div className="animate-in fade-in grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div>
         <div className="flex justify-between items-center mb-6 border-b border-emerald-500/20 pb-4">
           <h3 className="text-xl font-black uppercase text-emerald-500 flex items-center gap-2">
             {caixaEmEdicaoId ? <><span className="text-2xl">✏️</span> Editar Caixa</> : <><span className="text-2xl">📦</span> Criar Caixa</>}
           </h3>
           <button onClick={() => setMostrarImportacao(!mostrarImportacao)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-black px-4 py-2 rounded-lg uppercase tracking-widest transition-colors">
             {mostrarImportacao ? 'FECHAR MODO JSON' : 'IMPORTAR VIA JSON ⚡'}
           </button>
         </div>

         {mostrarImportacao && (
           <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl mb-6 animate-in slide-in-from-top-4">
             <p className="text-xs text-blue-400 font-bold mb-2 uppercase tracking-widest">Cola o Código JSON aqui:</p>
             <textarea className="w-full h-32 bg-black/80 border border-blue-500/50 rounded-lg p-3 text-xs font-mono text-zinc-300 focus:border-blue-400 outline-none mb-3 custom-scrollbar" value={jsonInput} onChange={(e) => setJsonInput(e.target.value)}></textarea>
             <button onClick={importarJSON} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-lg uppercase tracking-widest transition-colors">EXTRAIR ARMAS</button>
           </div>
         )}
         
         <form onSubmit={handleGuardarCaixa} className="space-y-4">
           <div>
             <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Nome da Coleção</label>
             <input type="text" required value={nomeCaixa} onChange={e => setNomeCaixa(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white" />
           </div>
           <div className="grid grid-cols-3 gap-4">
             <div>
               <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Preço (€)</label>
               <input type="number" step="0.01" required value={precoCaixa} onChange={e => setPrecoCaixa(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white" />
             </div>
             <div>
               <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Posição</label>
               <input type="number" value={ordemCaixa} onChange={e => setOrdemCaixa(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white" />
             </div>
             <div>
               <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">URL da Imagem</label>
               <input type="text" value={imagemCaixa} onChange={e => setImagemCaixa(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white" />
             </div>
           </div>
           
           <div className="pt-4 mt-4 border-t border-white/5">
             <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2 block">Ou procurar skins manualmente</label>
             <input type="text" value={pesquisa} onChange={e => setPesquisa(e.target.value)} className="w-full bg-black/80 border border-emerald-500/30 rounded-lg p-3 text-sm text-white mb-3" placeholder="Procurar skin..." />
             <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
               {itensFiltrados.map(item => (
                 <div key={item.id} onClick={() => adicionarItemACaixa(item)} className="bg-[#161619] border border-white/5 rounded-lg p-2 cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/10 flex flex-col items-center group">
                   <img src={item.imagem} className="w-12 h-12 object-contain group-hover:scale-110" alt="skin" />
                   <span className="text-[8px] font-bold mt-1 text-zinc-400 truncate w-full text-center">{item.nome}</span>
                 </div>
               ))}
             </div>
           </div>
           
           <div className="flex gap-4 pt-4">
             <button type="submit" className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
               {caixaEmEdicaoId ? 'GUARDAR ALTERAÇÕES' : 'CRIAR CAIXA'}
             </button>
             {caixaEmEdicaoId && <button type="button" onClick={cancelarEdicao} className="px-6 py-4 bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase rounded-xl">CANCELAR</button>}
           </div>
         </form>
      </div>
      
      <div className="bg-[#161619] border border-white/5 rounded-3xl p-6 flex flex-col relative overflow-hidden">
         <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-2">
           <h4 className="text-xs font-black uppercase text-zinc-500 tracking-widest">Conteúdo da Caixa</h4>
           <div className={`px-3 py-1 rounded font-mono font-black text-xs ${Math.abs(somaProbabilidades - 100) < 0.1 ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}>
              SOMA: {somaProbabilidades.toFixed(2)}%
           </div>
         </div>

         <div className="flex-1 overflow-y-auto space-y-3 pr-2">
           {itensCaixa.map((item: any) => (
             <div key={item.id} className="flex items-center justify-between bg-black/40 border border-white/5 p-3 rounded-xl">
               <div className="flex items-center gap-3">
                 <img src={item.imagem || item.image} className="w-10 h-10 object-contain" alt="skin" />
                 <div>
                   <p className="text-[10px] font-bold text-white truncate w-32">{item.nome}</p>
                   <p className="text-[9px] font-mono text-emerald-500">{item.preco || item.valor}€</p>
                 </div>
               </div>
               
               <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                     <span className="text-[8px] text-zinc-500 font-black uppercase mb-1">CHANCE (%)</span>
                     <input type="number" step="0.01" value={item.probabilidade} onChange={(e) => setProbabilidadeItem(item.id, e.target.value)} className="w-20 bg-[#121215] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-bold text-right focus:border-emerald-500 outline-none" />
                  </div>
                  <button onClick={() => removerItemDaCaixa(item.id)} className="text-red-500 hover:bg-red-500/20 p-2 rounded-md transition-colors text-xs mt-3">🗑️</button>
               </div>
             </div>
           ))}
         </div>

         <div className="mt-6 pt-4 border-t border-white/5">
           <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3">O teu Catálogo</h4>
           <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
             {caixasCriadas.map(caixa => (
               <div key={caixa.id} className="flex-shrink-0 bg-black/60 border border-white/10 p-3 rounded-xl flex flex-col w-32 relative group">
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={() => iniciarEdicaoCaixa(caixa)} className="bg-blue-500 p-1.5 rounded-md text-white hover:bg-blue-400 transition-colors" title="Editar">✏️</button>
                    <button onClick={() => apagarCaixa(caixa.id)} className="bg-red-500 p-1.5 rounded-md text-white hover:bg-red-400 transition-colors" title="Apagar">🗑️</button>
                  </div>
                  <div className="flex flex-col items-center text-center mt-2">
                    <img src={caixa.imagem} className="w-12 h-12 object-contain mb-2 drop-shadow-md" alt={caixa.nome} />
                    <span className="text-[9px] font-bold text-white truncate w-full">{caixa.nome}</span>
                    <span className="text-[9px] text-emerald-500 font-mono">{caixa.preco}€</span>
                  </div>
               </div>
             ))}
           </div>
         </div>
      </div>
    </div>
  );
}