import { Injectable, Inject } from '@nestjs/common';
import { PAYMENT_GATEWAY } from '../interfaces/payment-gateway.interface';
import type { IPaymentGateway } from '../interfaces/payment-gateway.interface';

@Injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    @Inject(PAYMENT_GATEWAY) private readonly paymentGateway: IPaymentGateway,
  ) {}

  async execute(userId: number, itemType: string, itemId: string) {
    return this.paymentGateway.createCheckoutSession(userId, itemType, itemId);
  }
}
