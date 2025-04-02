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
  Request,
  HttpException,
  HttpStatus,
  Patch,
  UseGuards,

} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

interface QueryDto {
  user_id?: number;
  order_status_id?: number;
  page?: number;
  limit?: number;
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createOrderDto: CreateOrderDto,@Request() req) {
      try {
          const order = await this.ordersService.create(createOrderDto, req.user.userId);
          return {
              statusCode: HttpStatus.CREATED,
              message: 'Order created successfully',
              data: order,
          };
      } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }

  @Get()
  async findAll(@Query() query: QueryDto) {
      try {
          const orders = await this.ordersService.findAll(query);
          return {
              statusCode: HttpStatus.OK,
              message: 'Orders fetched successfully',
              data: orders,
          };
      } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }
  @Get('monthly-revenue')
async getMonthlyRevenue() {
    try {
        const revenueData = await this.ordersService.getMonthlyRevenue();
        return {
            statusCode: HttpStatus.OK,
            message: 'Monthly revenue fetched successfully',
            data: revenueData,
        };
    } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
}

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
      try {
          const order = await this.ordersService.findOne(id);
          return {
              statusCode: HttpStatus.OK,
              message: 'Order fetched successfully',
              data: order,
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
      @Body() updateOrderDto: UpdateOrderDto,
  ) {
      try {
          const order = await this.ordersService.update(id, updateOrderDto);
          return {
              statusCode: HttpStatus.OK,
              message: 'Order updated successfully',
              data: order,
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
          await this.ordersService.delete(id);
          return {
              statusCode: HttpStatus.OK,
              message: 'Order deleted successfully',
          };
      } catch (error) {
          if (error instanceof NotFoundException) {
              throw new NotFoundException(error.message);
          }
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }

  // orders.controller.ts

}