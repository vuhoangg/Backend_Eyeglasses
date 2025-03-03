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
//   import { Category } from 'src/categories/entities/category.entity';
//   import { Brand } from 'src/brands/entities/brand.entity';
//   import { ProductImage } from 'src/product_images/entities/product_image.entity';
//   import { Review } from 'src/reviews/entities/review.entity';
  
  @Entity('products') // Matches the table name in SQL
  export class Product {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;
  
    @Column({ default: 0 })
    stock_quantity: number;
  
    // @Column()
    // category_id: number;
  
    // @ManyToOne(() => Category, (category) => category.products, {
    //   onDelete: 'RESTRICT',
    //   onUpdate: 'CASCADE',
    // })
    // @JoinColumn({ name: 'category_id' })
    // category: Category;
  
    // @Column()
    // brand_id: number;
  
    // @ManyToOne(() => Brand, (brand) => brand.products, {
    //   onDelete: 'RESTRICT',
    //   onUpdate: 'CASCADE',
    // })
    // @JoinColumn({ name: 'brand_id' })
    // brand: Brand;
  
    @Column({ nullable: true })
    image: string;
  
    @Column({ length: 100, nullable: true })
    shape: string;
  
    @Column({ length: 100, nullable: true })
    material: string;
  
    @Column({ length: 50, nullable: true })
    color: string;
  
    // @OneToMany(() => ProductImage, (productImage) => productImage.product)
    // productImages: ProductImage[];
  
    //  @OneToMany(() => Review, (review) => review.product)
    // reviews: Review[];
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }
