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
  
    @Column({ default: true })
    isActive: boolean;
  
    @CreateDateColumn()
    creationDate: Date;
  
    @UpdateDateColumn()
    modifiedDate: Date;

    deletedAt?: Date;


  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  
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
