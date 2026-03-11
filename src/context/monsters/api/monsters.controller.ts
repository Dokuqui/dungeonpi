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
import { PermissionsGuard } from '../../../core/guards/permissions.guard';
import { Permissions } from '../../../core/decorators/permissions.decorator';
import { Permission } from '../../auth/domain/permission.enum';
import { CreateSpawnerUseCase } from '../app/usecases/create-spawner.usecase';
import { CreateSpawnerDto } from './dtos/create-spawner.dto';

@ApiTags('Monsters')
@Controller('monsters')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class MonstersController {
  constructor(private readonly createSpawnerUseCase: CreateSpawnerUseCase) {}

  @Post('spawners')
  @Permissions(Permission.SPAWN_MONSTER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Place a monster spawner (Requires SPAWN_MONSTER permission)',
  })
  @ApiResponse({ status: 201, description: 'Spawner placed successfully.' })
  async createSpawner(@Body() dto: CreateSpawnerDto) {
    await this.createSpawnerUseCase.execute(dto);
    return {
      message: `${dto.monsterName} Spawner placed at (${dto.x}, ${dto.y}).`,
    };
  }
}
