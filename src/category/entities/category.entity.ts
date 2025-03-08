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
  import { Product } from 'src/products/entities/product.entity';
  
  @Entity('categories')
  export class Category {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    // @Column({ nullable: true })
    // parent_category_id: number;
  
    @ManyToOne(() => Category, (category) => category.children, {
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'parent_category_id' })
    parent: Category;
  
    @OneToMany(() => Category, (category) => category.parent)
    children: Category[];
  
    @OneToMany(() => Product, (product) => product.category)
    products: Product[];
  
    @CreateDateColumn()
    creationDate: Date;
  
    @UpdateDateColumn()
    modifiedDate: Date;
  }
