import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { instanceToPlain } from 'class-transformer';
import { QueryDto } from './dto/query.dto';

@Injectable()
export class BrandService {

  constructor(
  
    @InjectRepository(Brand) // Inject Brand repository
    private readonly brandRepository: Repository<Brand>,
  ) {}



  async create(createBrandDto: CreateBrandDto): Promise<any> {
    const {  ...BrandDetails } = createBrandDto; // Separate category_id and brand_id
     
    const Brand = this.brandRepository.create({
      ...BrandDetails,
    });

    const newBrand = await this.brandRepository.save(Brand);
    return instanceToPlain(newBrand);
  }

  async findAll(query: QueryDto): Promise<any> {
    const where: FindOptionsWhere<Brand> = {
      isActive: true, // Default to only active Brands
    };
    const { name, isActive, page = 1, limit = 10 } = query;
    if (name) {
      where.name = name;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    const [data, total] = await this.brandRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        creationDate: 'DESC',
      },
      // relations: ['product'], // Load relations
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
    const Brand = await this.brandRepository.findOne({
      where: { id, isActive: true }, // Only fetch active Brands
    });

    if (!Brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    return instanceToPlain(Brand);
  }

 

  

  async update(id: number, updateBrandDto: UpdateBrandDto): Promise<any> {
    const { ...BrandDetails } = updateBrandDto;

    const Brand = await this.brandRepository.findOne({
      where: { id },
    });

    if (!Brand) {
      throw new NotFoundException('Brand không tồn tại');
    }
    // Update Brand 
    Object.assign(Brand, BrandDetails);
    const updatedBrand = await this.brandRepository.save(Brand);
    return instanceToPlain(updatedBrand);
  }

  async softDelete(id: number): Promise<void> {
    const Brand = await this.brandRepository.findOne({where:{id}});
    if (!Brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    Brand.isActive = false;
    await this.brandRepository.save(Brand);
  }
}
