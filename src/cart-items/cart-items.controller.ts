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
import { CartItemsService } from './cart-items.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

interface QueryDto {
  cart_id?: number;
  product_id?: number;
  page?: number;
  limit?: number;
}

@Controller('cart-items')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post()
  async create(@Body() createCartItemDto: CreateCartItemDto) {
      try {
          const cartItem = await this.cartItemsService.create(createCartItemDto);
          return {
              statusCode: HttpStatus.CREATED,
              message: 'CartItem created successfully',
              data: cartItem,
          };
      } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }

  @Get()
  async findAll(@Query() query: QueryDto) {
      try {
          const cartItems = await this.cartItemsService.findAll(query);
          return {
              statusCode: HttpStatus.OK,
              message: 'CartItems fetched successfully',
              data: cartItems,
          };
      } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
      try {
          const cartItem = await this.cartItemsService.findOne(id);
          return {
              statusCode: HttpStatus.OK,
              message: 'CartItem fetched successfully',
              data: cartItem,
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
      @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
      try {
          const cartItem = await this.cartItemsService.update(id, updateCartItemDto);
          return {
              statusCode: HttpStatus.OK,
              message: 'CartItem updated successfully',
              data: cartItem,
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
          await this.cartItemsService.delete(id);
          return {
              statusCode: HttpStatus.OK,
              message: 'CartItem deleted successfully',
          };
      } catch (error) {
          if (error instanceof NotFoundException) {
              throw new NotFoundException(error.message);
          }
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }
}