import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { CHARACTER_REPOSITORY } from '../interface/character-repository.interface';
import type { ICharacterRepository } from '../interface/character-repository.interface';
import { Character } from '../../domain/character.entity';

@Injectable()
export class CreateCharacterUseCase {
  constructor(
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: ICharacterRepository,
  ) {}

  async execute(params: { userId: number; name: string }): Promise<Character> {
    const { userId, name } = params;

    const existingByUser = await this.characterRepository.findByUserId(userId);
    if (existingByUser) {
      throw new ConflictException(
        'Your soul is already bound to another hero.',
      );
    }

    const existingByName = await this.characterRepository.findByName(name);
    if (existingByName) {
      throw new ConflictException(
        `The name "${name}" is already claimed by another soul.`,
      );
    }

    const character = Character.create(userId, name);
    await this.characterRepository.save(character);
    return character;
  }
}
