import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import để sử dụng forFeature
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { Vendor } from './entities/vendor.entity'; // Import Entity

@Module({
  imports: [
      TypeOrmModule.forFeature([Vendor]) // Đăng ký Entity Vendor với TypeORM
    ],
  controllers: [VendorsController], // Khai báo Controller
  providers: [VendorsService],      // Khai báo Service
  exports: [VendorsService], // Export Service để module khác có thể sử dụng (ví dụ: ImportReceiptsModule)
})
export class VendorsModule {}