import Link from 'next/link';

export default function AMLPolicy() {
  return (
    <main className="min-h-screen bg-[#0b0b0d] text-zinc-200 py-20 px-4 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-[#121215] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-red-500/10 blur-[100px] pointer-events-none"></div>

        <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6 relative z-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-black italic uppercase text-white tracking-tighter">Política AML</h1>
            <p className="text-red-500 font-bold tracking-widest text-[10px] uppercase mt-2">Anti-Money Laundering</p>
          </div>
          <Link href="/" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2">
            ⬅ Voltar à Loja
          </Link>
        </div>

        <div className="prose prose-invert max-w-none text-zinc-400 text-sm md:text-base leading-relaxed space-y-6 relative z-10">
          
          <h2 className="text-white text-xl font-black uppercase tracking-wider mt-8">1. O Nosso Compromisso</h2>
          <p>
            A Sweet Drop está estritamente comprometida em prevenir a lavagem de dinheiro e o financiamento do terrorismo. Operamos com tolerância zero perante qualquer atividade financeira ilícita, e implementámos procedimentos internos rigorosos para detetar e bloquear essas práticas na nossa plataforma.
          </p>

          <h2 className="text-white text-xl font-black uppercase tracking-wider mt-8">2. Requisitos de Jogo (Play-through)</h2>
          <p>
            Para prevenir depósitos e levantamentos sequenciais que possam configurar esquemas de lavagem de dinheiro, a Sweet Drop exige que <strong>100% do valor depositado</strong> seja utilizado no site (na abertura de caixas, batalhas ou upgrader) antes que o utilizador esteja elegível para efetuar um levantamento de skins para a sua conta Steam.
          </p>

          <h2 className="text-white text-xl font-black uppercase tracking-wider mt-8">3. Monitorização e Verificação (KYC)</h2>
          <p>
            A nossa equipa monitoriza constantemente as transações para detetar comportamentos suspeitos. Caso um utilizador levante suspeitas de fraude (ex: múltiplas contas, uso de cartões roubados, ou transferências anómalas), a Sweet Drop reserva-se o direito de <strong>congelar temporariamente a conta e o saldo</strong>.
          </p>
          <p>
            Nesses casos, poderemos solicitar documentos de identificação adicionais (procedimento KYC - Know Your Customer) para verificar a legitimidade dos fundos e do utilizador antes de reativar a conta ou libertar as skins.
          </p>
          
        </div>
      </div>
    </main>
  );
}