import { Injectable, NotFoundException, Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<any> {
    try{
    const product = this.productRepository.create(createProductDto);
    return instanceToPlain(await this.productRepository.save(product));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(): Promise<any> {
    try {
      const products = await this.productRepository.find({ relations: ['category', 'brand'] });
      return {
        statusCode: HttpStatus.OK,
        message: 'Thành công',
        data: instanceToPlain(products),
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const product = await this.productRepository.findOne({ where: { id }, relations: ['category', 'brand', 'productImages'] });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Thành công',
        data: instanceToPlain(product),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<any> {
    try{
      const product = await this.productRepository.findOneBy({id:id});
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      Object.assign(product, updateProductDto);
      const updatedProduct = await this.productRepository.save(product);
      return {
        statusCode: HttpStatus.OK,
        message: 'Thành công',
        data: instanceToPlain(updatedProduct),
      };
    }catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number): Promise<any> {
    try {
      const product = await this.productRepository.findOneBy({id:id});
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      await this.productRepository.remove(product);
        return {
          statusCode: HttpStatus.OK,
          message: 'Thành công',
          data: [],
        };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}


