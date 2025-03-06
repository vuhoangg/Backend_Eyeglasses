import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpException, Query, ParseIntPipe, NotFoundException, HttpCode } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryDto } from './dto/query.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    const user = await this.rolesService.create(createRoleDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data: user,
    };
  }

 
  @Get()
  async findAll(@Query() query: QueryDto) {
    try {
      const admins = await this.rolesService.findAll(query);

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
    const user = await this.rolesService.getOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User fetched successfully',
      data: user,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    try {
      const admin = await this.rolesService.update(id, updateRoleDto);

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
  @HttpCode(HttpStatus.NO_CONTENT) // Returns 204 No Content
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.rolesService.delete(id);
    return; // No content on successful delete
  }
}
