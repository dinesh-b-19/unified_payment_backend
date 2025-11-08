import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  merchantOrderId: string; 

  @Column({ nullable: true })
  gateway: string; // 'razorpay', 'stripe', etc

  @Column({ nullable: true })
  gatewayOrderId: string; // order id from gateway

  @Column({ nullable: true })
  gatewayPaymentId?: string;

  @Column('numeric', { precision: 10, scale: 2 })
  amount: number; // in rupees

  @Column({ default: 'PENDING' })
  status: 'PENDING' | 'CREATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

  @Column({ nullable: true })
  currency: string;

  @Column('jsonb', { nullable: true })
  meta: any;

  @CreateDateColumn()
  createdAt: Date;
}
