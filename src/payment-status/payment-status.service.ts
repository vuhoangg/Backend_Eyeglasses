// payment-status.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';  // Import FindOptionsWhere
import { PaymentStatus } from './entities/payment-status.entity';
import { CreatePaymentStatusDto } from './dto/create-payment-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { instanceToPlain } from 'class-transformer';
import { QueryDto } from './dto/query.dto';


@Injectable()
export class PaymentStatusService {
    constructor(
        @InjectRepository(PaymentStatus)
        private readonly paymentStatusRepository: Repository<PaymentStatus>,
    ) { }

    async create(createPaymentStatusDto: CreatePaymentStatusDto): Promise<any> {
        const paymentStatus = this.paymentStatusRepository.create(createPaymentStatusDto);
        const newPaymentStatus = await this.paymentStatusRepository.save(paymentStatus);
        return instanceToPlain(newPaymentStatus);
    }

    async findAll(query: QueryDto): Promise<any> { // Add query parameter
         const where: FindOptionsWhere<PaymentStatus> = {
            isActive: true, // Default to only active payment statuses
        };
        const {isActive, page = 1, limit = 10 } = query; // Assuming QueryDto has page and limit

        if (isActive !== undefined) {
          where.isActive = isActive;
        }
        const [data, total] = await this.paymentStatusRepository.findAndCount({
            where,
            skip: (page - 1) * limit,
            take: limit,
            order: {
                id: 'DESC',
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
        const paymentStatus = await this.paymentStatusRepository.findOne({
            where: { id, isActive: true }, // Only fetch active payment statuses
        });

        if (!paymentStatus) {
            throw new NotFoundException(`PaymentStatus with ID ${id} not found`);
        }

        return instanceToPlain(paymentStatus);
    }

    async update(id: number, updatePaymentStatusDto: UpdatePaymentStatusDto): Promise<any> {
        const paymentStatus = await this.paymentStatusRepository.findOne({ where: { id } });

        if (!paymentStatus) {
            throw new NotFoundException('PaymentStatus not found');
        }

        Object.assign(paymentStatus, updatePaymentStatusDto);
        const updatedPaymentStatus = await this.paymentStatusRepository.save(paymentStatus);
        return instanceToPlain(updatedPaymentStatus);
    }

    async remove(id: number): Promise<void> {
        const paymentStatus = await this.paymentStatusRepository.findOne({ where: { id } });

        if (!paymentStatus) {
            throw new NotFoundException(`PaymentStatus with ID ${id} not found`);
        }

        paymentStatus.isActive = false; // Soft delete
        await this.paymentStatusRepository.save(paymentStatus);
    }
}