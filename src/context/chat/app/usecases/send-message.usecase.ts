import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { MESSAGE_REPOSITORY } from '../interfaces/message-repository.interface';
import type { IMessageRepository } from '../interfaces/message-repository.interface';
import { NOTIFICATION_REPOSITORY } from '../interfaces/notification-repository.interface';
import type { INotificationRepository } from '../interfaces/notification-repository.interface';
import { Message } from '../../domain/message.entity';
import { Notification } from '../../domain/notification.entity';

export interface SendMessageInputDto {
  senderId: number;
  receiverId: number;
  content: string;
}

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(input: SendMessageInputDto): Promise<void> {
    if (input.senderId === input.receiverId) {
      // Use NestJS's built-in exception instead of a raw Error!
      throw new BadRequestException('You cannot send a message to yourself.');
    }

    // 1. Save the chat message
    const message = Message.create(
      input.senderId,
      input.receiverId,
      input.content,
    );
    await this.messageRepository.save(message);

    const notification = Notification.create(
      input.receiverId,
      'NEW_MESSAGE',
      `You received a new direct message from User ${input.senderId}`,
    );
    await this.notificationRepository.save(notification);
  }
}
