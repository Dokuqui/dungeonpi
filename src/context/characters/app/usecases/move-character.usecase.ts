import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CHARACTER_REPOSITORY } from '../interface/character-repository.interface';
import type { ICharacterRepository } from '../interface/character-repository.interface';
import { ROOM_REPOSITORY } from 'src/context/world/app/interface/room-repository.interface';
import type { IRoomRepository } from 'src/context/world/app/interface/room-repository.interface';
import { Room } from 'src/context/world/domain/room.entity';
import { ChatGateway } from 'src/context/chat/api/chat.gateway';

export interface MoveCharacterInputDto {
  userId: number;
  direction: string;
}

@Injectable()
export class MoveCharacterUseCase {
  constructor(
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: ICharacterRepository,

    @Inject(forwardRef(() => ROOM_REPOSITORY))
    private readonly roomRepository: IRoomRepository,

    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  async execute(
    input: MoveCharacterInputDto,
  ): Promise<{ x: number; y: number }> {
    const character = await this.characterRepository.findByUserId(input.userId);
    if (!character) {
      throw new NotFoundException(
        'You do not have an active character. Please create one.',
      );
    }

    const oldX = character.coordinates.x;
    const oldY = character.coordinates.y;
    const previousRoom = await this.roomRepository.findByCoordinates(
      oldX,
      oldY,
    );

    let dx = 0;
    let dy = 0;
    switch (input.direction.toLowerCase()) {
      case 'north':
        dy = 1;
        break;
      case 'south':
        dy = -1;
        break;
      case 'east':
        dx = 1;
        break;
      case 'west':
        dx = -1;
        break;
      default:
        throw new Error('Invalid direction.');
    }

    const targetX = character.coordinates.x + dx;
    const targetY = character.coordinates.y + dy;

    let targetRoom = await this.roomRepository.findByCoordinates(
      targetX,
      targetY,
    );

    if (!targetRoom) {
      const names = [
        'Dusty Crypt',
        'Forsaken Hallway',
        'Spider Den',
        'Echoing Chamber',
      ];
      const randomName = names[Math.floor(Math.random() * names.length)];

      targetRoom = Room.create(
        targetX,
        targetY,
        randomName,
        'The shadows stretch infinitely in the dim light...',
      );

      await this.roomRepository.save(targetRoom);
    }

    character.move(dx, dy);
    await this.characterRepository.save(character);

    if (previousRoom?.id) {
      this.chatGateway.server
        .to(previousRoom.id.toString())
        .emit('room_update');
    }

    if (targetRoom?.id) {
      this.chatGateway.server.to(targetRoom.id.toString()).emit('room_update');
    }

    return {
      x: character.coordinates.x,
      y: character.coordinates.y,
    };
  }
}
