import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('messages')
export class MessageOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'sender_id' })
  senderId!: number;

  @Column({ name: 'receiver_id' })
  receiverId!: number;

  @Column({ type: 'text' })
  content!: string;

  @Column({ name: 'is_read', default: false })
  isRead!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
