// payment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm'; // Import FindOptionsWhere
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { instanceToPlain } from 'class-transformer';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/user/entities/user.entity';
import { PaymentStatus } from 'src/payment-status/entities/payment-status.entity';
import { QueryDto } from './dto/query.dto';


@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(PaymentStatus)
        private readonly paymentStatusRepository: Repository<PaymentStatus>,
    ) { }

    async create(createPaymentDto: CreatePaymentDto): Promise<any> {
        const { userId, orderId, paymentStatusId, ...paymentDetails } = createPaymentDto;

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }
        const paymentStatus = await this.paymentStatusRepository.findOne({ where: { id: paymentStatusId } });
        if (!paymentStatus) {
            throw new NotFoundException(`PaymentStatus with ID ${paymentStatusId} not found`);
        }

        const payment = this.paymentRepository.create({
            ...paymentDetails,
            user: { id: userId },
            order: { id: orderId },
            status: { id: paymentStatusId }

        });

        const newPayment = await this.paymentRepository.save(payment);
        return instanceToPlain(newPayment);
    }

    async findAll(query: QueryDto): Promise<any> { // Add query parameter
        const where: FindOptionsWhere<Payment> = {
            isActive: true, // Default to only active payments
        };
        const { page = 1, isActive, limit = 10 } = query; // Assuming QueryDto has page and limit
          
        if (isActive !== undefined) {
          where.isActive = isActive;
        }

         const [data, total] = await this.paymentRepository.findAndCount({
            where,
            skip: (page - 1) * limit,
            take: limit,
            relations: ['user', 'order', 'status'],
            order: {
                creationDate: 'DESC',
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
        const payment = await this.paymentRepository.findOne({
            where: { id, isActive: true }, // Only fetch active payments
            relations: ['user', 'order', 'status'],
        });

        if (!payment) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }

        return instanceToPlain(payment);
    }

    async update(id: number, updatePaymentDto: UpdatePaymentDto): Promise<any> {
        const { userId, orderId, paymentStatusId, ...paymentDetails } = updatePaymentDto;

        const payment = await this.paymentRepository.findOne({
            where: { id },
            relations: ['user', 'order', 'status'],
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }
         const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }
       const paymentStatus = await this.paymentStatusRepository.findOne({ where: { id: paymentStatusId } });
        if (!paymentStatus) {
            throw new NotFoundException(`PaymentStatus with ID ${paymentStatusId} not found`);
        }

        Object.assign(payment, paymentDetails);
        payment.user = user;
        payment.order = order;
        payment.status = paymentStatus;


        const updatedPayment = await this.paymentRepository.save(payment);
        return instanceToPlain(updatedPayment);
    }

    async remove(id: number): Promise<void> {
        const payment = await this.paymentRepository.findOne({ where: { id } });
        if (!payment) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }
        payment.isActive = false; // Soft delete
        await this.paymentRepository.save(payment);
    }
}