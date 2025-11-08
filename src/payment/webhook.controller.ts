import { Controller, Post, Req, Headers, Body } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentService } from './payment.service';
import * as crypto from 'crypto';

@Controller('api/webhooks')
export class WebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('razorpay')
  async razorpayWebhook(
    @Req() req: Request,
    @Headers('x-razorpay-signature') signature: string,
    @Body() body: any,
  ) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET as string;
    if (!secret) throw new Error('Missing Razorpay webhook secret');

    // ✅ Generate expected signature
    const expected = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');

    // ✅ Verify signature
    if (expected !== signature) {
      return { status: 'invalid signature' };
    }

    // ✅ Handle Razorpay event
    const event = body.event;
    const payload = body.payload;

    if (event === 'payment.captured') {
      const pgPayload = {
        razorpay_order_id: payload.payment.entity.order_id,
        razorpay_payment_id: payload.payment.entity.id,
        razorpay_signature: 'webhook',
      };
      await this.paymentService.verifyPayment(pgPayload);
    }

    return { status: 'ok' };
  }
}
