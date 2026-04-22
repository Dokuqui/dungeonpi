import { Module } from '@nestjs/common';
import { CreateCheckoutSessionUseCase } from './app/usecases/create-checkout-session.usecase';
import { StripePaymentGateway } from './infra/external/stripe-payment.gateway';
import { PAYMENT_GATEWAY } from './app/interfaces/payment-gateway.interface';
import { PaymentsController } from './api/payment.controller';

@Module({
  controllers: [PaymentsController],
  providers: [
    CreateCheckoutSessionUseCase,
    {
      provide: PAYMENT_GATEWAY,
      useClass: StripePaymentGateway,
    },
  ],
})
export class PaymentsModule {}
