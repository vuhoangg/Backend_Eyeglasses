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
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { QueryDto } from './dto/query.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    try {
      const payment = await this.paymentService.create(createPaymentDto);
        return {
                statusCode: HttpStatus.CREATED,
                message: 'Payment created successfully',
                data: payment,
            };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll(@Query() query: QueryDto) {
    try {
      const payments = await this.paymentService.findAll(query);
       return {
                statusCode: HttpStatus.OK,
                message: 'Payment fetched successfully',
                data: payments,
            };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const payment = await this.paymentService.findOne(id);
        return {
                statusCode: HttpStatus.OK,
                message: 'Payment fetched successfully',
                data: payment,
            };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePaymentDto: UpdatePaymentDto,
    ) {
        try {
            const payment = await this.paymentService.update(id, updatePaymentDto);
            return {
                statusCode: HttpStatus.OK,
                message: 'Payment updated successfully',
                data: payment,
            };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.paymentService.remove(id);
      return  {
                statusCode: HttpStatus.NO_CONTENT,
                message: 'Payment deleted successfully',
              };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}