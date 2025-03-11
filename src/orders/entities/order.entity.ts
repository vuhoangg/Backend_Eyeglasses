import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

import { OrderStatus } from 'src/order-status/entities/order-status.entity';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { OrderItem } from 'src/order_items/entities/order_item.entity';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

    @Column()
    shippingAddress: string;

    @ManyToOne(() => OrderStatus)
    @JoinColumn({ name: 'order_status_id' })
    orderStatus: OrderStatus;

    @Column({ length: 50, nullable: true })
    paymentMethod: string;

    @ManyToOne(() => Promotion, { nullable: true }) // Allow null value
    @JoinColumn({ name: 'promotion_id' })
    promotion: Promotion | null; // Change type to Promotion | null

    @CreateDateColumn()
    creationDate: Date;

    @UpdateDateColumn()
    modifiedDate: Date;

    @OneToMany(() => OrderItem, orderItem => orderItem.order)
    orderItems: OrderItem[];

    @Column({ default: true })
    isActive: boolean;
}