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
import { MoveCharacterUseCase } from '../app/usecases/move-character.usecase';
import { MoveCharacterDto } from './dtos/move-character.dto';

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
    private readonly moveCharacterUseCase: MoveCharacterUseCase,
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

  @Post('move')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Move your character (north, south, east, west)' })
  @ApiResponse({ status: 200, description: 'Character moved successfully.' })
  async moveCharacter(
    @Req() req: RequestWithUser,
    @Body() dto: MoveCharacterDto,
  ) {
    const newLocation = await this.moveCharacterUseCase.execute({
      userId: req.user.userId,
      direction: dto.direction,
    });

    return {
      message: `You moved ${dto.direction}.`,
      position: newLocation,
    };
  }
}
