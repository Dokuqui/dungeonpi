import { Inject, Injectable } from '@nestjs/common';
import {
  MONSTER_REPOSITORY,
  type IMonsterRepository,
} from '../interface/monster-repository.interface';
import { Monster } from '../../domain/monster.entity';

@Injectable()
export class GetMonsterAtCoordinatesUseCase {
  constructor(
    @Inject(MONSTER_REPOSITORY)
    private readonly monsterRepository: IMonsterRepository,
  ) {}

  async execute(x: number, y: number): Promise<Monster | null> {
    return this.monsterRepository.findByCoordinates(x, y);
  }
}
