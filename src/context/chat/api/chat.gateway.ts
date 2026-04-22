import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SendMessageUseCase } from '../app/usecases/send-message.usecase';
import { GetCharacterUseCase } from 'src/context/characters/app/usecases/get-character.usecase';
import { forwardRef, Inject } from '@nestjs/common';
import {
  TOKEN_SERVICE,
  type ITokenService,
} from '../../auth/app/interface/token-service.interface';
import * as crypto from 'crypto';

interface GatewayResponse {
  status: string;
  message: string;
}

interface ExpectedJwtPayload {
  sub: number;
  role: string;
}

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private activeUsers = new Map<number, string>();

  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
    private readonly sendMessageUseCase: SendMessageUseCase,

    @Inject(forwardRef(() => GetCharacterUseCase))
    private readonly getCharacterUseCase: GetCharacterUseCase,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const authData = client.handshake.auth as Record<string, unknown>;
      const authHeader = client.handshake.headers.authorization;

      let rawToken: string | undefined;

      if (typeof authData.token === 'string') {
        rawToken = authData.token;
      } else if (typeof authHeader === 'string') {
        rawToken = authHeader;
      } else if (
        Array.isArray(authHeader) &&
        typeof authHeader[0] === 'string'
      ) {
        rawToken = authHeader[0];
      }

      if (!rawToken) throw new Error('No token provided');

      const token = rawToken.startsWith('Bearer ')
        ? rawToken.slice(7)
        : rawToken;

      const ip = client.handshake.address || 'unknown';
      const userAgent = client.handshake.headers['user-agent'] || 'unknown';
      const currentFingerprint = crypto
        .createHash('sha256')
        .update(`${ip}-${userAgent}`)
        .digest('hex');

      const payload = (await this.tokenService.verifyToken(
        token,
        currentFingerprint,
      )) as ExpectedJwtPayload;

      const userId = Number(payload.sub);

      await client.join(`user_${String(userId)}`);

      this.activeUsers.set(userId, client.id);
      console.log(`[Chat] User ${String(userId)} connected.`);
    } catch {
      console.log(`[Chat] Connection rejected`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    for (const [userId, socketId] of Array.from(this.activeUsers.entries())) {
      if (socketId === client.id) {
        this.activeUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: number },
  ): void {
    const roomStr = data.roomId.toString();

    client.rooms.forEach((room) => {
      if (room !== client.id && !room.startsWith('user_')) {
        void client.leave(room);
      }
    });

    void client.join(roomStr);

    this.server.to(roomStr).emit('room_update');

    console.log(`[Chat] ${client.id} joined room ${roomStr}`);
  }

  @SubscribeMessage('send_direct_message')
  async handleDirectMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: number; content: string },
  ): Promise<GatewayResponse> {
    let senderId: number | null = null;
    for (const [id, socketId] of Array.from(this.activeUsers.entries())) {
      if (socketId === client.id) {
        senderId = id;
        break;
      }
    }

    if (!senderId) return { status: 'error', message: 'User not identified.' };

    await this.sendMessageUseCase.execute({
      senderId,
      receiverId: data.receiverId,
      content: data.content,
    });

    const payload = {
      senderId,
      content: data.content,
      timestamp: new Date().toISOString(),
    };

    this.server
      .to(`user_${String(data.receiverId)}`)
      .emit('receive_direct_message', payload);
    this.server
      .to(`user_${String(senderId)}`)
      .emit('receive_direct_message', payload);

    return { status: 'success', message: 'Message sent.' };
  }

  @SubscribeMessage('send_local_message')
  async handleLocalMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: number; content: string },
  ): Promise<GatewayResponse> {
    let senderId: number | null = null;
    for (const [id, socketId] of Array.from(this.activeUsers.entries())) {
      if (socketId === client.id) {
        senderId = id;
        break;
      }
    }

    if (!senderId) return { status: 'error', message: 'User not identified.' };

    try {
      const char = await this.getCharacterUseCase.execute(senderId);
      this.server.to(data.roomId.toString()).emit('receive_local_message', {
        senderId,
        senderName: char.name,
        content: data.content,
        timestamp: new Date().toISOString(),
      });
      return { status: 'success', message: 'Broadcasted' };
    } catch {
      return { status: 'error', message: 'Failed' };
    }
  }

  broadcastSystemAlert(message: string): void {
    this.server.emit('system_alert', {
      type: 'SYSTEM_BROADCAST',
      content: message,
      timestamp: new Date().toISOString(),
    });
  }
}
