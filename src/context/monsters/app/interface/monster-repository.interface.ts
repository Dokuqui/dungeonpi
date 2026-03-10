import { Monster } from '../../domain/monster.entity';

export const MONSTER_REPOSITORY = 'MONSTER_REPOSITORY';

export interface IMonsterRepository {
  save(monster: Monster): Promise<void>;
  findByCoordinates(x: number, y: number): Promise<Monster | null>;
}
