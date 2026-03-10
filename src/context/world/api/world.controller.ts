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
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { CreateRoomUseCase } from '../app/usecases/create-room.usecase';
import { LookAroundUseCase } from '../app/usecases/look-around.usecase';
import { Roles } from 'src/core/decorators/roles.decorator';
import { Role } from 'src/context/auth/domain/role.enum';
import { CreateRoomDto } from './dtos/create-room.dto';
import { GetCharacterUseCase } from 'src/context/characters/app/usecases/get-character.usecase';

interface RequestWithUser extends Request {
  user: { userId: number; role: Role };
}

@ApiTags('World')
@Controller('world')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WorldController {
  constructor(
    private readonly createRoomUseCase: CreateRoomUseCase,
    private readonly lookAroundUseCase: LookAroundUseCase,
    private readonly getCharacterUseCase: GetCharacterUseCase,
  ) {}

  @Post('rooms')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new room (Admin Only)' })
  @ApiResponse({ status: 201, description: 'Room created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Requires ADMIN role.' })
  async createRoom(@Body() dto: CreateRoomDto) {
    await this.createRoomUseCase.execute(dto);
    return { message: `Room '${dto.name}' created at (${dto.x}, ${dto.y}).` };
  }

  @Get('look')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Look around your current location' })
  @ApiResponse({ status: 200, description: 'Returns what is in the room.' })
  async lookAround(@Req() req: RequestWithUser) {
    const character = await this.getCharacterUseCase.execute(req.user.userId);

    return this.lookAroundUseCase.execute({
      x: character.coordinates.x,
      y: character.coordinates.y,
    });
  }
}
