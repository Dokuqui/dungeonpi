import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY } from '../interfaces/notification-repository.interface';
import type { INotificationRepository } from '../interfaces/notification-repository.interface';
import { Notification } from '../../domain/class/notification.class';

@Injectable()
export class GetNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(userId: number): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId);
  }
}
