import { Inject, Injectable } from '@nestjs/common';
import { ROOM_REPOSITORY } from '../interface/room-repository.interface';
import type { IRoomRepository } from '../interface/room-repository.interface';
import { Room } from '../../domain/room.entity';

export interface CreateRoomInputDto {
  x: number;
  y: number;
  name: string;
  description: string;
}

@Injectable()
export class CreateRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(input: CreateRoomInputDto): Promise<void> {
    const existingRoom = await this.roomRepository.findByCoordinates(
      input.x,
      input.y,
    );
    if (existingRoom) {
      throw new Error(
        `A room already exists at coordinates (${input.x}, ${input.y}).`,
      );
    }

    const newRoom = Room.create(
      input.x,
      input.y,
      input.name,
      input.description,
    );

    await this.roomRepository.save(newRoom);
  }
}
