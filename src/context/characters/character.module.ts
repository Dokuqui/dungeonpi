import { forwardRef, Inject, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterOrmEntity } from './infra/persistence/entities/character.orm-entity';
import { CharactersController } from './api/characters.controller';
import { CreateCharacterUseCase } from './app/usecases/create-character.usecase';
import {
  CHARACTER_REPOSITORY,
  type ICharacterRepository,
} from './app/interface/character-repository.interface';
import { CharacterRepository } from './infra/persistence/repo/character.repository';
import { GetCharacterUseCase } from './app/usecases/get-character.usecase';
import { MoveCharacterUseCase } from './app/usecases/move-character.usecase';
import { GetCharactersAtCoordinatesUseCase } from './app/usecases/get-characters-at-coordinates.usecase';
import { WorldModule } from '../world/world.module';
import { ChatModule } from '../chat/chat.module';
import { AuthModule } from '../auth/auth.module';
import { BloomFilter } from 'src/core/filters/bloom.filter';

@Module({
  imports: [
    TypeOrmModule.forFeature([CharacterOrmEntity]),
    forwardRef(() => WorldModule),
    forwardRef(() => ChatModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [CharactersController],
  providers: [
    CreateCharacterUseCase,
    GetCharactersAtCoordinatesUseCase,
    GetCharacterUseCase,
    MoveCharacterUseCase,
    {
      provide: 'BLOOM_FILTER_NAME',
      useFactory: () => new BloomFilter(100000, 3),
    },
    {
      provide: CHARACTER_REPOSITORY,
      useClass: CharacterRepository,
    },
  ],
  exports: [
    CHARACTER_REPOSITORY,
    GetCharacterUseCase,
    GetCharactersAtCoordinatesUseCase,
  ],
})
export class CharacterModule implements OnModuleInit {
  constructor(
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepo: ICharacterRepository,
    @Inject('BLOOM_FILTER_NAME') private readonly nameBloomFilter: BloomFilter,
  ) {}

  async onModuleInit() {
    console.log('[CharacterModule] Bootstrapping Hero Name Bloom Filter...');

    try {
      const allCharacters = await this.characterRepo.findAll();

      for (const char of allCharacters) {
        this.nameBloomFilter.add(char.name);
      }

      console.log(
        `[CharacterModule] Bloom Filter securely loaded with ${allCharacters.length} existing hero names.`,
      );
    } catch (error) {
      console.error(
        '[CharacterModule] Failed to bootstrap Bloom Filter.',
        error,
      );
    }
  }
}
