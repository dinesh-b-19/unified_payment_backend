import { Controller, Get, Patch, Body } from '@nestjs/common';
import { PaymentProviderService } from './payment-provider.service';

@Controller('api/admin/payment-provider')
export class AdminPaymentProviderController {
  constructor(private readonly providerService: PaymentProviderService) {}

  @Get()
  async getActive() {
    return this.providerService.getActiveProvider();
  }

  @Patch()
  async updateProvider(
    @Body() body: { provider_name: string; key_id: string; key_secret: string },
  ) {
    return this.providerService.updateProvider(
      body.provider_name,
      body.key_id,
      body.key_secret,
    );
  }
}
