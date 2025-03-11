import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { instanceToPlain } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';
import { OrderStatus } from 'src/order-status/entities/order-status.entity';
import { Promotion } from 'src/promotions/entities/promotion.entity';

interface QueryDto {
  user_id?: number;
  order_status_id?: number;
  page?: number;
  limit?: number;
  isActive?: boolean;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OrderStatus)
    private readonly orderStatusRepository: Repository<OrderStatus>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<any> {
    const { user_id, order_status_id, promotion_id, ...orderData } = createOrderDto;

    const user = await this.userRepository.findOneBy({ id: user_id });
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    const orderStatus = await this.orderStatusRepository.findOneBy({ id: order_status_id });
    if (!orderStatus) {
      throw new NotFoundException(`OrderStatus with ID ${order_status_id} not found`);
    }

    const promotion =  await this.promotionRepository.findOneBy({ id: promotion_id });
    if (promotion) {
      throw new NotFoundException(`Promotion with ID ${promotion_id} not found`);
    }

    const order = this.orderRepository.create({
      ...orderData,
      user,
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

  async findOne(id: number): Promise<any> {
    const order = await this.orderRepository.findOne({
      where: { id,isActive: true  },
      relations: ['user', 'orderStatus', 'promotion', 'orderItems'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return instanceToPlain(order);
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<any> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'orderStatus', 'promotion'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const { user_id, order_status_id, promotion_id, ...orderData } = updateOrderDto;

    if (user_id) {
      const user = await this.userRepository.findOneBy({ id: user_id });
      if (!user) {
        throw new NotFoundException(`User with ID ${user_id} not found`);
      }
      order.user = user;
    }
    if (order_status_id) {
      const orderStatus = await this.orderStatusRepository.findOneBy({ id: order_status_id });
      if (!orderStatus) {
        throw new NotFoundException(`OrderStatus with ID ${order_status_id} not found`);
      }
      order.orderStatus = orderStatus;
    }

    if (promotion_id) {
      const promotion = await this.promotionRepository.findOneBy({ id: promotion_id });
      if (!promotion) {
        throw new NotFoundException(`Promotion with ID ${promotion_id} not found`);
      }
      order.promotion = promotion;
    }

    Object.assign(order, orderData);

    const updatedOrder = await this.orderRepository.save(order);
    return instanceToPlain(updatedOrder);
  }


  async delete(id: number): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { id } });
  
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  
    order.isActive = false;
    await this.orderRepository.save(order);
  }
  
}