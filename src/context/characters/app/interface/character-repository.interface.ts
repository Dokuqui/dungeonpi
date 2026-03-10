import { Character } from '../../domain/character.entity';

export const CHARACTER_REPOSITORY = 'CHARACTER_REPOSITORY';

export interface ICharacterRepository {
  save(character: Character): Promise<void>;
  findByUserId(userId: number): Promise<Character | null>;
}
