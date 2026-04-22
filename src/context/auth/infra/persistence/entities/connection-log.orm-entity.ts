import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('connection_logs')
export class ConnectionLogOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  userId!: number;

  @Column()
  ipAddress!: string;

  @Column()
  userAgent!: string;

  @Column()
  status!: 'SUCCESS' | 'FAIL' | 'SUSPICIOUS';

  @CreateDateColumn()
  timestamp!: Date;
}
