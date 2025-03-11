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
import { OrderStatusService } from './order-status.service';
import { CreateOrderStatusDto } from './dto/create-order-status.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

interface QueryDto {
  page?: number;
  limit?: number;
}

@Controller('order-status')
export class OrderStatusController {
  constructor(private readonly orderStatusService: OrderStatusService) {}

  @Post()
  async create(@Body() createOrderStatusDto: CreateOrderStatusDto) {
      try {
          const orderStatus = await this.orderStatusService.create(createOrderStatusDto);
          return {
              statusCode: HttpStatus.CREATED,
              message: 'OrderStatus created successfully',
              data: orderStatus,
          };
      } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }

  @Get()
  async findAll(@Query() query: QueryDto) {
      try {
          const orderStatuses = await this.orderStatusService.findAll(query);
          return {
              statusCode: HttpStatus.OK,
              message: 'OrderStatuses fetched successfully',
              data: orderStatuses,
          };
      } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
      try {
          const orderStatus = await this.orderStatusService.findOne(id);
          return {
              statusCode: HttpStatus.OK,
              message: 'OrderStatus fetched successfully',
              data: orderStatus,
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
      @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
      try {
          const orderStatus = await this.orderStatusService.update(id, updateOrderStatusDto);
          return {
              statusCode: HttpStatus.OK,
              message: 'OrderStatus updated successfully',
              data: orderStatus,
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
          await this.orderStatusService.delete(id);
          return {
              statusCode: HttpStatus.OK,
              message: 'OrderStatus deleted successfully',
          };
      } catch (error) {
          if (error instanceof NotFoundException) {
              throw new NotFoundException(error.message);
          }
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }
}