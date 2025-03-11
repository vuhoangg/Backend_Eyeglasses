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
import { OrderItemsService } from './order_items.service';
import { CreateOrderItemDto } from './dto/create-order_item.dto';
import { UpdateOrderItemDto } from './dto/update-order_item.dto';


interface QueryDto {
  order_id?: number;
  product_id?: number;
  page?: number;
  limit?: number;
}

@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Post()
  async create(@Body() createOrderItemDto: CreateOrderItemDto) {
      try {
          const orderItem = await this.orderItemsService.create(createOrderItemDto);
          return {
              statusCode: HttpStatus.CREATED,
              message: 'OrderItem created successfully',
              data: orderItem,
          };
      } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }

  @Get()
  async findAll(@Query() query: QueryDto) {
      try {
          const orderItems = await this.orderItemsService.findAll(query);
          return {
              statusCode: HttpStatus.OK,
              message: 'OrderItems fetched successfully',
              data: orderItems,
          };
      } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
      try {
          const orderItem = await this.orderItemsService.findOne(id);
          return {
              statusCode: HttpStatus.OK,
              message: 'OrderItem fetched successfully',
              data: orderItem,
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
      @Body() updateOrderItemDto: UpdateOrderItemDto,
  ) {
      try {
          const orderItem = await this.orderItemsService.update(id, updateOrderItemDto);
          return {
              statusCode: HttpStatus.OK,
              message: 'OrderItem updated successfully',
              data: orderItem,
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
          await this.orderItemsService.delete(id);
          return {
              statusCode: HttpStatus.OK,
              message: 'OrderItem deleted successfully',
          };
      } catch (error) {
          if (error instanceof NotFoundException) {
              throw new NotFoundException(error.message);
          }
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }
}
