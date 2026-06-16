import { Injectable } from '@nestjs/common';
import { PassportStrategy, PassportSerializer } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import { UsersService } from './users.service';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = 'sweetdrop_secret_2026_muda_isto'; // 🔥 Muda para uma string secreta

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor(private usersService: UsersService) {
    super({
      returnURL: 'https://sweet-7ifa.onrender.com/api/auth/steam/return',
      realm: 'https://sweet-7ifa.onrender.com/',
      apiKey: '60600FD2DD5E73CCC3C63FAA5F003B5E',
    });
  }

  async validate(identifier: string, profile: any, done: any) {
    const user = await this.usersService.loginComSteam(profile);
    return done(null, user);
  }
}

// 🔥 Exporta para usar noutros ficheiros
export const JWT_SECRET_KEY = JWT_SECRET;

export function gerarToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

export function verificarToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch {
    return null;
  }
}

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: any, done: (err: any, user: any) => void): any {
    done(null, user);
  }
  deserializeUser(payload: any, done: (err: any, payload: any) => void): any {
    done(null, payload);
  }
}
