import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    example: 2,
    description: 'The User ID you are sending a message to',
  })
  @IsInt()
  @Min(1)
  receiverId!: number;

  @ApiProperty({
    example: 'Hello from the other side!',
    description: 'The message body',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;
}
