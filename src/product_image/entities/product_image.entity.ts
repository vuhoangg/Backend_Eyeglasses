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
  
  @Entity('product_images')
  export class ProductImage {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    product_id: number;
  
    @Column()
    image_url: string;
  
    @Column({ nullable: true })
    alt_text: string;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @Column({ default: false })
    is_thumbnail: boolean;
  
    @ManyToOne(() => Product, (product) => product.productImages)
    @JoinColumn({ name: 'product_id' })
    product: Product;
  
    @CreateDateColumn()
    creationDate: Date;
  
    @UpdateDateColumn()
    modifiedDate: Date;
  }
