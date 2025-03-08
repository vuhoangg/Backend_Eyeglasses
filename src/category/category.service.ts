import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { QueryDto } from './dto/query.dto';

@Injectable()
export class CategoryService {
  constructor(
  
    @InjectRepository(Category) // Inject Category repository
    private readonly categoryRepository: Repository<Category>,

  ) {}

  // async create(createCategoryDto: CreateCategoryDto): Promise<any> {
  //   const {  ...CategoryDetails } = createCategoryDto; // Separate category_id and Category_id
     
  //   const Category = this.categoryRepository.create({
  //     ...CategoryDetails,
  //   });
  //   const newCategory = await this.categoryRepository.save(Category);
  //   return instanceToPlain(newCategory);
  // }

  async create(createCategoryDto: CreateCategoryDto): Promise<any> {
    const { parentCategoryId, ...categoryDetails } = createCategoryDto;
    
    const category = this.categoryRepository.create(categoryDetails);
    
    if (parentCategoryId) {
      const parentCategory = await this.categoryRepository.findOne({ where: { id: parentCategoryId } });
      if (!parentCategory) {
        throw new NotFoundException(`Danh mục cha với ID ${parentCategoryId} không tồn tại`);
      }
      category.parent = parentCategory;
    }
    
    const newCategory = await this.categoryRepository.save(category);
    return instanceToPlain(newCategory);
  }

  async findAll(query: QueryDto): Promise<any> {
    const where: FindOptionsWhere<Category> = {
      isActive: true, // Default to only active Categorys
    };
    const { name, isActive, page = 1, limit = 10 } = query;
    if (name) {
      where.name = name;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    const [data, total] = await this.categoryRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        creationDate: 'DESC',
      },
      relations: ['parent', 'children'], // Load danh mục cha & con
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
    const Category = await this.categoryRepository.findOne({
      where: { id, isActive: true }, // Only fetch active Categorys
      relations: ['parent', 'children'], // Load danh mục cha & con
    });

    if (!Category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return instanceToPlain(Category);
  }

 

  

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<any> {
    const { ...CategoryDetails } = updateCategoryDto;

    const Category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!Category) {
      throw new NotFoundException('Category không tồn tại');
    }
    // Update Category 
    Object.assign(Category, CategoryDetails);
    const updatedCategory = await this.categoryRepository.save(Category);
    return instanceToPlain(updatedCategory);
  }

  async softDelete(id: number): Promise<void> {
    const Category = await this.categoryRepository.findOne({where:{id}});
    if (!Category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    Category.isActive = false;
    await this.categoryRepository.save(Category);
  }
}

