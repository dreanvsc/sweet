import Link from 'next/link';

export default function ProvablyFair() {
  return (
    <main className="min-h-screen bg-[#0b0b0d] text-zinc-200 py-20 px-4 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-[#121215] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-purple-500/10 blur-[100px] pointer-events-none"></div>

        <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6 relative z-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-black italic uppercase text-white tracking-tighter">Provably Fair</h1>
            <p className="text-purple-500 font-bold tracking-widest text-[10px] uppercase mt-2">Transparência 100% Garantida</p>
          </div>
          <Link href="/" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2">
            ⬅ Voltar à Loja
          </Link>
        </div>

        <div className="prose prose-invert max-w-none text-zinc-400 text-sm md:text-base leading-relaxed space-y-6 relative z-10">
          
          <h2 className="text-white text-xl font-black uppercase tracking-wider mt-8">O Que É "Comprovadamente Justo"?</h2>
          <p>
            O sistema Provably Fair é uma tecnologia criptográfica que garante que nenhum resultado na Sweet Drop pode ser manipulado por nós ou pelo jogador. Isto significa que sempre que abres uma caixa ou participas numa batalha, o resultado foi gerado de forma 100% aleatória e verificável.
          </p>

          <h2 className="text-white text-xl font-black uppercase tracking-wider mt-8">Como Funciona a Magia?</h2>
          <p>
            Antes de clicares para abrir a caixa, nós já gerámos o resultado. Para provar que não o alterámos depois de clicares, nós trancamos esse resultado numa "caixa-forte" criptográfica (o <strong>Server Seed Hash</strong>) e mostramos-te a fechadura antes da jogada.
          </p>
          
          <div className="bg-black/50 p-6 rounded-xl border border-white/5 my-6">
            <h3 className="text-purple-400 font-bold uppercase text-xs mb-4">A Receita Matemática:</h3>
            <ul className="space-y-4">
              <li>
                <strong className="text-white">1. Server Seed:</strong> Uma sequência secreta gerada pelo nosso servidor. Nós mostramos-te uma versão codificada (Hashed) antes do sorteio.
              </li>
              <li>
                <strong className="text-white">2. Client Seed:</strong> Uma sequência gerada pelo teu próprio navegador de internet. Tu podes alterá-la se quiseres, o que te dá poder direto na equação.
              </li>
              <li>
                <strong className="text-white">3. Nonce:</strong> Um número que sobe +1 a cada aposta que fazes, garantindo que o resultado é sempre diferente mesmo que não mudes o teu Client Seed.
              </li>
            </ul>
          </div>

          <h2 className="text-white text-xl font-black uppercase tracking-wider mt-8">Verificação Independente</h2>
          <p>
            Nós juntamos estes três elementos e usamos a função criptográfica <code>HMAC_SHA256</code> para desenhar um número. Esse número dita a skin que te sai na caixa. Qualquer pessoa que saiba um pouco de código consegue pegar nas suas "seeds" finais, reproduzir o cálculo e chegar exatamente ao mesmo resultado que nós. Transparência total.
          </p>
          
        </div>
      </div>
    </main>
  );
}