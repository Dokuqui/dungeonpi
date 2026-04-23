import { Inject, Injectable } from '@nestjs/common';
import { Spawner } from '../../domain/spawner.class';
import { SPAWNER_REPOSITORY } from '../interface/spawner-repository.interface';
import type { ISpawnerRepository } from '../interface/spawner-repository.interface';

export interface CreateSpawnerInputDto {
  x: number;
  y: number;
  monsterName: string;
  monsterMaxHealth: number;
  monsterDamage: number;
}

@Injectable()
export class CreateSpawnerUseCase {
  constructor(
    @Inject(SPAWNER_REPOSITORY)
    private readonly spawnerRepository: ISpawnerRepository,
  ) {}

  async execute(input: CreateSpawnerInputDto): Promise<void> {
    const spawner = Spawner.create(
      input.x,
      input.y,
      input.monsterName,
      input.monsterMaxHealth,
      input.monsterDamage,
    );

    await this.spawnerRepository.save(spawner);
  }
}
