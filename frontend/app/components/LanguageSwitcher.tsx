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

    // Restaura a língua escolhida anteriormente
    const guardada = localStorage.getItem('siteLang');
    if (guardada === 'en') {
      setLingua('en');
    }
  }, []);

  // 🔥 Aplica a tradução sempre que a língua mudar (e o widget estiver pronto)
  useEffect(() => {
    if (!pronto) return;

    const aplicar = () => {
      // Define a cookie que o Google Translate usa para saber a língua atual
      const valorCookie = lingua === 'en' ? '/pt/en' : '/pt/pt';
      document.cookie = `googtrans=${valorCookie}; path=/`;
      document.cookie = `googtrans=${valorCookie}; path=/; domain=${window.location.hostname}`;

      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (select) {
        select.value = lingua === 'en' ? 'en' : 'pt';
        select.dispatchEvent(new Event('change'));
      } else {
        // Se o select ainda não existir, tenta de novo em breve
        setTimeout(aplicar, 300);
      }
    };

    aplicar();
    localStorage.setItem('siteLang', lingua);
  }, [lingua, pronto]);

  // 🔥 Força o body a manter top:0 mesmo quando o Google Translate tenta empurrá-lo
  useEffect(() => {
    const corrigirBody = () => {
      document.body.style.top = '0px';
      document.body.style.position = 'static';
    };

    corrigirBody();
    const observer = new MutationObserver(corrigirBody);
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Container exigido pelo Google Translate, escondido visualmente */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>

      {/* Botão flutuante PT / EN */}
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

      {/* Esconde a barra horrível que o Google Translate injeta no topo */}
      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate,
        iframe.goog-te-banner-frame {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
        }
        body {
          top: 0px !important;
          position: static !important;
        }
        html {
          margin-top: 0px !important;
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