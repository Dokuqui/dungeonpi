import { Inject, Injectable } from '@nestjs/common';
import { ROOM_REPOSITORY } from '../interface/room-repository.interface';
import type { IRoomRepository } from '../interface/room-repository.interface';

export interface LookAroundInputDto {
  x: number;
  y: number;
}

export interface LookAroundOutputDto {
  name: string;
  description: string;
}

@Injectable()
export class LookAroundUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(input: LookAroundInputDto): Promise<LookAroundOutputDto> {
    const room = await this.roomRepository.findByCoordinates(input.x, input.y);

    if (!room) {
      return {
        name: 'The Void',
        description:
          'An endless expanse of nothingness. You should probably head back.',
      };
    }

    return {
      name: room.name,
      description: room.description,
    };
  }
}
