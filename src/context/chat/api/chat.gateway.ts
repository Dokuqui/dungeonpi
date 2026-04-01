import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../auth/domain/role.enum';
import { SendMessageUseCase } from '../app/usecases/send-message.usecase';
import { GetCharacterUseCase } from 'src/context/characters/app/usecases/get-character.usecase';
import { GetCharactersAtCoordinatesUseCase } from 'src/context/characters/app/usecases/get-characters-at-coordinates.usecase';

interface AuthenticatedSocket {
  id: string;
  handshake: {
    headers: {
      authorization?: string | string[];
    };
  };
  emit: (ev: string, data: unknown) => void;
  disconnect: () => void;
}

interface GatewayServer {
  emit: (ev: string, data: unknown) => void;
}

interface JwtPayload {
  sub: number;
  role: Role;
}

interface IncomingMessageDto {
  receiverId: number;
  content: string;
}

interface GatewayResponse {
  status: string;
  message: string;
}

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: GatewayServer;

  private activeUsers = new Map<number, AuthenticatedSocket>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getCharacterUseCase: GetCharacterUseCase,
    private readonly getCharactersAtCoordinatesUseCase: GetCharactersAtCoordinatesUseCase,
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const authHeader = client.handshake.headers.authorization;

      const tokenString = Array.isArray(authHeader)
        ? authHeader[0]
        : authHeader;
      const token = tokenString ? tokenString.split(' ')[1] : undefined;

      if (!token) {
        throw new Error('No token provided');
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new Error('JWT Secret is not configured');
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });

      const userId = payload.sub;

      this.activeUsers.set(userId, client);
      console.log(
        `[Chat] User ${String(userId)} connected. Total online: ${String(this.activeUsers.size)}`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown authentication error';
      console.log(`[Chat] Connection rejected: ${errorMessage}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    for (const [userId, socket] of Array.from(this.activeUsers.entries())) {
      if (socket.id === client.id) {
        this.activeUsers.delete(userId);
        console.log(
          `[Chat] User ${String(userId)} disconnected. Total online: ${String(this.activeUsers.size)}`,
        );
        break;
      }
    }
  }

  @SubscribeMessage('send_direct_message')
  async handleDirectMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: IncomingMessageDto,
  ): Promise<GatewayResponse> {
    let senderId: number | null = null;

    for (const [id, socket] of Array.from(this.activeUsers.entries())) {
      if (socket.id === client.id) {
        senderId = id;
        break;
      }
    }

    if (!senderId) {
      return { status: 'error', message: 'User not identified.' };
    }

    await this.sendMessageUseCase.execute({
      senderId,
      receiverId: data.receiverId,
      content: data.content,
    });

    const receiverSocket = this.activeUsers.get(data.receiverId);
    if (receiverSocket) {
      receiverSocket.emit('receive_direct_message', {
        senderId,
        content: data.content,
        timestamp: new Date().toISOString(),
      });
    }

    return { status: 'success', message: 'Message sent.' };
  }

  broadcastSystemAlert(message: string): void {
    this.server.emit('system_alert', {
      type: 'SYSTEM_BROADCAST',
      content: message,
      timestamp: new Date().toISOString(),
    });
    console.log(`[Chat] Global Broadcast Sent: ${message}`);
  }

  @SubscribeMessage('send_local_message')
  async handleLocalMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { content: string },
  ): Promise<GatewayResponse> {
    let senderId: number | null = null;

    for (const [id, socket] of Array.from(this.activeUsers.entries())) {
      if (socket.id === client.id) {
        senderId = id;
        break;
      }
    }

    if (!senderId) {
      return { status: 'error', message: 'User not identified.' };
    }

    try {
      const senderCharacter = await this.getCharacterUseCase.execute(senderId);
      const { x, y } = senderCharacter.coordinates;

      const charactersInRoom =
        await this.getCharactersAtCoordinatesUseCase.execute(x, y);

      for (const char of charactersInRoom) {
        const receiverSocket = this.activeUsers.get(char.userId);

        if (receiverSocket && char.userId !== senderId) {
          receiverSocket.emit('receive_local_message', {
            senderId,
            senderName: senderCharacter.name,
            content: data.content,
            timestamp: new Date().toISOString(),
          });
        }
      }

      return { status: 'success', message: 'Local message sent to the room.' };
    } catch {
      return { status: 'error', message: 'Could not send local message.' };
    }
  }
}
