import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';

import { Product } from '../../products/entities/product.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  
  @Column({ type: 'text' })
  comment: string;
  
  @Column({ type: 'int', default: 5 })
  rating: number;
  

  @Column({nullable: true})
  user_Id: number;

  @ManyToOne(() => User, (user) => user.reviews, {
    nullable: true,
    // onDelete: 'RESTRICT',
    onDelete: 'SET NULL', 
    onUpdate: 'CASCADE',
    eager: true 
    })

  @JoinColumn({ name: 'user_Id' })
  user: User;


  @Column({ nullable: true }) 
  product_Id: number;

  @ManyToOne(() => Product, (product) => product.reviews, {

    onDelete: 'SET NULL', 
    onUpdate: 'CASCADE',
     eager: true 
    })
    @JoinColumn({ name: 'product_Id' })
    product: Product;

   
 
  @Column({ default: true }) // Add isActive field
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  creationDate: Date;

  @UpdateDateColumn()
  modifiedDate: Date;
}
