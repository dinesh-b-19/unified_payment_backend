// import { RazorpayGateway } from './razorpay.gateway';
// import { PayUGateway } from './payu.gateway';
// import { PaymentGateway } from '../../common/payment.interface';

// export function createPaymentGateway(): PaymentGateway {
//   const provider = process.env.PAYMENT_PROVIDER?.toLowerCase();

//   switch (provider) {
//     case 'razorpay':
//       return new RazorpayGateway();
//     case 'payu':
//       return new PayUGateway();
//     default:
//       throw new Error(`Unsupported payment gateway: ${provider}`);
//   }
// }

import { RazorpayGateway } from './razorpay.gateway';
import { PayUGateway } from './payu.gateway';
import { PaymentGateway } from '../../common/payment.interface';
import { PaymentProviderService } from '../payment-provider.service';

export async function createPaymentGateway(
  providerService: PaymentProviderService,
): Promise<PaymentGateway> {
  const providerConfig = await providerService.getActiveProvider();
  if (!providerConfig) throw new Error('No active payment provider found.');

  const { provider_name, key_id, key_secret } = providerConfig;

  switch (provider_name.toLowerCase()) {
    case 'razorpay':
      return new RazorpayGateway(key_id, key_secret);
    case 'payu':
      return new PayUGateway(key_id, key_secret, 'test');
    default:
      throw new Error(`Unsupported payment gateway: ${provider_name}`);
  }
}
