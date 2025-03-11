import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { User } from 'src/user/entities/user.entity';
import { OrderStatus } from 'src/order-status/entities/order-status.entity';
import { Promotion } from 'src/promotions/entities/promotion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User , OrderStatus , Promotion ])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
