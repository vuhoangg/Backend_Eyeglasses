import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { instanceToPlain } from 'class-transformer';
import { QueryDto } from './dto/query.dto';
import { Category } from 'src/category/entities/category.entity';
import { Brand } from 'src/brand/entities/brand.entity';
import { ILike } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category) // Inject Category repository
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand) // Inject Brand repository
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<any> {
    const {  ...productDetails } = createProductDto; // Separate category_id and brand_id
     
    const product = this.productRepository.create({
      ...productDetails,
    });

    const newProduct = await this.productRepository.save(product);
    return instanceToPlain(newProduct);
  }

  async findAll(query: QueryDto): Promise<any> {
    const where: FindOptionsWhere<Product> = {
      isActive: true, // Default to only active products
    };

    const { name, category_id, brand_id, isActive, page = 1, limit = 10 } = query;

    if (name) {
      where.name = ILike(`%${name}%`);
    }

    if (category_id) {
      where.category_id = category_id;
    }

    if (brand_id) {
      where.brand_id = brand_id;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await this.productRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        creationDate: 'DESC',
      },
      relations: ['category', 'brand'], // Load relations
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
    const product = await this.productRepository.findOne({
      where: { id, isActive: true }, // Only fetch active products
      relations: ['category', 'brand'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return instanceToPlain(product);
  }

 

  

  async update(id: number, updateProductDto: UpdateProductDto): Promise<any> {
    const { ...productDetails } = updateProductDto;

    const product = await this.productRepository.findOne({
      where: { id },
      // relations: ['category', 'brand'],
    });

    if (!product) {
      throw new NotFoundException('Product không tồn tại');
    }

    // Cập nhật các trường cơ bản
    Object.assign(product, productDetails);


    const updatedProduct = await this.productRepository.save(product);
    return instanceToPlain(updatedProduct);
  }

  async delete(id: number): Promise<void> {
    const product = await this.productRepository.findOne({where:{id}});
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    product.isActive = false;
    await this.productRepository.save(product);
  }
}