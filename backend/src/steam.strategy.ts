import { Injectable } from '@nestjs/common';
import { PassportStrategy, PassportSerializer } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import { UsersService } from './users.service';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  // 🔥 Trocámos o AppService pelo UsersService aqui
  constructor(private usersService: UsersService) {
    super({
      returnURL: 'https://sweet-7ifa.onrender.com/auth/steam/return',
      realm: 'https://sweet-7ifa.onrender.com/',
      apiKey: '70414B811C0BEB087375922452721CCA',
    });
  }

  async validate(identifier: string, profile: any, done: any) {
    // 🔥 E trocámos aqui também para ele chamar a função no sítio certo!
    const user = await this.usersService.loginComSteam(profile);
    return done(null, user);
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