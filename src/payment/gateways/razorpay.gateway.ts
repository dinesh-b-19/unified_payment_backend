import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { PaymentGateway } from '../../common/payment.interface';

export class RazorpayGateway implements PaymentGateway {
  private instance: Razorpay;
  private keySecret: string;

  constructor(keyId: string, keySecret: string) {
    this.keySecret = keySecret;
    this.instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createOrder(merchantOrderId: string, amount: number, currency: string) {
    const order = await this.instance.orders.create({
      amount: amount * 100,
      currency,
      receipt: merchantOrderId,
    });

    return {
      gatewayOrderId: order.id,
      extra: { receipt: order.receipt },
    };
  }

  async verifyPayment(payload: any) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      payload;

    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    return {
      success: expectedSignature === razorpay_signature,
      gatewayOrderId: razorpay_order_id,
      gatewayPaymentId: razorpay_payment_id,
    };
  }

  async refundPayment(paymentId: string, amount?: number) {
    const refund = await this.instance.payments.refund(paymentId, {
      amount: amount ? amount * 100 : undefined,
    });

    return { refundId: refund.id, status: refund.status };
  }
}
