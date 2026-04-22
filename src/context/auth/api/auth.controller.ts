import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import type { Request } from 'express';

import { LoginUseCase } from '../app/usecases/login.usecase';
import { RegisterUseCase } from '../app/usecases/register.usecase';
import { RefreshUseCase } from '../app/usecases/referesh.usecase';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import {
  type ITokenService,
  TOKEN_SERVICE,
} from '../app/interface/token-service.interface';

interface RequestWithUser extends Request {
  user: {
    userId: number;
  };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
    private readonly refreshUseCase: RefreshUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g. invalid email).',
  })
  @ApiResponse({ status: 409, description: 'Conflict: User already exists.' })
  async register(@Body() registerDto: RegisterDto) {
    await this.registerUseCase.execute({
      email: registerDto.email,
      passwordRaw: registerDto.password,
    });

    return { message: 'User successfully registered.' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in and get a JWT token' })
  @ApiResponse({ status: 200, description: 'Returns the access token.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Invalid credentials.',
  })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    return this.loginUseCase.execute({
      email: loginDto.email,
      passwordRaw: loginDto.password,
      ip,
      userAgent,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile (Protected)' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user ID from the token.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Missing or invalid token.',
  })
  getProfile(@Req() req: RequestWithUser) {
    return {
      message: 'You have accessed a protected route!',
      user: req.user,
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Get a new access token using a refresh token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          description: 'Paste your long-lived Refresh Token here',
        },
      },
    },
  })
  async refreshTokens(
    @Body('refreshToken') token: string,
    @Req() req: Request,
  ) {
    if (!token) throw new UnauthorizedException('No refresh token provided');

    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    return this.refreshUseCase.execute({
      refreshToken: token,
      currentIp: ip,
      currentUserAgent: userAgent,
    });
  }
}
