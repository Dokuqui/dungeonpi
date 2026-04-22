import { forwardRef, Module } from '@nestjs/common';
import { CreateCheckoutSessionUseCase } from './app/usecases/create-checkout-session.usecase';
import { StripePaymentGateway } from './infra/external/stripe-payment.gateway';
import { PAYMENT_GATEWAY } from './app/interfaces/payment-gateway.interface';
import { PaymentsController } from './api/payment.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
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
