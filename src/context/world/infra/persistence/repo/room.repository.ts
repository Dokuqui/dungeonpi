import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomOrmEntity } from '../entities/room.orm-entity';
import { IRoomRepository } from 'src/context/world/app/interface/room-repository.interface';
import { Room } from 'src/context/world/domain/room.class';

@Injectable()
export class RoomRepository implements IRoomRepository {
  constructor(
    @InjectRepository(RoomOrmEntity)
    private readonly ormRepository: Repository<RoomOrmEntity>,
  ) {}

  async save(room: Room): Promise<void> {
    const ormEntity = this.toOrmEntity(room);
    await this.ormRepository.save(ormEntity);
  }

  async findByCoordinates(x: number, y: number): Promise<Room | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { x, y } });
    if (!ormEntity) return null;
    return this.toDomainEntity(ormEntity);
  }

  private toOrmEntity(domain: Room): RoomOrmEntity {
    const orm = new RoomOrmEntity();
    if (domain.id !== undefined) {
      orm.id = domain.id;
    }
    orm.x = domain.x;
    orm.y = domain.y;
    orm.name = domain.name;
    orm.description = domain.description;
    return orm;
  }

  private toDomainEntity(orm: RoomOrmEntity): Room {
    return Room.reconstitute(orm.id, orm.x, orm.y, orm.name, orm.description);
  }
}
