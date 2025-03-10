import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { CartItem } from 'src/cart-items/entities/cart-item.entity';


@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;


  // @Column()
  // user_id: number;

  @ManyToOne(() => User, user => user.carts)
  @JoinColumn({ name: 'user_id' })
  user: User;


 

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  creationDate: Date;

  @UpdateDateColumn()
  modifiedDate: Date;

  @OneToMany(() => CartItem, cartItem => cartItem.cart)
  cartItems: CartItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalPrice: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  discountCode: string;
}