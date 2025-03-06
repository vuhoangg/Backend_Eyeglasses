// export class OrderItem {}
// import {
//     Entity,
//     PrimaryGeneratedColumn,
//     Column,
//     ManyToOne,
//     JoinColumn,
//     CreateDateColumn,
//     UpdateDateColumn,
//   } from 'typeorm';
//   import { Order } from 'src/orders/entities/order.entity';
//   import { Product } from 'src/products/entities/product.entity';
  
//   @Entity('order_items')
//   export class OrderItem {
//     @PrimaryGeneratedColumn()
//     id: number;
  
//     @Column()
//     order_id: number;
  
//     @Column()
//     product_id: number;
  
//     @Column()
//     quantity: number;
  
//     @Column({ type: 'decimal', precision: 10, scale: 2 })
//     price: number;
  
//     @ManyToOne(() => Order, (order) => order.orderItems)
//     @JoinColumn({ name: 'order_id' })
//     order: Order;
  
//     @ManyToOne(() => Product, (product) => product.orderItems)
//     @JoinColumn({ name: 'product_id' })
//     product: Product;
  
//     @CreateDateColumn()
//     creationDate: Date;
  
//     @UpdateDateColumn()
//     modifiedDate: Date;
//   }