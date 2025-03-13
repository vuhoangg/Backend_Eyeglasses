import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { User } from 'src/user/entities/user.entity';
  import { Order } from 'src/orders/entities/order.entity';
import { PaymentStatus } from 'src/payment-status/entities/payment-status.entity';

  
  @Entity('payment')
  export class Payment {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @ManyToOne(() => Order)
    @JoinColumn({ name: 'order_id' })
    order: Order;
  
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;
  
    @Column({ length: 255 })
    provider: string; // e.g., "PayPal", "Stripe", "Credit Card"
  
    @ManyToOne(() => PaymentStatus) // Assuming you want to reuse the order_status table
    @JoinColumn({ name: 'payment_status_id' })
    status: PaymentStatus;
  
    @Column({ length: 255, nullable: true })
    transactionId: string; // Transaction ID from the payment provider
  
    @CreateDateColumn()
    creationDate: Date;
  
    @UpdateDateColumn()
    modifiedDate: Date;
  
    @Column({ default: true })
    isActive: boolean;
  }