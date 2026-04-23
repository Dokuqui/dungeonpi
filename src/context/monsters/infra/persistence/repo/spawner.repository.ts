import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpawnerOrmEntity } from '../entities/spawner.orm-entity';
import { Spawner } from 'src/context/monsters/domain/spawner.class';
import { ISpawnerRepository } from 'src/context/monsters/app/interface/spawner-repository.interface';
import { Coordinates } from 'src/context/characters/domain/class/coordinates.class';

@Injectable()
export class SpawnerRepository implements ISpawnerRepository {
  constructor(
    @InjectRepository(SpawnerOrmEntity)
    private readonly ormRepository: Repository<SpawnerOrmEntity>,
  ) {}

  async save(spawner: Spawner): Promise<void> {
    const orm = new SpawnerOrmEntity();
    if (spawner.id !== undefined) orm.id = spawner.id;
    orm.x = spawner.coordinates.x;
    orm.y = spawner.coordinates.y;
    orm.monsterName = spawner.monsterName;
    orm.monsterMaxHealth = spawner.monsterMaxHealth;
    orm.monsterDamage = spawner.monsterDamage;

    await this.ormRepository.save(orm);
  }

  async findAll(): Promise<Spawner[]> {
    const ormEntities = await this.ormRepository.find();
    return ormEntities.map((orm) => {
      const coords = Coordinates.create(orm.x, orm.y);
      return Spawner.reconstitute(
        orm.id,
        coords,
        orm.monsterName,
        orm.monsterMaxHealth,
        orm.monsterDamage,
      );
    });
  }
}
