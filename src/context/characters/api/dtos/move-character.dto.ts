import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class MoveCharacterDto {
  @ApiProperty({
    example: 'north',
    description: 'Direction: north, south, east, or west',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['north', 'south', 'east', 'west'], {
    message: 'Direction must be north, south, east, or west.',
  })
  direction!: string;
}
