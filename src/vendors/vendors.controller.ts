import {
  Controller,
  Get,
  Post,
  Body,
  Patch, // Dùng cho cập nhật một phần
  Param,
  Delete,
  Query,
  ParseIntPipe, // Chuyển đổi param string thành number
  HttpCode,
  HttpStatus, // Các mã trạng thái HTTP chuẩn
  NotFoundException,
  HttpException,
  UseGuards, // Optional: Thêm Guard nếu cần xác thực/phân quyền
  BadRequestException
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { QueryVendorDto } from './dto/query-vendor.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'; // Ví dụ Guard xác thực
// import { RolesGuard } from 'src/auth/roles.guard';     // Ví dụ Guard phân quyền
// import { Roles } from 'src/auth/roles.decorator';   // Ví dụ Decorator gán quyền

@Controller('vendors') 
@UseGuards(JwtAuthGuard, RolesGuard) 
export class VendorsController {
  // Tiêm VendorsService vào controller
  constructor(private readonly vendorsService: VendorsService) {}

  @Roles('admin', 'staff') 
  @Post()
  async create(@Body() createVendorDto: CreateVendorDto) {
    try {
      const vendor = await this.vendorsService.create(createVendorDto);
      return {
        statusCode: HttpStatus.CREATED, // 201 Created
        message: 'Tạo nhà cung cấp thành công',
        data: vendor,
      };
    } catch (error) {
        // Ném lỗi HttpException để client nhận được thông báo lỗi rõ ràng
         if (error instanceof BadRequestException || error instanceof NotFoundException) {
             throw error; // Ném lại lỗi cụ thể đã bắt được từ service
         }
         throw new HttpException(error.message || 'Tạo nhà cung cấp thất bại', HttpStatus.BAD_REQUEST);
    }
  }

  @Roles('admin', 'staff') 
  @Get()
  async findAll(@Query() query: QueryVendorDto) {
     try {
       const result = await this.vendorsService.findAll(query);
       return {
            statusCode: HttpStatus.OK, // 200 OK
            message: 'Lấy danh sách nhà cung cấp thành công',
            data: result, // result chứa data, total, page, limit, totalPage
       };
     } catch (error) {
        throw new HttpException(error.message || 'Lấy danh sách nhà cung cấp thất bại', HttpStatus.INTERNAL_SERVER_ERROR); // Lỗi server nếu không xác định
     }
  }

  // Endpoint lấy chi tiết Vendor (GET /vendors/:id)
  @Get(':id')
 // @Roles('admin', 'manager') // Ví dụ: Chỉ admin/manager được xem chi tiết
  async findOne(@Param('id', ParseIntPipe) id: number) { // ParseIntPipe đảm bảo id là số nguyên
    try {
        const vendor = await this.vendorsService.findOne(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Lấy thông tin nhà cung cấp thành công',
            data: vendor,
        };
    } catch (error) {
        // Nếu service ném NotFoundException, controller sẽ bắt và trả về 404
         if (error instanceof NotFoundException) {
           throw new NotFoundException(error.message);
         }
        // Các lỗi khác trả về 500
        throw new HttpException(error.message || 'Lấy thông tin nhà cung cấp thất bại', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles('admin', 'staff') 
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateVendorDto: UpdateVendorDto) {
     try {
        const updatedVendor = await this.vendorsService.update(id, updateVendorDto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Cập nhật nhà cung cấp thành công',
            data: updatedVendor,
        };
    } catch (error) {
         if (error instanceof NotFoundException || error instanceof BadRequestException) {
           throw error; // Ném lại lỗi cụ thể
         }
        // Lỗi khác thì trả về 400 Bad Request (thường do validation DTO)
        throw new HttpException(error.message || 'Cập nhật nhà cung cấp thất bại', HttpStatus.BAD_REQUEST);
    }
  }

 
  @Roles('admin', 'staff') 
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) 
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
        await this.vendorsService.remove(id);
       // Không cần trả về body, mã 204 là đủ
     } catch (error) {
         if (error instanceof NotFoundException) {
           throw new NotFoundException(error.message);
         }
        // Lỗi khác trả về 500
        throw new HttpException(error.message || 'Xóa nhà cung cấp thất bại', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}