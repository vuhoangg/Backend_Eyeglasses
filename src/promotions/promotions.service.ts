import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { instanceToPlain } from 'class-transformer';

interface QueryDto {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
  ) {}

  async create(createPromotionDto: CreatePromotionDto): Promise<any> {
    const promotion = this.promotionRepository.create(createPromotionDto);
    const newPromotion = await this.promotionRepository.save(promotion);
    return instanceToPlain(newPromotion);
  }

  async findAll(query: QueryDto): Promise<any> {
    const where: FindOptionsWhere<Promotion> = {};
    const { isActive, page = 1, limit = 10 } = query;

    if (isActive !== undefined) {
      where.isActive = isActive; // Use isActive from query if provided
    } else {
      where.isActive = true; // Default to isActive = true
    }
    const [data, total] = await this.promotionRepository.findAndCount({
      where, // ADD this
      skip: (page - 1) * limit,
      take: limit,
      order: {
        code: 'ASC',
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
    const promotion = await this.promotionRepository.findOne({ where: { id ,isActive: true } });

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    return instanceToPlain(promotion);
  }

  async update(id: number, updatePromotionDto: UpdatePromotionDto): Promise<any> {
    const promotion = await this.promotionRepository.findOne({ where: { id } });

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    Object.assign(promotion, updatePromotionDto);
    const updatedPromotion = await this.promotionRepository.save(promotion);
    return instanceToPlain(updatedPromotion);
  }



  async delete(id: number): Promise<void> {
    const promotion = await this.promotionRepository.findOne({ where: { id } });

    if (!promotion) {
      throw new NotFoundException(`promotion with ID ${id} not found`);
    }

    promotion.isActive = false;
    await this.promotionRepository.save(promotion);
  }
}