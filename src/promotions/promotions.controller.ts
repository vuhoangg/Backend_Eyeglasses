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
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

interface QueryDto {
  page?: number;
  limit?: number;
}

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  async create(@Body() createPromotionDto: CreatePromotionDto) {
      try {
          const promotion = await this.promotionsService.create(createPromotionDto);
          return {
              statusCode: HttpStatus.CREATED,
              message: 'Promotion created successfully',
              data: promotion,
          };
      } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }

  @Get()
  async findAll(@Query() query: QueryDto) {
      try {
          const promotions = await this.promotionsService.findAll(query);
          return {
              statusCode: HttpStatus.OK,
              message: 'Promotions fetched successfully',
              data: promotions,
          };
      } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
      try {
          const promotion = await this.promotionsService.findOne(id);
          return {
              statusCode: HttpStatus.OK,
              message: 'Promotion fetched successfully',
              data: promotion,
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
      @Body() updatePromotionDto: UpdatePromotionDto,
  ) {
      try {
          const promotion = await this.promotionsService.update(id, updatePromotionDto);
          return {
              statusCode: HttpStatus.OK,
              message: 'Promotion updated successfully',
              data: promotion,
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
          await this.promotionsService.delete(id);
          return {
              statusCode: HttpStatus.OK,
              message: 'Promotion deleted successfully',
          };
      } catch (error) {
          if (error instanceof NotFoundException) {
              throw new NotFoundException(error.message);
          }
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }
}