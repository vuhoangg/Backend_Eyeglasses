
import { ImportReceipt } from 'src/import-receipts/entities/import-receipt.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true }) // Cho phép null nhưng nếu có thì phải duy nhất
  email?: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ name: 'website_url', nullable: true })
  websiteUrl?: string;

  @Column({ nullable: true })
  logo?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  creationDate: Date;

  @UpdateDateColumn()
  modifiedDate: Date;

  // Relationship: One Vendor has many ImportReceipts
  @OneToMany(() => ImportReceipt, (receipt) => receipt.vendor)
  importReceipts: ImportReceipt[];
}