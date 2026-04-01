import { Inject, Injectable } from '@nestjs/common';
import { MESSAGE_REPOSITORY } from '../interfaces/message-repository.interface';
import type { IMessageRepository } from '../interfaces/message-repository.interface';
import { Message } from '../../domain/message.entity';

@Injectable()
export class GetConversationUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(userAId: number, userBId: number): Promise<Message[]> {
    return this.messageRepository.getConversation(userAId, userBId);
  }
}
