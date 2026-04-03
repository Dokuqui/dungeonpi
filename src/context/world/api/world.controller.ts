import {
  Body,
  Controller,
  Get,
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
import { PermissionsGuard } from '../../../core/guards/permissions.guard';
import { Permissions } from '../../../core/decorators/permissions.decorator';
import { Permission } from '../../auth/domain/permission.enum';
import { Role } from '../../auth/domain/role.enum';
import { CreateRoomUseCase } from '../app/usecases/create-room.usecase';
import { LookAroundUseCase } from '../app/usecases/look-around.usecase';
import { GetCharacterUseCase } from '../../characters/app/usecases/get-character.usecase';
import { CreateRoomDto } from './dtos/create-room.dto';

interface RequestWithUser extends Request {
  user: { userId: number; role: Role };
}

@ApiTags('World')
@Controller('world')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class WorldController {
  constructor(
    private readonly createRoomUseCase: CreateRoomUseCase,
    private readonly lookAroundUseCase: LookAroundUseCase,
    private readonly getCharacterUseCase: GetCharacterUseCase,
  ) {}

  @Post('rooms')
  @Permissions(Permission.CREATE_ROOM)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new room (Requires CREATE_ROOM permission)',
  })
  @ApiResponse({ status: 201, description: 'Room created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Missing permission.' })
  async createRoom(@Body() dto: CreateRoomDto) {
    await this.createRoomUseCase.execute(dto);
    return { message: `Room '${dto.name}' created at (${dto.x}, ${dto.y}).` };
  }

  @Get('look')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Look around the current room' })
  async lookAround(@Req() req: RequestWithUser) {
    return this.lookAroundUseCase.execute(req.user.userId);
  }
}
