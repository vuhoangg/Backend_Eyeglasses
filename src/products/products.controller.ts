import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Query,
  NotFoundException,
  HttpException,
  UseGuards,
} from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { ProductService } from './products.service';
import { QueryDto } from './dto/query.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}


  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Roles('admin') 
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    try {
      const product = await this.productService.create(createProductDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Product created successfully',
        data: product,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
 

  @Get()
  async findAll(@Query() query: QueryDto) {
    try {
      const products = await this.productService.findAll(query);
      return {
        statusCode: HttpStatus.OK,
        message: 'Products fetched successfully',
        data: products,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  @Get('best-selling')
async getBestSellingProducts() {
    try {
        const products = await this.productService.getBestSellingProducts();
        return {
            statusCode: HttpStatus.OK,
            message: 'Best selling products fetched successfully',
            data: products,
        };
    } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
}


@Get('latest') // New endpoint for latest products
  async getLatestProducts() {
    try {
      const products = await this.productService.getLatestProducts();
      return {
        statusCode: HttpStatus.OK,
        message: 'Latest products fetched successfully',
        data: products,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const product = await this.productService.findOne(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Product fetched successfully',
        data: product,
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Roles('admin') 
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      const product = await this.productService.update(id, updateProductDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Product updated successfully',
        data: product,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Roles('admin') 
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.productService.delete(id);
      return{
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Product deleted successfully',
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  // products.controller.ts

}