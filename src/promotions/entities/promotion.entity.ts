import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';

@Entity('promotions')
export class Promotion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50, unique: true })
    code: string;

    @Column({ type: 'enum', enum: ['percent', 'amount'] })
    discountType: 'percent' | 'amount';

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    discountValue: number;

    @Column({ type: 'datetime' })
    startDate: Date;

    @Column({ type: 'datetime' })
    endDate: Date;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => Order, order => order.promotion)
    orders: Order[];
}