'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function TabBanner() {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    imagem: '',
    titulo: 'HIGH RISK ZONE',
    descricao: 'Abre as caixas exclusivas deste evento e ganha skins lendárias!',
    ativo: true
  });

  const IMGBB_API_KEY = 'f34e1a15059fa969cecc59e5f3990f3d'; // 🔥 COLA A TUA CHAVE AQUI

  useEffect(() => {
    // Busca o banner atual à BD
    fetch('https://sweet-7ifa.onrender.com/admin/banner')
      .then(res => res.json())
      .then(data => { if (data && data.titulo) setForm(data); })
      .catch(() => console.log('Banner ainda não configurado na BD.'));
  }, []);

  // 🔥 MAGIA DO UPLOAD DIRETO PARA O IMGBB
  const handleUploadImagem = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const toastId = toast.loading('A carregar imagem para a nuvem...');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        setForm({ ...form, imagem: data.data.url }); // Guarda o link automático!
        toast.success('Imagem carregada!', { id: toastId });
      } else {
        toast.error('Erro no upload.', { id: toastId });
      }
    } catch (error) {
      toast.error('Falha ao ligar ao servidor de imagens.', { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  const guardarBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('A atualizar loja...');
    
    try {
      const res = await fetch('https://sweet-7ifa.onrender.com/admin/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) toast.success('A loja foi atualizada!', { id: toastId });
      else toast.error('Erro ao guardar banner.', { id: toastId });
    } catch (error) { toast.error('Falha de ligação.', { id: toastId }); } 
    finally { setLoading(false); }
  };

  return (
    <div className="bg-[#121215]/80 backdrop-blur-sm border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl max-w-3xl">
      <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
        <span className="text-3xl">🎨</span>
        <div>
          <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Banner de Eventos</h2>
          <p className="text-xs text-amber-500 font-bold uppercase tracking-widest mt-1">Controla a montra principal da loja</p>
        </div>
      </div>

      <form onSubmit={guardarBanner} className="space-y-5">
        
        {/* 🔥 CAIXA DE UPLOAD COM DESIGN PREMIUM */}
        <div className="bg-black/40 border border-white/5 rounded-xl p-4">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block ml-1">Imagem do Banner</label>
          <div className="flex gap-4 items-center">
            {form.imagem && (
              <img src={form.imagem} alt="Preview" className="h-16 w-32 object-cover rounded-lg border border-white/10" />
            )}
            <div className="flex-1 relative">
              <input type="file" accept="image/*" onChange={handleUploadImagem} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className={`w-full border-2 border-dashed ${uploadingImage ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:border-emerald-500/50'} rounded-xl p-4 flex justify-center items-center transition-colors`}>
                <span className="text-xs font-black uppercase text-zinc-400 tracking-widest">
                  {uploadingImage ? 'A CARREGAR...' : '📁 CLICA PARA ESCOLHER IMAGEM DO PC'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-[9px] text-zinc-600 uppercase font-black mt-2">Podes também colar o link direto abaixo se preferires:</p>
          <input type="text" value={form.imagem} onChange={e => setForm({...form, imagem: e.target.value})} className="w-full mt-1 bg-black/40 border border-white/5 rounded-lg p-3 text-xs text-white outline-none" placeholder="https://..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Título do Evento</label>
            <input type="text" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-emerald-500/50 rounded-xl p-4 text-sm text-white font-black uppercase outline-none" required />
          </div>
          <div className="flex items-center mt-6 bg-white/5 p-4 rounded-xl border border-white/5">
             <input type="checkbox" id="ativo" checked={form.ativo} onChange={e => setForm({...form, ativo: e.target.checked})} className="w-5 h-5 rounded border-white/20 bg-black/40 text-emerald-500" />
             <label htmlFor="ativo" className="ml-3 text-xs font-black text-white uppercase tracking-widest cursor-pointer">ATIVAR EVENTO NA LOJA</label>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Descrição Curta</label>
          <textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-emerald-500/50 rounded-xl p-4 text-sm text-zinc-400 outline-none h-20" required></textarea>
        </div>

        <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          {loading ? 'A GUARDAR...' : 'ATUALIZAR BANNER DA LOJA'}
        </button>
      </form>
    </div>
  );
}