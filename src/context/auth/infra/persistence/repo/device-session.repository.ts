import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceSessionOrmEntity } from '../entities/device-session.orm-entity';
import {
  DeviceSessionData,
  IDeviceSessionRepository,
} from '../../../app/interface/device-session-repository.interface';

@Injectable()
export class DeviceSessionRepository implements IDeviceSessionRepository {
  constructor(
    @InjectRepository(DeviceSessionOrmEntity)
    private readonly repo: Repository<DeviceSessionOrmEntity>,
  ) {}

  async create(data: {
    familyId: string;
    userId: number;
    refreshTokenHash: string;
    fingerprint: string;
    isRevoked: boolean;
    expiresAt: Date;
  }): Promise<void> {
    const session = this.repo.create(data);
    await this.repo.save(session);
  }

  async findByRefreshTokenHash(
    hash: string,
  ): Promise<DeviceSessionData | null> {
    return this.repo.findOne({ where: { refreshTokenHash: hash } });
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.repo.update({ familyId }, { isRevoked: true });
  }

  async updateHash(familyId: string, newHash: string): Promise<void> {
    await this.repo.update({ familyId }, { refreshTokenHash: newHash });
  }
}
