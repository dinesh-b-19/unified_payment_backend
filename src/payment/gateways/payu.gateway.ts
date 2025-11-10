import { PaymentGateway } from '../../common/payment.interface';
import * as crypto from 'crypto';

export class PayUGateway implements PaymentGateway {
  private baseUrl: string;
  private key: string;
  private salt: string;

  constructor(
    key: string,
    salt: string,
    environment: 'test' | 'live' = 'test',
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

      surl: 'https://transarctic-significatively-jace.ngrok-free.dev/api/payments/verify',
      furl: 'https://transarctic-significatively-jace.ngrok-free.dev/api/payments/verify',

      udf1: '',
      udf2: '',
      udf3: '',
      udf4: '',
      udf5: '',
    };

    const hashString =
      `${data.key}|${data.txnid}|${data.amount}|${data.productinfo}|` +
      `${data.firstname}|${data.email}|${data.udf1}|${data.udf2}|${data.udf3}|${data.udf4}|${data.udf5}` +
      `||||||${this.salt}`;

    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

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
    const hashString =
      `${this.salt}|${payload.status}||||||` +
      `${payload.udf5}|${payload.udf4}|${payload.udf3}|${payload.udf2}|${payload.udf1}|` +
      `${payload.email}|${payload.firstname}|${payload.productinfo}|${payload.amount}|${payload.txnid}|${this.key}`;

    const expectedHash = crypto
      .createHash('sha512')
      .update(hashString)
      .digest('hex');

    return {
      success: expectedHash === payload.hash,
      gatewayOrderId: payload.txnid,
      gatewayPaymentId: payload.mihpayid,
    };
  }
}
