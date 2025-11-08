import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentProvider } from './payment-provider.entity';

@Injectable()
export class PaymentProviderService {
  constructor(
    @InjectRepository(PaymentProvider)
    private repo: Repository<PaymentProvider>,
  ) {}

  async getActiveProvider() {
    return this.repo.findOne({ where: { is_active: true } });
  }

  async updateProvider(
    provider_name: string,
    key_id: string,
    key_secret: string,
  ) {
    await this.repo
      .createQueryBuilder()
      .update(PaymentProvider)
      .set({ is_active: false })
      .execute();

    // ✅ find existing or create new
    let provider = await this.repo.findOne({ where: { provider_name } });
    if (!provider) {
      provider = this.repo.create({
        provider_name,
        key_id,
        key_secret,
        is_active: true,
      });
    } else {
      provider.key_id = key_id;
      provider.key_secret = key_secret;
      provider.is_active = true;
    }

    return this.repo.save(provider);
  }
}
