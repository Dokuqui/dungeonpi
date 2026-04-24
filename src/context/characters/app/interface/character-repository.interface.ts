import { Character } from '../../domain/class/character.class';

export const CHARACTER_REPOSITORY = 'CHARACTER_REPOSITORY';

export interface ICharacterRepository {
  save(character: Character): Promise<void>;
  findAll(): Promise<Character[]>;
  findByUserId(userId: number): Promise<Character | null>;
  findByCoordinates(x: number, y: number): Promise<Character[]>;
  findByName(name: string): Promise<Character | null>;
}
