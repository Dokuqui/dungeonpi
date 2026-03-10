import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CHARACTER_REPOSITORY } from '../interface/character-repository.interface';
import type { ICharacterRepository } from '../interface/character-repository.interface';
import { Character } from '../../domain/character.entity';

@Injectable()
export class GetCharacterUseCase {
  constructor(
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: ICharacterRepository,
  ) {}

  async execute(userId: number): Promise<Character> {
    const character = await this.characterRepository.findByUserId(userId);
    if (!character) {
      throw new NotFoundException(
        'You do not have an active character. Please create one first.',
      );
    }
    return character;
  }
}
