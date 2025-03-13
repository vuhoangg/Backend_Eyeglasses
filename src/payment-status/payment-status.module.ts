import { Module } from '@nestjs/common';
import { PaymentStatusService } from './payment-status.service';
import { PaymentStatusController } from './payment-status.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentStatus } from './entities/payment-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentStatus])],
  controllers: [PaymentStatusController],
  providers: [PaymentStatusService],
  exports: [PaymentStatusService], // Export the service if needed elsewhere
})
export class PaymentStatusModule {}