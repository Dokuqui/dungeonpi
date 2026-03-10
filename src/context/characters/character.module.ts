import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterOrmEntity } from './infra/persistence/entities/character.orm-entity';
import { CharactersController } from './api/characters.controller';
import { CreateCharacterUseCase } from './app/usecases/create-character.usecase';
import { CHARACTER_REPOSITORY } from './app/interface/character-repository.interface';
import { CharacterRepository } from './infra/persistence/repo/character.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CharacterOrmEntity])],
  controllers: [CharactersController],
  providers: [
    CreateCharacterUseCase,
    {
      provide: CHARACTER_REPOSITORY,
      useClass: CharacterRepository,
    },
  ],
})
export class CharacterModule {}
