import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConnectionLogOrmEntity } from '../entities/connection-log.orm-entity';
import {
  ConnectionLogData,
  IConnectionLogRepository,
} from '../../../app/interface/connection-log-repository.interface';

@Injectable()
export class ConnectionLogRepository implements IConnectionLogRepository {
  constructor(
    @InjectRepository(ConnectionLogOrmEntity)
    private readonly repo: Repository<ConnectionLogOrmEntity>,
  ) {}

  async create(data: ConnectionLogData): Promise<void> {
    const log = this.repo.create({
      ...data,
      userId: data.userId === null ? undefined : data.userId,
    });
    await this.repo.save(log);
  }
}
