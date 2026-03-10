import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { CreateCharacterUseCase } from '../app/usecases/create-character.usecase';
import { CreateCharacterDto } from './dtos/create-character.dto';

interface RequestWithUser extends Request {
  user: { userId: number };
}

@ApiTags('Characters')
@Controller('characters')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CharactersController {
  constructor(
    private readonly createCharacterUseCase: CreateCharacterUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new character' })
  @ApiResponse({ status: 201, description: 'Character successfully created.' })
  async createCharacter(
    @Req() req: RequestWithUser,
    @Body() dto: CreateCharacterDto,
  ) {
    await this.createCharacterUseCase.execute({
      userId: req.user.userId,
      name: dto.name,
    });

    return { message: `${dto.name} has entered the dungeon!` };
  }
}
