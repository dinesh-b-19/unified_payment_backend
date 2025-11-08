import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { Repository, DataSource } from 'typeorm';
import { createPaymentGateway } from './gateways/payment.factory';
import { PaymentProviderService } from './payment-provider.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    private dataSource: DataSource,
    private providerService: PaymentProviderService,
  ) {}

  private async getGateway() {
    return await createPaymentGateway(this.providerService);
  }

  async createOrder(
    amount: number,
    currency = 'INR',
    merchantOrderId?: string,
    meta?: any,
  ) {
    const id =
      merchantOrderId ||
      `mord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const existing = await this.paymentRepo.findOne({
      where: { merchantOrderId: id },
    });
    if (existing) return { existing: true, payment: existing };

    const gateway = await this.getGateway();
    const gatewayRes = await gateway.createOrder(id, amount, currency);

    const payment = this.paymentRepo.create({
      merchantOrderId: id,
      gateway:
        (await this.providerService.getActiveProvider())?.provider_name ||
        'unknown',
      gatewayOrderId: gatewayRes.gatewayOrderId,
      amount,
      currency,
      status: 'CREATED',
      meta: gatewayRes.extra || {},
    });

    await this.paymentRepo.save(payment);
    return { payment, gateway: gatewayRes };
  }

  async verifyPayment(payload: any) {
    const gateway = await this.getGateway();
    const result = await gateway.verifyPayment(payload);

    const tx = await this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { gatewayOrderId: result.gatewayOrderId },
      });
      if (!payment)
        throw new InternalServerErrorException('Payment record not found');

      payment.status = result.success ? 'SUCCESS' : 'FAILED';
      payment.gatewayPaymentId = result.gatewayPaymentId;
      await manager.save(payment);
      return payment;
    });

    return { success: result.success, payment: tx };
  }

  async refund(paymentId: string, amount?: number) {
    const payment = await this.paymentRepo.findOne({
      where: [{ merchantOrderId: paymentId }, { gatewayPaymentId: paymentId }],
    });
    if (!payment) throw new Error('Payment not found');

    const gateway = await this.getGateway();
    if (!gateway.refundPayment)
      throw new Error('Refund not supported for this gateway');

    const res = await gateway.refundPayment(payment.gatewayPaymentId!, amount);
    payment.status = 'REFUNDED';
    await this.paymentRepo.save(payment);

    return { refund: res, payment };
  }
}
