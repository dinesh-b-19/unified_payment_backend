export interface PaymentGateway {
  createOrder(
    merchantOrderId: string,
    amount: number,
    currency: string,
    meta?: any,
  ): Promise<{ gatewayOrderId: string; extra?: any }>;

  verifyPayment(payload: any): Promise<{
    success: boolean;
    gatewayOrderId: string;
    gatewayPaymentId?: string;
  }>;

  refundPayment?(
    paymentId: string,
    amount?: number,
  ): Promise<{ refundId: string; status: string }>;
}
