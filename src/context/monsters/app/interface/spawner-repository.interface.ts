import { Spawner } from '../../domain/spawner.entity';

export const SPAWNER_REPOSITORY = 'SPAWNER_REPOSITORY';

export interface ISpawnerRepository {
  save(spawner: Spawner): Promise<void>;
  findAll(): Promise<Spawner[]>;
}
