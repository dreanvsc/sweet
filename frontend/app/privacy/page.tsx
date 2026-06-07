import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#0b0b0d] text-zinc-200 py-20 px-4 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-[#121215] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-blue-500/10 blur-[100px] pointer-events-none"></div>

        <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6 relative z-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-black italic uppercase text-white tracking-tighter">Privacidade</h1>
            <p className="text-blue-500 font-bold tracking-widest text-[10px] uppercase mt-2">Proteção dos Teus Dados</p>
          </div>
          <Link href="/" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2">
            ⬅ Voltar à Loja
          </Link>
        </div>

        <div className="prose prose-invert max-w-none text-zinc-400 text-sm md:text-base leading-relaxed space-y-6 relative z-10">
          
          <h2 className="text-white text-xl font-black uppercase tracking-wider mt-8">1. Informação que Recolhemos</h2>
          <p>
            Quando fazes login na Sweet Drop através da Steam, nós recolhemos apenas a informação pública disponibilizada pela API da Steam (SteamID, Nome de Utilizador e Imagem de Perfil). Não temos acesso às tuas credenciais, palavra-passe ou dados bancários através deste método.
          </p>

          <h2 className="text-white text-xl font-black uppercase tracking-wider mt-8">2. Como Usamos os Teus Dados</h2>
          <p>
            A informação recolhida serve exclusivamente para:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Criar e manter o teu perfil no nosso sistema.</li>
              <li>Processar os teus depósitos e levantamentos (Trades na Steam).</li>
              <li>Garantir a segurança da tua conta e prevenir atividades fraudulentas.</li>
            </ul>
          </p>

          <h2 className="text-white text-xl font-black uppercase tracking-wider mt-8">3. Partilha de Informação</h2>
          <p>
            A Sweet Drop <strong>não vende, aluga ou partilha</strong> as tuas informações pessoais com terceiros para fins de marketing. Os teus dados apenas poderão ser partilhados com as autoridades competentes caso exista uma requisição legal oficial ou para efeitos de investigação de fraudes (AML).
          </p>

          <h2 className="text-white text-xl font-black uppercase tracking-wider mt-8">4. Cookies</h2>
          <p>
            Utilizamos cookies estritamente necessários para manter a tua sessão ativa e garantir que o site funciona corretamente e de forma rápida. Ao utilizares a Sweet Drop, consentes o uso destes cookies essenciais.
          </p>
          
        </div>
      </div>
    </main>
  );
}