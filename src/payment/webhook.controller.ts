import { Controller, Post, Get, Req, Res, Headers } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as crypto from 'crypto';

@Controller('payments/webhook')
export class PaymentWebhookController {
  private razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? '';

  // NEW: allow Razorpay to validate GET URL
  @Get('razorpay')
  checkRazorpayWebhookUrl() {
    return { status: 'OK', message: 'Razorpay Webhook URL is reachable.' };
  }

  @Post('razorpay')
  handleRazorpayWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const rawBody = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', this.razorpayWebhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(403).send('Invalid signature');
    }

    return res.status(200).json({ status: 'success' });
  }

  @Post('payu')
  handlePayUWebhook(@Req() req: Request, @Res() res: Response) {
    const payload = req.body;

    const {
      status,
      email,
      firstname,
      productinfo,
      amount,
      txnid,
      hash,
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
    } = payload;

    const key = process.env.PAYU_KEY ?? '';
    const salt = process.env.PAYU_SALT ?? '';

    const hashString =
      `${salt}|${status}|||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|` +
      `${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

    const expectedHash = crypto
      .createHash('sha512')
      .update(hashString)
      .digest('hex');

    if (expectedHash !== hash) {
      return res.status(400).json({ status: 'invalid hash' });
    }

    return res.status(200).json({ status: 'ok' });
  }
}
