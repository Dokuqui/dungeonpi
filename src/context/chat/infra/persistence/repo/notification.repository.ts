import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { INotificationRepository } from 'src/context/chat/app/interfaces/notification-repository.interface';
import { Notification } from 'src/context/chat/domain/notification.entity';
import { NotificationOrmEntity } from '../entities/notification.orm-entity';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(NotificationOrmEntity)
    private readonly ormRepository: Repository<NotificationOrmEntity>,
  ) {}

  async save(notification: Notification): Promise<void> {
    const orm = new NotificationOrmEntity();
    if (notification.id !== undefined) orm.id = notification.id;
    orm.userId = notification.userId;
    orm.type = notification.type;
    orm.content = notification.content;
    orm.isRead = notification.isRead;

    await this.ormRepository.save(orm);
  }

  async findByUserId(userId: number): Promise<Notification[]> {
    const ormEntities = await this.ormRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }, // Newest first
    });

    return ormEntities.map((orm) => this.toDomainEntity(orm));
  }

  async markAsRead(notificationId: number): Promise<void> {
    await this.ormRepository.update(notificationId, { isRead: true });
  }

  private toDomainEntity(orm: NotificationOrmEntity): Notification {
    return Notification.reconstitute(
      orm.id,
      orm.userId,
      orm.type,
      orm.content,
      orm.isRead,
      orm.createdAt,
    );
  }
}
