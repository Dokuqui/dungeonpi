import { Inject, Injectable } from '@nestjs/common';
import { MESSAGE_REPOSITORY } from '../interfaces/message-repository.interface';
import type { IMessageRepository } from '../interfaces/message-repository.interface';

@Injectable()
export class GetContactsUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(userId: number): Promise<number[]> {
    return this.messageRepository.getContactIds(userId);
  }
}
