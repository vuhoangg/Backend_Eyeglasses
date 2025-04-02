import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminsModule } from './admins/admins.module';
import { Admin } from './admins/entities/admin.entity';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { ProductImageModule } from './product_image/product_image.module';
import { ReviewModule } from './review/review.module';
import { UserModule } from './user/user.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { User } from './user/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { Product } from './products/entities/product.entity';
import { Permission } from './permissions/entities/permission.entity';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { FilesModule } from './files/files.module';
import { Category } from './category/entities/category.entity';
import { Brand } from './brand/entities/brand.entity';
import { ProductImage } from './product_image/entities/product_image.entity';
import { Review } from './review/entities/review.entity';
import { CartItemsModule } from './cart-items/cart-items.module';
import { CartItem } from './cart-items/entities/cart-item.entity';
import { OrderStatusModule } from './order-status/order-status.module';
import { PromotionsModule } from './promotions/promotions.module';
import { OrderItemsModule } from './order_items/order_items.module';
import { OrdersModule } from './orders/orders.module';
import { Promotion } from './promotions/entities/promotion.entity';
import { OrderStatus } from './order-status/entities/order-status.entity';
import { OrderItem } from './order_items/entities/order_item.entity';
import { Order } from './orders/entities/order.entity';
import { PaymentModule } from './payment/payment.module';
import { Payment } from './payment/entities/payment.entity';
import { PaymentStatusModule } from './payment-status/payment-status.module';
import { PaymentStatus } from './payment-status/entities/payment-status.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'eyeglasses_4',
      entities: [User, Role, Product, Permission, Category, Brand ,ProductImage, Review, CartItem, Order, OrderItem, OrderStatus, Promotion, Payment ,PaymentStatus ],
      synchronize: true,
      logging: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule available globally
      envFilePath: '.env', // Optional: Specify the path to your .env file
    }),
  
    // AdminsModule,
    ProductsModule,
    CategoryModule,
    BrandModule,
    ProductImageModule,
    ReviewModule,
    UserModule,
    RolesModule,
    PermissionsModule,
    AuthModule,
    FilesModule,
    CartItemsModule,
    OrderStatusModule,
    PromotionsModule,
    OrderItemsModule,
    OrdersModule,
    PaymentModule,
    PaymentStatusModule,
  
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
