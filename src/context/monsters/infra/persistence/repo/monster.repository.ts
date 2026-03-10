import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonsterOrmEntity } from '../entities/monster.orm-entity';
import { IMonsterRepository } from 'src/context/monsters/app/interface/monster-repository.interface';
import { Monster } from 'src/context/monsters/domain/monster.entity';
import { Health } from 'src/context/characters/domain/valueObjects/health.vo';
import { Coordinates } from 'src/context/characters/domain/valueObjects/coordinates.vo';
@Injectable()
export class MonsterRepository implements IMonsterRepository {
  constructor(
    @InjectRepository(MonsterOrmEntity)
    private readonly ormRepository: Repository<MonsterOrmEntity>,
  ) {}

  async save(monster: Monster): Promise<void> {
    const orm = new MonsterOrmEntity();
    if (monster.id !== undefined) orm.id = monster.id;
    orm.name = monster.name;
    orm.healthCurrent = monster.health.current;
    orm.healthMax = monster.health.max;
    orm.coordX = monster.coordinates.x;
    orm.coordY = monster.coordinates.y;
    orm.damage = monster.damage;

    await this.ormRepository.save(orm);
  }

  async findByCoordinates(x: number, y: number): Promise<Monster | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { coordX: x, coordY: y },
    });

    if (!ormEntity || ormEntity.healthCurrent <= 0) return null;

    const health = Health.reconstitute(
      ormEntity.healthCurrent,
      ormEntity.healthMax,
    );
    const coords = Coordinates.create(ormEntity.coordX, ormEntity.coordY);
    return Monster.reconstitute(
      ormEntity.id,
      ormEntity.name,
      health,
      coords,
      ormEntity.damage,
    );
  }
}
