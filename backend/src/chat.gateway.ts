import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🔥 Abre a porta com permissão total de acesso
@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  // Quando o jogador ou admin entra, junta-se a uma "sala" com o ID do jogador
  @SubscribeMessage('entrarChat')
  handleEntrarChat(@ConnectedSocket() client: Socket, @MessageBody() userId: number) {
    client.join(`chat_${userId}`);
    console.log(`🔌 Cliente ligado à sala: chat_${userId}`);
  }

  // Quando alguém envia uma mensagem
  @SubscribeMessage('enviarMensagem')
  async handleEnviarMensagem(
    @ConnectedSocket() client: Socket, 
    @MessageBody() payload: { userId: number, remetente: string, texto: string }
  ) {
    // 1. Puxa sempre a conversa MAIS RECENTE que estiver aberta
    let chat = await prisma.liveChat.findFirst({ 
      where: { userId: Number(payload.userId), status: 'ABERTO' },
      orderBy: { createdAt: 'desc' }
    });
    
    // 🔥 CORREÇÃO: Garante que cria o novo chat com o status ABERTO
    if (!chat) {
      chat = await prisma.liveChat.create({ 
        data: { userId: Number(payload.userId), status: 'ABERTO' } 
      });
    }

    // 2. Guarda a mensagem na Base de Dados
    const novaMensagem = await prisma.liveChatMessage.create({
      data: {
        chatId: chat.id,
        remetente: payload.remetente,
        texto: payload.texto
      }
    });

    // 3. Dispara a mensagem instantaneamente para o Jogador E para o Admin que estiverem na sala
    this.server.to(`chat_${payload.userId}`).emit('novaMensagem', novaMensagem);
    
    // 4. 🔥 Avisa TODOS os Admins que há movimento novo, para atualizarem a lista na esquerda!
    this.server.emit('atualizarListaAdmin');
  }

  // =======================================================================
  // 🔥 O NOVO SISTEMA DE ENCERRAR O CHAT EM TEMPO REAL E LIMPAR O LIXO
  // =======================================================================
  @SubscribeMessage('encerrarChat')
  async handleEncerrarChat(
    @ConnectedSocket() client: Socket, 
    @MessageBody() payload: { chatId: number, userId: number }
  ) {
    // 🔥 A MÁQUINA DE LIMPEZA: Fecha TODOS os chats que ficaram esquecidos abertos deste utilizador!
    await prisma.liveChat.updateMany({
      where: { userId: Number(payload.userId), status: 'ABERTO' },
      data: { status: 'FECHADO' }
    });

    // Avisa o Jogador e o Admin específico que esta conversa acabou e limpa o ecrã
    this.server.to(`chat_${payload.userId}`).emit('chatEncerrado', payload.chatId);
    
    // Avisa todos os Admins para atualizarem/limparem a lista lateral
    this.server.emit('atualizarListaAdmin');
  }
}