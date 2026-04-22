import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonstersController } from './api/monsters.controller';
import { CreateSpawnerUseCase } from './app/usecases/create-spawner.usecase';
import { TriggerSpawnersUseCase } from './app/usecases/trigger-spawners.usecase';
import { SpawnerOrmEntity } from './infra/persistence/entities/spawner.orm-entity';
import { MonsterOrmEntity } from './infra/persistence/entities/monster.orm-entity';
import { SpawnerRepository } from './infra/persistence/repo/spawner.repository';
import { MonsterRepository } from './infra/persistence/repo/monster.repository';
import { SpawnerCronService } from './infra/jobs/spawner.cron';
import { SPAWNER_REPOSITORY } from './app/interface/spawner-repository.interface';
import { MONSTER_REPOSITORY } from './app/interface/monster-repository.interface';
import { GetMonsterAtCoordinatesUseCase } from './app/usecases/get-monster-at-coordinates.usecase';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SpawnerOrmEntity, MonsterOrmEntity]),
    forwardRef(() => AuthModule),
  ],
  controllers: [MonstersController],
  providers: [
    CreateSpawnerUseCase,
    TriggerSpawnersUseCase,
    SpawnerCronService,
    GetMonsterAtCoordinatesUseCase,
    { provide: SPAWNER_REPOSITORY, useClass: SpawnerRepository },
    { provide: MONSTER_REPOSITORY, useClass: MonsterRepository },
  ],
  exports: [GetMonsterAtCoordinatesUseCase],
})
export class MonstersModule {}
