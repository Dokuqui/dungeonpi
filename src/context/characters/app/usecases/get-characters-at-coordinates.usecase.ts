import { Inject, Injectable } from '@nestjs/common';
import type { ICharacterRepository } from '../interface/character-repository.interface';
import { Character } from '../../domain/character.entity';
import { CHARACTER_REPOSITORY } from '../interface/character-repository.interface';

@Injectable()
export class GetCharactersAtCoordinatesUseCase {
  constructor(
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: ICharacterRepository,
  ) {}

  async execute(x: number, y: number): Promise<Character[]> {
    return this.characterRepository.findByCoordinates(x, y);
  }
}
