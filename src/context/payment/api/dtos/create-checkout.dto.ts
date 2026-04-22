import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateCheckoutDto {
  @ApiProperty({
    description: 'The type of item being purchased',
    example: 'SKIN',
    enum: ['BATTLE_PASS', 'SKIN', 'CURRENCY'],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['BATTLE_PASS', 'SKIN', 'CURRENCY'])
  itemType!: string;

  @ApiProperty({
    description: 'The specific ID of the item from the atlas',
    example: 'wizzard_m',
  })
  @IsString()
  @IsNotEmpty()
  itemId!: string;
}
