import { Inject, Injectable } from '@nestjs/common';
import { CHARACTER_REPOSITORY } from '../interface/character-repository.interface';
import type { ICharacterRepository } from '../interface/character-repository.interface';
import { Character } from '../../domain/character.entity';

export interface CreateCharacterInputDto {
  userId: number;
  name: string;
}

@Injectable()
export class CreateCharacterUseCase {
  constructor(
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: ICharacterRepository,
  ) {}

  async execute(input: CreateCharacterInputDto): Promise<void> {
    const existingCharacter = await this.characterRepository.findByUserId(
      input.userId,
    );
    if (existingCharacter) {
      throw new Error('User already has an active character.');
    }

    const newCharacter = Character.create(input.userId, input.name);

    await this.characterRepository.save(newCharacter);
  }
}
