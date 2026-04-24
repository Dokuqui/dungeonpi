import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CharacterOrmEntity } from '../entities/character.orm-entity';
import { ICharacterRepository } from 'src/context/characters/app/interface/character-repository.interface';
import { Health } from 'src/context/characters/domain/class/health.class';
import { Coordinates } from 'src/context/characters/domain/class/coordinates.class';
import { Character } from 'src/context/characters/domain/class/character.class';

@Injectable()
export class CharacterRepository implements ICharacterRepository {
  constructor(
    @InjectRepository(CharacterOrmEntity)
    private readonly ormRepository: Repository<CharacterOrmEntity>,
  ) {}

  async save(character: Character): Promise<void> {
    const ormEntity = this.toOrmEntity(character);
    await this.ormRepository.save(ormEntity);
  }

  async findAll(): Promise<Character[]> {
    const ormEntities = await this.ormRepository.find();
    return ormEntities.map((orm) => this.toDomainEntity(orm));
  }

  async findByUserId(userId: number): Promise<Character | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { userId } });
    if (!ormEntity) return null;
    return this.toDomainEntity(ormEntity);
  }

  async findByCoordinates(x: number, y: number): Promise<Character[]> {
    const ormEntities = await this.ormRepository.find({
      where: { coordX: x, coordY: y },
    });
    return ormEntities.map((orm) => this.toDomainEntity(orm));
  }

  async findByName(name: string): Promise<Character | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { name: name },
    });

    if (!ormEntity) return null;
    return this.toDomainEntity(ormEntity);
  }

  private toOrmEntity(domain: Character): CharacterOrmEntity {
    const orm = new CharacterOrmEntity();
    if (domain.id !== undefined) {
      orm.id = domain.id;
    }
    orm.userId = domain.userId;
    orm.name = domain.name;
    orm.healthCurrent = domain.health.current;
    orm.healthMax = domain.health.max;
    orm.coordX = domain.coordinates.x;
    orm.coordY = domain.coordinates.y;
    return orm;
  }

  private toDomainEntity(orm: CharacterOrmEntity): Character {
    const health = Health.reconstitute(orm.healthCurrent, orm.healthMax);
    const coords = Coordinates.create(orm.coordX, orm.coordY);
    return Character.reconstitute(orm.id, orm.userId, orm.name, health, coords);
  }
}
