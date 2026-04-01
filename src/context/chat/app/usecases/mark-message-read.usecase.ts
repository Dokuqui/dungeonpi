import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { MESSAGE_REPOSITORY } from '../interfaces/message-repository.interface';
import type { IMessageRepository } from '../interfaces/message-repository.interface';

@Injectable()
export class MarkMessageReadUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(messageId: number, userId: number): Promise<void> {
    const message = await this.messageRepository.findById(messageId);

    if (!message) {
      throw new NotFoundException('Message not found.');
    }

    if (message.receiverId !== userId) {
      throw new ForbiddenException(
        'You can only mark your own messages as read.',
      );
    }

    message.markAsRead();
    await this.messageRepository.save(message);
  }
}
