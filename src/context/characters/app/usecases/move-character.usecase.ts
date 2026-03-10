import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CHARACTER_REPOSITORY } from '../interface/character-repository.interface';
import type { ICharacterRepository } from '../interface/character-repository.interface';

export interface MoveCharacterInputDto {
  userId: number;
  direction: string;
}

@Injectable()
export class MoveCharacterUseCase {
  constructor(
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: ICharacterRepository,
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

    character.move(dx, dy);
    await this.characterRepository.save(character);
    return {
      x: character.coordinates.x,
      y: character.coordinates.y,
    };
  }
}
