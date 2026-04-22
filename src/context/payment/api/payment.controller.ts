import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateCheckoutSessionUseCase } from '../app/usecases/create-checkout-session.usecase';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { CreateCheckoutDto } from './dtos/create-checkout.dto';

interface AuthenticatedRequest {
  user: {
    userId: number;
    role: string;
  };
}

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly createCheckoutSessionUseCase: CreateCheckoutSessionUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  @ApiOperation({ summary: 'Create a Stripe Checkout Session' })
  @ApiResponse({ status: 201, description: 'Returns the Stripe Checkout URL' })
  async checkout(
    @Body() body: CreateCheckoutDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.createCheckoutSessionUseCase.execute(
      req.user.userId,
      body.itemType,
      body.itemId,
    );
  }
}
