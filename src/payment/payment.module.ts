// payment.module.ts

import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/user/entities/user.entity';
import { PaymentStatus } from 'src/payment-status/entities/payment-status.entity';
import { PaymentStatusModule } from 'src/payment-status/payment-status.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Order, User, PaymentStatus]), PaymentStatusModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}