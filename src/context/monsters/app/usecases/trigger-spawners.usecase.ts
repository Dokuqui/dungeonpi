import { Inject, Injectable, Logger } from '@nestjs/common';
import { Monster } from '../../domain/monster.entity';
import { SPAWNER_REPOSITORY } from '../interface/spawner-repository.interface';
import { MONSTER_REPOSITORY } from '../interface/monster-repository.interface';
import type { ISpawnerRepository } from '../interface/spawner-repository.interface';
import type { IMonsterRepository } from '../interface/monster-repository.interface';

@Injectable()
export class TriggerSpawnersUseCase {
  private readonly logger = new Logger(TriggerSpawnersUseCase.name);

  constructor(
    @Inject(SPAWNER_REPOSITORY)
    private readonly spawnerRepository: ISpawnerRepository,
    @Inject(MONSTER_REPOSITORY)
    private readonly monsterRepository: IMonsterRepository,
  ) {}

  async execute(): Promise<void> {
    this.logger.debug('Waking up spawners to check for missing monsters...');

    const spawners = await this.spawnerRepository.findAll();

    for (const spawner of spawners) {
      const existingMonster = await this.monsterRepository.findByCoordinates(
        spawner.coordinates.x,
        spawner.coordinates.y,
      );

      if (!existingMonster) {
        const newMonster = Monster.create(
          spawner.monsterName,
          spawner.monsterMaxHealth,
          spawner.monsterDamage,
          spawner.coordinates.x,
          spawner.coordinates.y,
        );

        await this.monsterRepository.save(newMonster);
        this.logger.log(
          `Spawned a new ${spawner.monsterName} at (${spawner.coordinates.x}, ${spawner.coordinates.y})!`,
        );
      }
    }
  }
}
