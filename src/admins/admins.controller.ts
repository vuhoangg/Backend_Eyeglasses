import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, HttpException, NotFoundException, ParseIntPipe, Put, ConflictException, HttpCode } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { QueryDto } from './dto/query.dto';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  // @Post()
  // create(@Body() createAdminDto: CreateAdminDto) {
  //   return this.adminsService.create(createAdminDto);
  // }
  @Post()
  async create(@Body() createAdminDto: CreateAdminDto) {
    try {
      const newAdmin = await this.adminsService.create(createAdminDto);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Thành công',
        data: newAdmin,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  @Get()
  async findAll(@Query() query: QueryDto) {
    try {
      const admins = await this.adminsService.findAll(query);

      return {
        statusCode: HttpStatus.OK,
        message: 'Thành công',
        data: admins,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }



  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const admin = await this.adminsService.findOne(id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Thành công',
        data: admin,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
  //   return this.adminsService.update(+id, updateAdminDto);
  // }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    try {
      const admin = await this.adminsService.update(id, updateAdminDto);

      return {
        statusCode: HttpStatus.OK,
        message: 'Thành công',
        data: admin,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.adminsService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
