import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } }) // Permite ligações de qualquer domínio
export class FeedGateway {
  @WebSocketServer()
  server: Server;

  // 🔥 Quando o serviço das caixas chamar isto, a magia acontece!
  emitirNovoDrop(drop: any) {
    this.server.emit('novo_drop', drop);
  }
}
