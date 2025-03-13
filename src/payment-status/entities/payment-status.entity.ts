import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Payment } from 'src/payment/entities/payment.entity';

@Entity('payment_status')
export class PaymentStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => Payment, (payment) => payment.status)
  payments: Payment[]; // Relationship with Payment entity

  @Column({ default: true })
  isActive: boolean;
}
