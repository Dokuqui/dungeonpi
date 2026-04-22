import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('device_sessions')
export class DeviceSessionOrmEntity {
  @PrimaryColumn()
  familyId!: string;

  @Column()
  userId!: number;

  @Column()
  refreshTokenHash!: string;

  @Column()
  fingerprint!: string;

  @Column({ default: false })
  isRevoked!: boolean;

  @Column()
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
