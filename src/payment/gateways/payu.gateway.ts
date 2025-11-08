import { PaymentGateway } from '../../common/payment.interface';
import * as crypto from 'crypto';

export class PayUGateway implements PaymentGateway {
  private baseUrl: string;
  private key: string;
  private salt: string;

  constructor(
    key: string,
    salt: string,
    environment: 'test' | 'live' = 'live',
  ) {
    this.key = key;
    this.salt = salt;
    this.baseUrl =
      environment === 'test'
        ? 'https://test.payu.in'
        : 'https://secure.payu.in';
  }

  async createOrder(
    merchantOrderId: string,
    amount: number,
    currency: string,
    meta?: any,
  ) {
    const formattedAmount = Number(amount).toFixed(2);

    const data = {
      key: this.key,
      txnid: merchantOrderId,
      amount: formattedAmount,
      productinfo: meta?.productinfo || 'Product',
      firstname: meta?.firstname || 'User',
      email: meta?.email || 'user@example.com',
      phone: meta?.phone || '9999999999',
      surl: 'http://localhost:5000/api/payments/payu-success',
      furl: 'http://localhost:5000/api/payments/payu-failure',
      service_provider: 'payu_paisa',
      udf1: '',
      udf2: '',
      udf3: '',
      udf4: '',
      udf5: '',
    };

    const hashString = `${data.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|${data.udf1}|${data.udf2}|${data.udf3}|${data.udf4}|${data.udf5}||||||${this.salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    // Add debug logs
    console.log('Creating PayU Order');
    console.log('Hash String:', hashString);
    console.log('Generated Hash:', hash);

    return {
      gatewayOrderId: merchantOrderId,
      extra: {
        form: {
          ...data,
          hash,
          action: `${this.baseUrl}/_payment`,
        },
      },
    };
  }

  async verifyPayment(payload: any) {
    const hashString = `${this.salt}|${payload.status}|||||||||||${payload.email}|${payload.firstname}|${payload.productinfo}|${payload.amount}|${payload.txnid}|${this.key}`;
    const expectedHash = crypto
      .createHash('sha512')
      .update(hashString)
      .digest('hex');

    console.log('Verifying PayU Payment');
    console.log('Received Payload:', payload);
    console.log('Expected Hash:', expectedHash);

    return {
      success: expectedHash === payload.hash,
      gatewayOrderId: payload.txnid,
      gatewayPaymentId: payload.mihpayid,
    };
  }

//   async refundPayment(paymentId: string, amount?: number) {
//     return { refundId: `payu_ref_${paymentId}`, status: 'success' };
//   }
}
