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
} from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { ProductService } from './products.service';
import { QueryDto } from './dto/query.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

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
}