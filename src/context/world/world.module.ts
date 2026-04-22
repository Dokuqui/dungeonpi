import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterModule } from '../characters/character.module';
import { RoomOrmEntity } from './infra/persistence/entities/room.orm-entity';
import { WorldController } from './api/world.controller';
import { CreateRoomUseCase } from './app/usecases/create-room.usecase';
import { LookAroundUseCase } from './app/usecases/look-around.usecase';
import { ROOM_REPOSITORY } from './app/interface/room-repository.interface';
import { RoomRepository } from './infra/persistence/repo/room.repository';
import { MonstersModule } from '../monsters/monsters.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoomOrmEntity]),
    MonstersModule,
    forwardRef(() => CharacterModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [WorldController],
  providers: [
    CreateRoomUseCase,
    LookAroundUseCase,
    {
      provide: ROOM_REPOSITORY,
      useClass: RoomRepository,
    },
  ],
  exports: [ROOM_REPOSITORY],
})
export class WorldModule {}
