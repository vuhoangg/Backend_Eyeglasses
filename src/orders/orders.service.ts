import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { instanceToPlain } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';
import { OrderStatus } from 'src/order-status/entities/order-status.entity';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { Product } from 'src/products/entities/product.entity';
import { OrderItem } from 'src/order_items/entities/order_item.entity';

interface QueryDto {
  user_id?: number;
  order_status_id?: number;
  page?: number;
  limit?: number;
  isActive?: boolean;
}

const TARGET_COMPLETED_STATUS_ID = 4; // ID for 'Delivered' status

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name); // Thêm Logger
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OrderStatus)
    private readonly orderStatusRepository: Repository<OrderStatus>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(Product) // <-- Inject ProductRepository
    private readonly productRepository: Repository<Product>,
    @InjectRepository(OrderItem) // <-- Inject OrderItemRepository (cần thiết để load relations)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly dataSource: DataSource, // <-- Inject DataSource
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number): Promise<any> {
    const { order_status_id, promotion_id, ...orderData } = createOrderDto;

    const user = await this.userRepository.findOneBy({ id: userId  });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId } not found`);
    }

    const orderStatus = await this.orderStatusRepository.findOneBy({ id: order_status_id });
    if (!orderStatus) {
      throw new NotFoundException(`OrderStatus with ID ${order_status_id} not found`);
    }
    
    // Khởi tạo promotion là null trước
    let promotion: Promotion | null = null;

    // Check nếu promotion_id tồn tại thì mới tìm kiếm promotion
    if (promotion_id) {
        promotion = await this.promotionRepository.findOneBy({ id: promotion_id });
        if (!promotion) {
            throw new NotFoundException(`Promotion with ID ${promotion_id} not found`);
        }
    }

    const order = this.orderRepository.create({
      ...orderData,
      user: user,  // Gán trực tiếp đối tượng User
      orderStatus,
      promotion,
    });

    const newOrder = await this.orderRepository.save(order);
    return instanceToPlain(newOrder);
  }

  async findAll(query: QueryDto): Promise<any> {
    const where: FindOptionsWhere<Order> = {
      isActive: true, // Default to only active orders
    };
    const { user_id, order_status_id, isActive, page = 1, limit = 10 } = query;

    if (user_id) {
      where.user = { id: user_id };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (order_status_id) {
      where.orderStatus = { id: order_status_id };
    }

    const [data, total] = await this.orderRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        creationDate: 'DESC',
      },
      relations: ['user', 'orderStatus', 'promotion', 'orderItems'],
    });

    const totalPage = Math.ceil(total / limit);

    return {
      total,
      totalPage,
      page,
      limit,
      data: instanceToPlain(data),
    };
  }

  // async findOne(id: number): Promise<any> {
  //   const order = await this.orderRepository.findOne({
  //     where: { id, isActive: true  },
  //     relations: ['user', 'orderStatus', 'promotion', 'orderItems'],
  //   });

  //   if (!order) {
  //     throw new NotFoundException(`Order with ID ${id} not found`);
  //   }

  //   return instanceToPlain(order);
  // }
  async findOne(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'orderStatus', 'promotion', 'orderItems'], // ⚡ Thêm orderItems vào
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  // async update(id: number, updateOrderDto: UpdateOrderDto): Promise<any> {
  //   const order = await this.orderRepository.findOne({
  //     where: { id },
  //     relations: ['user', 'orderStatus', 'promotion'],
  //   });

  //   if (!order) {
  //     throw new NotFoundException(`Order with ID ${id} not found`);
  //   }

  //   const { user_id, order_status_id, promotion_id, ...orderData } = updateOrderDto;

  //   if (user_id) {
  //     const user = await this.userRepository.findOneBy({ id: user_id });
  //     if (!user) {
  //       throw new NotFoundException(`User with ID ${user_id} not found`);
  //     }
  //     order.user = user;
  //   }
  //   if (order_status_id) {
  //     const orderStatus = await this.orderStatusRepository.findOneBy({ id: order_status_id });
  //     if (!orderStatus) {
  //       throw new NotFoundException(`OrderStatus with ID ${order_status_id} not found`);
  //     }
  //     order.orderStatus = orderStatus;
  //   }

  //   if (promotion_id) {
  //     const promotion = await this.promotionRepository.findOneBy({ id: promotion_id });
  //     if (!promotion) {
  //       throw new NotFoundException(`Promotion with ID ${promotion_id} not found`);
  //     }
  //     order.promotion = promotion;
  //   }

  //   Object.assign(order, orderData);

  //   const updatedOrder = await this.orderRepository.save(order);
  //   return instanceToPlain(updatedOrder);
  // }

  // --- Cập nhật phương thức update ---
  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<any> {
    // --- Bắt đầu Transaction ---
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tìm Order CÙNG VỚI relations cần thiết cho logic stock
      const order = await queryRunner.manager.findOne(Order, {
        where: { id },
        relations: [
            'orderStatus', // Cần trạng thái cũ
            'orderItems', // Cần danh sách sản phẩm đã mua
            'orderItems.product', // Cần thông tin sản phẩm để cập nhật stock
            'user', // Giữ lại các relations cũ nếu cần
            'promotion',
        ],
      });

      if (!order) {
        throw new NotFoundException(`Đơn hàng với ID ${id} không tồn tại.`);
      }

      const oldStatusId = order.orderStatus ? order.orderStatus.id : null; // Lưu ID trạng thái cũ

      // Lấy thông tin cập nhật từ DTO
      const { user_id, order_status_id, promotion_id, ...orderData } = updateOrderDto;

      // --- Xử lý cập nhật các field thông thường và status ---
      let newStatus: OrderStatus | null = null; // Biến lưu trạng thái mới

      // Cập nhật các trường thông thường
      queryRunner.manager.merge(Order, order, orderData); // Merge các field như totalAmount, shippingAddress,...

      // Cập nhật user nếu có
      if (user_id && order.userId !== user_id) {
          const user = await queryRunner.manager.findOneBy(User, { id: user_id });
          if (!user) {
              throw new NotFoundException(`User với ID ${user_id} không tồn tại.`);
          }
          order.user = user; // Gán đối tượng user
      }

      // Cập nhật promotion nếu có
      if (promotion_id !== undefined ) { // Xử lý cả trường hợp promotion_id là null
           if(promotion_id === null){
               order.promotion = null;
           } else {
               const promotion = await queryRunner.manager.findOneBy(Promotion, { id: promotion_id });
               if (!promotion) {
                   throw new NotFoundException(`Khuyến mãi với ID ${promotion_id} không tồn tại.`);
               }
               order.promotion = promotion;
           }
      }


      // Cập nhật order status nếu có
      if (order_status_id && (!order.orderStatus || order.orderStatus.id !== order_status_id)) {
        newStatus = await queryRunner.manager.findOneBy(OrderStatus, { id: order_status_id });
        if (!newStatus) {
          throw new NotFoundException(`Trạng thái đơn hàng với ID ${order_status_id} không tồn tại.`);
        }
        order.orderStatus = newStatus; // Gán trạng thái mới
      } else {
          newStatus = order.orderStatus; // Vẫn là trạng thái hiện tại nếu không có thay đổi ID
      }

      // --- LOGIC TRỪ KHO ---
      // Chỉ trừ kho khi chuyển sang trạng thái Đích (TARGET_COMPLETED_STATUS_ID) và trạng thái cũ *KHÁC* trạng thái Đích
      if (newStatus && newStatus.id === TARGET_COMPLETED_STATUS_ID && oldStatusId !== TARGET_COMPLETED_STATUS_ID) {
        this.logger.log(`Order ID ${id} status changing to 'Delivered' (ID: ${TARGET_COMPLETED_STATUS_ID}). Decrementing stock...`);

        if (!order.orderItems || order.orderItems.length === 0) {
            this.logger.warn(`Order ID ${id} has no items to decrement stock for.`);
        } else {
            for (const item of order.orderItems) {
                const product = item.product; // Product đã được load từ relations

                if (!product) {
                    // Trường hợp hy hữu product bị null dù đã load relation
                    throw new InternalServerErrorException(`Không tìm thấy thông tin sản phẩm cho OrderItem ID ${item.id}.`);
                }

                this.logger.log(`Checking stock for Product ID ${product.id} (${product.name}). Current stock: ${product.stock_quantity}, Quantity to decrement: ${item.quantity}`);

                // Kiểm tra tồn kho trước khi trừ
                if (product.stock_quantity < item.quantity) {
                    throw new BadRequestException(`Không đủ số lượng tồn kho cho sản phẩm "${product.name}" (ID: ${product.id}). Yêu cầu: ${item.quantity}, Hiện có: ${product.stock_quantity}`);
                }

                // Trừ kho
                product.stock_quantity -= item.quantity;

                // Lưu lại sản phẩm đã cập nhật trong transaction
                await queryRunner.manager.save(product);
                this.logger.log(`Successfully decremented stock for Product ID ${product.id}. New stock: ${product.stock_quantity}`);
            }
         }
      }
      // --- (Optional) LOGIC HOÀN KHO KHI HỦY ĐƠN ĐÃ GIAO ---
      // else if (newStatus && oldStatusId === TARGET_COMPLETED_STATUS_ID && (newStatus.name === 'Cancelled' || newStatus.name === 'Returned')) {
      //     this.logger.log(`Order ID ${id} status changing from 'Delivered' to '${newStatus.name}'. Incrementing stock...`);
      //     // Tương tự vòng lặp trên, nhưng cộng lại stock_quantity
      //     // Cẩn thận với logic hoàn kho, đảm bảo đúng nghiệp vụ
      //     for (const item of order.orderItems) {
      //         const product = item.product;
      //         if(product){
      //              product.stock_quantity += item.quantity;
      //              await queryRunner.manager.save(product);
      //              this.logger.log(`Incremented stock for Product ID ${product.id}. New stock: ${product.stock_quantity}`);
      //         }
      //     }
      // }

      // Lưu lại Order với các thay đổi (status, fields khác)
      const updatedOrder = await queryRunner.manager.save(order);

      // --- Kết thúc Transaction ---
      await queryRunner.commitTransaction();

      this.logger.log(`Successfully updated Order ID ${id}.`);
      // Trả về dữ liệu đã được làm sạch và có relations đầy đủ
      return instanceToPlain(updatedOrder);

    } catch (error) {
      // Nếu có lỗi, rollback transaction
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to update Order ID ${id}: ${error.message}`, error.stack);
      // Ném lại lỗi để controller xử lý
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
          throw error;
      }
      throw new InternalServerErrorException('Cập nhật đơn hàng thất bại. Thay đổi đã được hoàn tác.');
    } finally {
      // Luôn giải phóng queryRunner
      await queryRunner.release();
    }
  }






  async delete(id: number): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { id } });
  
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  
    order.isActive = false;
    await this.orderRepository.save(order);
  }

  // orders.service.ts
  async getMonthlyRevenue(): Promise<any[]> {
    const monthlyRevenue = await this.orderRepository
        .createQueryBuilder('order')
        .select("DATE_FORMAT(creationDate, '%Y-%m-01')", 'month')
        .addSelect('SUM(order.totalAmount)', 'revenue')
        .where("YEAR(creationDate) = YEAR(CURDATE())") // Lấy dữ liệu năm hiện tại trong MySQL
        .groupBy('month')
        .orderBy('month', 'ASC')
        .getRawMany();
  
    return monthlyRevenue.map(item => ({
        month: new Date(item.month).toLocaleDateString('en-US', { month: '2-digit' }),
        revenue: parseFloat(item.revenue || 0), // Thêm xử lý cho trường hợp null
    }));
  }
  
}