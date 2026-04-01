import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../core/guards/permissions.guard';
import { Permissions } from '../../../core/decorators/permissions.decorator';
import { Permission } from '../../auth/domain/permission.enum';
import { Role } from '../../auth/domain/role.enum';
import { SendMessageUseCase } from '../app/usecases/send-message.usecase';
import { GetConversationUseCase } from '../app/usecases/get-conversation.usecase';
import { GetContactsUseCase } from '../app/usecases/get-contacts.usecase';
import { SendMessageDto } from './dtos/send-message.dto';
import { GetNotificationsUseCase } from '../app/usecases/get-notifications.usecase';
import { MarkNotificationReadUseCase } from '../app/usecases/mark-notification-read.usecase';
import { ChatGateway } from './chat.gateway';
import { BroadcastDto } from './dtos/broadcast.dto';
import { MarkMessageReadUseCase } from '../app/usecases/mark-message-read.usecase';

interface RequestWithUser extends Request {
  user: { userId: number; role: Role };
}

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getConversationUseCase: GetConversationUseCase,
    private readonly getContactsUseCase: GetContactsUseCase,
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly chatGateway: ChatGateway,
    private readonly markMessageReadUseCase: MarkMessageReadUseCase,
  ) {}

  @Post('messages')
  @Permissions(Permission.SEND_MESSAGE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a direct message to another user' })
  async sendMessage(@Req() req: RequestWithUser, @Body() dto: SendMessageDto) {
    await this.sendMessageUseCase.execute({
      senderId: req.user.userId,
      receiverId: dto.receiverId,
      content: dto.content,
    });
    return { message: 'Message sent successfully.' };
  }

  @Patch('messages/:id/read')
  @Permissions(Permission.PLAY_GAME)
  @ApiOperation({ summary: 'Mark a direct message as read' })
  async markMessageAsRead(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.markMessageReadUseCase.execute(id, req.user.userId);
    return { message: 'Message marked as read.' };
  }

  @Get('contacts')
  @Permissions(Permission.PLAY_GAME)
  @ApiOperation({ summary: 'Get a list of user IDs you have chatted with' })
  async getContacts(@Req() req: RequestWithUser) {
    const contactIds = await this.getContactsUseCase.execute(req.user.userId);
    return { contacts: contactIds };
  }

  @Get('messages/:contactId')
  @Permissions(Permission.PLAY_GAME)
  @ApiOperation({ summary: 'Get the chat history with a specific user' })
  async getConversation(
    @Req() req: RequestWithUser,
    @Param('contactId', ParseIntPipe) contactId: number,
  ) {
    const messages = await this.getConversationUseCase.execute(
      req.user.userId,
      contactId,
    );

    return messages.map((msg) => ({
      id: msg.id,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      content: msg.content,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
    }));
  }

  @Get('notifications')
  @Permissions(Permission.PLAY_GAME)
  @ApiOperation({ summary: 'Get all your notifications' })
  async getNotifications(@Req() req: RequestWithUser) {
    const notifications = await this.getNotificationsUseCase.execute(
      req.user.userId,
    );
    return { notifications };
  }

  @Patch('notifications/:id/read')
  @Permissions(Permission.PLAY_GAME)
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markNotificationAsRead(@Param('id', ParseIntPipe) id: number) {
    await this.markNotificationReadUseCase.execute(id);
    return { message: 'Notification marked as read.' };
  }

  @Post('broadcast')
  @Permissions(Permission.CREATE_ROOM)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send a live global alert to ALL online players (Admin Only)',
  })
  broadcastSystemAlert(@Body() dto: BroadcastDto) {
    this.chatGateway.broadcastSystemAlert(dto.message);
    return { message: 'Broadcast sent successfully!' };
  }
}
