import { Module } from '@nestjs/common';


import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductController } from './products.controller';
import { ProductService } from './products.service';
import { Category } from 'src/category/entities/category.entity';
import { Brand } from 'src/brand/entities/brand.entity';
import { OrderItem } from 'src/order_items/entities/order_item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Brand, OrderItem ])], 
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductsModule {}
