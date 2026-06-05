import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// A forma clássica e à prova de bala de importar no Node.js
const session = require('express-session');
const passport = require('passport');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    // AQUI ESTÁ A TUA LISTA VIP DE SITES AUTORIZADOS
    origin: [
      'http://localhost:3000', // A tua oficina local 1
      'http://localhost:3001', // A tua oficina local 2
      'https://sweet-sooty.vercel.app', // Link antigo
      'https://sweetdrop.vercel.app', // Link antigo
      'https://sweetdrop.pt', // 🔥 O TEU DOMÍNIO OFICIAL
      'https://www.sweetdrop.pt' // 🔥 O TEU DOMÍNIO OFICIAL (COM WWW)
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 1. Iniciar as Sessões (A "Memória")
  app.use(
    session({
      secret: 'chave-secreta-do-imperio', 
      resave: false,
      saveUninitialized: false,
    }),
  );

  // 2. Iniciar o Passaporte
  app.use(passport.initialize());
  app.use(passport.session());

  // O Render vai buscar a porta certa ou usa a 3000
  await app.listen(process.env.PORT || 3000);
}
bootstrap();