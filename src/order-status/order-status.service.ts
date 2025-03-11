import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { OrderStatus } from './entities/order-status.entity';
import { CreateOrderStatusDto } from './dto/create-order-status.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { instanceToPlain } from 'class-transformer';

interface QueryDto {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

@Injectable()
export class OrderStatusService {
  constructor(
    @InjectRepository(OrderStatus)
    private readonly orderStatusRepository: Repository<OrderStatus>,
  ) {}

  async create(createOrderStatusDto: CreateOrderStatusDto): Promise<any> {
    const orderStatus = this.orderStatusRepository.create(createOrderStatusDto);
    const newOrderStatus = await this.orderStatusRepository.save(orderStatus);
    return instanceToPlain(newOrderStatus);
  }

  async findAll(query: QueryDto): Promise<any> {
    const where: FindOptionsWhere<OrderStatus> = {
      isActive: true,
    };
    const { page = 1, isActive, limit = 10 } = query;

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await this.orderStatusRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        name: 'ASC',
      },
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
    const orderStatus = await this.orderStatusRepository.findOne({ where: { id,  isActive: true } });

    if (!orderStatus) {
      throw new NotFoundException(`OrderStatus with ID ${id} not found`);
    }

    return instanceToPlain(orderStatus);
  }

  async update(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<any> {
    const orderStatus = await this.orderStatusRepository.findOne({ where: { id} });

    if (!orderStatus) {
      throw new NotFoundException(`OrderStatus with ID ${id} not found`);
    }

    Object.assign(orderStatus, updateOrderStatusDto);
    const updatedOrderStatus = await this.orderStatusRepository.save(orderStatus);
    return instanceToPlain(updatedOrderStatus);
  }



  async delete(id: number): Promise<void> {
    const orderStatus = await this.orderStatusRepository.findOne({ where: { id } });

    if (!orderStatus) {
      throw new NotFoundException(`orderStatus with ID ${id} not found`);
    }

    orderStatus.isActive = false;
    await this.orderStatusRepository.save(orderStatus);
  }
}