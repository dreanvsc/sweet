'use client';

import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export default function LanguageSwitcher() {
  const [lingua, setLingua] = useState<'pt' | 'en'>('pt');
  const [pronto, setPronto] = useState(false);

  // 🔥 Carrega o script do Google Translate uma única vez
  useEffect(() => {
    if (document.getElementById('google-translate-script')) {
      setPronto(true);
      return;
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'pt',
          includedLanguages: 'en,pt',
          autoDisplay: false,
        },
        'google_translate_element'
      );
      setPronto(true);
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    const guardada = localStorage.getItem('siteLang');
    if (guardada === 'en') {
      setLingua('en');
    }
  }, []);

  useEffect(() => {
    if (!pronto) return;

    const aplicar = () => {
      const valorCookie = lingua === 'en' ? '/pt/en' : '/pt/pt';
      document.cookie = `googtrans=${valorCookie}; path=/`;
      document.cookie = `googtrans=${valorCookie}; path=/; domain=${window.location.hostname}`;

      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (select) {
        select.value = lingua === 'en' ? 'en' : 'pt';
        select.dispatchEvent(new Event('change'));
      } else {
        setTimeout(aplicar, 300);
      }
    };

    aplicar();
    localStorage.setItem('siteLang', lingua);
  }, [lingua, pronto]);

  // 🔥 Apenas EMPURRA a barra para fora do ecrã via CSS — não remove nada da DOM,
  // para não interferir com o motor de tradução do Google.
  useEffect(() => {
    const corrigirPosicao = () => {
      document.documentElement.style.setProperty('margin-top', '0px', 'important');
      document.body.style.setProperty('top', '0px', 'important');
    };

    corrigirPosicao();
    const interval = setInterval(corrigirPosicao, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }}></div>

      <div className="fixed top-3 right-3 z-[60] flex gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg notranslate">
        <button
          onClick={() => setLingua('pt')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${lingua === 'pt' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'}`}
        >
          PT
        </button>
        <button
          onClick={() => setLingua('en')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${lingua === 'en' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'}`}
        >
          EN
        </button>
      </div>

      {/* Apenas esconde visualmente a barra (sem remover do DOM, sem afetar o motor) */}
      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate {
          top: -50px !important;
          height: 0 !important;
        }
        body {
          top: 0px !important;
        }
        .goog-te-gadget {
          height: 0;
          overflow: hidden;
        }
        #google_translate_element {
          display: none !important;
        }
        .goog-tooltip,
        .goog-tooltip:hover {
          display: none !important;
        }
        .goog-text-highlight {
          background: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </>
  );
}