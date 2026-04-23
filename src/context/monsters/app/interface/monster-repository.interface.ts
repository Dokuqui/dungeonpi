import { Monster } from '../../domain/monster.class';

export const MONSTER_REPOSITORY = 'MONSTER_REPOSITORY';

export interface IMonsterRepository {
  save(monster: Monster): Promise<void>;
  findByCoordinates(x: number, y: number): Promise<Monster | null>;
}
