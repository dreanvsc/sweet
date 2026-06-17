'use client';

import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

function lerCookie(nome: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + nome + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function limparCookieGoogtrans() {
  const hostname = window.location.hostname; // ex: sweetdrop.pt ou www.sweetdrop.pt
  const hostnameSemWww = hostname.replace(/^www\./, ''); // sweetdrop.pt

  const dominios = [
    undefined, // sem domain explícito (host-only)
    hostname,
    hostnameSemWww,
    `.${hostnameSemWww}`, // .sweetdrop.pt
    `www.${hostnameSemWww}`, // www.sweetdrop.pt
  ];

  dominios.forEach((dominio) => {
    const base = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    document.cookie = dominio ? `${base}; domain=${dominio}` : base;
  });
}

export default function LanguageSwitcher() {
  const [lingua, setLingua] = useState<'pt' | 'en'>('pt');

  // 🔥 Ao montar: descobre a língua real a partir da cookie (fonte de verdade)
  useEffect(() => {
    const cookieAtual = lerCookie('googtrans');
    if (cookieAtual && cookieAtual.includes('/en')) {
      setLingua('en');
    } else {
      setLingua('pt');
    }

    // Carrega o script do Google Translate (só uma vez)
    if (!document.getElementById('google-translate-script')) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'pt', includedLanguages: 'en,pt', autoDisplay: false },
          'google_translate_element'
        );
      };
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const mudarPara = (novaLingua: 'pt' | 'en') => {
    if (novaLingua === lingua) return;

    if (novaLingua === 'pt') {
      // 🔥 Remove a cookie de tradução em todos os domínios possíveis e recarrega -> volta ao original
      limparCookieGoogtrans();
      window.location.reload();
    } else {
      // 🔥 Define a cookie para inglês nos mesmos domínios e recarrega -> o Google traduz ao carregar
      const hostname = window.location.hostname;
      const hostnameSemWww = hostname.replace(/^www\./, '');

      document.cookie = `googtrans=/pt/en; path=/`;
      document.cookie = `googtrans=/pt/en; path=/; domain=${hostnameSemWww}`;
      document.cookie = `googtrans=/pt/en; path=/; domain=.${hostnameSemWww}`;
      document.cookie = `googtrans=/pt/en; path=/; domain=www.${hostnameSemWww}`;

      window.location.reload();
    }
  };

  // 🔥 Esconde a barra do Google de forma contínua
  useEffect(() => {
    const escondeBarra = () => {
      const containers = document.querySelectorAll('body > .skiptranslate, iframe.skiptranslate, .goog-te-banner-frame');
      containers.forEach((el) => {
        (el as HTMLElement).style.setProperty('display', 'none', 'important');
        (el as HTMLElement).style.setProperty('height', '0px', 'important');
        (el as HTMLElement).style.setProperty('visibility', 'hidden', 'important');
      });
      document.documentElement.style.setProperty('margin-top', '0px', 'important');
      document.body.style.setProperty('top', '0px', 'important');
    };

    escondeBarra();
    const interval = setInterval(escondeBarra, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }}></div>

      <div className="fixed top-3 right-3 z-[60] flex gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg notranslate">
        <button
          onClick={() => mudarPara('pt')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${lingua === 'pt' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'}`}
        >
          PT
        </button>
        <button
          onClick={() => mudarPara('en')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${lingua === 'en' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'}`}
        >
          EN
        </button>
      </div>

      <style jsx global>{`
        .skiptranslate,
        iframe.skiptranslate,
        body > .skiptranslate,
        .goog-te-banner-frame {
          display: none !important;
          height: 0 !important;
          min-height: 0 !important;
          max-height: 0 !important;
          visibility: hidden !important;
          border: none !important;
          overflow: hidden !important;
        }
        html {
          margin-top: 0 !important;
        }
        body {
          margin-top: 0 !important;
          top: 0px !important;
          position: static !important;
          min-height: 0;
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