import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpException, Query, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { QueryDto } from './dto/query.dto';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  async create(@Body() createBrandDto: CreateBrandDto) {
    try {
      const brand = await this.brandService.create(createBrandDto);
      return  {
        statusCode : HttpStatus.CREATED,
        message: 'Brand created successfully',
        data: brand ,
        
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll(@Query() query: QueryDto ) {
    try {
      const brands = await this.brandService.findAll(query);
      return {

        statusCode: HttpStatus.OK,
        message: 'Brands fetched successfully',
        data: brands,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const Brand = await this.brandService.findOne(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Brand OnebyId successfully',
        data: Brand,
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    try {
      const brand  = await this.brandService.update(id, updateBrandDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Brand updated successfully',
        data: brand ,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.brandService.softDelete(id);
      return{
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Brand deleted successfully',
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
