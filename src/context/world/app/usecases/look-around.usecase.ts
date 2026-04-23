import {
  Injectable,
  Inject,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CHARACTER_REPOSITORY } from 'src/context/characters/app/interface/character-repository.interface';
import type { ICharacterRepository } from 'src/context/characters/app/interface/character-repository.interface';
import { ROOM_REPOSITORY } from '../interface/room-repository.interface';
import type { IRoomRepository } from '../interface/room-repository.interface';
import { Room } from '../../domain/room.class';

@Injectable()
export class LookAroundUseCase {
  constructor(
    @Inject(forwardRef(() => CHARACTER_REPOSITORY))
    private readonly characterRepo: ICharacterRepository,

    @Inject(ROOM_REPOSITORY)
    private readonly roomRepo: IRoomRepository,
  ) {}

  async execute(userId: number) {
    const character = await this.characterRepo.findByUserId(userId);
    if (!character) throw new NotFoundException('Character not found');

    const { x, y } = character.coordinates;
    let room = await this.roomRepo.findByCoordinates(x, y);

    if (!room) {
      room = Room.create(
        x,
        y,
        x === 0 && y === 0 ? 'The Safe Haven' : 'Uncharted Dungeon',
        'A mysterious room forged from the void...',
      );
      await this.roomRepo.save(room);
    }

    const playersInRoom = await this.characterRepo.findByCoordinates(x, y);

    return {
      id: room.id,
      x: room.x,
      y: room.y,
      name: room.name,
      description: room.description,
      players: playersInRoom.map((p) => ({
        userId: p.userId,
        name: p.name,
      })),
    };
  }
}
