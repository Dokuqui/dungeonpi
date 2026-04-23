import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageOrmEntity } from '../entities/message.orm-entity';
import { IMessageRepository } from 'src/context/chat/app/interfaces/message-repository.interface';
import { Message } from 'src/context/chat/domain/class/message.class';

@Injectable()
export class MessageRepository implements IMessageRepository {
  constructor(
    @InjectRepository(MessageOrmEntity)
    private readonly ormRepository: Repository<MessageOrmEntity>,
  ) {}

  async save(message: Message): Promise<void> {
    const orm = new MessageOrmEntity();
    if (message.id !== undefined) orm.id = message.id;
    orm.senderId = message.senderId;
    orm.receiverId = message.receiverId;
    orm.content = message.content;
    orm.isRead = message.isRead;

    await this.ormRepository.save(orm);
  }

  async getConversation(userAId: number, userBId: number): Promise<Message[]> {
    const ormEntities = await this.ormRepository.find({
      where: [
        { senderId: userAId, receiverId: userBId },
        { senderId: userBId, receiverId: userAId },
      ],
      order: { createdAt: 'ASC' },
    });

    return ormEntities.map((orm) => this.toDomainEntity(orm));
  }

  async getContactIds(userId: number): Promise<number[]> {
    const contacts: { contactId: number }[] = await this.ormRepository
      .createQueryBuilder('message')
      .select(
        'DISTINCT CASE WHEN message.sender_id = :userId THEN message.receiver_id ELSE message.sender_id END',
        'contactId',
      )
      .where('message.sender_id = :userId OR message.receiver_id = :userId', {
        userId,
      })
      .getRawMany<{ contactId: number }>();

    return contacts.map((c) => c.contactId);
  }

  async findById(id: number): Promise<Message | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { id } });
    if (!ormEntity) return null;
    return this.toDomainEntity(ormEntity);
  }

  private toDomainEntity(orm: MessageOrmEntity): Message {
    return Message.reconstitute(
      orm.id,
      orm.senderId,
      orm.receiverId,
      orm.content,
      orm.isRead,
      orm.createdAt,
    );
  }
}
