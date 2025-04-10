import { Product } from 'src/products/entities/product.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ImportReceipt } from './import-receipt.entity';

@Entity('import_receipt_details')
export class ImportReceiptDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'import_receipt_id' })
  importReceiptId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column()
  quantity: number;

  @Column({ name: 'import_price', type: 'decimal', precision: 10, scale: 2 })
  importPrice: number;

  @CreateDateColumn()
  creationDate: Date;

  @UpdateDateColumn()
  modifiedDate: Date;

  // Relationships
  @ManyToOne(() => ImportReceipt, (receipt) => receipt.importReceiptDetails, {
    onDelete: 'CASCADE', // Xóa details khi receipt bị xóa
  })
  @JoinColumn({ name: 'import_receipt_id' })
  importReceipt: ImportReceipt;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' }) // Không cho xóa Product nếu có Detail
  @JoinColumn({ name: 'product_id' })
  product: Product;
}