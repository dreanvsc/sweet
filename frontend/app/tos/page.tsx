import Link from 'next/link';

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-[#0b0b0d] text-zinc-200 py-20 px-4 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-[#121215] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Luz de fundo de enfeite */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-500/10 blur-[100px] pointer-events-none"></div>

        <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6 relative z-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-black italic uppercase text-white tracking-tighter">Termos de Serviço</h1>
            <p className="text-emerald-500 font-bold tracking-widest text-[10px] uppercase mt-2">Última atualização: Junho 2026</p>
          </div>
          <Link href="/" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2">
            ⬅ Voltar à Loja
          </Link>
        </div>

        <div className="prose prose-invert max-w-none text-zinc-400 text-sm md:text-base leading-relaxed space-y-6 relative z-10">
          
          <h2 className="text-white text-xl font-black uppercase tracking-wider mt-8">1. Aceitação dos Termos</h2>
          <p>
            Ao aceder e utilizar o website <strong>Sweet Drop</strong>, o utilizador concorda em cumprir e ficar vinculado a estes Termos de Serviço. Se não concordar com alguma parte destes termos, não deverá utilizar a nossa plataforma. Apenas utilizadores com <strong>mais de 18 anos</strong> estão autorizados a utilizar os nossos serviços.
          </p>

          <h2 className="text-white text-xl font-black uppercase tracking-wider mt-8">2. Depósitos e Saldo</h2>
          <p>
            Todos os depósitos realizados através de Skins, MBWay ou Criptomoedas são finais e <strong>não reembolsáveis</strong>. O saldo da conta tem como finalidade exclusiva a utilização dentro da plataforma Sweet Drop (abertura de caixas, batalhas, etc.).
          </p>

          <h2 className="text-white text-xl font-black uppercase tracking-wider mt-8">3. Sistema Comprovadamente Justo (Provably Fair)</h2>
          <p>
            Garantimos a total transparência dos nossos sorteios. A Sweet Drop utiliza um sistema criptográfico que impede qualquer manipulação de resultados. O utilizador pode verificar o "seed" de cada ronda a qualquer momento no seu histórico.
          </p>

          {/* Adiciona mais texto conforme precisares */}
          
        </div>
      </div>
    </main>
  );
}