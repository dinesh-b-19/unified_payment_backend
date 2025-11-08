import { Controller, Post, Body, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('api/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  async create(
    @Body()
    body: {
      amount: number;
      currency?: string;
      merchantOrderId?: string;
      meta?: any;
    },
  ) {
    return this.paymentService.createOrder(
      body.amount,
      body.currency || 'INR',
      body.merchantOrderId,
      body.meta,
    );
  }

  @Post('verify')
  async verify(@Body() body: any) {
    return this.paymentService.verifyPayment(body);
  }

  @Post('refund')
  async refund(@Body() body: { paymentId: string; amount?: number }) {
    return this.paymentService.refund(body.paymentId, body.amount);
  }

  @Post('payu-success')
  async handlePayUSuccess(@Body() body: any) {
    console.log('✅ PayU Success Callback Received:', body);

    const result = await this.paymentService.verifyPayment(body);

    console.log('✅ PayU Verification Result:', result);

    return result.success
      ? { message: 'Payment verified successfully', result }
      : { message: 'Payment verification failed', result };
  }

  @Post('payu-failure')
  async handlePayUFailure(@Body() body: any) {
    console.log('❌ PayU Failure Callback:', body);
    return { message: 'Payment failed', body };
  }
}
