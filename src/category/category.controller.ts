import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpException, NotFoundException, ParseIntPipe, Query, UseGuards } from '@nestjs/common';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryService } from './category.service';
import { QueryDto } from './dto/query.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('category')
@UseGuards(JwtAuthGuard, RolesGuard) 
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Roles('admin', 'staff')
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

  @Roles('admin') 
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


  @Roles('admin') 
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
