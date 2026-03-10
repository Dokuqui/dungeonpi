import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('rooms')
@Unique(['x', 'y'])
export class RoomOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'int' })
  x!: number;

  @Column({ type: 'int' })
  y!: number;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  description!: string;
}
