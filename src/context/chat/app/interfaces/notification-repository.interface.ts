import { Notification } from '../../domain/class/notification.class';

export const NOTIFICATION_REPOSITORY = 'NOTIFICATION_REPOSITORY';

export interface INotificationRepository {
  save(notification: Notification): Promise<void>;

  findByUserId(userId: number): Promise<Notification[]>;

  markAsRead(notificationId: number): Promise<void>;
}
