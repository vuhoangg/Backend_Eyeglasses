import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Product } from 'src/products/entities/product.entity';
  
  @Entity('brands')
  export class Brand {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @Column({ nullable: true })
    logo: string;

    @Column({ default: true }) // Add isActive field
    isActive: boolean;
  
    @OneToMany(() => Product, (product) => product.brand)
    products: Product[];

  
    @CreateDateColumn()
    creationDate: Date;
  
    @UpdateDateColumn()
    modifiedDate: Date;
  }
