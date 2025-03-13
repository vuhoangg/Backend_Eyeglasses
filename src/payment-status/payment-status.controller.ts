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
  HttpException,
  Query,
} from '@nestjs/common';
import { PaymentStatusService } from './payment-status.service';
import { CreatePaymentStatusDto } from './dto/create-payment-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { QueryDto } from './dto/query.dto';

@Controller('payment-status')
export class PaymentStatusController {
  constructor(private readonly paymentStatusService: PaymentStatusService) {}

  @Post()
  async create(@Body() createPaymentStatusDto: CreatePaymentStatusDto) {
    try {
      const paymentStatus = await this.paymentStatusService.create(createPaymentStatusDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'PaymentStatus created successfully',
        data: paymentStatus,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll(@Query() query: QueryDto) {
    try {
      const paymentStatuses = await this.paymentStatusService.findAll(query);
      return {
        statusCode: HttpStatus.OK,
        message: 'PaymentStatuses fetched successfully',
        data: paymentStatuses,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const paymentStatus = await this.paymentStatusService.findOne(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'PaymentStatus fetched successfully',
        data: paymentStatus,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentStatusDto: UpdatePaymentStatusDto,
  ) {
    try {
      const paymentStatus = await this.paymentStatusService.update(id, updatePaymentStatusDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'PaymentStatus updated successfully',
        data: paymentStatus,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.paymentStatusService.remove(id);
      return {
        statusCode: HttpStatus.NO_CONTENT,
        message: 'PaymentStatus deleted successfully',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}