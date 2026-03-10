import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('spawners')
export class SpawnerOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'int' })
  x!: number;

  @Column({ type: 'int' })
  y!: number;

  @Column()
  monsterName!: string;

  @Column({ type: 'int' })
  monsterMaxHealth!: number;

  @Column({ type: 'int' })
  monsterDamage!: number;
}
