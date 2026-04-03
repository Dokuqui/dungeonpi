import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterOrmEntity } from './infra/persistence/entities/character.orm-entity';
import { CharactersController } from './api/characters.controller';
import { CreateCharacterUseCase } from './app/usecases/create-character.usecase';
import { CHARACTER_REPOSITORY } from './app/interface/character-repository.interface';
import { CharacterRepository } from './infra/persistence/repo/character.repository';
import { GetCharacterUseCase } from './app/usecases/get-character.usecase';
import { MoveCharacterUseCase } from './app/usecases/move-character.usecase';
import { GetCharactersAtCoordinatesUseCase } from './app/usecases/get-characters-at-coordinates.usecase';
import { WorldModule } from '../world/world.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CharacterOrmEntity]),
    forwardRef(() => WorldModule),
    forwardRef(() => ChatModule),
  ],
  controllers: [CharactersController],
  providers: [
    CreateCharacterUseCase,
    GetCharactersAtCoordinatesUseCase,
    GetCharacterUseCase,
    MoveCharacterUseCase,
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
export class CharacterModule {}
