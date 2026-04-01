import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageOrmEntity } from './infra/persistence/entities/message.orm-entity';
import { NotificationOrmEntity } from './infra/persistence/entities/notification.orm-entity';
import { ChatController } from './api/chat.controller';
import { SendMessageUseCase } from './app/usecases/send-message.usecase';
import { GetConversationUseCase } from './app/usecases/get-conversation.usecase';
import { GetContactsUseCase } from './app/usecases/get-contacts.usecase';
import { MESSAGE_REPOSITORY } from './app/interfaces/message-repository.interface';
import { MessageRepository } from './infra/persistence/repo/message.repository';
import { NOTIFICATION_REPOSITORY } from './app/interfaces/notification-repository.interface';
import { NotificationRepository } from './infra/persistence/repo/notification.repository';
import { AuthModule } from '../auth/auth.module';
import { ChatGateway } from './api/chat.gateway';
import { GetNotificationsUseCase } from './app/usecases/get-notifications.usecase';
import { MarkNotificationReadUseCase } from './app/usecases/mark-notification-read.usecase';
import { MarkMessageReadUseCase } from './app/usecases/mark-message-read.usecase';
import { CharacterModule } from '../characters/character.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageOrmEntity, NotificationOrmEntity]),
    AuthModule,
    CharacterModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    SendMessageUseCase,
    MarkMessageReadUseCase,
    GetConversationUseCase,
    GetContactsUseCase,
    GetNotificationsUseCase,
    MarkNotificationReadUseCase,
    { provide: MESSAGE_REPOSITORY, useClass: MessageRepository },
    { provide: NOTIFICATION_REPOSITORY, useClass: NotificationRepository },
  ],
})
export class ChatModule {}
