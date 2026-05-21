'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast'; // 🔥 Import adicionado

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
    fetch('https://sweet-7ifa.onrender.com/itens').then(res => res.json()).then(setTodosItens).catch(console.error);
    carregarCaixas();
  }, []);

  const carregarCaixas = () => fetch('https://sweet-7ifa.onrender.com/caixas').then(res => res.json()).then(setCaixasCriadas);

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
      if (!Array.isArray(dadosParseados)) return toast.error("O JSON tem de ser uma lista [ ... ]");

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
      toast.success("✅ Caixa Importada com Sucesso!"); // 🔥
    } catch (e) { toast.error("❌ Erro de Sintaxe JSON."); } // 🔥
  };

  const handleGuardarCaixa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itensCaixa.length === 0) return toast.error("A caixa precisa de ter armas!"); // 🔥
    if (Math.abs(somaProbabilidades - 100) > 0.1) {
      if(!window.confirm(`Atenção: As probabilidades somam ${somaProbabilidades.toFixed(3)}%. Gravar na mesma?`)) return;
    }
    
    const toastId = toast.loading("A guardar caixa..."); // 🔥
    const url = caixaEmEdicaoId ? `https://sweet-7ifa.onrender.com/admin/caixa/${caixaEmEdicaoId}` : 'https://sweet-7ifa.onrender.com/admin/caixa';
    const metodo = caixaEmEdicaoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: metodo, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomeCaixa, preco: parseFloat(precoCaixa), imagem: imagemCaixa, itens: itensCaixa, ordem: parseInt(ordemCaixa) || 0 })
      });
      if (res.ok) {
        toast.success(caixaEmEdicaoId ? '📦 Caixa Atualizada!' : '📦 Caixa Fabricada!', { id: toastId }); // 🔥
        cancelarEdicao(); carregarCaixas();
      } else {
        toast.error('❌ Falha ao processar a caixa.', { id: toastId }); // 🔥
      }
    } catch (e) { toast.error('❌ Erro de ligação ao guardar caixa.', { id: toastId }); } // 🔥
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
    if (!window.confirm("⚠️ Apagar esta caixa da loja? (Esta ação não pode ser desfeita)")) return;
    const toastId = toast.loading("A apagar...");
    try {
      const res = await fetch(`https://sweet-7ifa.onrender.com/admin/caixa/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Caixa eliminada!', { id: toastId });
        carregarCaixas();
      } else {
        toast.error('Erro ao eliminar.', { id: toastId });
      }
    } catch(e) { toast.error('Erro ao apagar', { id: toastId }); }
  };

  const itensFiltrados = todosItens.filter(i => i.nome.toLowerCase().includes(pesquisa.toLowerCase())).slice(0, 12);

  return (
    <div className="animate-in fade-in grid grid-cols-1 xl:grid-cols-2 gap-8">
      
      {/* PAINEL ESQUERDO: CONTROLO DA CAIXA */}
      <div className="bg-[#121215]/80 backdrop-blur-sm border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>

         <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4 relative z-10">
           <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
             {caixaEmEdicaoId ? <><span className="text-amber-500 text-3xl">✏️</span> Editar Caixa</> : <><span className="text-emerald-500 text-3xl">📦</span> Criar Caixa</>}
           </h3>
           <button onClick={() => setMostrarImportacao(!mostrarImportacao)} className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(37,99,235,0.15)]">
             {mostrarImportacao ? '✕ FECHAR' : 'JSON ⚡'}
           </button>
         </div>

         {mostrarImportacao && (
           <div className="bg-black/40 border border-blue-500/30 p-5 rounded-2xl mb-6 animate-in slide-in-from-top-4 relative z-10 shadow-inner">
             <p className="text-[10px] text-zinc-400 font-black mb-3 uppercase tracking-widest">Cole o JSON extraído do site concorrente:</p>
             <textarea className="w-full h-32 bg-[#0b0b0d] border border-white/10 rounded-xl p-4 text-xs font-mono text-zinc-300 focus:border-blue-500 outline-none mb-4 custom-scrollbar transition-colors" placeholder="[{ nome: 'AK-47', preco: 10... }]" value={jsonInput} onChange={(e) => setJsonInput(e.target.value)}></textarea>
             <button onClick={importarJSON} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">EXTRAIR ARMAS</button>
           </div>
         )}
         
         <form onSubmit={handleGuardarCaixa} className="space-y-5 relative z-10">
           <div>
             <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Nome da Coleção</label>
             <input type="text" placeholder="Ex: Cyberpunk Case" required value={nomeCaixa} onChange={e => setNomeCaixa(e.target.value)} className="w-full bg-black/40 border border-white/5 focus:border-emerald-500/50 rounded-xl p-4 text-sm text-white font-bold outline-none transition-colors" />
           </div>

           <div className="grid grid-cols-3 gap-4">
             <div>
               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Preço (€)</label>
               <input type="number" step="0.01" placeholder="0.00" required value={precoCaixa} onChange={e => setPrecoCaixa(e.target.value)} className="w-full bg-black/40 border border-white/5 focus:border-emerald-500/50 rounded-xl p-4 text-sm text-emerald-400 font-mono font-black outline-none transition-colors" />
             </div>
             <div>
               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Posição</label>
               <input type="number" placeholder="1" value={ordemCaixa} onChange={e => setOrdemCaixa(e.target.value)} className="w-full bg-black/40 border border-white/5 focus:border-emerald-500/50 rounded-xl p-4 text-sm text-white outline-none transition-colors" />
             </div>
             <div>
               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">URL Imagem</label>
               <input type="text" placeholder="https://..." value={imagemCaixa} onChange={e => setImagemCaixa(e.target.value)} className="w-full bg-black/40 border border-white/5 focus:border-emerald-500/50 rounded-xl p-4 text-sm text-zinc-400 outline-none transition-colors" />
             </div>
           </div>
           
           <div className="pt-6 mt-6 border-t border-white/5">
             <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block ml-1">🔍 Procurar Skins Manualmente</label>
             <input type="text" value={pesquisa} onChange={e => setPesquisa(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white mb-4 outline-none focus:border-white/20 transition-colors" placeholder="Nome da skin (ex: Asiimov)..." />
             
             <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
               {itensFiltrados.map(item => (
                 <div key={item.id} onClick={() => adicionarItemACaixa(item)} className="bg-black/60 border border-white/5 rounded-xl p-2 cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/10 flex flex-col items-center group transition-all">
                   <img src={item.imagem} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform drop-shadow-md" alt="skin" />
                   <span className="text-[8px] font-bold mt-1 text-zinc-400 truncate w-full text-center group-hover:text-white">{item.nome}</span>
                 </div>
               ))}
             </div>
           </div>
           
           <div className="flex gap-4 pt-6 mt-6 border-t border-white/5">
             <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-[1.02]">
               {caixaEmEdicaoId ? 'GUARDAR ALTERAÇÕES' : 'CRIAR CAIXA'}
             </button>
             {caixaEmEdicaoId && <button type="button" onClick={cancelarEdicao} className="px-8 py-4 bg-white/5 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 border border-white/5 hover:border-red-500/50 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all">CANCELAR</button>}
           </div>
         </form>
      </div>
      
      {/* PAINEL DIREITO: CONTEÚDO DA CAIXA & CATÁLOGO */}
      <div className="flex flex-col gap-6">
        
        {/* BLOCO: ITENS DENTRO DA CAIXA */}
        <div className="bg-[#121215]/80 backdrop-blur-sm border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col shadow-xl flex-1 max-h-[500px]">
           <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
             <h4 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2">
               <span className="text-amber-500">🎯</span> Conteúdo Atual
             </h4>
             <div className={`px-4 py-1.5 rounded-lg font-mono font-black text-xs border ${Math.abs(somaProbabilidades - 100) < 0.1 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                TOTAL: {somaProbabilidades.toFixed(3)}%
             </div>
           </div>

           {itensCaixa.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-white/5 rounded-2xl bg-black/20">
               <span className="text-4xl mb-3 opacity-30">🕳️</span>
               <span className="text-[10px] font-black uppercase tracking-widest">Caixa Vazia</span>
             </div>
           ) : (
             <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
               {itensCaixa.map((item: any) => (
                 <div key={item.id} className="flex items-center justify-between bg-black/40 border border-white/5 p-3 rounded-xl hover:border-white/10 transition-colors group">
                   <div className="flex items-center gap-3">
                     <div className="bg-black/60 p-2 rounded-lg border border-white/5">
                        <img src={item.imagem || item.image} className="w-8 h-8 object-contain drop-shadow-md" alt="skin" />
                     </div>
                     <div>
                       <p className="text-[10px] font-bold text-white truncate w-32 sm:w-40">{item.nome}</p>
                       <p className="text-[9px] font-mono font-black text-emerald-500">{item.preco || item.valor}€</p>
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                         <span className="text-[8px] text-zinc-500 font-black uppercase mb-1">PROBABILIDADE (%)</span>
                         <input type="number" step="0.01" value={item.probabilidade} onChange={(e) => setProbabilidadeItem(item.id, e.target.value)} className="w-24 bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono font-black text-right focus:border-amber-500 outline-none transition-colors shadow-inner" />
                      </div>
                      <button onClick={() => removerItemDaCaixa(item.id)} className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 rounded-lg transition-all mt-3">✕</button>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* BLOCO: CATÁLOGO DE CAIXAS (O MEU IMPÉRIO) */}
        <div className="bg-[#121215]/80 backdrop-blur-sm border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
           <h4 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2 mb-6">
             <span className="text-blue-500">📚</span> O Teu Catálogo
           </h4>
           
           {caixasCriadas.length === 0 ? (
             <div className="py-8 text-center border border-dashed border-white/5 rounded-2xl bg-black/20 text-zinc-600 font-black uppercase text-[10px] tracking-widest">
               Ainda não tens caixas ativas.
             </div>
           ) : (
             <div className="flex gap-4 overflow-x-auto pb-4 pt-2 custom-scrollbar">
               {caixasCriadas.map(caixa => (
                 <div key={caixa.id} className="flex-shrink-0 bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col w-36 relative group hover:bg-white/[0.05] hover:border-emerald-500/30 transition-all hover:-translate-y-1">
                    <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <button onClick={() => iniciarEdicaoCaixa(caixa)} className="bg-amber-500 hover:bg-amber-400 w-8 h-8 rounded-full flex items-center justify-center text-black font-black shadow-lg transition-colors border-2 border-[#121215]" title="Editar">✏️</button>
                      <button onClick={() => apagarCaixa(caixa.id)} className="bg-red-500 hover:bg-red-400 w-8 h-8 rounded-full flex items-center justify-center text-white font-black shadow-lg transition-colors border-2 border-[#121215]" title="Apagar">✕</button>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 relative mb-3">
                         <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         <img src={caixa.imagem} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 drop-shadow-xl relative z-10" alt={caixa.nome} />
                      </div>
                      <span className="text-[10px] font-black uppercase text-zinc-300 truncate w-full tracking-widest">{caixa.nome}</span>
                      <span className="text-xs text-emerald-400 font-mono font-black mt-1 drop-shadow-md">{caixa.preco}€</span>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>

      </div>
    </div>
  );
}