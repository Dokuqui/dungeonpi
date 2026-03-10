import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCharacterDto {
  @ApiProperty({ example: 'Arthas', description: 'The name of your hero' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name!: string;
}
