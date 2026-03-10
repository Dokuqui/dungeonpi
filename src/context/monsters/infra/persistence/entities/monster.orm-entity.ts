import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('monsters')
export class MonsterOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  name!: string;

  @Column({ name: 'health_current', type: 'int' })
  healthCurrent!: number;

  @Column({ name: 'health_max', type: 'int' })
  healthMax!: number;

  @Column({ name: 'coord_x', type: 'int' })
  coordX!: number;

  @Column({ name: 'coord_y', type: 'int' })
  coordY!: number;

  @Column({ type: 'int' })
  damage!: number;
}
