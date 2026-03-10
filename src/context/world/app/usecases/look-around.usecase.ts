import { Inject, Injectable } from '@nestjs/common';
import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '../interface/room-repository.interface';
import { GetMonsterAtCoordinatesUseCase } from 'src/context/monsters/app/usecases/get-monster-at-coordinates.usecase';

export interface LookAroundInputDto {
  x: number;
  y: number;
}

export interface LookAroundOutputDto {
  name: string;
  description: string;
  monster?: {
    name: string;
    health: number;
    maxHealth: number;
  } | null;
}

@Injectable()
export class LookAroundUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly getMonsterUseCase: GetMonsterAtCoordinatesUseCase,
  ) {}

  async execute(input: LookAroundInputDto): Promise<LookAroundOutputDto> {
    const room = await this.roomRepository.findByCoordinates(input.x, input.y);

    const monster = await this.getMonsterUseCase.execute(input.x, input.y);

    const monsterData = monster
      ? {
          name: monster.name,
          health: monster.health.current,
          maxHealth: monster.health.max,
        }
      : null;

    if (!room) {
      return {
        name: 'The Void',
        description: 'An endless expanse of nothingness.',
        monster: monsterData,
      };
    }

    return {
      name: room.name,
      description: room.description,
      monster: monsterData,
    };
  }
}
