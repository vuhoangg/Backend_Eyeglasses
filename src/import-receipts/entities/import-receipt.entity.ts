import { User } from 'src/user/entities/user.entity'; // Optional: nếu có creator_id

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ImportReceiptDetail } from './import-receipt-detail.entity';
import { Vendor } from 'src/vendors/entities/vendor.entity';


export enum ImportReceiptStatus {
    PENDING = 'PENDING', // Đang chờ xử lý/chưa hoàn thành
    COMPLETED = 'COMPLETED', // Đã hoàn thành (đã cập nhật kho)
    CANCELLED = 'CANCELLED', // Đã hủy
}


@Entity('import_receipts')
export class ImportReceipt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'vendor_id' })
  vendorId: number;

  @Column({ name: 'receipt_code', unique: true, nullable: true })
  receiptCode?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 12, // Tăng precision nếu cần
    scale: 2,
    default: 0.0,
  })
  totalAmount: number;

  @Column({
      type: 'enum',
      enum: ImportReceiptStatus,
      default: ImportReceiptStatus.PENDING,
  })
  status: ImportReceiptStatus;

  @Column({ name: 'import_date', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  importDate: Date;

  // Optional: Người tạo phiếu
  @Column({ name: 'creator_id', nullable: true })
  creatorId?: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL'}) // Nếu user bị xóa, set creator_id = NULL
  @JoinColumn({ name: 'creator_id' })
  creator?: User;
  // End Optional

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  creationDate: Date;

  @UpdateDateColumn()
  modifiedDate: Date;

  // Relationships
  @ManyToOne(() => Vendor, (vendor) => vendor.importReceipts, {
    onDelete: 'RESTRICT', // Không cho xóa Vendor nếu có Receipt
  })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @OneToMany(
    () => ImportReceiptDetail,
    (detail) => detail.importReceipt,
    { cascade: true }, // Cho phép lưu details cùng lúc với receipt
  )
  importReceiptDetails: ImportReceiptDetail[];
}