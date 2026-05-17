import React, { useState } from 'react';

export default function TabSistema() {
  const [syncLoading, setSyncLoading] = useState(false);

  const handleSincronizar = async () => {
    if(!window.confirm("Atenção! Isto vai importar milhares de skins. Queres continuar?")) return;
    setSyncLoading(true);
    try {
      const res = await fetch('http://localhost:3000/sincronizar-arsenal', { method: 'POST' });
      const data = await res.json();
      alert(data.message || '✅ Sincronizado!');
    } catch (e) { 
      alert('❌ Erro ao sincronizar.'); 
    }
    setSyncLoading(false);
  };

  const gerarPromo = async () => {
    const codigo = (document.getElementById('pcodigo') as HTMLInputElement).value;
    const valor = (document.getElementById('pvalor') as HTMLInputElement).value;
    const limite = (document.getElementById('plimite') as HTMLInputElement).value;
    
    if(!codigo || !valor || !limite) return alert("Preenche o código, o valor e o limite de usos!");

    try {
      const res = await fetch('http://localhost:3000/admin/criar-promo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, valor: parseFloat(valor), limite: parseInt(limite) })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.msg); 
        (document.getElementById('pcodigo') as HTMLInputElement).value = '';
        (document.getElementById('pvalor') as HTMLInputElement).value = '';
        (document.getElementById('plimite') as HTMLInputElement).value = '';
      } else {
        alert("Erro: " + data.message);
      }
    } catch(e) { alert("Erro ao ligar ao servidor."); }
  };

  return (
    <div className="animate-in fade-in space-y-8">
      <div className="bg-[#161619] border border-white/5 p-8 rounded-3xl">
        <h3 className="text-xl font-black uppercase mb-6 text-blue-500 flex items-center gap-2">
          <span className="text-2xl">🎫</span> Gerador de Promo Codes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input id="pcodigo" type="text" placeholder="CÓDIGO (Ex: VIP10)" className="bg-black/50 border border-white/10 rounded-xl p-4 text-white uppercase font-black" />
          <input id="pvalor" type="number" placeholder="VALOR EM €" className="bg-black/50 border border-white/10 rounded-xl p-4 text-white" />
          <input id="plimite" type="number" placeholder="MÁXIMO DE USOS" className="bg-black/50 border border-white/10 rounded-xl p-4 text-white" />
        </div>
        <button onClick={gerarPromo} className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase rounded-xl transition-all">
          GERAR CÓDIGO
        </button>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 p-8 rounded-3xl">
        <h4 className="font-bold text-white mb-2 uppercase text-xs">Arsenal Global</h4>
        <button onClick={handleSincronizar} disabled={syncLoading} className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase rounded-xl transition-all">
          {syncLoading ? 'A processar...' : '⬇️ Sincronizar Base de Dados de Skins'}
        </button>
      </div>
    </div>
  );
}