import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { OrderItem } from './entities/order_item.entity';
import { CreateOrderItemDto } from './dto/create-order_item.dto';
import { UpdateOrderItemDto } from './dto/update-order_item.dto';

interface QueryDto {
  order_id?: number;
  product_id?: number;
  page?: number;
  limit?: number;
  isActive?: boolean;
}

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createOrderItemDto: CreateOrderItemDto): Promise<any> {
    const { order_id, product_id, ...orderItemData } = createOrderItemDto;

    const order = await this.orderRepository.findOneBy({ id: order_id });
    if (!order) {
      throw new NotFoundException(`Order with ID ${order_id} not found`);
    }

    const product = await this.productRepository.findOneBy({ id: product_id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${product_id} not found`);
    }

    const orderItem = this.orderItemRepository.create({
      ...orderItemData,
      order,
      product,
    });

    const newOrderItem = await this.orderItemRepository.save(orderItem);
    return instanceToPlain(newOrderItem);
  }

  async findAll(query: QueryDto): Promise<any> {
    const where: FindOptionsWhere<OrderItem> = {
      isActive: true, // Default to only active orders
    };
    const { order_id, product_id, isActive, page = 1, limit = 10 } = query;

    if (order_id) {
      where.order = { id: order_id };
    }

    if (product_id) {
      where.product = { id: product_id };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await this.orderItemRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        creationDate: 'DESC',
      },
      relations: ['order', 'product'],
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
    const orderItem = await this.orderItemRepository.findOne({
      where: { id, isActive: true },
      relations: ['order', 'product'],
    });

    if (!orderItem) {
      throw new NotFoundException(`OrderItem with ID ${id} not found`);
    }

    return instanceToPlain(orderItem);
  }
  
  async findAllByOrderId(orderId: number): Promise<any> {
    const where: FindOptionsWhere<OrderItem> = {
      isActive: true, // Default to only active orderItems
      order: { id: orderId }, // Filter by orderId
    };

    const [data, total] = await this.orderItemRepository.findAndCount({
      where,
      order: {
        creationDate: 'DESC',
      },
      relations: ['order', 'product'], // Ensure relations are loaded
    });

    return {
      total,
      data: instanceToPlain(data),
    };
  }

  async update(id: number, updateOrderItemDto: UpdateOrderItemDto): Promise<any> {
    const orderItem = await this.orderItemRepository.findOne({ where: { id } });

    if (!orderItem) {
      throw new NotFoundException(`OrderItem with ID ${id} not found`);
    }

    const { order_id, product_id, ...orderItemData } = updateOrderItemDto;

    if (order_id) {
      const order = await this.orderRepository.findOneBy({ id: order_id });
      if (!order) {
        throw new NotFoundException(`Order with ID ${order_id} not found`);
      }
      orderItem.order = order;
    }

    if (product_id) {
      const product = await this.productRepository.findOneBy({ id: product_id });
      if (!product) {
        throw new NotFoundException(`Product with ID ${product_id} not found`);
      }
      orderItem.product = product;
    }

    Object.assign(orderItem, orderItemData);

    const updatedOrderItem = await this.orderItemRepository.save(orderItem);
    return instanceToPlain(updatedOrderItem);
  }

  async delete(id: number): Promise<void> {
    const orderItem = await this.orderItemRepository.findOne({ where: { id } });

    if (!orderItem) {
      throw new NotFoundException(`OrderItem with ID ${id} not found`);
    }

    await this.orderItemRepository.remove(orderItem);
  }
}