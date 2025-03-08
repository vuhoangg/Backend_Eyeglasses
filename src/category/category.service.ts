import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { instanceToPlain } from 'class-transformer';
import { QueryDto } from './dto/query.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

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
    const where: FindOptionsWhere<Category> = { isActive: true };

    if (query.name) where.name = query.name;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const [data, total] = await this.categoryRepository.findAndCount({
      where,
      relations: ['parent', 'children'], // Load danh mục cha & con
      order: { creationDate: 'DESC' },
    });

    return { total, data: instanceToPlain(data) };
  }

  async findOne(id: number): Promise<any> {
    const category = await this.categoryRepository.findOne({
      where: { id, isActive: true },
      relations: ['parent', 'children'], // Lấy danh mục cha & con nếu có
    });

    if (!category) {
      throw new NotFoundException(`Danh mục với ID ${id} không tồn tại`);
    }

    return instanceToPlain(category);
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<any> {
    const { parentCategoryId, ...categoryDetails } = updateCategoryDto;

    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Danh mục không tồn tại');

    Object.assign(category, categoryDetails);

    if (parentCategoryId) {
      const parentCategory = await this.categoryRepository.findOne({ where: { id: parentCategoryId } });
      if (!parentCategory) throw new NotFoundException('Danh mục cha không tồn tại');
      category.parent = parentCategory;
    }

    const updatedCategory = await this.categoryRepository.save(category);
    return instanceToPlain(updatedCategory);
  }

  async softDelete(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Danh mục không tồn tại');

    category.isActive = false;
    await this.categoryRepository.save(category);
  }
}
