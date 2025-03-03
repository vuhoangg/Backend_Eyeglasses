import { Exclude } from 'class-transformer';
import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,} from 'typeorm';

@Entity('admins')
export class Admin {

        @PrimaryGeneratedColumn()
        id: number;
      
        @Column({ length: 255 })
        name: string;
      
        @Column({ length: 10 })
        phone: string;
      
        @Column({ length: 255, default: '' })
        email?: string;
      
        @Exclude()
        @Column({ length: 255 })
        password: string;
      
        @Column({
          name: 'is_active',
          default: true,
        })
        isActive: boolean;
      
        @CreateDateColumn({
          name: 'created_at',
        })
        createdAt: Date;
      
        @UpdateDateColumn({
          name: 'updated_at',
        })
        updatedAt: Date;
      }
      
