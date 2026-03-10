import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 0, description: 'The X coordinate' })
  @IsInt()
  x!: number;

  @ApiProperty({ example: 0, description: 'The Y coordinate' })
  @IsInt()
  y!: number;

  @ApiProperty({ example: 'Town Square', description: 'The name of the room' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'A bustling square with a fountain.',
    description: 'What the players see',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
