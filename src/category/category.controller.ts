import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpException, NotFoundException, ParseIntPipe, Query } from '@nestjs/common';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryService } from './category.service';
import { QueryDto } from './dto/query.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    try {
      const brand = await this.categoryService.create(createCategoryDto);
      return  {
        statusCode : HttpStatus.CREATED,
        message: 'Brand created successfully',
        data: brand ,
        
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll(@Query() query: QueryDto ) {
    try {
      const brands = await this.categoryService.findAll(query);
      return {

        statusCode: HttpStatus.OK,
        message: 'Brands fetched successfully',
        data: brands,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const Brand = await this.categoryService.findOne(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Brand OnebyId successfully',
        data: Brand,
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandDto: UpdateCategoryDto,
  ) {
    try {
      const brand  = await this.categoryService.update(id, updateBrandDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Brand updated successfully',
        data: brand ,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.categoryService.softDelete(id);
      return{
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Brand deleted successfully',
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

}
