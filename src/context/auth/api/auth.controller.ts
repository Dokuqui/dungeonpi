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

import { LoginUseCase } from '../app/usecases/login.usecase';
import { RegisterUseCase } from '../app/usecases/register.usecase';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';

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
  async login(@Body() loginDto: LoginDto) {
    return this.loginUseCase.execute({
      email: loginDto.email,
      passwordRaw: loginDto.password,
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
}
