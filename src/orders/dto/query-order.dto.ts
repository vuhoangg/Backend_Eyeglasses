// src/orders/dto/query-order.dto.ts (Tạo file này nếu chưa có)
import { IsOptional, IsInt, IsString, IsEnum, IsBoolean, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum SortOrderEnum { // Đổi tên để tránh trùng lặp nếu bạn có enum SortOrder ở chỗ khác
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryOrderDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  customerName?: string; // Tìm theo tên khách hàng (username, firstName, lastName)

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  order_status_id?: number; // Lọc theo ID trạng thái đơn hàng

  @IsOptional()
  @IsString() // Nhận cả số (ID) và chuỗi (code)
  orderIdentifier?: string; // <<<<<< THÊM TRƯỜNG NÀY

  @IsOptional()
  @IsString()
  sortBy?: string = 'creationDate'; // Sắp xếp theo trường nào (mặc định là ngày tạo)

  @IsOptional()
  @IsEnum(SortOrderEnum)
  sortOrder?: SortOrderEnum = SortOrderEnum.DESC; // Thứ tự sắp xếp (mặc định mới nhất)

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;
}