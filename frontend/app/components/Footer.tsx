'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0a0a0c] border-t border-white/5 pt-12 pb-8 mt-20 relative overflow-hidden z-10 md:ml-[260px] md:w-[calc(100%-260px)]">
      
      {/* 1. BARRA DE ESTATÍSTICAS (PROVA SOCIAL) */}
      <div className="container mx-auto px-6 mb-12">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center text-center">
          <div className="flex flex-col items-center">
            <span className="text-emerald-400 text-2xl font-black font-mono drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">3 492</span>
            <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mt-1">Online</span>
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block"></div>
          <div className="flex flex-col items-center">
            <span className="text-white text-2xl font-black font-mono drop-shadow-md">842 104</span>
            <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mt-1">Utilizadores Registados</span>
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block"></div>
          <div className="flex flex-col items-center">
            <span className="text-white text-2xl font-black font-mono drop-shadow-md">2 144 593</span>
            <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mt-1">Caixas Abertas</span>
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block"></div>
          <div className="flex flex-col items-center">
            <span className="text-white text-2xl font-black font-mono drop-shadow-md">753 291</span>
            <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mt-1">Upgrades Feitos</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-t border-white/5 pt-12">
        
        {/* COLUNA 1: LOGO E REDES SOCIAIS */}
        <div className="flex flex-col gap-6">
          <Link href="/" className="text-3xl font-black italic tracking-tighter text-white">
            SWEET<span className="text-emerald-500">DROP</span>
          </Link>
          <p className="text-zinc-500 text-xs leading-relaxed max-w-sm">
            A plataforma mais inovadora e transparente para obteres as tuas skins de CS2 favoritas. Preços justos, sorteios limpos e comunidade forte.
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-[#5865F2] hover:text-white text-zinc-400 transition-all">
              <span className="font-bold">Discord</span>
            </a>
            <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white hover:text-black text-zinc-400 transition-all">
              <span className="font-bold">X</span>
            </a>
            <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-400 hover:to-purple-600 hover:text-white text-zinc-400 transition-all">
              <span className="font-bold">IG</span>
            </a>
          </div>
        </div>

        {/* COLUNA 2: SERVIÇO AO CLIENTE */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2">Serviço ao Cliente</h4>
          <Link href="/provably-fair" className="text-zinc-400 hover:text-emerald-400 text-xs font-semibold transition-colors">⚖️ Comprovadamente Justo</Link>
          <Link href="/tos" className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors">📄 Termos de Serviço (TOS)</Link>
          <Link href="/aml" className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors">🛡️ Política AML</Link>
          <Link href="/privacidade" className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors">🔒 Política de Privacidade</Link>
          <Link href="/faq" className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors">❓ Perguntas Frequentes</Link>
        </div>

        {/* COLUNA 3: A MINHA CONTA */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2">A Minha Conta</h4>
          <Link href="/perfil" className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors">👤 O Meu Perfil</Link>
          <Link href="/afiliados" className="text-zinc-400 hover:text-amber-400 text-xs font-semibold transition-colors">💰 Sistema de Afiliados</Link>
          <Link href="/historico" className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors">📦 Histórico de Caixas</Link>
          <Link href="/suporte" className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors">🎧 Suporte / Tickets</Link>
        </div>

        {/* COLUNA 4: GAMBLING RESPONSÁVEL (+18) */}
        <div className="flex flex-col gap-4 justify-start">
          <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/20 border border-blue-500/20 p-5 rounded-2xl flex items-center gap-4 hover:border-blue-500/40 transition-colors">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              +18
            </div>
            <div>
              <h4 className="text-blue-400 font-black text-sm uppercase">Jogue com</h4>
              <p className="text-white font-black text-sm uppercase">Responsabilidade</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE PAGAMENTOS */}
      <div className="container mx-auto px-6 mb-12">
        <div className="bg-black/50 border border-white/5 rounded-2xl py-6 px-8 flex flex-wrap justify-center md:justify-between items-center gap-8 shadow-inner">
          <div className="text-blue-600 font-black italic text-3xl tracking-tighter">VISA</div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-red-500/90 mix-blend-screen relative z-10"></div>
            <div className="w-8 h-8 rounded-full bg-orange-500/90 mix-blend-screen -ml-4 relative z-0"></div>
            <span className="text-white font-semibold text-lg ml-2">mastercard</span>
          </div>
          <div className="text-emerald-500 font-black text-2xl tracking-tighter">Trustly</div>
          <div className="text-white font-black italic text-2xl tracking-tighter"><span className="text-blue-800">Pay</span><span className="text-blue-400">Pal</span></div>
          <div className="text-zinc-600 font-black text-sm uppercase">E muitos mais...</div>
        </div>
      </div>

      {/* 3. AVISO LEGAL DA VALVE E COPYRIGHT */}
      <div className="container mx-auto px-6 border-t border-white/5 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest leading-loose max-w-3xl">
          <p className="mb-2">ALL RIGHTS RESERVED. POWERED BY STEAM. <span className="text-zinc-400">NOT AFFILIATED WITH VALVE CORP.</span></p>
          <p>Counter-Strike 2 (CS2) e todas as marcas comerciais associadas são propriedade da Valve Corporation. Este site não é patrocinado, endossado ou administrado pela Valve.</p>
        </div>
        <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">
          © {new Date().getFullYear()} SWEET DROP.
        </div>
      </div>
    </footer>
  );
}