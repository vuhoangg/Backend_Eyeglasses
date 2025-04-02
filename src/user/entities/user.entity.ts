import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    JoinTable,
    DeleteDateColumn,
    OneToMany,
  } from 'typeorm';
  import { Role } from 'src/roles/entities/role.entity';
import { Review } from 'src/review/entities/review.entity';
import { CartItem } from 'src/cart-items/entities/cart-item.entity';
  
  @Entity('users')
  export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    username: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    password: string;
  
    @Column({ nullable: true })
    firstName?: string;
  
    @Column({ nullable: true })
    lastName?: string;
  
    @Column({ nullable: true })
    phone?: string;
  
    @Column({ nullable: true })
    address?: string;

    @Column({ nullable: true })
    avartar?: string;
  
  
    @Column({ default: true })
    isActive: boolean;
  
    @CreateDateColumn()
    creationDate: Date;
  
    @UpdateDateColumn()
    modifiedDate: Date;

    deletedAt?: Date;


  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.user)
  cartItems: CartItem[];

  
    @ManyToMany(() => Role, (role) => role.users)
    @JoinTable({
      name: 'user_roles',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
      },
      inverseJoinColumn: {
        name: 'role_id',
        referencedColumnName: 'id',
      },
    })
    roles: Role[];
  }
