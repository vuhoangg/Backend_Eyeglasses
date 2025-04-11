import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
  HttpException,
  UseGuards, // Nếu cần bảo vệ route
  Request, // Nếu cần lấy user từ JWT
} from '@nestjs/common';

import { CreateImportReceiptDto } from './dto/create-import-receipt.dto';
import { UpdateImportReceiptDto } from './dto/update-import-receipt.dto';
import { QueryImportReceiptDto } from './dto/query-import-receipt.dto';
import { ImportReceiptService } from './import-receipts.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'; // Ví dụ import Guard

@Controller('import-receipts') // Đổi tên route
@UseGuards(JwtAuthGuard, RolesGuard) 
export class ImportReceiptController {
  constructor(private readonly importReceiptService: ImportReceiptService) {}


  @Roles('admin', 'staff') 
  @Post()
  async create(
      @Body() createImportReceiptDto: CreateImportReceiptDto,
      ) {
    try {
        // const userId = req.user.userId; // Lấy userId từ payload JWT (ví dụ)
        const receipt = await this.importReceiptService.create(createImportReceiptDto /*, userId */);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Tạo phiếu nhập thành công',
            data: receipt,
        };
    } catch (error) {
        if (error instanceof NotFoundException) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
        throw new HttpException(
            error.message || 'Không thể tạo phiếu nhập',
            HttpStatus.BAD_REQUEST, // Hoặc Internal Server Error
        );
    }
  }

  @Roles('admin', 'staff') 
  @Get()
  async findAll(@Query() query: QueryImportReceiptDto) {
    try {
      const receipts = await this.importReceiptService.findAll(query);
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy danh sách phiếu nhập thành công',
        data: receipts,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Không thể lấy danh sách phiếu nhập',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const receipt = await this.importReceiptService.findOne(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy thông tin phiếu nhập thành công',
        data: receipt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new HttpException(
        error.message || 'Không thể lấy thông tin phiếu nhập',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Roles('admin') 
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateImportReceiptDto: UpdateImportReceiptDto,
  ) {
    try {
      const receipt = await this.importReceiptService.update(id, updateImportReceiptDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Cập nhật phiếu nhập thành công',
        data: receipt,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error.status === HttpStatus.BAD_REQUEST) {
        throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        error.message || 'Không thể cập nhật phiếu nhập',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Roles('admin') 
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.importReceiptService.delete(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Xóa phiếu nhập thành công (soft delete)',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error.status === HttpStatus.BAD_REQUEST) {
         throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        error.message || 'Không thể xóa phiếu nhập',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}