// src/orders/orders.controller.ts
import { Controller, Get, Post, Body, Param, Delete, Query, ParseIntPipe, NotFoundException, Request, HttpException, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { QueryOrderDto } from './dto/query-order.dto'; // <--- IMPORT DTO MỚI

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    try {
      // req.user.userId sẽ lấy từ JWT payload sau khi xác thực
      const order = await this.ordersService.create(createOrderDto, req.user.userId);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Order created successfully',
        data: order,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Roles('admin', 'staff') // Cho phép admin và staff xem đơn hàng
  @Get()
  async findAll(@Query() query: QueryOrderDto) { // <--- SỬ DỤNG DTO MỚI
    try {
      const orders = await this.ordersService.findAll(query);
      return {
        statusCode: HttpStatus.OK,
        message: 'Orders fetched successfully',
        data: orders,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('monthly-revenue') // Endpoint này nên được bảo vệ và chỉ admin mới có quyền truy cập
  @Roles('admin')
  async getMonthlyRevenue() {
      try {
          const revenueData = await this.ordersService.getMonthlyRevenue();
          return {
              statusCode: HttpStatus.OK,
              message: 'Monthly revenue fetched successfully',
              data: revenueData,
          };
      } catch (error) {
          throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
      }
  }

  @Roles('admin', 'staff')
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
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Roles('admin', 'staff')
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
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Roles('admin') // Chỉ admin mới được xóa mềm đơn hàng
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.ordersService.delete(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Order deleted successfully (soft delete)',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }
}