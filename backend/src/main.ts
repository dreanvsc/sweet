import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// A forma clássica e à prova de bala de importar no Node.js
const session = require('express-session');
const passport = require('passport');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(); 

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

  await app.listen(3000);
}
bootstrap();