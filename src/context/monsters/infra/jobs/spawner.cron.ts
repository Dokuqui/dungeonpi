import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TriggerSpawnersUseCase } from '../../app/usecases/trigger-spawners.usecase';

@Injectable()
export class SpawnerCronService {
  constructor(
    private readonly triggerSpawnersUseCase: TriggerSpawnersUseCase,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleSpawning() {
    await this.triggerSpawnersUseCase.execute();
  }
}
