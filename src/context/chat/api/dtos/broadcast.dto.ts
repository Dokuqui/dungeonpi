import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BroadcastDto {
  @ApiProperty({
    example: 'Server restarting in 5 minutes!',
    description: 'The message to broadcast',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;
}
