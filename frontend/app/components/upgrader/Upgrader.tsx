import React, { useState, useEffect } from 'react';
import UpgraderInventory from './UpgraderInventory';
import UpgraderWheel from './UpgraderWheel';
import UpgraderStore from './UpgraderStore';

export default function Upgrader({ userId, inventario, setSaldo, setInventario, setView }: any) {
  const [userSkins, setUserSkins] = useState<any[]>([]); 
  const [targetSkin, setTargetSkin] = useState<any>(null);
  const [lojaItens, setLojaItens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const inventarioUnico = (Array.isArray(inventario) ? inventario : []).map((item: any, index: number) => ({
    ...item, uniqueClickId: `${item.id}-${index}` 
  }));

  useEffect(() => {
    fetch('http://localhost:3000/itens')
      .then(res => res.json())
      .then(data => setLojaItens(data)); 
  }, []);

  const toggleUserSkin = (skin: any) => {
    if (spinning) return;
    setUserSkins(prev => {
      const jaExiste = prev.find(s => s.uniqueClickId === skin.uniqueClickId);
      if (jaExiste) return prev.filter(s => s.uniqueClickId !== skin.uniqueClickId); 
      return [...prev, skin]; 
    });
    setTargetSkin(null);
  };

  const limparSelecao = () => {
    if (spinning) return;
    setUserSkins([]);
    setTargetSkin(null);
  };

  const getPreco = (item: any) => Number(item.preco || item.valor || 0);

  const valorTotalApostado = userSkins.reduce((acc, skin) => acc + getPreco(skin), 0);
  const precoAlvo = targetSkin ? getPreco(targetSkin) : 1;
  
  const isDowngrade = userSkins.length > 0 && targetSkin && precoAlvo <= valorTotalApostado;
  const chanceRaw = userSkins.length > 0 && targetSkin && !isDowngrade ? ((valorTotalApostado / precoAlvo) * 100 * 0.90) : 0;
  const chance = Math.min(chanceRaw, 90).toFixed(2); 

  const handleUpgrade = async () => {
    if (userSkins.length === 0 || !targetSkin) return alert("Seleciona as skins!");
    if (spinning) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/upgrade', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, skinIds: userSkins.map(s => s.id), alvoId: targetSkin.id })
      });
      const data = await res.json();
      if (res.ok) iniciarAnimacao(data);
      else { alert(data.message); setLoading(false); }
    } catch (e) { alert("Erro no servidor"); setLoading(false); }
  };

  const iniciarAnimacao = (data: any) => {
    setSpinning(true);
    const voltasExtras = 5 * 360; 
    const chanceNumerica = Number(data.chance);
    const limiteVerde = chanceNumerica * 3.6; 
    
    let anguloAlvo;
    if (data.sucesso) anguloAlvo = 1 + Math.random() * (limiteVerde - 2); 
    else anguloAlvo = limiteVerde + 2 + Math.random() * (360 - limiteVerde - 4); 

    setRotation(voltasExtras + anguloAlvo);

    setTimeout(() => {
      setSpinning(false);
      setLoading(false);
      if (data.sucesso) {
        const novaSkinGanha = { ...data.skinGanha, id: data.novoItemId, valor: getPreco(data.skinGanha) };
        alert(`🔥 SUCESSO! Ganhaste a ${novaSkinGanha.nome}!`);
        setInventario((prev: any) => [...prev.filter((s: any) => !data.idsDestruidos.includes(s.id)), novaSkinGanha]);
      } else {
        alert("❌ Falhaste o upgrade... as tuas skins foram destruídas.");
        setInventario((prev: any) => prev.filter((s: any) => !data.idsDestruidos.includes(s.id)));
      }
      setUserSkins([]); 
      setTargetSkin(null);
      setRotation(0);
    }, 5000);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in pb-20">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-white italic tracking-tighter">UPGRADER <span className="text-emerald-500">PRO</span></h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">Arrisca o teu lixo por tesouros</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <UpgraderInventory 
          inventarioUnico={inventarioUnico} userSkins={userSkins} toggleUserSkin={toggleUserSkin} 
          limparSelecao={limparSelecao} valorTotalApostado={valorTotalApostado} 
          spinning={spinning} setView={setView} getPreco={getPreco} 
        />
        
        <UpgraderWheel 
          chance={chance} rotation={rotation} spinning={spinning} loading={loading} 
          isDowngrade={isDowngrade} userSkins={userSkins} targetSkin={targetSkin} 
          handleUpgrade={handleUpgrade} 
        />
        
        <UpgraderStore 
          lojaItens={lojaItens} targetSkin={targetSkin} setTargetSkin={setTargetSkin} 
          valorTotalApostado={valorTotalApostado} precoAlvo={precoAlvo} 
          spinning={spinning} getPreco={getPreco} 
        />
      </div>
    </div>
  );
}