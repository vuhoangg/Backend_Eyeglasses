import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportReceipt } from './entities/import-receipt.entity';

import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/user/entities/user.entity'; // Import User nếu có creator_id
import { ImportReceiptDetail } from './entities/import-receipt-detail.entity';
import { Vendor } from 'src/vendors/entities/vendor.entity';
import { ImportReceiptController } from './import-receipts.controller';
import { ImportReceiptService } from './import-receipts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImportReceipt,
      ImportReceiptDetail,
      Vendor,
      Product,
      // User, // Import User nếu có creator_id
    ]),
  ],
  controllers: [ImportReceiptController],
  providers: [ImportReceiptService],
})
export class ImportReceiptsModule {}