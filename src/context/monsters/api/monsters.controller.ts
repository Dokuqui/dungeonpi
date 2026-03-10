import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { Role } from '../../auth/domain/role.enum';
import { CreateSpawnerUseCase } from '../app/usecases/create-spawner.usecase';
import { CreateSpawnerDto } from './dtos/create-spawner.dto';

@ApiTags('Monsters')
@Controller('monsters')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MonstersController {
  constructor(private readonly createSpawnerUseCase: CreateSpawnerUseCase) {}

  @Post('spawners')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Place a monster spawner (Admin Only)' })
  @ApiResponse({ status: 201, description: 'Spawner placed successfully.' })
  async createSpawner(@Body() dto: CreateSpawnerDto) {
    await this.createSpawnerUseCase.execute(dto);
    return {
      message: `${dto.monsterName} Spawner placed at (${dto.x}, ${dto.y}).`,
    };
  }
}
