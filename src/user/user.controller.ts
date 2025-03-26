import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  Patch,
  NotFoundException,
  HttpException,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { QueryDto } from './dto/query.dto';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard) 
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data: user,
    };
  }

  @Roles('admin') // Yêu cầu role "admin" để tạo user
  @Get()
  async findAll(@Query() query: QueryDto) {
    try {
      const admins = await this.userService.findAll(query);

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
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.getOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User fetched successfully',
      data: user,
    };
  }


  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateuserDto: UpdateUserDto,
  ) {
    try {
      const admin = await this.userService.update(id, updateuserDto);

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
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.userService.delete(id);
      return{
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Product deleted successfully',
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
 
}
