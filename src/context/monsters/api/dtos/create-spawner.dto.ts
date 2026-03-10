import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateSpawnerDto {
  @ApiProperty({ example: 0 })
  @IsInt()
  x!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  y!: number;

  @ApiProperty({ example: 'Goblin' })
  @IsString()
  @IsNotEmpty()
  monsterName!: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  monsterMaxHealth!: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(0)
  monsterDamage!: number;
}
