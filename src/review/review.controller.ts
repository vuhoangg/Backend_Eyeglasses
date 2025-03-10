import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpException, Query, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryDto } from './dto/query.dto';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}
@Post()
  async create(@Body() createReviewDto: CreateReviewDto) {
    try {
      const Review = await this.reviewService.create(createReviewDto);
      return  {
        statusCode : HttpStatus.CREATED,
        message: 'Review created successfully',
        data: Review ,
        
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll(@Query() query: QueryDto ) {
    try {
      const Reviews = await this.reviewService.findAll(query);
      return {

        statusCode: HttpStatus.OK,
        message: 'Reviews fetched successfully',
        data: Reviews,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const Review = await this.reviewService.findOne(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Review OnebyId successfully',
        data: Review,
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    try {
      const Review  = await this.reviewService.update(id, updateReviewDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Review updated successfully',
        data: Review ,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.reviewService.softDelete(id);
      return{
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Review deleted successfully',
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
