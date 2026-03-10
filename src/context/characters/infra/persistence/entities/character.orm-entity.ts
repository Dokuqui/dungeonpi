import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('characters')
export class CharacterOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'user_id', unique: true })
  userId!: number;

  @Column()
  name!: string;

  @Column({ name: 'health_current' })
  healthCurrent!: number;

  @Column({ name: 'health_max' })
  healthMax!: number;

  @Column({ name: 'coord_x' })
  coordX!: number;

  @Column({ name: 'coord_y' })
  coordY!: number;
}
