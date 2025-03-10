import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  NotFoundException,
  HttpException,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

interface QueryDto {
  user_id?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  async create(@Body() createCartDto: CreateCartDto) {
      try {
          const cart = await this.cartsService.create(createCartDto);
          return {
              statusCode: HttpStatus.CREATED,
              message: 'Cart created successfully',
              data: cart,
          };
      } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }

  @Get()
  async findAll(@Query() query: QueryDto) {
      try {
          const carts = await this.cartsService.findAll(query);
          return {
              statusCode: HttpStatus.OK,
              message: 'Carts fetched successfully',
              data: carts,
          };
      } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
      try {
          const cart = await this.cartsService.findOne(id);
          return {
              statusCode: HttpStatus.OK,
              message: 'Cart fetched successfully',
              data: cart,
          };
      } catch (error) {
          if (error instanceof NotFoundException) {
              throw new NotFoundException(error.message);
          }
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }

  @Patch(':id')
  async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateCartDto: UpdateCartDto,
  ) {
      try {
          const cart = await this.cartsService.update(id, updateCartDto);
          return {
              statusCode: HttpStatus.OK,
              message: 'Cart updated successfully',
              data: cart,
          };
      } catch (error) {
          if (error instanceof NotFoundException) {
              throw new NotFoundException(error.message);
          }
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
      try {
          await this.cartsService.delete(id);
          return {
              statusCode: HttpStatus.OK,
              message: 'Cart deleted successfully',
          };
      } catch (error) {
          if (error instanceof NotFoundException) {
              throw new NotFoundException(error.message);
          }
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }
}