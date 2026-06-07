import Link from 'next/link';

export default function FAQ() {
  return (
    <main className="min-h-screen bg-[#0b0b0d] text-zinc-200 py-20 px-4 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-[#121215] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Luz de fundo de enfeite */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/10 blur-[100px] pointer-events-none"></div>

        <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6 relative z-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-black italic uppercase text-white tracking-tighter">Perguntas Frequentes</h1>
            <p className="text-amber-500 font-bold tracking-widest text-[10px] uppercase mt-2">Tira as tuas dúvidas (FAQ)</p>
          </div>
          <Link href="/" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2">
            ⬅ Voltar à Loja
          </Link>
        </div>

        <div className="relative z-10 space-y-4">
          
          {/* Pergunta 1 */}
          <details className="group bg-black/40 border border-white/5 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between cursor-pointer p-6 font-black uppercase tracking-wider text-sm text-white hover:bg-white/5 transition-colors">
              1. Como faço um depósito no site?
              <span className="text-amber-500 transition duration-300 group-open:-rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div className="p-6 pt-0 text-zinc-400 text-sm leading-relaxed border-t border-white/5 mt-2">
              <p className="mt-4">Para depositar saldo, clica no botão "Depositar" no teu perfil. Atualmente suportamos depósitos manuais através de Skins de CS2 (via Steam Trade), MBWay (imediato) e muito em breve adicionaremos Criptomoedas.</p>
            </div>
          </details>

          {/* Pergunta 2 */}
          <details className="group bg-black/40 border border-white/5 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between cursor-pointer p-6 font-black uppercase tracking-wider text-sm text-white hover:bg-white/5 transition-colors">
              2. Como retiro as minhas Skins?
              <span className="text-amber-500 transition duration-300 group-open:-rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div className="p-6 pt-0 text-zinc-400 text-sm leading-relaxed border-t border-white/5 mt-2">
              <p className="mt-4">Sempre que ganhas uma skin numa caixa ou batalha, ela vai para o teu Inventário da Sweet Drop (no teu Perfil). Basta ires lá, selecionar a skin e clicar em "Levantar". Um dos nossos administradores ou bots enviará a oferta de troca para a tua conta Steam.</p>
            </div>
          </details>

          {/* Pergunta 3 */}
          <details className="group bg-black/40 border border-white/5 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between cursor-pointer p-6 font-black uppercase tracking-wider text-sm text-white hover:bg-white/5 transition-colors">
              3. O site é de confiança? Os resultados são manipulados?
              <span className="text-amber-500 transition duration-300 group-open:-rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div className="p-6 pt-0 text-zinc-400 text-sm leading-relaxed border-t border-white/5 mt-2">
              <p className="mt-4">A Sweet Drop é 100% transparente. Utilizamos um sistema criptográfico "Provably Fair" (Comprovadamente Justo). Isto significa que o resultado de cada abertura de caixa é gerado matematicamente antes de clicares e não pode ser alterado por nós. Podes verificar a página "Comprovadamente Justo" no rodapé para testares os resultados tu mesmo.</p>
            </div>
          </details>

          {/* Pergunta 4 */}
          <details className="group bg-black/40 border border-white/5 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between cursor-pointer p-6 font-black uppercase tracking-wider text-sm text-white hover:bg-white/5 transition-colors">
              4. O que é o requisito de Play-through?
              <span className="text-amber-500 transition duration-300 group-open:-rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div className="p-6 pt-0 text-zinc-400 text-sm leading-relaxed border-t border-white/5 mt-2">
              <p className="mt-4">De acordo com a nossa política AML (Anti-Lavagem de Dinheiro), todo o valor depositado tem de ser utilizado a 100% no site (abrir caixas, batalhas, etc.) antes que possas efetuar um levantamento de skins. Isto evita que a plataforma seja usada apenas para troca direta de fundos.</p>
            </div>
          </details>

        </div>
      </div>
    </main>
  );
}