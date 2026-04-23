import { Message } from '../../domain/class/message.class';

export const MESSAGE_REPOSITORY = 'MESSAGE_REPOSITORY';

export interface IMessageRepository {
  save(message: Message): Promise<void>;

  getConversation(userAId: number, userBId: number): Promise<Message[]>;

  getContactIds(userId: number): Promise<number[]>;

  findById(id: number): Promise<Message | null>;
}
