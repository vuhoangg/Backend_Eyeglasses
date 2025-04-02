import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: number;

  @ManyToOne(() => User, user => user.cartItems, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  product_id: number;

  @ManyToOne(() => Product, { eager: true, nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn()
  creationDate: Date;

  @UpdateDateColumn()
  modifiedDate: Date;

  @Column({ length: 50, nullable: true })
  color: string;

  @Column({ length: 50, nullable: true })
  size: string;

  @Column({ default: true })
  isActive: boolean;
}