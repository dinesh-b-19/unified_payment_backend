import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { PaymentProvider } from './payment-provider.entity';
import { PaymentService } from './payment.service';
import { PaymentProviderService } from './payment-provider.service';
import { PaymentController } from './payment.controller';
import { AdminPaymentProviderController } from './admin-payment-provider.controller';
import { PaymentWebhookController } from './webhook.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, PaymentProvider])],
  providers: [PaymentService, PaymentProviderService],
  controllers: [
    PaymentController,
    PaymentWebhookController,
    AdminPaymentProviderController,
  ],
  exports: [PaymentService, PaymentProviderService],
})
export class PaymentModule {}
